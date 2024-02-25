# How to update data?
1. Go to the oushadhavana google sheet.
2. Download the file as CSV
3. Rename the file to `oushadhavana.csv`
4. Replace the old `oushadhavana.csv` file at `~[repository_root]/oushadhavana/` with `oushadhavana.csv`.
5. Navigate to `~[repository_root]/oushadhavana/scripts/csvToJson`
6. Run `npm install` and then `npm start`. You will need nodeJs installed for this.
7. A `data.mjs` file will be created at `~[repository_root]/oushadhavana/` which is the data file.

# How to update or create the individual details file for each plant?
1. Once the `data.mjs` file is setup, navigate to `~[repository_root]/oushadhavana/scripts`.
2. Run `node deletePlantsDirectory.mjs`. This deletes all the outdated details page for each plant.
3. To create the files for plants from the latest data, while on `~[repository_root]/oushadhavana/scripts` run `node setupFiles.mjs`. This creates the individual details page for each plant.
4. The details page is based on `base.htmx` template file which is located at `~[repository_root/oushadhavana/`. Steps 1 to 3 will need to executed everytime there is a change done to this file so its gets reflected in the individual files.
