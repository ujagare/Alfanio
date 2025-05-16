/**
 * Brochure Routes for Alfanio
 * This file handles all brochure-related routes
 */

import { Router } from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const router = Router();

// Add CORS headers to all responses in this router
router.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  next();
});

// Get directory name in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Simple logger function
const log = (level, message, data = {}) => {
  const timestamp = new Date().toISOString();
  console.log(JSON.stringify({ timestamp, level, message, ...data }));
};

// Define possible brochure paths
const possibleBrochurePaths = [
  path.join(__dirname, '../../assets/brochure.pdf'),
  path.join(__dirname, '../../assets/Alfanio.pdf'),
  path.join(__dirname, '../../../public/brochure.pdf'),
  path.join(__dirname, '../../../frontend/public/brochure.pdf'),
  '/var/www/Alfanio/backend/assets/brochure.pdf',
  '/var/www/Alfanio/backend/assets/Alfanio.pdf',
  '/opt/render/project/src/backend/assets/brochure.pdf',
  '/opt/render/project/src/backend/assets/Alfanio.pdf',
  '/opt/render/project/src/frontend/public/brochure.pdf'
];

// Find the first existing brochure file
const findBrochureFile = () => {
  for (const p of possibleBrochurePaths) {
    try {
      if (fs.existsSync(p)) {
        log('info', `Found brochure at: ${p}`);
        return p;
      }
    } catch (err) {
      log('warn', `Error checking path ${p}:`, { error: err.message });
    }
  }
  return null;
};

// Brochure download endpoint
router.get('/download', (req, res) => {
  try {
    log('info', 'Brochure download requested');

    // Find brochure file
    const brochurePath = findBrochureFile();

    if (brochurePath) {
      log('info', `Sending brochure from: ${brochurePath}`);

      // Set headers
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename="Alfanio-Brochure.pdf"');

      // Send file
      return res.sendFile(brochurePath);
    } else {
      log('error', 'Brochure file not found');
      return res.status(404).json({
        success: false,
        message: 'Brochure file not found'
      });
    }
  } catch (error) {
    log('error', 'Error serving brochure', { error: error.message });
    return res.status(500).json({
      success: false,
      message: 'Failed to serve brochure file'
    });
  }
});

// Brochure info endpoint
router.get('/info', (req, res) => {
  try {
    log('info', 'Brochure info requested');

    // Find brochure file
    const brochurePath = findBrochureFile();

    if (brochurePath) {
      // Get file stats
      const stats = fs.statSync(brochurePath);

      return res.json({
        success: true,
        filename: 'Alfanio-Brochure.pdf',
        size: stats.size,
        lastModified: stats.mtime,
        path: brochurePath
      });
    } else {
      return res.status(404).json({
        success: false,
        message: 'Brochure file not found'
      });
    }
  } catch (error) {
    log('error', 'Error getting brochure info', { error: error.message });
    return res.status(500).json({
      success: false,
      message: 'Failed to get brochure info'
    });
  }
});

export default router;
