// Simple script to test MongoDB connection
const mongoose = require('mongoose');
require('dotenv').config({ path: './backend/.env' });

async function testConnection() {
  // console.log('Testing MongoDB connection...');  // [removed by fix script]
  // console.log('MongoDB URI:', process.env.MONGODB_URI.replace(/mongodb\+srv:\/\/.*?@/, 'mongodb+srv://******@'));  // [removed by fix script]
  
  try {
    // Connect with no options
  // console.log('Attempting connection with no options...');  // [removed by fix script]
    await mongoose.connect(process.env.MONGODB_URI);
    
  // console.log('Connection successful!');  // [removed by fix script]
  // console.log('Connected to database:', mongoose.connection.name);  // [removed by fix script]
  // console.log('Connected to host:', mongoose.connection.host);  // [removed by fix script]
    
    // Close the connection
    await mongoose.connection.close();
  // console.log('Connection closed successfully');  // [removed by fix script]
    
    return true;
  } catch (error) {
  // console.error('Connection failed:');  // [removed by fix script]
  // console.error('- Error message:', error.message);  // [removed by fix script]
  // console.error('- Error name:', error.name);  // [removed by fix script]
  // console.error('- Error code:', error.code || 'N/A');  // [removed by fix script]
    
    return false;
  }
}

// Run the test
testConnection()
  .then(success => {
  // console.log('Test completed with ' + (success ? 'SUCCESS' : 'FAILURE'));  // [removed by fix script]
    process.exit(success ? 0 : 1);
  })
  .catch(err => {
  // console.error('Unexpected error:', err);  // [removed by fix script]
    process.exit(1);
  });
