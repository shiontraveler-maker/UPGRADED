"""GoNow — last-minute vacation packages, decided for you.

You don't search. You tell GoNow your budget, dates, party size and passport,
and it returns ready-to-book packages: flights + hotel + a day-by-day plan +
visa guidance, payable in-app (Apple Pay / Google Pay / Tabby / Klarna).

Launch market: Dubai (all flights depart DXB). Sample data for the MVP; real
flight/hotel/payment integrations plug in behind the same interface later.

Run:
    pip install -r requirements.txt
    python app.py   ->  http://127.0.0.1:5000
"""

import os

from flask import Flask, render_template, request, redirect, url_for, abort

import engine
from data import packages as inv
from data import visa as visa_data

app = Flask(__name__)
app.config["SECRET_KEY"] = os.environ.get("SECRET_KEY", "dev-secret-change-me")

PAYMENT_METHODS = [
    {"id": "apple_pay", "label": "Apple Pay", "kind": "instant"},
    {"id": "google_pay", "label": "Google Pay", "kind": "instant"},
    {"id": "tabby", "label": "Tabby", "kind": "Pay in 4, interest-free"},
    {"id": "klarna", "label": "Klarna", "kind": "Pay later"},
]


@app.route("/")
def index():
    return render_template(
        "index.html",
        passports=visa_data.PASSPORTS,
        origin=inv.ORIGIN,
    )


@app.route("/results", methods=["GET", "POST"])
def results():
    form = request.values
    req, errors = engine.parse_request(form)
    if errors:
        return render_template(
            "index.html",
            passports=visa_data.PASSPORTS,
            origin=inv.ORIGIN,
            errors=errors,
            form=form,
        )
    packages = engine.generate(req)
    return render_template(
        "results.html",
        packages=packages,
        req=req,
        passport_label=visa_data.passport_label(req["passport"]),
        origin=inv.ORIGIN,
        currency=engine.CURRENCY,
    )


@app.route("/checkout/<pkg_id>", methods=["GET", "POST"])
def checkout(pkg_id):
    req, _ = engine.parse_request(request.values)
    dest = next((d for d in inv.DESTINATIONS if d["id"] == pkg_id), None)
    if not dest:
        abort(404)
    pkg = engine.build_package(dest, req)
    if not pkg:
        abort(404)

    if request.method == "POST":
        method = request.form.get("method", "apple_pay")
        method_label = next(
            (m["label"] for m in PAYMENT_METHODS if m["id"] == method), method
        )
        return render_template(
            "confirmed.html",
            pkg=pkg,
            req=req,
            method_label=method_label,
            currency=engine.CURRENCY,
        )

    return render_template(
        "checkout.html",
        pkg=pkg,
        req=req,
        methods=PAYMENT_METHODS,
        passport_label=visa_data.passport_label(req["passport"]),
        currency=engine.CURRENCY,
    )


@app.route("/health")
def health():
    return {"status": "ok"}


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)
