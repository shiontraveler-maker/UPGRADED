# Tasks — a tiny Flask web app

A minimal but complete task-manager web app, built with **Flask** and **SQLite**.
Add tasks, mark them done, and delete them — with data persisted to a local
database file.

## Features

- Add / toggle / delete tasks
- SQLite persistence (no external database to set up)
- Server-rendered templates with a small dark theme
- `/health` endpoint that returns `{"status": "ok"}`

## Requirements

- Python 3.9+

## Getting started

```bash
cd webapp

# (optional) create a virtual environment
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate

# install dependencies
pip install -r requirements.txt

# run the app
python app.py
```

Then open **http://127.0.0.1:5000** in your browser.

The database file `tasks.db` is created automatically on first run and is
git-ignored.

## Project structure

```
webapp/
├── app.py              # Flask application & routes
├── requirements.txt    # Python dependencies
├── templates/
│   ├── base.html       # shared layout
│   └── index.html      # task list page
└── static/
    └── style.css       # styling
```

## Configuration

| Environment variable | Default            | Purpose                 |
| -------------------- | ------------------ | ----------------------- |
| `SECRET_KEY`         | `dev-secret-...`   | Flask session secret    |

Set a real `SECRET_KEY` before deploying anywhere public.
