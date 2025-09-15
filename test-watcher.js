#!/usr/bin/env node

// Simple test script to verify the watcher functionality
import fs from 'fs/promises';
import path from 'path';

const DOCUMENTS_PATH = path.join(process.env.HOME, 'Documents');
const INPUT_DIR = path.join(DOCUMENTS_PATH, 'input');
const RESULTS_DIR = path.join(DOCUMENTS_PATH, 'results');
const BIN_DIR = path.join(DOCUMENTS_PATH, 'bin');

async function createTestFiles() {
  console.log('🧪 Creating test files...');
  
  // Create test .bin file
  const binContent = 'Test binary content for CloudCompare';
  const binFile = path.join(INPUT_DIR, '000025_1_quebec_2022-02-14T11_26_49.029703Z_r30m_fov360deg_margin10.bin');
  await fs.writeFile(binFile, binContent);
  console.log('✅ Created test .bin file');
  
  // Create test .txt files
  const txt1Content = 'Line 1 from file 1\nLine 2 from file 1\nLine 3 from file 1';
  const txt2Content = 'Line 1 from file 2\nLine 2 from file 2\nLine 3 from file 2';
  
  const txt1File = path.join(INPUT_DIR, '000025_1_0001.txt');
  const txt2File = path.join(INPUT_DIR, '000025_1_0002.txt');
  
  await fs.writeFile(txt1File, txt1Content);
  await fs.writeFile(txt2File, txt2Content);
  console.log('✅ Created test .txt files');
  
  console.log('\n📁 Test files created in ~/Documents/input/');
  console.log('   Now run: node watcher.js');
  console.log('   The watcher should process these files automatically.');
}

createTestFiles().catch(console.error);
