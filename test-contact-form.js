// Test script for contact form email sending and MongoDB saving
const fetch = require('node-fetch');
const mongoose = require('mongoose');

// Define MongoDB schemas
const contactSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

// Create models
const Contact = mongoose.model('Contact', contactSchema);

// MongoDB connection function
const connectToMongoDB = async () => {
  try {
    // Construct URI from individual parts
    const username = encodeURIComponent('Alfanioindia');
    const password = encodeURIComponent('10Nu2FEpmRZuNFYf');
    const cluster = 'cluster0.0wbdp.mongodb.net';
    const dbName = 'Alfanio';

    const mongoURI = `mongodb+srv://${username}:${password}@${cluster}/${dbName}?retryWrites=true&w=majority`;
  // console.log(`Connecting to MongoDB Atlas...`);  // [removed by fix script]

    // Connect to MongoDB with modern options
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      minPoolSize: 5,
      retryWrites: true,
      w: 'majority'
    });

  // console.log('MongoDB connected successfully');  // [removed by fix script]
    return true;
  } catch (error) {
  // console.error('MongoDB connection error:', error.message);  // [removed by fix script]
    return false;
  }
};

// Test contact form submission
const testContactForm = async () => {
  try {
  // console.log('Testing contact form submission...');  // [removed by fix script]

    // Test data
    const testData = {
      name: 'Test User',
      email: 'test@example.com',
      phone: '+1234567890',
      message: 'This is a test message from the test script'
    };

    // Send request to contact endpoint
  // console.log('Sending request to /api/contact endpoint...');  // [removed by fix script]
    const contactResponse = await fetch('http://localhost:5001/api/contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });

    const contactResult = await contactResponse.json();
  // console.log('Response from /api/contact:', contactResult);  // [removed by fix script]

    // Check MongoDB for the test submission
    if (mongoose.connection.readyState === 1) {
  // console.log('Checking MongoDB for the test submission...');  // [removed by fix script]
      const latestContact = await Contact.findOne({ email: 'test@example.com' })
        .sort({ createdAt: -1 })
        .exec();

      if (latestContact) {
  // console.log('Found test submission in MongoDB:', latestContact);  // [removed by fix script]
      } else {
  // console.log('Test submission not found in MongoDB');  // [removed by fix script]
      }
    }

    return {
      contactEndpoint: contactResult
    };
  } catch (error) {
  // console.error('Test failed:', error);  // [removed by fix script]
    return { error: error.message };
  }
};

// Main function
const main = async () => {
  try {
    // Connect to MongoDB
    const isMongoConnected = await connectToMongoDB();
  // console.log(`MongoDB connection status: ${isMongoConnected ? 'Connected' : 'Failed to connect'}`);  // [removed by fix script]

    // Test contact form
    const testResults = await testContactForm();
  // console.log('Test results:', JSON.stringify(testResults, null, 2));  // [removed by fix script]

    // Close MongoDB connection
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
  // console.log('MongoDB connection closed');  // [removed by fix script]
    }
  } catch (error) {
  // console.error('Error in main function:', error);  // [removed by fix script]
  }
};

// Run the main function
main().catch(err => {
  // console.error('Unhandled error:', err);  // [removed by fix script]
  process.exit(1);
});
