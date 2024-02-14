/* Script to delete plants directories when base.htmx is updated */
import fs from 'fs';
import plants from "../data.mjs";

const directoryPath = '../';

for(const plant of plants) {
  const folderNameToSearch = `${plant['Sanskrit Name'].toLowerCase().replace(/\s+/g, '_')}`;

  const files = fs.readdirSync(directoryPath);

  const matchingFolders = files.filter(file => {
    const filePath = `${directoryPath}/${file}`;
    return fs.statSync(filePath).isDirectory() && file === folderNameToSearch;
  });

  console.log('Matching folders:', matchingFolders);

  for(const folderPath of matchingFolders) {
    fs.rmdir(`../${folderPath}`, { recursive: true }, (err) => {
      if (err) {
        console.error('Error deleting folder:', err);
      } else {
        console.log('Folder deleted successfully', folderPath);
      }
    });
  }
}

