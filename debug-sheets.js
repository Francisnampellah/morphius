#!/usr/bin/env node

// Load environment variables
import 'dotenv/config';
import { initializeSheetsAPI, testConnection } from './sheets-sync.js';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m'
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

async function debugSheets() {
  const spreadsheetId = process.env.SHEET_ID;
  const sheetName = process.env.SHEET_NAME;
  
  if (!spreadsheetId || !sheetName) {
    log('❌ Missing SHEET_ID or SHEET_NAME environment variables', colors.red);
    log('Please check your .env file or environment variables', colors.yellow);
    process.exit(1);
  }

  log(`🔍 Debugging Google Sheets connection...`, colors.blue);
  log(`   Spreadsheet ID: ${spreadsheetId}`, colors.cyan);
  log(`   Sheet Name: ${sheetName}`, colors.cyan);
  log('', colors.reset);

  // Test basic connection
  log('1. Testing basic connection...', colors.blue);
  const connectionTest = await testConnection(spreadsheetId, sheetName);
  
  if (!connectionTest) {
    log('❌ Basic connection failed. Check your credentials and permissions.', colors.red);
    process.exit(1);
  }

  // Test reading different ranges
  log('', colors.reset);
  log('2. Testing different range reads...', colors.blue);
  
  const ranges = [
    `${sheetName}!A1:B1`,
    `${sheetName}!B:B`,
    `${sheetName}!B1:B10`,
    `${sheetName}!A1:Z1`
  ];

  for (const range of ranges) {
    try {
      log(`   Testing range: ${range}`, colors.cyan);
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: spreadsheetId,
        range: range,
      });
      
      const values = response.data.values;
      log(`   ✅ Success: Found ${values ? values.length : 0} rows`, colors.green);
      
      if (values && values.length > 0) {
        log(`   Sample data: ${JSON.stringify(values[0])}`, colors.cyan);
      }
    } catch (error) {
      log(`   ❌ Failed: ${error.message}`, colors.red);
    }
  }

  // Test searching for the specific filename
  log('', colors.reset);
  log('3. Testing filename search...', colors.blue);
  
  try {
    const range = `${sheetName}!B:B`;
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: spreadsheetId,
      range: range,
    });

    const values = response.data.values;
    if (values && values.length > 0) {
      log(`   Found ${values.length} rows in column B`, colors.green);
      
      // Show first few values
      for (let i = 0; i < Math.min(5, values.length); i++) {
        if (values[i] && values[i][0]) {
          log(`   Row ${i + 1}: "${values[i][0]}"`, colors.cyan);
        }
      }
      
      // Search for the specific filename
      const searchFilename = '000107-0';
      let found = false;
      for (let i = 0; i < values.length; i++) {
        if (values[i] && values[i][0] === searchFilename) {
          log(`   ✅ Found "${searchFilename}" in row ${i + 1}`, colors.green);
          found = true;
          break;
        }
      }
      
      if (!found) {
        log(`   ❌ Filename "${searchFilename}" not found in column B`, colors.red);
        log(`   Available filenames:`, colors.yellow);
        for (let i = 0; i < Math.min(10, values.length); i++) {
          if (values[i] && values[i][0]) {
            log(`     - "${values[i][0]}"`, colors.cyan);
          }
        }
      }
    } else {
      log('   ⚠️  No data found in column B', colors.yellow);
    }
  } catch (error) {
    log(`   ❌ Error reading column B: ${error.message}`, colors.red);
  }

  log('', colors.reset);
  log('🔍 Debug complete!', colors.blue);
}

// Run the debug function
debugSheets().catch(error => {
  log(`❌ Debug failed: ${error.message}`, colors.red);
  process.exit(1);
});
