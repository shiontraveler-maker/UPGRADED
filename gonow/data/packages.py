"""Sample travel inventory for the GoNow MVP.

In production this data comes from real flight/hotel APIs (Amadeus, Skyscanner,
Booking, lastminute.com, etc.). For the prototype we use a curated, realistic
sample so the whole experience works end-to-end.

All flights depart from Dubai (DXB) — GoNow launches in Dubai first.
Prices are in AED unless noted.
"""

ORIGIN = {"city": "Dubai", "code": "DXB", "country": "United Arab Emirates"}

# Each destination bundles the pieces GoNow needs to assemble a package:
# flight price per person (round-trip from DXB), a few hotels, and attractions.
DESTINATIONS = [
    {
        "id": "maldives",
        "city": "Malé",
        "label": "Maldives",
        "country": "Maldives",
        "airport": "MLE",
        "tags": ["beach", "luxury", "honeymoon"],
        "flight_pp": 1450,
        "flight_hours": 4.5,
        "hotels": [
            {"name": "Lagoon Pearl Resort", "stars": 5, "area": "North Malé Atoll", "per_night": 1900},
            {"name": "Reef & Sands", "stars": 4, "area": "South Malé Atoll", "per_night": 1100},
            {"name": "Blue Horizon Inn", "stars": 3, "area": "Maafushi", "per_night": 520},
        ],
        "attractions": [
            {"name": "Snorkeling at the house reef", "cat": "Adventure", "cost_pp": 0, "hours": 2},
            {"name": "Sunset dolphin cruise", "cat": "Nature", "cost_pp": 160, "hours": 2},
            {"name": "Sandbank picnic excursion", "cat": "Beach", "cost_pp": 220, "hours": 3},
            {"name": "Local island & culture walk (Maafushi)", "cat": "Culture", "cost_pp": 90, "hours": 2},
        ],
    },
    {
        "id": "istanbul",
        "city": "Istanbul",
        "label": "Istanbul",
        "country": "Türkiye",
        "airport": "IST",
        "tags": ["city", "culture", "food"],
        "flight_pp": 980,
        "flight_hours": 4.5,
        "hotels": [
            {"name": "Bosphorus View Hotel", "stars": 5, "area": "Beşiktaş", "per_night": 760},
            {"name": "Old City Boutique", "stars": 4, "area": "Sultanahmet", "per_night": 430},
            {"name": "Taksim Central Stay", "stars": 3, "area": "Taksim", "per_night": 260},
        ],
        "attractions": [
            {"name": "Hagia Sophia & Blue Mosque", "cat": "Culture", "cost_pp": 95, "hours": 3},
            {"name": "Grand Bazaar shopping", "cat": "Shopping", "cost_pp": 0, "hours": 2},
            {"name": "Bosphorus dinner cruise", "cat": "Food", "cost_pp": 210, "hours": 3},
            {"name": "Topkapı Palace tour", "cat": "History", "cost_pp": 110, "hours": 3},
        ],
    },
    {
        "id": "bali",
        "city": "Denpasar",
        "label": "Bali",
        "country": "Indonesia",
        "airport": "DPS",
        "tags": ["beach", "adventure", "nature"],
        "flight_pp": 1700,
        "flight_hours": 9.0,
        "hotels": [
            {"name": "Ubud Jungle Villas", "stars": 5, "area": "Ubud", "per_night": 880},
            {"name": "Seminyak Surf Lodge", "stars": 4, "area": "Seminyak", "per_night": 470},
            {"name": "Canggu Co-Stay", "stars": 3, "area": "Canggu", "per_night": 230},
        ],
        "attractions": [
            {"name": "Tegallalang rice terraces", "cat": "Nature", "cost_pp": 40, "hours": 2},
            {"name": "Mount Batur sunrise hike", "cat": "Adventure", "cost_pp": 260, "hours": 5},
            {"name": "Uluwatu temple & sunset", "cat": "Culture", "cost_pp": 70, "hours": 3},
            {"name": "Surf lesson in Canggu", "cat": "Adventure", "cost_pp": 150, "hours": 2},
        ],
    },
    {
        "id": "cairo",
        "city": "Cairo",
        "label": "Cairo",
        "country": "Egypt",
        "airport": "CAI",
        "tags": ["history", "culture", "budget"],
        "flight_pp": 820,
        "flight_hours": 4.0,
        "hotels": [
            {"name": "Nile Grand Hotel", "stars": 5, "area": "Garden City", "per_night": 540},
            {"name": "Pyramids View Inn", "stars": 4, "area": "Giza", "per_night": 300},
            {"name": "Downtown Heritage Stay", "stars": 3, "area": "Downtown", "per_night": 170},
        ],
        "attractions": [
            {"name": "Pyramids of Giza & Sphinx", "cat": "History", "cost_pp": 120, "hours": 4},
            {"name": "Egyptian Museum", "cat": "Culture", "cost_pp": 80, "hours": 3},
            {"name": "Nile felucca ride", "cat": "Nature", "cost_pp": 60, "hours": 2},
            {"name": "Khan el-Khalili bazaar", "cat": "Shopping", "cost_pp": 0, "hours": 2},
        ],
    },
    {
        "id": "tbilisi",
        "city": "Tbilisi",
        "label": "Tbilisi",
        "country": "Georgia",
        "airport": "TBS",
        "tags": ["city", "nature", "budget"],
        "flight_pp": 760,
        "flight_hours": 3.0,
        "hotels": [
            {"name": "Old Town Wine Hotel", "stars": 5, "area": "Old Tbilisi", "per_night": 480},
            {"name": "Rustaveli Boutique", "stars": 4, "area": "Rustaveli", "per_night": 280},
            {"name": "Vake Garden Stay", "stars": 3, "area": "Vake", "per_night": 150},
        ],
        "attractions": [
            {"name": "Narikala fortress cable car", "cat": "History", "cost_pp": 30, "hours": 2},
            {"name": "Sulphur bath district", "cat": "Wellness", "cost_pp": 110, "hours": 2},
            {"name": "Kakheti wine day trip", "cat": "Food", "cost_pp": 240, "hours": 6},
            {"name": "Old town walking tour", "cat": "Culture", "cost_pp": 0, "hours": 2},
        ],
    },
    {
        "id": "phuket",
        "city": "Phuket",
        "label": "Phuket",
        "country": "Thailand",
        "airport": "HKT",
        "tags": ["beach", "nightlife", "adventure"],
        "flight_pp": 1320,
        "flight_hours": 6.5,
        "hotels": [
            {"name": "Patong Bay Resort", "stars": 5, "area": "Patong", "per_night": 690},
            {"name": "Kata Beach Hotel", "stars": 4, "area": "Kata", "per_night": 360},
            {"name": "Old Town Guesthouse", "stars": 3, "area": "Phuket Town", "per_night": 180},
        ],
        "attractions": [
            {"name": "Phi Phi islands speedboat tour", "cat": "Adventure", "cost_pp": 280, "hours": 7},
            {"name": "Big Buddha viewpoint", "cat": "Culture", "cost_pp": 0, "hours": 2},
            {"name": "Thai cooking class", "cat": "Food", "cost_pp": 170, "hours": 3},
            {"name": "Old town & night market", "cat": "Shopping", "cost_pp": 0, "hours": 2},
        ],
    },
]
