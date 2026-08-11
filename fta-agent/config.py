"""Configuration for the FTA portal agent.

Credentials are read from environment variables — never hardcode them.
Copy .env.example to .env and fill it in, or export the variables directly.
"""

import os

try:
    from dotenv import load_dotenv
    load_dotenv()  # load .env if present, so credentials don't live in the shell
except Exception:
    pass


def _get(name, default=None, required=False):
    val = os.environ.get(name, default)
    if required and not val:
        raise RuntimeError(
            f"Missing required environment variable: {name}. "
            f"Copy .env.example to .env and fill it in."
        )
    return val


# --- Credentials (keep these secret) ---------------------------------------
FTA_EMAIL = _get("FTA_EMAIL")
FTA_PASSWORD = _get("FTA_PASSWORD")

# --- Portal ----------------------------------------------------------------
# The login URL for the FTA / EmaraTax portal. Override via env if it changes.
FTA_LOGIN_URL = _get("FTA_LOGIN_URL", "https://eservices.tax.gov.ae/")

# --- Behaviour -------------------------------------------------------------
HEADLESS = _get("FTA_HEADLESS", "true").lower() != "false"
# How many times to retry the captcha via OCR before asking a human.
CAPTCHA_OCR_ATTEMPTS = int(_get("FTA_CAPTCHA_ATTEMPTS", "4"))
# Where to drop screenshots / downloaded files.
ARTIFACTS_DIR = _get("FTA_ARTIFACTS_DIR", "artifacts")

# --- Selectors -------------------------------------------------------------
# Fill these in from the real EmaraTax login page (right-click element ->
# Inspect, then copy a stable selector — prefer id or name attributes).
# These are placeholders so the framework runs; replace with real values.
SELECTORS = {
    "email":           "#email",            # the email/username input
    "password":        "#password",         # the password input
    "captcha_image":   "#captchaImage",     # the <img> showing the captcha
    "captcha_input":   "#captchaText",      # where the captcha text is typed
    "login_button":    "button[type=submit]",
    # An element that only exists AFTER a successful login — used to confirm
    # we're in (e.g. a dashboard header or the account menu).
    "logged_in_marker": "text=Dashboard",
}
