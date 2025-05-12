import { build } from 'vite';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

// Load environment variables
dotenv.config({ path: path.join(rootDir, '.env') });

async function buildApp() {
  try {
    // Build frontend
    console.log('Building frontend...');
    await build({
      root: rootDir,
      build: {
        outDir: 'dist',
        emptyOutDir: true,
        sourcemap: false,
        minify: 'terser',
        terserOptions: {
          compress: {
            drop_console: true,
          },
        },
      },
    });

    // Copy necessary files
    console.log('Copying server files...');
    const serverFiles = [
      'server',
      'package.json',
      'package-lock.json',
      '.env',
    ];

    serverFiles.forEach(file => {
      const src = path.join(rootDir, file);
      const dest = path.join(rootDir, 'dist', file);
      
      if (fs.existsSync(src)) {
        if (fs.lstatSync(src).isDirectory()) {
          fs.cpSync(src, dest, { recursive: true });
        } else {
          fs.copyFileSync(src, dest);
        }
      }
    });

    console.log('Build completed successfully!');
  } catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
  }
}

buildApp();
