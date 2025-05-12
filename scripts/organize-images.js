import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const assetsDir = path.join(__dirname, '..', 'src', 'assets');

const imageMap = {
  // About page images
  '(10).webp': 'about/hero.webp',
  '(11).webp': 'about/factory.webp',
  '(12).webp': 'about/machine-1.webp',
  '(13).webp': 'about/pump-1.webp',
  '(14).webp': 'about/pump-2.webp',
  '(15).webp': 'about/mixer.webp',
  
  // Product images
  'Twin-Shaft-Concrete-Mixer.jpg': 'products/twin-shaft-mixer.jpg',
  'Planetary-Concrete-Mixer.jpg': 'products/planetary-mixer.jpg'
};

// Create directories
const dirs = ['about', 'products', 'gallery'].map(dir => 
  path.join(assetsDir, 'alaf-images', dir)
);

dirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Move and rename files
Object.entries(imageMap).forEach(([oldName, newPath]) => {
  const oldPath = path.join(assetsDir, 'alaf-images', oldName);
  const newFullPath = path.join(assetsDir, 'alaf-images', newPath);
  
  if (fs.existsSync(oldPath)) {
    fs.renameSync(oldPath, newFullPath);
    console.log(`✅ Moved: ${oldName} → ${newPath}`);
  }
});