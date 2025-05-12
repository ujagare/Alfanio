import winston from 'winston';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Create console transport
const consoleTransport = new winston.transports.Console({
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.printf(({ level, message, timestamp, ...meta }) => {
      return `${timestamp} ${level}: ${message} ${Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''}`;
    })
  ),
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug'
});

// Create file transports
const fileTransport = new winston.transports.File({
  filename: path.join(logsDir, 'application.log'),
  maxsize: 5242880, // 5MB
  maxFiles: 5,
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug'
});

const errorFileTransport = new winston.transports.File({
  filename: path.join(logsDir, 'error.log'),
  maxsize: 5242880, // 5MB
  maxFiles: 5,
  level: 'error'
});

// Create logger
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: logFormat,
  defaultMeta: { service: 'alfanio-api' },
  transports: [
    fileTransport,
    consoleTransport,
    errorFileTransport
  ],
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join(logsDir, 'exceptions.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    consoleTransport
  ]
});

export default logger;
