"""GoNow package engine.

Turns a simple request (budget, dates, travelers, passport) into ready-to-book
vacation packages — no searching required. Each package bundles flights, a hotel
choice that fits the budget, a day-by-day plan of attractions, a cost breakdown,
and passport/visa guidance.

This is deliberately self-contained and pure-Python so it's easy to later
replace the sample data with live flight/hotel API calls.
"""

import math
from datetime import date, timedelta

from data import packages as inv
from data import visa as visa_data

CURRENCY = "AED"


def _rooms_needed(travelers):
    """Assume up to 2 guests per room."""
    return max(1, math.ceil(travelers / 2))


def _pick_hotel(dest, nights, travelers, budget, flight_total):
    """Choose the best hotel that keeps the whole trip within budget.

    Prefers the highest-rated hotel the budget allows, leaving a sensible
    cushion for activities and food.
    """
    rooms = _rooms_needed(travelers)
    activity_floor = 200 * travelers  # keep a little aside for the trip
    affordable = []
    for hotel in dest["hotels"]:
        hotel_total = hotel["per_night"] * nights * rooms
        if flight_total + hotel_total + activity_floor <= budget:
            affordable.append((hotel, hotel_total, rooms))
    if not affordable:
        return None
    # Best experience that still fits: highest stars, then cheapest among those.
    affordable.sort(key=lambda x: (-x[0]["stars"], x[1]))
    return affordable[0]


def _build_itinerary(dest, start, nights, travelers):
    """Spread attractions across the trip days into a simple plan."""
    attractions = dest["attractions"]
    days = []
    total_days = nights + 1
    per_day = max(1, math.ceil(len(attractions) / total_days)) if attractions else 0
    cursor = 0
    activity_cost = 0
    for d in range(total_days):
        day_date = start + timedelta(days=d) if start else None
        items = []
        if d == 0:
            items.append({"name": f"Arrive in {dest['city']}, check in & relax",
                          "cat": "Travel", "cost_pp": 0})
        if d == total_days - 1:
            items.append({"name": "Check out & fly back to Dubai",
                          "cat": "Travel", "cost_pp": 0})
        else:
            picks = attractions[cursor:cursor + per_day]
            cursor += per_day
            for a in picks:
                items.append(a)
                activity_cost += a["cost_pp"] * travelers
        days.append({
            "n": d + 1,
            "date": day_date.isoformat() if day_date else None,
            "items": items,
        })
    return days, activity_cost


def build_package(dest, req):
    """Assemble a single package for a destination, or None if it can't fit."""
    travelers = req["travelers"]
    nights = req["nights"]
    budget = req["budget"]

    flight_total = dest["flight_pp"] * travelers
    if flight_total >= budget:
        return None

    chosen = _pick_hotel(dest, nights, travelers, budget, flight_total)
    if not chosen:
        return None
    hotel, hotel_total, rooms = chosen

    itinerary, activity_cost = _build_itinerary(
        dest, req.get("start_date"), nights, travelers
    )

    total = flight_total + hotel_total + activity_cost
    if total > budget:
        # Trim optional paid activities until it fits the budget.
        overflow = total - budget
        for day in itinerary:
            for item in day["items"]:
                if overflow <= 0:
                    break
                cost = item.get("cost_pp", 0) * travelers
                if cost > 0:
                    item["trimmed"] = True
                    activity_cost -= cost
                    overflow -= cost
        total = flight_total + hotel_total + activity_cost
        if total > budget:
            return None

    visa = visa_data.lookup(req["passport"], dest["country"])

    return {
        "id": dest["id"],
        "label": dest["label"],
        "city": dest["city"],
        "country": dest["country"],
        "airport": dest["airport"],
        "tags": dest["tags"],
        "flight": {
            "from": inv.ORIGIN["code"],
            "to": dest["airport"],
            "hours": dest["flight_hours"],
            "price_pp": dest["flight_pp"],
            "total": flight_total,
            "travelers": travelers,
        },
        "hotel": {
            "name": hotel["name"],
            "stars": hotel["stars"],
            "area": hotel["area"],
            "per_night": hotel["per_night"],
            "nights": nights,
            "rooms": rooms,
            "total": hotel_total,
        },
        "itinerary": itinerary,
        "costs": {
            "flights": flight_total,
            "hotel": hotel_total,
            "activities": activity_cost,
            "total": total,
            "leftover": budget - total,
            "currency": CURRENCY,
        },
        "visa": visa,
    }


def generate(req):
    """Return budget-fitting packages, best value first.

    `req` keys: budget (int), nights (int), travelers (int), passport (str),
    start_date (date|None).
    """
    results = []
    for dest in inv.DESTINATIONS:
        pkg = build_package(dest, req)
        if pkg:
            results.append(pkg)
    # Best value first: most experience left in the budget, nicer hotel wins ties.
    results.sort(key=lambda p: (-p["hotel"]["stars"], p["costs"]["total"]))
    return results


def parse_request(form):
    """Validate and normalize the input form into a request dict."""
    errors = []

    try:
        budget = int(float(form.get("budget", "")))
        if budget <= 0:
            errors.append("Budget must be greater than zero.")
    except (ValueError, TypeError):
        budget = 0
        errors.append("Enter a valid budget amount.")

    try:
        travelers = int(form.get("travelers", "1"))
        travelers = max(1, min(travelers, 12))
    except (ValueError, TypeError):
        travelers = 1

    try:
        nights = int(form.get("nights", "3"))
        nights = max(1, min(nights, 21))
    except (ValueError, TypeError):
        nights = 3

    passport = form.get("passport", "AE")

    start_date = None
    raw_date = form.get("start_date")
    if raw_date:
        try:
            start_date = date.fromisoformat(raw_date)
        except ValueError:
            start_date = None

    return {
        "budget": budget,
        "travelers": travelers,
        "nights": nights,
        "passport": passport,
        "start_date": start_date,
    }, errors
