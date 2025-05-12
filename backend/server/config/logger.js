import winston from 'winston';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create logs directory at project root
const projectRoot = path.join(__dirname, '../../');
const logsDir = path.join(projectRoot, 'logs');

// Create directory synchronously
try {
    if (!fs.existsSync(logsDir)) {
        fs.mkdirSync(logsDir, { recursive: true });
    }
} catch (error) {
    console.error('Failed to create logs directory:', error);
}

const logger = {
  info: (message, meta = {}) => console.log('[INFO]', message, meta),
  error: (message, meta = {}) => console.error('[ERROR]', message, meta),
  warn: (message, meta = {}) => console.warn('[WARN]', message, meta)
};

export default logger;