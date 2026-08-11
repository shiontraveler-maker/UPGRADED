"""Playwright driver for the FTA / EmaraTax portal.

Wraps the browser so the workflow code reads like plain steps:

    with Portal() as p:
        p.login()
        p.goto_section(...)
        ...

Selectors live in config.SELECTORS — fill those in from the real page.
"""

import os
import time

from playwright.sync_api import sync_playwright

import config
import captcha


class LoginError(RuntimeError):
    pass


class Portal:
    def __init__(self, headless=None):
        self.headless = config.HEADLESS if headless is None else headless
        self._pw = None
        self.browser = None
        self.page = None
        os.makedirs(config.ARTIFACTS_DIR, exist_ok=True)

    # -- context manager ----------------------------------------------------
    def __enter__(self):
        self._pw = sync_playwright().start()
        self.browser = self._pw.chromium.launch(headless=self.headless)
        ctx = self.browser.new_context(accept_downloads=True)
        self.page = ctx.new_page()
        return self

    def __exit__(self, *exc):
        try:
            if self.browser:
                self.browser.close()
        finally:
            if self._pw:
                self._pw.stop()

    # -- helpers ------------------------------------------------------------
    def shot(self, name):
        """Save a screenshot to the artifacts dir (handy for debugging)."""
        path = os.path.join(config.ARTIFACTS_DIR, f"{name}.png")
        self.page.screenshot(path=path, full_page=True)
        return path

    def _solve_captcha(self):
        """Read the captcha via OCR, falling back to manual entry once."""
        sel = config.SELECTORS
        img_el = self.page.query_selector(sel["captcha_image"])
        if not img_el:
            return None  # no captcha on the page
        for attempt in range(config.CAPTCHA_OCR_ATTEMPTS):
            png = img_el.screenshot()
            text = captcha.ocr_text(png)
            if text and 3 <= len(text) <= 8:
                return text
            # Reload the captcha image for a cleaner glyph, then retry.
            img_el.click()
            time.sleep(0.6)
        # OCR struggled — ask a human to read the saved image once.
        path = os.path.join(config.ARTIFACTS_DIR, "captcha.png")
        img_el.screenshot(path=path)
        if captcha.is_available():
            print(f"[captcha] OCR unsure — open {path} and read it.")
        else:
            print(f"[captcha] OCR not installed — open {path} and read it.")
        try:
            return input("[captcha] Enter the captcha text: ").strip()
        except EOFError:
            raise LoginError("Captcha needs manual entry but no input available.")

    # -- actions ------------------------------------------------------------
    def login(self):
        """Open the portal and sign in with credentials from config/env."""
        if not (config.FTA_EMAIL and config.FTA_PASSWORD):
            raise LoginError(
                "FTA_EMAIL / FTA_PASSWORD not set. See .env.example."
            )
        sel = config.SELECTORS
        self.page.goto(config.FTA_LOGIN_URL, wait_until="domcontentloaded")
        self.page.fill(sel["email"], config.FTA_EMAIL)
        self.page.fill(sel["password"], config.FTA_PASSWORD)

        text = self._solve_captcha()
        if text:
            self.page.fill(sel["captcha_input"], text)

        self.page.click(sel["login_button"])
        # Confirm we actually got in.
        try:
            self.page.wait_for_selector(sel["logged_in_marker"], timeout=15000)
        except Exception:
            self.shot("login-failed")
            raise LoginError(
                "Login marker not found — captcha may have been misread or "
                "selectors need updating. See artifacts/login-failed.png."
            )
        self.shot("logged-in")
        return True
