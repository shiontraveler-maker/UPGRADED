"""Simple text-captcha reader.

For a basic letters/words captcha, OCR (Tesseract) usually works once the image
is cleaned up (greyscale, upscale, threshold). If OCR can't read it confidently,
the caller falls back to asking a human to type it once.

Requires the Tesseract binary plus pytesseract + Pillow. If those aren't
available, `ocr_text` returns None and the agent falls back to manual entry.
"""

import io
import re

try:
    from PIL import Image, ImageFilter, ImageOps
    import pytesseract
    _OCR_AVAILABLE = True
except Exception:  # pragma: no cover - optional dependency
    _OCR_AVAILABLE = False


def _clean(raw):
    """Keep only the kind of characters a simple captcha uses."""
    return re.sub(r"[^A-Za-z0-9]", "", raw or "").strip()


def _preprocess(img):
    """Make a noisy captcha easier for OCR to read."""
    img = img.convert("L")                 # greyscale
    w, h = img.size
    img = img.resize((w * 3, h * 3))       # upscale for sharper glyphs
    img = ImageOps.autocontrast(img)
    img = img.filter(ImageFilter.MedianFilter(3))  # knock out speckle noise
    # Binarize: push to pure black/white.
    img = img.point(lambda px: 0 if px < 140 else 255)
    return img


def ocr_text(image_bytes):
    """Try to read a captcha from raw PNG/JPEG bytes. Returns text or None."""
    if not _OCR_AVAILABLE:
        return None
    try:
        img = Image.open(io.BytesIO(image_bytes))
    except Exception:
        return None
    img = _preprocess(img)
    # PSM 8 = treat the image as a single word/line.
    config = "--psm 8 -c tessedit_char_whitelist=" \
             "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
    guess = _clean(pytesseract.image_to_string(img, config=config))
    return guess or None


def is_available():
    return _OCR_AVAILABLE
