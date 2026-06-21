# FTA Portal Agent

A small **browser-automation framework** for automating a fixed, repetitive
workflow on the UAE **Federal Tax Authority (EmaraTax)** portal — using *your
own* account. It logs in (email + password), reads the simple text captcha via
OCR, and runs your procedure step by step.

> ⚠️ **This is a skeleton.** It runs end-to-end in structure, but two things must
> be filled in with values from the real portal: the **selectors** in
> `config.py` and the **steps** in `workflow.py`. They can't be guessed without
> seeing the live page.

## How it's organised

```
fta-agent/
├── run.py          # entry point: python run.py [--login] [--no-headless]
├── config.py       # env-based credentials, URL, and SELECTORS to fill in
├── portal.py       # Playwright driver: login() + captcha solving + screenshots
├── captcha.py      # OCR reader for a simple letters/numbers captcha
├── workflow.py     # YOUR fixed procedure, as ordered steps  <-- fill in
├── requirements.txt
└── .env.example    # copy to .env and add your credentials
```

## Setup

```bash
cd fta-agent
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python -m playwright install chromium

# OCR needs the Tesseract binary:
#   Ubuntu/Debian: sudo apt-get install tesseract-ocr
#   macOS:         brew install tesseract

cp .env.example .env      # then edit .env with your email + password
```

## Two things to fill in

1. **Selectors** — open the EmaraTax login page, inspect each element (email,
   password, captcha image, captcha input, login button, and something that
   only appears once logged in) and put real selectors in `config.SELECTORS`.
2. **Your procedure** — list your real clicks in `workflow.py` `STEPS`. Tell me
   the steps ("log in → open VAT return → download PDF → …") and I'll wire them.

## Run

```bash
python run.py --login        # just test login + captcha
python run.py --no-headless  # watch the browser do it
python run.py                # login + run the full workflow
```

Screenshots and downloads land in `artifacts/` (git-ignored), which is the
first place to look if a step fails.

## Notes & limits

- **Credentials** live only in `.env` / environment variables and are never
  printed or committed (`.env` is git-ignored).
- **Captcha:** simple text captchas usually read fine via OCR; if one character
  is ever misread, the agent saves the image and asks you to type it once.
- **Robustness:** if the portal changes its HTML, update the selectors. If it
  ever adds reCAPTCHA / MFA, hands-off login would need rethinking.
- Use this only for **your own account** and your own routine tasks.
