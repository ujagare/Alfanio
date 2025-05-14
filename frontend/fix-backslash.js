/**
 * This script replaces all backslashes (\) with forward slashes (/) in import paths
 * in all JavaScript and JSX files in the project.
 */

import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

// Regular expression to match import statements with backslashes
const importRegex = /import\s+(?:(?:{[^}]*})|(?:[^{}\s,]+))\s+from\s+['"]([^'"\\]*(?:\\[^'"]*)+[^'"]*)['"]/g;
const pathRegex = /['"]([^'"\\]*(?:\\[^'"]*)+[^'"]*)['"]/g;

// Function to get all files recursively
async function getFiles(dir) {
  const subdirs = await readdir(dir);
  const files = await Promise.all(subdirs.map(async (subdir) => {
    const res = path.resolve(dir, subdir);
    return (await stat(res)).isDirectory() ? getFiles(res) : res;
  }));
  return files.flat();
}

// Function to fix backslashes in a file
async function fixBackslashesInFile(filePath) {
  try {
    // Read the file content
    const content = await readFile(filePath, 'utf8');
    
    // Check if the file contains backslashes in import paths
    const hasBackslashes = content.match(importRegex) || content.match(pathRegex);
    
    if (!hasBackslashes) {
      return false;
    }
    
    // Replace backslashes with forward slashes in import paths
    let newContent = content.replace(importRegex, (match) => {
      return match.replace(/\\/g, '/');
    });
    
    // Also replace backslashes in other string literals that might be paths
    newContent = newContent.replace(pathRegex, (match) => {
      // Only replace if it looks like a path (contains backslashes)
      if (match.includes('\\')) {
        return match.replace(/\\/g, '/');
      }
      return match;
    });
    
    // Write the file if changes were made
    if (newContent !== content) {
      await writeFile(filePath, newContent, 'utf8');
      console.log(`Fixed backslashes in ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
    return false;
  }
}

// Main function
async function main() {
  try {
    // Get all JS and JSX files
    const srcDir = path.resolve(__dirname, 'src');
    const allFiles = await getFiles(srcDir);
    const jsFiles = allFiles.filter(file => /\.(js|jsx)$/.test(file));
    
    console.log(`Found ${jsFiles.length} JavaScript/JSX files to process`);
    
    // Process each file
    let fixedCount = 0;
    for (const file of jsFiles) {
      const fixed = await fixBackslashesInFile(file);
      if (fixed) {
        fixedCount++;
      }
    }
    
    console.log(`Fixed backslashes in ${fixedCount} files`);
  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the script
main();
