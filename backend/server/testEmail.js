/**
 * Test Email Script for Alfanio
 * 
 * This script tests email sending functionality using Nodemailer
 * Run with: node testEmail.js
 */

import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Email configuration
const EMAIL_CONFIG = {
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER || 'alfanioindia@gmail.com',
    pass: process.env.EMAIL_PASS || 'ogwoqwpovqfcgacz' // App password from 2-step verification
  },
  from: `${process.env.EMAIL_FROM_NAME || 'Alfanio India'} <${process.env.EMAIL_USER || 'alfanioindia@gmail.com'}>`,
  to: process.env.EMAIL_TO || 'alfanioindia@gmail.com'
};

// Log configuration
console.log('Email Configuration:');
console.log('- Host:', EMAIL_CONFIG.host);
console.log('- Port:', EMAIL_CONFIG.port);
console.log('- Secure:', EMAIL_CONFIG.secure);
console.log('- User:', EMAIL_CONFIG.auth.user);
console.log('- From:', EMAIL_CONFIG.from);
console.log('- To:', EMAIL_CONFIG.to);

// Test with Gmail service configuration
async function testGmailService() {
  console.log('\n--- Testing with Gmail Service Configuration ---');
  
  try {
    // Create transport
    const transport = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: EMAIL_CONFIG.auth.user,
        pass: EMAIL_CONFIG.auth.pass
      }
    });
    
    // Verify connection
    console.log('Verifying connection...');
    const isVerified = await transport.verify();
    console.log('Connection verified:', isVerified);
    
    // Send test email
    console.log('Sending test email...');
    const info = await transport.sendMail({
      from: EMAIL_CONFIG.from,
      to: EMAIL_CONFIG.to,
      subject: 'Test Email from Alfanio (Gmail Service)',
      text: 'This is a test email from Alfanio using Gmail service configuration.',
      html: `
        <h2>Test Email from Alfanio</h2>
        <p>This is a test email sent using Gmail service configuration.</p>
        <p>Time: ${new Date().toISOString()}</p>
      `
    });
    
    console.log('Email sent successfully!');
    console.log('Message ID:', info.messageId);
    console.log('Response:', info.response);
    
    return true;
  } catch (error) {
    console.error('Error sending email with Gmail service:', error);
    return false;
  }
}

// Test with SMTP configuration
async function testSmtpConfiguration() {
  console.log('\n--- Testing with SMTP Configuration ---');
  
  try {
    // Create transport
    const transport = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: EMAIL_CONFIG.auth.user,
        pass: EMAIL_CONFIG.auth.pass
      },
      tls: {
        rejectUnauthorized: false
      }
    });
    
    // Verify connection
    console.log('Verifying connection...');
    const isVerified = await transport.verify();
    console.log('Connection verified:', isVerified);
    
    // Send test email
    console.log('Sending test email...');
    const info = await transport.sendMail({
      from: EMAIL_CONFIG.from,
      to: EMAIL_CONFIG.to,
      subject: 'Test Email from Alfanio (SMTP)',
      text: 'This is a test email from Alfanio using SMTP configuration.',
      html: `
        <h2>Test Email from Alfanio</h2>
        <p>This is a test email sent using SMTP configuration.</p>
        <p>Time: ${new Date().toISOString()}</p>
      `
    });
    
    console.log('Email sent successfully!');
    console.log('Message ID:', info.messageId);
    console.log('Response:', info.response);
    
    return true;
  } catch (error) {
    console.error('Error sending email with SMTP:', error);
    return false;
  }
}

// Run tests
async function runTests() {
  console.log('Starting email tests...');
  
  // Test Gmail service
  const gmailServiceResult = await testGmailService();
  
  // Test SMTP configuration
  const smtpResult = await testSmtpConfiguration();
  
  // Print summary
  console.log('\n--- Test Results ---');
  console.log('Gmail Service Test:', gmailServiceResult ? 'SUCCESS' : 'FAILED');
  console.log('SMTP Test:', smtpResult ? 'SUCCESS' : 'FAILED');
  
  if (!gmailServiceResult && !smtpResult) {
    console.log('\nBoth tests failed. Possible issues:');
    console.log('1. Incorrect email credentials');
    console.log('2. Gmail security settings blocking the connection');
    console.log('3. Network issues preventing connection to Gmail servers');
    console.log('\nTroubleshooting steps:');
    console.log('1. Verify the App Password is correct');
    console.log('2. Check if 2-Step Verification is enabled on the Gmail account');
    console.log('3. Check if there are any security alerts in the Gmail account');
    console.log('4. Try generating a new App Password');
  }
}

// Run the tests
runTests().catch(error => {
  console.error('Error running tests:', error);
});
