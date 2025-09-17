#!/usr/bin/env node

// Load environment variables from .env file
import 'dotenv/config';

// Test script for Google Sheets integration
import { testConnection, syncAnnotation } from './sheets-sync.js';

async function testSheetsIntegration() {
  console.log('🧪 Testing Google Sheets Integration...\n');
  
  // Check environment variables
  const sheetId = process.env.SHEET_ID;
  const sheetName = process.env.SHEET_NAME;
  
  if (!sheetId || !sheetName) {
    console.error('❌ Missing environment variables:');
    console.error('   SHEET_ID:', sheetId ? '✅ Set' : '❌ Missing');
    console.error('   SHEET_NAME:', sheetName ? '✅ Set' : '❌ Missing');
    console.error('\nPlease set these environment variables and try again.');
    process.exit(1);
  }
  
  console.log('📋 Configuration:');
  console.log(`   Sheet ID: ${sheetId}`);
  console.log(`   Sheet Name: ${sheetName}\n`);
  
  // Test connection
  console.log('1️⃣ Testing Google Sheets connection...');
  const connectionSuccess = await testConnection(sheetId, sheetName);
  
  if (!connectionSuccess) {
    console.error('❌ Connection test failed. Please check your setup.');
    process.exit(1);
  }
  
  // Test sync with sample data
  console.log('\n2️⃣ Testing sync with sample data...');
  const sampleFilename = '000089_0';
  const sampleSfCounts = {
    1: 1200,  // Road Surface
    2: 50,    // Curb
    3: 300,   // Vehiclee
    4: 0,     // Guard Rails (empty)
    5: 0,     // Protective Barrier (empty)
    6: 25,    // Street Light
    7: 0      // Sign and Overhead (empty)
  };
  
  const prevTime = new Date(Date.now() - 30 * 60 * 1000); // 30 minutes ago
  const currentTime = new Date();
  
  console.log(`   Filename: ${sampleFilename}`);
  console.log(`   SF Counts:`, sampleSfCounts);
  console.log(`   Time Range: ${prevTime.toISOString()} to ${currentTime.toISOString()}`);
  
  const syncSuccess = await syncAnnotation(
    sheetId, 
    sheetName, 
    sampleFilename, 
    sampleSfCounts, 
    prevTime, 
    currentTime
  );
  
  if (syncSuccess) {
    console.log('\n✅ Google Sheets integration test completed successfully!');
    console.log('\n📊 Expected Google Sheets updates:');
    console.log('   Column O (Road Surface): O');
    console.log('   Column P (Curb): O');
    console.log('   Column Q (Vehicle): O');
    console.log('   Column R (Guard Rails): X');
    console.log('   Column S (Protective Barrier): X');
    console.log('   Column T (Street Light): O');
    console.log('   Column U (Sign and Overhead): X');
    console.log('   Column V (Time Taken): ~30.0 minutes');
    console.log('   Column W (Comment): Completed. No problem. Review GOOD');
  } else {
    console.error('\n❌ Sync test failed. Please check your Google Sheets setup.');
    process.exit(1);
  }
}

// Run the test
testSheetsIntegration().catch(error => {
  console.error('❌ Test failed:', error.message);
  process.exit(1);
});
