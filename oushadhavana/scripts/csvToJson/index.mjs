import https from 'https';
import fs from "fs";
import Papa from "papaparse";

const csvFilePath = '../../oushadhavana.csv';
const csvData = fs.readFileSync(csvFilePath, 'utf8');

const tempJson = `../../temp-json.mjs`;

// Parse CSV and convert to JSON
Papa.parse(csvData, {
  header: true,
  complete: function(results) {
    // Convert results to JSON
    const data = `const plants = ${JSON.stringify(results.data)};\n\nexport default plants;
    `
    fs.writeFile(tempJson, data, (err) => {
      if (err) {
        console.error('Error creating file:', err);
      } else {
        console.log('File created successfully');
      }
    });
  }
});

const filePath = '../../data.mjs';

// Check if the file exists
fs.access(filePath, fs.constants.F_OK, (err) => {
  if (err) {
    console.error('File does not exist');
    return;
  }

  // File exists, so delete it
  fs.unlink(filePath, (err) => {
    if (err) {
      console.error('Error deleting file:', err);
      return;
    }
    console.log('File deleted successfully');

    const newFilePath = '../../data.mjs';

    fs.rename(tempJson, newFilePath, (err) => {
      if (err) {
        console.error('Error renaming file:', err);
        return;
      }
      console.log('File renamed successfully');
    });
  });
});
