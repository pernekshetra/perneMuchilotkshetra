# Form maker

Make the Marriage Registration and Pandal Mangalam forms in the browser, then print or save as PDF.
This is not online registration: people sign the printed form and submit it at the temple.
There is no backend. Data stays in the browser.

| Page | Prints |
|---|---|
| `forms/marriage/` | 2 A4 pages: 1 form (sections A–F), 2 office use + Kannada/Malayalam instructions |
| `forms/pandal-mangalam/?lang=kn` | 1 A4 page, Kannada |
| `forms/pandal-mangalam/?lang=ml` | 1 A4 page, Malayalam |

## How it works

- `forms.js` builds the inputs (`PerneForm.field`), formats typing (dates DD/MM/YYYY, Aadhaar, phone, PIN), validates on blur, and copies values into the A4 `.sheet` markup (`data-bind`, `data-boxes`).
- `forms.css` is the screen UI. `sheet.css` is the A4 sheet and the print rules: `@media print` hides everything except the sheets, and `@page { margin: 0 }` removes browser headers/footers.
- Both forms use the same framed sheet design (`.sheet.mf` in `sheet.css`): maroon and gold frame, temple header, title band and lettered cards. Page-specific rows stay in each page's `<style>`.
- Wide screens show a live preview that highlights the focused field. Narrow screens open the preview as an overlay.
- The browser makes the PDF (Print → Save as PDF). The browser shapes Kannada/Malayalam text correctly; JS PDF libraries do not.
- A draft is kept in `localStorage` (`pernekshetra:form:<id>`). Fields with `data-nosave` (Aadhaar) are never stored. "Clear my data" removes the draft.
- Aadhaar numbers are checked with the Verhoeff check digit, and must not start with 0 or 1. This catches any single wrong digit and any swap of two neighbouring digits.
- "Print blank form" on the marriage page opens the temple's own paper form, `paper/MarriageApplicationPerneBlank.pdf`, in a new tab. People print it from the browser's PDF viewer and fill it in by hand. The new framed design prints only typed forms.
- "Print blank form" on the Pandal Mangalam page prints the framed sheets with empty fields (there is no paper PDF for it yet). The draft is not changed; the sheets show the values again when the print dialog closes.
- Each sheet footer (`[data-print-meta]`) shows the page number and "Filled online at pernekshetra.com/forms" ("Blank form" for a blank print). It does not show the print date.
- The framed sheets print 296mm tall in Chrome and Edge. In WebKit (Safari on a Mac, and every browser on iPhone and iPad) they print 275mm tall with shorter rows (`html.is-webkit`, set in `forms.js`), because Safari fits only about 275mm per page on its first layout and iOS adds its own margins.
- Google Analytics (`/js/analytics.js`) is loaded. On these pages it reports the URL without query parameters except `lang`, fixes the page title at load (Print renames the page to the PDF file name, which contains people's names), and turns off Google signals and ad personalisation. Form values are never sent. Keep "Form interactions" off in GA Enhanced measurement.
- Print and Print blank form send a GA event `form_printed` (on the marriage page, a click on the blank PDF link counts as `blank: yes`) with `form_name` (`marriage`, `pandal-mangalam`), `blank` (`yes`/`no`) and, on Pandal Mangalam, `lang`. To see these in GA reports, register them as custom dimensions (Admin → Custom definitions). Ctrl+P is not counted.
- Fonts are self-hosted in `fonts/` (SIL OFL 1.1): Anek for the screen UI (one design for Latin, Kannada and Malayalam); EB Garamond and Noto Serif Kannada/Malayalam for the printed sheet.

## Version numbers on CSS and JS

The form pages load `forms.css`, `sheet.css`, `forms.js` and `marriage.js` with `?v=<number>` (date and time, YYYYMMDDHHMM).
GitHub Pages lets browsers keep these files for 10 minutes. A new number makes browsers load the new files at once.
When you change any of these files, update the number in all three pages (macOS):

```sh
V=$(date +%Y%m%d%H%M)
sed -i '' -E "s/\?v=[0-9]+/?v=$V/g" forms/index.html forms/marriage/index.html forms/pandal-mangalam/index.html
```

## Social preview images

`og/forms.jpg`, `og/marriage.jpg` and `og/pandal.jpg` (1200x630) are the link previews for WhatsApp, Facebook and X.
They are rendered from `og/template.html` with the site's own photos and fonts. To regenerate (macOS):

```sh
python3 -m http.server 8765   # from the repo root, in another terminal
for f in forms marriage pandal; do
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --hide-scrollbars \
    --force-device-scale-factor=1 --window-size=1200,630 --virtual-time-budget=6000 \
    --screenshot="/tmp/og-$f.png" "http://127.0.0.1:8765/forms/og/template.html?f=$f"
  sips -s format jpeg -s formatOptions 84 "/tmp/og-$f.png" --out "forms/og/$f.jpg"
done
```

Keep each JPEG under about 300 KB, or WhatsApp may not show the preview.

## Proofreading needed

The source PDFs used old non-Unicode fonts, so the Kannada and Malayalam text was retyped from the page images.
A native reader must check:

1. `pandal-mangalam/index.html`: all `lang="kn"` and `lang="ml"` text.
2. `marriage/index.html`: the instructions on page 2 (ಸೂಚನೆಗಳು, നിർദേശങ്ങൾ).
3. `marriage/marriage.js`: the `kn` and `ml` labels (new translations, not on the paper form).

Points to check in particular:

- Malayalam "പെരുതണ" (Pandal form and marriage instruction 6) is copied from the paper form. Confirm the spelling.
- Malayalam "അച്ചന്റെ" / "അമ്മന്റെ" are copied from the paper form (vs. "അച്ഛന്റെ" / "അമ്മയുടെ").
- Small spelling fixes were made: ದೃಢೀಕರಿಸುವ, സർട്ടിഫിക്കറ്റ്, നിയമങ്ങളും.
