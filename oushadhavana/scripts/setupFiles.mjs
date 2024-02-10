import fs from 'fs';
import plants from '../data.mjs';

const pathOfFileToCopy = '../index.html';

for(const plant of plants) {
  const folderPath = `../${plant['sanskrit_name'].toLowerCase().replace(/\s+/g, '')}`;

  fs.mkdir(folderPath, (err) => {
    if (err) {
      console.error('Error creating folder:', err);
    } else {
      console.log('Folder created successfully');

      let fileContent;

      fs.readFile(pathOfFileToCopy, 'utf8', (err, data) => {
        if (err) {
          console.error('Error reading file:', err);
          return;
        }
        fileContent = data;
        console.log("read successful");

        const filePath = `${folderPath}/index.html`;
        console.log(typeof fileContent);

        fs.writeFile(filePath, fileContent, (err) => {
          if (err) {
            console.error('Error creating file:', err);
          } else {
            console.log('File created successfully');
          }
        });
      });
    }
  });
  console.log("file written");
  console.log("==============");
}

