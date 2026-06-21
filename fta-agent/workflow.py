"""Your fixed FTA procedure, expressed as ordered steps.

Each step is a small function that drives `portal.page` (a Playwright page).
Because your procedure doesn't change, we just list the steps in order and the
runner executes them one after another, screenshotting along the way.

>>> FILL ME IN <<<
Replace the placeholder steps below with your real clicks. Tell Claude the
procedure ("log in -> open VAT return -> download PDF -> ...") and the steps
get wired here.
"""


def step_open_dashboard(portal):
    """Example placeholder: confirm we're on the dashboard."""
    portal.shot("01-dashboard")
    # e.g. portal.page.click("text=VAT")


def step_example_navigate(portal):
    """Example placeholder for the next action in your procedure."""
    # e.g. portal.page.click("text=Returns")
    #      portal.page.wait_for_selector("...")
    portal.shot("02-step")


# The procedure, in order. Add/remove/reorder to match your real workflow.
STEPS = [
    ("Open dashboard", step_open_dashboard),
    ("Example navigate", step_example_navigate),
]


def run(portal):
    """Execute every step in order, logging progress."""
    for i, (label, fn) in enumerate(STEPS, 1):
        print(f"[{i}/{len(STEPS)}] {label} ...")
        fn(portal)
        print(f"[{i}/{len(STEPS)}] {label} ✓")
    print("Workflow complete.")
