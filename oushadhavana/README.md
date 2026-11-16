# How to update data?
1. Go to the oushadhavana google sheet.
2. Download the file as CSV
3. Rename the file to `oushadhavana.csv`
4. Replace the old `oushadhavana.csv` file at `~[repository_root]/oushadhavana/` with `oushadhavana.csv`.
5. Navigate to `~[repository_root]/oushadhavana/scripts/csvToJson`
6. Run `npm install` and then `npm start`. You will need nodeJs installed for this.
7. A `data.mjs` file will be created at `~[repository_root]/oushadhavana/` which is the data file.

# How to update or create the individual details file for each plant?
1. Once the `data.mjs` file is set up, go to `~[repository_root]/oushadhavana/scripts`.
2. Run `node setupFiles.mjs`. It creates or overwrites `oushadhavana/<plant>/index.html` for every plant in `data.mjs`.
3. Each page is built from the `base.htmx` template in `~[repository_root]/oushadhavana/`. The script fills the `%%TITLE%%`, `%%DESCRIPTION%%`, `%%URL%%` and `%%IMAGE%%` tokens for each plant. Run step 2 again after every change to `base.htmx` or `data.mjs`.
4. If you add or remove a plant, run `node scripts/build-sitemap.mjs` from the repository root to update `sitemap.xml`.

`deletePlantsDirectory.mjs` is needed only when a plant is removed from the sheet. It deletes the folders of the plants that are in `data.mjs`.
