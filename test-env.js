#!/usr/bin/env node

// Load environment variables from .env file
import 'dotenv/config';

console.log('🔍 Environment Variables Test:');
console.log('SHEET_ID:', process.env.SHEET_ID);
console.log('SHEET_NAME:', process.env.SHEET_NAME);
console.log('DOCUMENTS_PATH:', process.env.DOCUMENTS_PATH);

if (process.env.SHEET_ID && process.env.SHEET_NAME) {
  console.log('✅ Environment variables loaded successfully!');
} else {
  console.log('❌ Environment variables not loaded properly');
}
