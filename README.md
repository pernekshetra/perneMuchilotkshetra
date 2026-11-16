# PerneKshetra.com

This is a website built for the religious place in my hometown. 
This place is known for it's culture and simple mass marriage

[Visit pernekshetra.com](http://www.pernekshetra.com/)

Feel free to contribute, Raise a PR, follow best coding guidelines. 
If you contribute for a major feature, your name will be added to contribution list

Oushadhavana [README.md](https://github.com/pernekshetra/perneMuchilotkshetra/tree/main/oushadhavana#readme)

## Scripts

Run these from the repository root.

| Command | What it does |
| --- | --- |
| `python3 scripts/check-links.py` | Finds broken local links in all pages. CI runs it on every pull request. |
| `python3 scripts/optimize-images.py [files]` | Resizes and compresses images in place (needs ImageMagick). Run it on new images before you commit them. |
| `node scripts/build-sitemap.mjs` | Rebuilds `sitemap.xml`. Run it after you add or remove a page. |

Use paths that start with `/` (for example `/css/custom.css`) for links, scripts, styles and images. They work on every page, at any folder depth. To preview the site, run `python3 -m http.server 8765` from the repository root. Pages opened directly from disk (`file://`) do not load these paths.
