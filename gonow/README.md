# GoNow ✈

**Last-minute vacation packages, decided for you.** The opposite of Skyscanner:
you don't search flights and hotels — you tell GoNow your **budget**, **dates**,
**party size** and **passport**, and it hands back ready-to-book trips with
flights **+** hotel **+** a day-by-day plan of things to see **+** the visa &
document info for *your* passport. Pay in-app with Apple Pay, Google Pay, Tabby
or Klarna.

Launch market: **Dubai** (all flights depart DXB), worldwide later.

> This is an **MVP prototype**. It runs end-to-end on realistic **sample data**.
> The data layer is isolated so live flight/hotel and payment APIs can be plugged
> in behind the same interface without rewriting the app.

## How it works

1. **You say:** budget · nights · travelers · passport (+ optional date).
2. **GoNow decides:** the engine (`engine.py`) picks destinations that fit your
   budget, chooses the best hotel that fits, builds a day-by-day itinerary, trims
   optional activities to stay under budget, and looks up visa rules for your
   passport.
3. **You book:** a mock checkout offers Apple Pay / Google Pay / Tabby / Klarna.

## Run it

```bash
cd gonow
python -m venv .venv && source .venv/bin/activate   # optional
pip install -r requirements.txt
python app.py        # -> http://127.0.0.1:5000
```

## Structure

```
gonow/
├── app.py              # Flask routes: ask → results → checkout → confirmed
├── engine.py           # package generation (budget/dates/travelers → trips)
├── data/
│   ├── packages.py     # sample destinations, flights, hotels, attractions
│   └── visa.py         # passport → destination visa/document rules
├── templates/          # index, results, checkout, confirmed
├── static/style.css
└── requirements.txt
```

## Roadmap to production

| Area | MVP (now) | Next |
| ---- | --------- | ---- |
| Flights | Sample prices from DXB | Amadeus / Duffel / Skyscanner API |
| Hotels | Sample inventory | Booking / Expedia / lastminute.com |
| Attractions | Curated lists | GetYourGuide / Viator API |
| Visa rules | Sample matrix | IATA Timatic / Sherpa |
| Payments | Mock buttons | Apple Pay, Google Pay, Tabby, Klarna SDKs |
| Accounts | None | Auth, saved trips, booking management |

## Notes

- Prices are sample values in **AED**.
- The checkout is a **demo** — no real payment or booking is made.
- Visa data is a **simplified sample** — always verify with official sources
  before real travel.
