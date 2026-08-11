"""Sample passport -> destination visa/document rules for the GoNow MVP.

In production this comes from a maintained visa dataset / API (e.g. IATA Timatic
or Sherpa). Here we use a representative sample so the passport feature works.

Requirement codes:
    visa_free   - No visa needed for short tourism stays
    voa         - Visa on arrival
    evisa       - Apply online before travel
    visa        - Embassy/consulate visa required in advance
"""

# A few passports GoNow supports at launch. Add more as the dataset grows.
PASSPORTS = [
    {"code": "AE", "label": "United Arab Emirates"},
    {"code": "IN", "label": "India"},
    {"code": "GB", "label": "United Kingdom"},
    {"code": "US", "label": "United States"},
    {"code": "PK", "label": "Pakistan"},
    {"code": "EG", "label": "Egypt"},
    {"code": "PH", "label": "Philippines"},
]

# rules[passport_code][destination_country] = (requirement_code, note)
# Destination countries match data/packages.py.
RULES = {
    "AE": {
        "Maldives": ("voa", "30-day visa on arrival, free of charge."),
        "Türkiye": ("visa_free", "Up to 90 days visa-free."),
        "Indonesia": ("voa", "30-day visa on arrival."),
        "Egypt": ("visa_free", "Visa-free entry for UAE nationals."),
        "Georgia": ("visa_free", "Up to 1 year visa-free."),
        "Thailand": ("visa_free", "30-day visa exemption."),
    },
    "IN": {
        "Maldives": ("voa", "30-day visa on arrival, free."),
        "Türkiye": ("evisa", "Apply for an e-Visa online before travel."),
        "Indonesia": ("voa", "Visa on arrival (~35 USD)."),
        "Egypt": ("visa", "Embassy visa required in advance."),
        "Georgia": ("evisa", "e-Visa or e-Visa via Georgia portal."),
        "Thailand": ("voa", "Visa on arrival available."),
    },
    "GB": {
        "Maldives": ("voa", "30-day visa on arrival, free."),
        "Türkiye": ("visa_free", "Up to 90 days visa-free."),
        "Indonesia": ("voa", "Visa on arrival (~35 USD)."),
        "Egypt": ("voa", "Visa on arrival or e-Visa (~25 USD)."),
        "Georgia": ("visa_free", "Up to 1 year visa-free."),
        "Thailand": ("visa_free", "30-day visa exemption."),
    },
    "US": {
        "Maldives": ("voa", "30-day visa on arrival, free."),
        "Türkiye": ("visa_free", "Up to 90 days visa-free."),
        "Indonesia": ("voa", "Visa on arrival (~35 USD)."),
        "Egypt": ("voa", "Visa on arrival or e-Visa (~25 USD)."),
        "Georgia": ("visa_free", "Up to 1 year visa-free."),
        "Thailand": ("visa_free", "30-day visa exemption."),
    },
    "PK": {
        "Maldives": ("voa", "30-day visa on arrival, free."),
        "Türkiye": ("evisa", "e-Visa required (conditions apply)."),
        "Indonesia": ("voa", "Visa on arrival (~35 USD)."),
        "Egypt": ("visa", "Embassy visa required in advance."),
        "Georgia": ("evisa", "e-Visa required."),
        "Thailand": ("voa", "Visa on arrival available."),
    },
    "EG": {
        "Maldives": ("voa", "30-day visa on arrival, free."),
        "Türkiye": ("evisa", "e-Visa required (conditions apply)."),
        "Indonesia": ("voa", "Visa on arrival (~35 USD)."),
        "Egypt": ("visa_free", "Home country."),
        "Georgia": ("evisa", "e-Visa required."),
        "Thailand": ("voa", "Visa on arrival available."),
    },
    "PH": {
        "Maldives": ("voa", "30-day visa on arrival, free."),
        "Türkiye": ("evisa", "e-Visa required."),
        "Indonesia": ("visa_free", "30-day visa-free (ASEAN)."),
        "Egypt": ("visa", "Embassy visa required in advance."),
        "Georgia": ("evisa", "e-Visa required."),
        "Thailand": ("visa_free", "30-day visa exemption (ASEAN)."),
    },
}

REQUIREMENT_LABELS = {
    "visa_free": "Visa-free",
    "voa": "Visa on arrival",
    "evisa": "e-Visa (apply online)",
    "visa": "Visa required in advance",
}


def lookup(passport_code, destination_country):
    """Return a dict describing entry requirements, with safe fallbacks."""
    rule = RULES.get(passport_code, {}).get(destination_country)
    if rule is None:
        return {
            "code": "unknown",
            "label": "Check requirements",
            "note": "We don't have this passport/destination rule yet — "
                    "verify with the destination's embassy before booking.",
            "passport_valid_months": 6,
        }
    code, note = rule
    return {
        "code": code,
        "label": REQUIREMENT_LABELS.get(code, code),
        "note": note,
        # Most destinations require 6 months passport validity.
        "passport_valid_months": 6,
    }


def passport_label(passport_code):
    for p in PASSPORTS:
        if p["code"] == passport_code:
            return p["label"]
    return passport_code
