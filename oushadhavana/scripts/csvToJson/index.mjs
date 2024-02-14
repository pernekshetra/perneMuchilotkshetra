import https from 'https';
import fs from "fs";
import Papa from "papaparse";

const csvFilePath = '../../oushadhavana.csv';
const csvData = fs.readFileSync(csvFilePath, 'utf8');

function getDate() {
  const currentDate = new Date();

  const options = {
    weekday: 'long', // full name of the weekday (e.g., "Monday")
    year: 'numeric', // full numeric representation of the year (e.g., "2024")
    month: 'long', // full name of the month (e.g., "February")
    day: 'numeric', // day of the month (e.g., "13")
    hour: 'numeric', // hour in 24-hour format (e.g., "15")
    minute: 'numeric', // minute (e.g., "42")
    second: 'numeric', // second (e.g., "59")
    timeZoneName: 'short' // abbreviated name of the time zone (e.g., "EST")
  };

  return new Intl.DateTimeFormat('en-US', options).format(currentDate);
}

// Parse CSV and convert to JSON
Papa.parse(csvData, {
  header: true,
  complete: function(results) {
    // Convert results to JSON
    const jsonData = JSON.stringify(results.data);
    const filePath = `../../json-${getDate()}.mjs`;

    fs.writeFile(filePath, jsonData, (err) => {
      if (err) {
        console.error('Error creating file:', err);
      } else {
        console.log('File created successfully');
      }
    });
  }
});

