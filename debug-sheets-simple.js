#!/usr/bin/env node

// Load environment variables
import 'dotenv/config';
import { google } from 'googleapis';
import fs from 'fs';

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

async function debugSheetsSimple() {
  const spreadsheetId = process.env.SHEET_ID;
  const sheetName = process.env.SHEET_NAME;
  
  log(`🔍 Simple Google Sheets Debug`, colors.blue);
  log(`   Spreadsheet ID: ${spreadsheetId}`, colors.cyan);
  log(`   Sheet Name: "${sheetName}"`, colors.cyan);
  log('', colors.reset);

  try {
    // Load service account credentials
    const serviceAccountPath = './uploader.json';
    if (!fs.existsSync(serviceAccountPath)) {
      log(`❌ Service account file not found: ${serviceAccountPath}`, colors.red);
      return;
    }

    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
    log(`✅ Service account loaded: ${serviceAccount.client_email}`, colors.green);

    // Initialize Google Sheets API
    const auth = new google.auth.GoogleAuth({
      credentials: serviceAccount,
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });

    const sheets = google.sheets({ version: 'v4', auth });

    // Test 1: Get spreadsheet metadata
    log('1. Testing spreadsheet metadata...', colors.blue);
    try {
      const metadata = await sheets.spreadsheets.get({
        spreadsheetId: spreadsheetId
      });
      
      log(`   ✅ Spreadsheet title: "${metadata.data.properties.title}"`, colors.green);
      log(`   ✅ Sheets available:`, colors.green);
      
      metadata.data.sheets.forEach((sheet, index) => {
        log(`     ${index + 1}. "${sheet.properties.title}" (ID: ${sheet.properties.sheetId})`, colors.cyan);
      });
    } catch (error) {
      log(`   ❌ Error getting metadata: ${error.message}`, colors.red);
      return;
    }

    // Test 2: Try different range formats
    log('', colors.reset);
    log('2. Testing different range formats...', colors.blue);
    
    const testRanges = [
      `${sheetName}!A1`,
      `${sheetName}!A1:B1`,
      `${sheetName}!A1:Z1`,
      `'${sheetName}'!A1:B1`,
      `'${sheetName}'!A1:Z1`
    ];

    for (const range of testRanges) {
      try {
        log(`   Testing: ${range}`, colors.cyan);
        const response = await sheets.spreadsheets.values.get({
          spreadsheetId: spreadsheetId,
          range: range
        });
        
        const values = response.data.values;
        log(`   ✅ Success: ${values ? values.length : 0} rows`, colors.green);
        
        if (values && values.length > 0) {
          log(`   Sample: ${JSON.stringify(values[0])}`, colors.cyan);
        }
      } catch (error) {
        log(`   ❌ Failed: ${error.message}`, colors.red);
      }
    }

    // Test 3: Try reading column B specifically
    log('', colors.reset);
    log('3. Testing column B read...', colors.blue);
    
    try {
      const range = `${sheetName}!B:B`;
      log(`   Range: ${range}`, colors.cyan);
      
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: spreadsheetId,
        range: range
      });
      
      const values = response.data.values;
      log(`   ✅ Column B read successful: ${values ? values.length : 0} rows`, colors.green);
      
      if (values && values.length > 0) {
        log(`   First 5 values in column B:`, colors.cyan);
        for (let i = 0; i < Math.min(5, values.length); i++) {
          if (values[i] && values[i][0]) {
            log(`     Row ${i + 1}: "${values[i][0]}"`, colors.cyan);
          }
        }
      }
    } catch (error) {
      log(`   ❌ Column B read failed: ${error.message}`, colors.red);
      
      // Try alternative approach
      log('   Trying alternative approach...', colors.yellow);
      try {
        const range = `${sheetName}!B1:B10`;
        const response = await sheets.spreadsheets.values.get({
          spreadsheetId: spreadsheetId,
          range: range
        });
        
        const values = response.data.values;
        log(`   ✅ Alternative approach worked: ${values ? values.length : 0} rows`, colors.green);
      } catch (altError) {
        log(`   ❌ Alternative approach also failed: ${altError.message}`, colors.red);
      }
    }

  } catch (error) {
    log(`❌ Debug failed: ${error.message}`, colors.red);
  }
}

// Run the debug function
debugSheetsSimple().catch(error => {
  log(`❌ Debug failed: ${error.message}`, colors.red);
  process.exit(1);
});
