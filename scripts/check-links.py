#!/usr/bin/env python3
"""Find broken local links in the site. No packages needed.

Usage (from the repo root):  python3 scripts/check-links.py

It checks every src="..." and href="..." in the HTML pages, and every url(...) in the CSS files.
A link is resolved the way a browser does on GitHub Pages: a page at /about/festivals/index.html
is served at /about/festivals/, and "../" never goes above the site root.
Links to other sites, mailto:, tel: and #anchors are not checked.
Exit code 1 means at least one link is broken.
"""
import os
import re
import subprocess
import sys
from urllib.parse import unquote, urljoin, urlparse

SKIP = re.compile(r"^(https?:|//|#|mailto:|tel:|sms:|data:|javascript:)|\$\{|\{\{")
ATTR = re.compile(r'(?<=\s)(?:src|href)="([^"]*)"')
CSS_URL = re.compile(r"url\(\s*['\"]?([^'\")]+)['\"]?\s*\)")


def tracked(*patterns):
    out = subprocess.check_output(["git", "ls-files", *patterns], text=True)
    return [f for f in out.splitlines() if os.path.exists(f)]


def target_exists(path):
    path = path.lstrip("/")
    if path == "":
        return True
    if os.path.isfile(path):
        return True
    return os.path.isfile(os.path.join(path, "index.html"))


def check(file, links, base):
    broken = []
    for link in links:
        link = link.strip()
        if not link or SKIP.search(link):
            continue
        path = unquote(urlparse(urljoin(base, link)).path)
        if not target_exists(path):
            broken.append(link)
    return broken


def main():
    problems = 0
    for file in tracked("*.html"):
        if file.startswith("docs/"):
            continue
        folder = os.path.dirname(file)
        base = "https://site/" + (folder + "/" if folder else "")
        with open(file, encoding="utf-8", errors="replace") as fh:
            html = fh.read()
        for link in sorted(set(check(file, ATTR.findall(html), base))):
            print(f"{file}: broken link {link}")
            problems += 1
    for file in tracked("*.css"):
        base = "https://site/" + os.path.dirname(file) + "/"
        with open(file, encoding="utf-8", errors="replace") as fh:
            css = fh.read()
        for link in sorted(set(check(file, CSS_URL.findall(css), base))):
            print(f"{file}: broken url() {link}")
            problems += 1
    if problems:
        print(f"\n{problems} broken link(s).")
        return 1
    print("No broken local links.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
