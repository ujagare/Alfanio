// Simple script to test MongoDB connection
const mongoose = require('mongoose');
require('dotenv').config({ path: './backend/.env' });

async function testConnection() {
  console.log('Testing MongoDB connection...');
  console.log('MongoDB URI:', process.env.MONGODB_URI.replace(/mongodb\+srv:\/\/.*?@/, 'mongodb+srv://******@'));
  
  try {
    // Connect with no options
    console.log('Attempting connection with no options...');
    await mongoose.connect(process.env.MONGODB_URI);
    
    console.log('Connection successful!');
    console.log('Connected to database:', mongoose.connection.name);
    console.log('Connected to host:', mongoose.connection.host);
    
    // Close the connection
    await mongoose.connection.close();
    console.log('Connection closed successfully');
    
    return true;
  } catch (error) {
    console.error('Connection failed:');
    console.error('- Error message:', error.message);
    console.error('- Error name:', error.name);
    console.error('- Error code:', error.code || 'N/A');
    
    return false;
  }
}

// Run the test
testConnection()
  .then(success => {
    console.log('Test completed with ' + (success ? 'SUCCESS' : 'FAILURE'));
    process.exit(success ? 0 : 1);
  })
  .catch(err => {
    console.error('Unexpected error:', err);
    process.exit(1);
  });
