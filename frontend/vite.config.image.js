import { defineConfig } from 'vite';
import { promises as fs } from 'fs';
import path from 'path';
import sharp from 'sharp';

// Image optimization configuration
export default defineConfig({
  name: 'image-optimizer',
  enforce: 'pre',
  async buildStart() {
    console.log('Starting image optimization...');
    
    // Define source and destination directories
    const srcDir = path.resolve(__dirname, 'src/assets');
    const destDir = path.resolve(__dirname, 'public/assets/optimized');
    
    // Create destination directory if it doesn't exist
    try {
      await fs.mkdir(destDir, { recursive: true });
      console.log(`Created directory: ${destDir}`);
    } catch (err) {
      console.error(`Error creating directory: ${err.message}`);
    }
    
    // Process images
    try {
      await processImages(srcDir, destDir);
      console.log('Image optimization completed successfully');
    } catch (err) {
      console.error(`Error processing images: ${err.message}`);
    }
  }
});

// Function to process images recursively
async function processImages(srcDir, destDir) {
  // Read directory contents
  const entries = await fs.readdir(srcDir, { withFileTypes: true });
  
  // Process each entry
  for (const entry of entries) {
    const srcPath = path.join(srcDir, entry.name);
    
    if (entry.isDirectory()) {
      // Create corresponding destination directory
      const nestedDestDir = path.join(destDir, entry.name);
      await fs.mkdir(nestedDestDir, { recursive: true });
      
      // Process nested directory
      await processImages(srcPath, nestedDestDir);
    } else if (isImageFile(entry.name)) {
      // Process image file
      await optimizeImage(srcPath, destDir, entry.name);
    }
  }
}

// Function to check if a file is an image
function isImageFile(filename) {
  const ext = path.extname(filename).toLowerCase();
  return ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext);
}

// Function to optimize an image
async function optimizeImage(srcPath, destDir, filename) {
  const ext = path.extname(filename).toLowerCase();
  const baseName = path.basename(filename, ext);
  
  try {
    // Load the image
    const image = sharp(srcPath);
    const metadata = await image.metadata();
    
    // Skip if image is already optimized (check file size)
    const stats = await fs.stat(srcPath);
    if (stats.size < 10 * 1024) { // Skip files smaller than 10KB
      console.log(`Skipping small image: ${filename}`);
      return;
    }
    
    // Create WebP version
    const webpPath = path.join(destDir, `${baseName}.webp`);
    await image
      .webp({ quality: 80 })
      .toFile(webpPath);
    console.log(`Created WebP: ${webpPath}`);
    
    // Create responsive versions for larger images
    if (metadata.width > 800) {
      // Medium size (800px width)
      const mediumPath = path.join(destDir, `${baseName}-800.webp`);
      await sharp(srcPath)
        .resize(800)
        .webp({ quality: 75 })
        .toFile(mediumPath);
      console.log(`Created medium: ${mediumPath}`);
      
      // Small size (400px width)
      const smallPath = path.join(destDir, `${baseName}-400.webp`);
      await sharp(srcPath)
        .resize(400)
        .webp({ quality: 70 })
        .toFile(smallPath);
      console.log(`Created small: ${smallPath}`);
    }
    
    // Create original format optimized version
    if (ext === '.jpg' || ext === '.jpeg') {
      const jpgPath = path.join(destDir, filename);
      await sharp(srcPath)
        .jpeg({ quality: 85, progressive: true })
        .toFile(jpgPath);
      console.log(`Optimized JPEG: ${jpgPath}`);
    } else if (ext === '.png') {
      const pngPath = path.join(destDir, filename);
      await sharp(srcPath)
        .png({ compressionLevel: 9, progressive: true })
        .toFile(pngPath);
      console.log(`Optimized PNG: ${pngPath}`);
    }
  } catch (err) {
    console.error(`Error optimizing ${filename}: ${err.message}`);
  }
}
