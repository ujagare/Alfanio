import mongoose from 'mongoose';
import winston from 'winston';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Configure database logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { service: 'database-service' },
  transports: [
    new winston.transports.File({ 
      filename: path.join(logsDir, 'database-error.log'), 
      level: 'error' 
    }),
    new winston.transports.File({ 
      filename: path.join(logsDir, 'database.log')
    }),
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

// Function to get public IP address
async function getPublicIpAddress() {
  try {
    const response = await axios.get('https://api.ipify.org?format=json');
    return response.data.ip;
  } catch (error) {
    logger.error('Failed to get public IP address', { error: error.message });
    return 'unknown';
  }
}

// Function to connect to MongoDB with retry logic
const connectToMongoDB = async (retries = 5) => {
  try {
    logger.info(`Connecting to MongoDB (attempt 1/${retries})...`);
    
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // Log connection success
    logger.info('MongoDB connection established successfully', {
      host: mongoose.connection.host,
      database: mongoose.connection.name
    });

    return true;

  } catch (error) {
    logger.error('MongoDB connection failed:', error);
    
    if (retries > 1) {
      logger.info(`Retrying connection... (${retries - 1} attempts remaining)`);
      await new Promise(resolve => setTimeout(resolve, 2000));
      return connectToMongoDB(retries - 1);
    }
    
    throw error;
  }
};

export { connectToMongoDB, logger };
