import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Configure environment variables
dotenv.config();

// Get the directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(express.json());
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Accept', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 204
}));

// Log all requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Contact model schema
const contactSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String },
  message: { type: String },
  type: { type: String, default: 'contact' },
  createdAt: { type: Date, default: Date.now }
});

const Contact = mongoose.model('Contact', contactSchema);

// Routes
app.get('/', (req, res) => {
  res.send('Alfanio API is running');
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', time: new Date().toISOString() });
});

// Contact form endpoint
app.post('/contact', async (req, res) => {
  try {
    console.log('Received contact form submission:', req.body);
    
    // Save to MongoDB
    const contact = new Contact(req.body);
    await contact.save();
    
    console.log('Contact saved to database:', contact._id);
    
    // Log email (instead of sending)
    console.log('Would have sent email to:', req.body.email);
    console.log('Email subject: Thank you for contacting Alfanio');
    
    res.status(201).json({ 
      success: true, 
      message: 'Your message has been received. We will contact you soon.',
      id: contact._id
    });
  } catch (error) {
    console.error('Error processing contact form:', error);
    res.status(500).json({ 
      success: false, 
      message: 'There was a problem processing your request. Please try again later.' 
    });
  }
});

// Brochure request endpoint
app.post('/brochure', async (req, res) => {
  try {
    console.log('Received brochure request:', req.body);
    
    // Save to MongoDB with type=brochure
    const brochureRequest = new Contact({
      ...req.body,
      type: 'brochure'
    });
    await brochureRequest.save();
    
    console.log('Brochure request saved to database:', brochureRequest._id);
    
    // Log email (instead of sending)
    console.log('Would have sent brochure to:', req.body.email);
    
    res.status(201).json({ 
      success: true, 
      message: 'Your brochure request has been received. We will send it to your email shortly.',
      id: brochureRequest._id
    });
  } catch (error) {
    console.error('Error processing brochure request:', error);
    res.status(500).json({ 
      success: false, 
      message: 'There was a problem processing your request. Please try again later.' 
    });
  }
});

// Connect to MongoDB
const connectDB = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    // Exit process with failure
    process.exit(1);
  }
};

// Start server
const startServer = async () => {
  try {
    await connectDB();
    
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`API available at http://localhost:${PORT}`);
      console.log('Email sending is DISABLED - all emails will be logged to console');
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Start the server
startServer();
