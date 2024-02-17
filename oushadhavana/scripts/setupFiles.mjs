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
            let fileContent;

            fs.readFile(pathOfFileToCopy, 'utf8', (err, data) => {
              if (err) {
                console.error('Error reading file:', err);
                return;
              }
              fileContent = data;

              const filePath = `${folderPath}/index.html`;

              fs.writeFile(filePath, fileContent, (err) => {
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

