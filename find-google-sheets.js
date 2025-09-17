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

async function findGoogleSheets() {
  log(`🔍 Finding Google Sheets files in your Drive`, colors.blue);
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

    // Initialize Google Drive API
    const auth = new google.auth.GoogleAuth({
      credentials: serviceAccount,
      scopes: ['https://www.googleapis.com/auth/drive.readonly']
    });

    const drive = google.drive({ version: 'v3', auth });

    // Search for Google Sheets files
    log('1. Searching for Google Sheets files...', colors.blue);
    
    try {
      const response = await drive.files.list({
        q: "mimeType='application/vnd.google-apps.spreadsheet'",
        fields: 'files(id,name,createdTime,modifiedTime,webViewLink)',
        orderBy: 'modifiedTime desc',
        pageSize: 20
      });

      const files = response.data.files;
      
      if (files.length === 0) {
        log('   ⚠️  No Google Sheets files found', colors.yellow);
        log('   💡 You may need to create a Google Sheets file or convert your Excel file', colors.yellow);
        return;
      }

      log(`   ✅ Found ${files.length} Google Sheets files:`, colors.green);
      log('', colors.reset);

      files.forEach((file, index) => {
        log(`${index + 1}. "${file.name}"`, colors.cyan);
        log(`   ID: ${file.id}`, colors.cyan);
        log(`   Created: ${file.createdTime}`, colors.cyan);
        log(`   Modified: ${file.modifiedTime}`, colors.cyan);
        log(`   Link: ${file.webViewLink}`, colors.cyan);
        log('', colors.reset);
      });

      // Test each file to see if it works with Sheets API
      log('2. Testing each file with Google Sheets API...', colors.blue);
      
      const sheets = google.sheets({ version: 'v4', auth });
      
      for (const file of files) {
        try {
          log(`   Testing: "${file.name}" (${file.id})`, colors.cyan);
          
          // Try to get spreadsheet metadata
          const metadata = await sheets.spreadsheets.get({
            spreadsheetId: file.id
          });
          
          log(`   ✅ Works! Title: "${metadata.data.properties.title}"`, colors.green);
          
          // Try to read a simple range
          const range = 'A1:B1';
          const valuesResponse = await sheets.spreadsheets.values.get({
            spreadsheetId: file.id,
            range: range
          });
          
          const values = valuesResponse.data.values;
          log(`   ✅ Can read data: ${values ? values.length : 0} rows in ${range}`, colors.green);
          
          if (values && values.length > 0) {
            log(`   Sample data: ${JSON.stringify(values[0])}`, colors.cyan);
          }
          
          log(`   💡 Use this SHEET_ID: ${file.id}`, colors.yellow);
          log('', colors.reset);
          
        } catch (error) {
          log(`   ❌ Failed: ${error.message}`, colors.red);
          log('', colors.reset);
        }
      }

    } catch (error) {
      log(`❌ Error searching for files: ${error.message}`, colors.red);
    }

  } catch (error) {
    log(`❌ Test failed: ${error.message}`, colors.red);
  }
}

// Run the search
findGoogleSheets().catch(error => {
  log(`❌ Search failed: ${error.message}`, colors.red);
  process.exit(1);
});
