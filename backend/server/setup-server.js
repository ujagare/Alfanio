/**
 * Alfanio Server Setup Utility
 * This script helps diagnose and fix common server issues
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { execSync } = require('child_process');

// Create interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// ANSI color codes for better readability
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
};

// Print colored message
const print = (message, color = 'white') => {
  // console.log(colors[color] + message + colors.reset);  // [removed by fix script]
};

// Print header
const printHeader = () => {
  // console.log('\n');  // [removed by fix script]
  print('╔════════════════════════════════════════════════════════════╗', 'cyan');
  print('║                 ALFANIO SERVER SETUP UTILITY                ║', 'cyan');
  print('╚════════════════════════════════════════════════════════════╝', 'cyan');
  // console.log('\n');  // [removed by fix script]
};

// Check if .env file exists
const checkEnvFile = () => {
  const envPath = path.join(__dirname, '.env');
  const envExamplePath = path.join(__dirname, '.env.example');
  
  if (!fs.existsSync(envPath)) {
    print('❌ .env file not found!', 'red');
    
    if (fs.existsSync(envExamplePath)) {
      print('📝 Creating .env file from .env.example...', 'yellow');
      fs.copyFileSync(envExamplePath, envPath);
      print('✅ .env file created successfully!', 'green');
    } else {
      print('❌ .env.example file not found!', 'red');
      return false;
    }
  } else {
    print('✅ .env file exists', 'green');
  }
  
  return true;
};

// Update .env file with user input
const updateEnvFile = async () => {
  const envPath = path.join(__dirname, '.env');
  let envContent = fs.readFileSync(envPath, 'utf8');
  
  print('\n📝 Let\'s configure your server environment:', 'cyan');
  
  // MongoDB Configuration
  print('\n🗄️  MongoDB Configuration:', 'magenta');
  const mongoUri = await askQuestion('MongoDB URI (e.g., mongodb+srv://username:password@cluster.mongodb.net/dbname): ');
  if (mongoUri) {
    envContent = updateEnvVariable(envContent, 'MONGODB_URI', mongoUri);
  }
  
  // Email Configuration
  print('\n📧 Email Configuration:', 'magenta');
  print('Note: For Gmail, you need to use an App Password. Learn more: https://support.google.com/accounts/answer/185833', 'yellow');
  
  const emailUser = await askQuestion('Email address: ');
  if (emailUser) {
    envContent = updateEnvVariable(envContent, 'EMAIL_USER', emailUser);
  }
  
  const emailPass = await askQuestion('Email password or app password: ');
  if (emailPass) {
    envContent = updateEnvVariable(envContent, 'EMAIL_PASS', emailPass);
  }
  
  const emailFromName = await askQuestion('From name (e.g., Alfanio India): ');
  if (emailFromName) {
    envContent = updateEnvVariable(envContent, 'EMAIL_FROM_NAME', emailFromName);
  }
  
  const emailTo = await askQuestion('Contact form recipient email: ');
  if (emailTo) {
    envContent = updateEnvVariable(envContent, 'EMAIL_TO', emailTo);
  }
  
  // Write updated content back to .env file
  fs.writeFileSync(envPath, envContent);
  print('\n✅ Environment configuration updated successfully!', 'green');
};

// Update or add environment variable in .env content
const updateEnvVariable = (content, variable, value) => {
  const regex = new RegExp(`^${variable}=.*$`, 'm');
  
  if (regex.test(content)) {
    return content.replace(regex, `${variable}=${value}`);
  } else {
    return content + `\n${variable}=${value}`;
  }
};

// Ask question and return answer
const askQuestion = (question) => {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
};

// Check if MongoDB is installed
const checkMongoDB = async () => {
  print('\n🔍 Checking MongoDB connection...', 'cyan');
  
  try {
    // Load dotenv to get MongoDB URI
    require('dotenv').config({ path: path.join(__dirname, '.env') });
    
    if (!process.env.MONGODB_URI) {
      print('❌ MONGODB_URI not set in .env file', 'red');
      return false;
    }
    
    print('🔄 Attempting to connect to MongoDB...', 'yellow');
    
    // Try to connect to MongoDB
    const mongoose = require('mongoose');
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000 // 5 seconds timeout
    });
    
    print('✅ Successfully connected to MongoDB!', 'green');
    await mongoose.connection.close();
    return true;
  } catch (error) {
    print(`❌ MongoDB connection failed: ${error.message}`, 'red');
    
    if (error.message.includes('ENOTFOUND') || error.message.includes('ETIMEDOUT')) {
      print('💡 This appears to be a network connectivity issue. Please check your internet connection.', 'yellow');
    } else if (error.message.includes('Authentication failed')) {
      print('💡 Authentication failed. Please check your MongoDB username and password.', 'yellow');
    } else if (error.message.includes('bad auth')) {
      print('💡 Bad authentication. Your MongoDB URI might be incorrect.', 'yellow');
    }
    
    return false;
  }
};

// Check email configuration
const checkEmail = async () => {
  print('\n🔍 Checking email configuration...', 'cyan');
  
  try {
    // Load dotenv to get email config
    require('dotenv').config({ path: path.join(__dirname, '.env') });
    
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      print('❌ Email credentials not set in .env file', 'red');
      return false;
    }
    
    print('🔄 Attempting to connect to email server...', 'yellow');
    
    // Try to connect to email server
    const nodemailer = require('nodemailer');
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
    
    await transporter.verify();
    print('✅ Successfully connected to email server!', 'green');
    return true;
  } catch (error) {
    print(`❌ Email server connection failed: ${error.message}`, 'red');
    
    if (error.message.includes('Invalid login')) {
      print('💡 Invalid login. For Gmail, you need to use an App Password if 2FA is enabled.', 'yellow');
      print('💡 Learn more: https://support.google.com/accounts/answer/185833', 'yellow');
    }
    
    return false;
  }
};

// Check if required npm packages are installed
const checkDependencies = async () => {
  print('\n🔍 Checking required dependencies...', 'cyan');
  
  const requiredPackages = [
    'express',
    'mongoose',
    'nodemailer',
    'dotenv',
    'cors',
    'helmet',
    'compression',
    'express-mongo-sanitize',
    'xss-clean',
    'hpp',
    'express-rate-limit',
    'winston'
  ];
  
  const missingPackages = [];
  
  for (const pkg of requiredPackages) {
    try {
      require.resolve(pkg);
      print(`✅ ${pkg} is installed`, 'green');
    } catch (error) {
      print(`❌ ${pkg} is not installed`, 'red');
      missingPackages.push(pkg);
    }
  }
  
  if (missingPackages.length > 0) {
    print('\n📦 Installing missing packages...', 'yellow');
    
    try {
      const command = `npm install ${missingPackages.join(' ')} --save`;
      print(`Running: ${command}`, 'cyan');
      execSync(command, { stdio: 'inherit', cwd: __dirname });
      print('✅ All dependencies installed successfully!', 'green');
    } catch (error) {
      print(`❌ Failed to install dependencies: ${error.message}`, 'red');
      return false;
    }
  }
  
  return true;
};

// Create required directories
const createDirectories = () => {
  print('\n🔍 Checking required directories...', 'cyan');
  
  const directories = [
    path.join(__dirname, 'logs'),
    path.join(__dirname, 'assets'),
    path.join(__dirname, 'uploads')
  ];
  
  for (const dir of directories) {
    if (!fs.existsSync(dir)) {
      print(`📁 Creating directory: ${dir}`, 'yellow');
      fs.mkdirSync(dir, { recursive: true });
    } else {
      print(`✅ Directory exists: ${dir}`, 'green');
    }
  }
};

// Main function
const main = async () => {
  printHeader();
  
  print('This utility will help you set up and diagnose your Alfanio server.', 'cyan');
  print('It will check your environment, dependencies, and connections.', 'cyan');
  // console.log('\n');  // [removed by fix script]
  
  // Check .env file
  if (!checkEnvFile()) {
    print('❌ Cannot proceed without .env file', 'red');
    rl.close();
    return;
  }
  
  // Update .env file with user input
  const shouldUpdate = await askQuestion('Do you want to update your environment configuration? (y/n): ');
  if (shouldUpdate.toLowerCase() === 'y') {
    await updateEnvFile();
  }
  
  // Check dependencies
  await checkDependencies();
  
  // Create required directories
  createDirectories();
  
  // Check MongoDB connection
  const mongodbOk = await checkMongoDB();
  
  // Check email configuration
  const emailOk = await checkEmail();
  
  // console.log('\n');  // [removed by fix script]
  print('╔════════════════════════════════════════════════════════════╗', 'cyan');
  print('║                      SETUP SUMMARY                         ║', 'cyan');
  print('╚════════════════════════════════════════════════════════════╝', 'cyan');
  // console.log('\n');  // [removed by fix script]
  
  print(`MongoDB Connection: ${mongodbOk ? '✅ OK' : '❌ Failed'}`, mongodbOk ? 'green' : 'red');
  print(`Email Configuration: ${emailOk ? '✅ OK' : '❌ Failed'}`, emailOk ? 'green' : 'red');
  
  // console.log('\n');  // [removed by fix script]
  
  if (mongodbOk && emailOk) {
    print('🎉 All systems are ready! You can start your server now.', 'green');
    print('To start the server, run: node server.js', 'cyan');
  } else {
    print('⚠️ Some checks failed. Please fix the issues before starting the server.', 'yellow');
  }
  
  rl.close();
};

// Run the main function
main().catch(error => {
  print(`❌ An unexpected error occurred: ${error.message}`, 'red');
  rl.close();
});
