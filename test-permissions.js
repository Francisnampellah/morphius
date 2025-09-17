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

async function testPermissions() {
  const spreadsheetId = process.env.SHEET_ID;
  
  log(`🔍 Testing Google Sheets Permissions`, colors.blue);
  log(`   Spreadsheet ID: ${spreadsheetId}`, colors.cyan);
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

    // Initialize Google Drive API (to test basic access)
    const auth = new google.auth.GoogleAuth({
      credentials: serviceAccount,
      scopes: [
        'https://www.googleapis.com/auth/drive.readonly',
        'https://www.googleapis.com/auth/spreadsheets.readonly'
      ]
    });

    const drive = google.drive({ version: 'v3', auth });

    // Test 1: Check if we can access the file via Drive API
    log('1. Testing Drive API access...', colors.blue);
    try {
      const file = await drive.files.get({
        fileId: spreadsheetId,
        fields: 'id,name,mimeType,permissions'
      });
      
      log(`   ✅ File found: "${file.data.name}"`, colors.green);
      log(`   ✅ MIME type: ${file.data.mimeType}`, colors.green);
      
      if (file.data.permissions) {
        log(`   ✅ Permissions:`, colors.green);
        file.data.permissions.forEach(perm => {
          log(`     - ${perm.role}: ${perm.emailAddress || perm.displayName || 'Unknown'}`, colors.cyan);
        });
      }
    } catch (error) {
      log(`   ❌ Drive API access failed: ${error.message}`, colors.red);
      
      if (error.message.includes('not found')) {
        log(`   💡 The spreadsheet ID might be incorrect or the file doesn't exist`, colors.yellow);
      } else if (error.message.includes('permission')) {
        log(`   💡 The service account might not have access to this file`, colors.yellow);
        log(`   💡 Make sure to share the spreadsheet with: ${serviceAccount.client_email}`, colors.yellow);
      }
      return;
    }

    // Test 2: Try to access via Sheets API with different scopes
    log('', colors.reset);
    log('2. Testing Sheets API with different scopes...', colors.blue);
    
    const scopes = [
      'https://www.googleapis.com/auth/spreadsheets.readonly',
      'https://www.googleapis.com/auth/spreadsheets'
    ];

    for (const scope of scopes) {
      try {
        log(`   Testing scope: ${scope}`, colors.cyan);
        
        const auth2 = new google.auth.GoogleAuth({
          credentials: serviceAccount,
          scopes: [scope]
        });

        const sheets = google.sheets({ version: 'v4', auth: auth2 });
        
        // Try to get spreadsheet metadata
        const metadata = await sheets.spreadsheets.get({
          spreadsheetId: spreadsheetId
        });
        
        log(`   ✅ Success with scope: ${scope}`, colors.green);
        log(`   ✅ Spreadsheet title: "${metadata.data.properties.title}"`, colors.green);
        break;
        
      } catch (error) {
        log(`   ❌ Failed with scope ${scope}: ${error.message}`, colors.red);
      }
    }

  } catch (error) {
    log(`❌ Test failed: ${error.message}`, colors.red);
  }
}

// Run the test
testPermissions().catch(error => {
  log(`❌ Test failed: ${error.message}`, colors.red);
  process.exit(1);
});
