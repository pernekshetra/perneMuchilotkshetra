# Online forms

Fill the Marriage Registration and Pandal Mangalam forms in the browser, then print or save as PDF.
There is no backend. Data stays in the browser.

| Page | Prints |
|---|---|
| `forms/marriage/` | 2 A4 pages (form + Kannada/Malayalam instructions + office use) |
| `forms/pandal-mangalam/?lang=kn` | 1 A4 page, Kannada |
| `forms/pandal-mangalam/?lang=ml` | 1 A4 page, Malayalam |

## How it works

- `forms.js` builds the inputs (`PerneForm.field`), formats typing (dates DD/MM/YYYY, Aadhaar, phone, PIN), validates on blur, and copies values into the A4 `.sheet` markup (`data-bind`, `data-boxes`).
- `forms.css` is the screen UI. `sheet.css` is the A4 sheet and the print rules: `@media print` hides everything except the sheets, and `@page { margin: 0 }` removes browser headers/footers.
- Wide screens show a live preview that highlights the focused field. Narrow screens open the preview as an overlay.
- The browser makes the PDF (Print → Save as PDF). The browser shapes Kannada/Malayalam text correctly; JS PDF libraries do not.
- A draft is kept in `localStorage` (`pernekshetra:form:<id>`). Fields with `data-nosave` (Aadhaar) are never stored. "Clear my data" removes the draft.
- No analytics script is loaded on these pages.
- Fonts are self-hosted in `fonts/` (SIL OFL 1.1): Anek for the screen UI (one design for Latin, Kannada and Malayalam); EB Garamond and Noto Serif Kannada/Malayalam for the printed sheet.

## Test

Add `?demo=1` to a form URL to fill sample data (it is not saved).
For example: `forms/marriage/?demo=1`, `forms/pandal-mangalam/?lang=ml&demo=1`.

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
