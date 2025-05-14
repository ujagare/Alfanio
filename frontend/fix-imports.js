/**
 * This script scans all JavaScript and JSX files in the project
 * and fixes case sensitivity issues in import paths.
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

// Regular expression to match import statements
const importRegex = /import\s+(?:(?:{[^}]*})|(?:[^{}\s,]+))\s+from\s+['"]([^'"]+)['"]/g;

// Function to get all files recursively
async function getFiles(dir) {
  const subdirs = await readdir(dir);
  const files = await Promise.all(subdirs.map(async (subdir) => {
    const res = path.resolve(dir, subdir);
    return (await stat(res)).isDirectory() ? getFiles(res) : res;
  }));
  return files.flat();
}

// Function to check if a file exists with different case
async function findFileWithCorrectCase(importPath, basePath) {
  try {
    // Get the directory and filename from the import path
    const dirPath = path.dirname(importPath);
    const fileName = path.basename(importPath);

    // Resolve the absolute directory path
    const absoluteDirPath = path.resolve(basePath, dirPath);

    // Check if the directory exists
    await stat(absoluteDirPath);

    // Get all files in the directory
    const files = await readdir(absoluteDirPath);

    // Find a file that matches the filename (case-insensitive)
    const correctFile = files.find(file => file.toLowerCase() === fileName.toLowerCase());

    if (correctFile) {
      return path.join(dirPath, correctFile);
    }

    return null;
  } catch (error) {
    return null;
  }
}

// Function to fix imports in a file
async function fixImportsInFile(filePath) {
  try {
    // Read the file content
    const content = await readFile(filePath, 'utf8');

    // Get the base directory of the file
    const baseDir = path.dirname(filePath);

    // Find all import statements
    let match;
    let newContent = content;
    let hasChanges = false;

    // Reset the regex
    importRegex.lastIndex = 0;

    // Collect all matches first to avoid regex issues with global flag
    const matches = [];
    while ((match = importRegex.exec(content)) !== null) {
      matches.push({
        fullMatch: match[0],
        importPath: match[1]
      });
    }

    // Process each match
    for (const { fullMatch, importPath } of matches) {
      // Skip node_modules and relative imports that don't start with . or ..
      if (!importPath.startsWith('.')) {
        continue;
      }

      // Check if the import path has an extension
      const hasExtension = path.extname(importPath) !== '';

      // Try to find the correct case for the file
      let correctPath = null;

      if (hasExtension) {
        // If it has an extension, check directly
        correctPath = await findFileWithCorrectCase(importPath, baseDir);
      } else {
        // If it doesn't have an extension, try with common extensions
        for (const ext of ['.js', '.jsx', '.ts', '.tsx', '.json']) {
          const pathWithExt = `${importPath}${ext}`;
          const found = await findFileWithCorrectCase(pathWithExt, baseDir);
          if (found) {
            // Remove the extension as it was not in the original import
            correctPath = found.slice(0, -ext.length);
            break;
          }
        }

        // If still not found, try as a directory
        if (!correctPath) {
          const dirPath = path.resolve(baseDir, importPath);
          try {
            const dirStat = await stat(dirPath);
            if (dirStat.isDirectory()) {
              // It's a directory, keep the original path
              correctPath = importPath;
            }
          } catch (error) {
            // Not a directory, try to find a similar path
            correctPath = await findFileWithCorrectCase(importPath, baseDir);
          }
        }
      }

      // If a correct path was found and it's different from the original
      if (correctPath && correctPath !== importPath) {
        const newImport = fullMatch.replace(importPath, correctPath);
        newContent = newContent.replace(fullMatch, newImport);
        hasChanges = true;
        console.log(`Fixed import in ${filePath}: ${importPath} -> ${correctPath}`);
      }
    }

    // Write the file if changes were made
    if (hasChanges) {
      await writeFile(filePath, newContent, 'utf8');
      console.log(`Updated ${filePath}`);
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
      const fixed = await fixImportsInFile(file);
      if (fixed) {
        fixedCount++;
      }
    }

    console.log(`Fixed imports in ${fixedCount} files`);
  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the script
main();
