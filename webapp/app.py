"""A small but complete Flask web app: a task manager backed by SQLite.

Run locally:
    pip install -r requirements.txt
    python app.py
Then open http://127.0.0.1:5000
"""

import os
import sqlite3
from flask import (
    Flask,
    g,
    redirect,
    render_template,
    request,
    url_for,
)

BASE_DIR = os.path.abspath(os.path.dirname(__file__))
DATABASE = os.path.join(BASE_DIR, "tasks.db")

app = Flask(__name__)
app.config["SECRET_KEY"] = os.environ.get("SECRET_KEY", "dev-secret-change-me")


# --- Database helpers -------------------------------------------------------

def get_db():
    """Return a per-request SQLite connection."""
    if "db" not in g:
        g.db = sqlite3.connect(DATABASE)
        g.db.row_factory = sqlite3.Row
    return g.db


@app.teardown_appcontext
def close_db(exception=None):
    db = g.pop("db", None)
    if db is not None:
        db.close()


def init_db():
    """Create the tasks table if it does not already exist."""
    db = sqlite3.connect(DATABASE)
    db.execute(
        """
        CREATE TABLE IF NOT EXISTS tasks (
            id        INTEGER PRIMARY KEY AUTOINCREMENT,
            title     TEXT NOT NULL,
            done      INTEGER NOT NULL DEFAULT 0,
            created   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        """
    )
    db.commit()
    db.close()


# --- Routes -----------------------------------------------------------------

@app.route("/")
def index():
    db = get_db()
    tasks = db.execute(
        "SELECT id, title, done, created FROM tasks ORDER BY done, created DESC"
    ).fetchall()
    remaining = sum(1 for t in tasks if not t["done"])
    return render_template("index.html", tasks=tasks, remaining=remaining)


@app.route("/add", methods=["POST"])
def add():
    title = (request.form.get("title") or "").strip()
    if title:
        db = get_db()
        db.execute("INSERT INTO tasks (title) VALUES (?)", (title,))
        db.commit()
    return redirect(url_for("index"))


@app.route("/toggle/<int:task_id>", methods=["POST"])
def toggle(task_id):
    db = get_db()
    db.execute("UPDATE tasks SET done = 1 - done WHERE id = ?", (task_id,))
    db.commit()
    return redirect(url_for("index"))


@app.route("/delete/<int:task_id>", methods=["POST"])
def delete(task_id):
    db = get_db()
    db.execute("DELETE FROM tasks WHERE id = ?", (task_id,))
    db.commit()
    return redirect(url_for("index"))


@app.route("/health")
def health():
    return {"status": "ok"}


if __name__ == "__main__":
    init_db()
    app.run(host="127.0.0.1", port=5000, debug=True)
