"""Entry point for the FTA portal agent.

Usage:
    python run.py            # log in and run the full workflow
    python run.py --login    # just test the login + captcha
    python run.py --no-headless   # watch it in a real browser window

Credentials come from environment / .env (see config.py). This script never
prints or stores your password.
"""

import argparse
import sys

import config
import workflow
from portal import Portal, LoginError


def main(argv=None):
    parser = argparse.ArgumentParser(description="FTA / EmaraTax portal agent")
    parser.add_argument("--login", action="store_true",
                        help="only test login + captcha, then stop")
    parser.add_argument("--no-headless", action="store_true",
                        help="show the browser window")
    args = parser.parse_args(argv)

    headless = config.HEADLESS and not args.no_headless

    try:
        with Portal(headless=headless) as portal:
            print("Signing in ...")
            portal.login()
            print("Logged in ✓")
            if args.login:
                return 0
            workflow.run(portal)
        return 0
    except LoginError as e:
        print(f"Login failed: {e}", file=sys.stderr)
        return 2


if __name__ == "__main__":
    raise SystemExit(main())
