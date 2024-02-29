import fs from 'fs';
import plants from '../data.mjs';

const pathOfFileToCopy = '../base.htmx';

for(const plant of plants) {
  const folderPath = `../${plant['Sanskrit Name'].toLowerCase().replace(/\s+/g, '_')}`;

  fs.stat(folderPath, (err, stats) => {
    if (err) {
      if (err.code === 'ENOENT') {
        fs.mkdir(folderPath, (err) => {
          if (err) {
            console.error('Error creating folder:', err);
            return;
          } else {

            fs.readFile(pathOfFileToCopy, 'utf8', (err, html) => {
              if (err) {
                console.error('Error reading file:', err);
                return;
              }

              const titleStart = html.indexOf('<title>');
              const titleEnd = html.indexOf('</title>');

              if (titleStart === -1 || titleEnd === -1) {
                console.error('Title tag not found in the HTML file');
                return;
              }

              html.substring(titleStart + 7, titleEnd);

              const newTitle = `${plant['Sanskrit Name']} Oushadhavana - Perne`;
              const updatedHtml = html.substring(0, titleStart + 7) + newTitle + html.substring(titleEnd);

              const filePath = `${folderPath}/index.html`;

              fs.writeFile(filePath, updatedHtml, (err) => {
                if (err) {
                  console.error('Error creating file:', err);
                } else {
                  console.log('File created successfully', filePath);
                }
              });
            });
          }
        });
      } else {
        console.error('Error checking folder:', err);
      }
    } else {
      if (stats.isDirectory()) {
        console.log('Folder exists', folderPath);
        return;
      } else {
        console.log('Path exists, but is not a folder');
        return;
      }
    }
  });

}

