#!/usr/bin/env python3
"""Shrink site images in place. Needs ImageMagick (`brew install imagemagick`).

Usage (from the repo root):
  python3 scripts/optimize-images.py                 # all images under Resource/ and oushadhavana/images/
  python3 scripts/optimize-images.py path/a.jpg ...  # only these files

Rules:
- Page headers (Resource/Header/) are limited to 1920 px wide, all other images to 1600 px.
- JPEG is saved at quality 80, progressive, without metadata. PNG is saved at the highest compression.
- A file is replaced only when the new file is at least 5% smaller. File names do not change.
"""
import os
import subprocess
import sys
import tempfile

ROOTS = ["Resource", "oushadhavana/images"]
EXTS = {".jpg", ".jpeg", ".png"}
MAX_WIDTH = {"Resource/Header/": 1920, "Resource/Oushadhavana/main_board": 2400}
DEFAULT_MAX = 1600


def max_width(path):
    for prefix, width in MAX_WIDTH.items():
        if path.startswith(prefix):
            return width
    return DEFAULT_MAX


def optimize(path):
    ext = os.path.splitext(path)[1].lower()
    before = os.path.getsize(path)
    fd, tmp = tempfile.mkstemp(suffix=ext)
    os.close(fd)
    args = ["magick", path + "[0]", "-auto-orient", "-strip", "-resize", f"{max_width(path)}x>"]
    if ext == ".png":
        args += ["-define", "png:compression-level=9", "-define", "png:compression-filter=5"]
    else:
        args += ["-sampling-factor", "4:2:0", "-quality", "80", "-interlace", "JPEG", "-colorspace", "sRGB"]
    result = subprocess.run(args + [tmp], capture_output=True, text=True, stdin=subprocess.DEVNULL)
    if result.returncode != 0:
        os.remove(tmp)
        print(f"skip  {path}: {result.stderr.strip()[:100]}")
        return 0
    after = os.path.getsize(tmp)
    if after < before * 0.95:
        os.replace(tmp, path)
        print(f"{before // 1024:7d}K -> {after // 1024:6d}K  {path}")
        return before - after
    os.remove(tmp)
    return 0


def main():
    files = sys.argv[1:]
    if not files:
        for root in ROOTS:
            for d, _, names in os.walk(root):
                files += [os.path.join(d, n) for n in names if os.path.splitext(n)[1].lower() in EXTS]
    saved = sum(optimize(f) for f in sorted(files))
    print(f"Saved {saved / 1e6:.1f} MB in total.")


if __name__ == "__main__":
    main()
