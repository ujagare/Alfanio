import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const assetsDir = path.join(__dirname, '..', 'src', 'assets', 'alaf-images');

// Create directories if they don't exist
fs.mkdirSync(assetsDir, { recursive: true });

// Rename images to proper format
fs.readdir(assetsDir, (err, files) => {
  if (err) throw err;
  
  files.forEach((file, index) => {
    if (file.match(/\(\d+\)/)) {
      const extension = path.extname(file);
      const newName = `image-${index + 1}${extension}`;
      fs.renameSync(
        path.join(assetsDir, file),
        path.join(assetsDir, newName)
      );
    }
  });
});

console.log('✅ Images validated and renamed successfully!');