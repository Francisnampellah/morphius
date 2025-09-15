#!/usr/bin/env node

// Create test files to demonstrate the correct workflow
import fs from 'fs/promises';
import path from 'path';

const DOCUMENTS_PATH = path.join(process.env.HOME, 'Documents');
const INPUT_DIR = path.join(DOCUMENTS_PATH, 'input');

async function createTestFiles() {
  console.log('🧪 Creating test files to demonstrate correct workflow...');
  
  // Create .bin file first (this starts the batch)
  const binContent = 'Test binary content for CloudCompare - 000025_18';
  const binFile = path.join(INPUT_DIR, '000025_18_quebec_2022-02-14T11_27_05.918683Z_r30m_fov360deg_margin10.bin');
  await fs.writeFile(binFile, binContent);
  console.log('✅ Created .bin file: 000025_18_quebec_2022-02-14T11_27_05.918683Z_r30m_fov360deg_margin10.bin');
  console.log('   Expected prefix: 000025_18');
  
  // Create .txt files with different prefixes (only matching ones should be processed)
  const txt1Content = 'Line 1 from file 0001\nLine 2 from file 0001\nLine 3 from file 0001';
  const txt2Content = 'Line 1 from file 0002\nLine 2 from file 0002\nLine 3 from file 0002';
  const txt3Content = 'Line 1 from file 0003\nLine 2 from file 0003\nLine 3 from file 0003';
  
  // These should be processed (match the .bin prefix)
  const txt1File = path.join(INPUT_DIR, '000025_18_0001.txt');
  const txt2File = path.join(INPUT_DIR, '000025_18_0002.txt');
  const txt3File = path.join(INPUT_DIR, '000025_18_0003.txt');
  
  await fs.writeFile(txt1File, txt1Content);
  await fs.writeFile(txt2File, txt2Content);
  await fs.writeFile(txt3File, txt3Content);
  
  console.log('✅ Created matching .txt files: 000025_18_0001.txt, 000025_18_0002.txt, 000025_18_0003.txt');
  
  // This should be ignored (different prefix)
  const txt4File = path.join(INPUT_DIR, '000025_19_0001.txt');
  const txt4Content = 'This file should be ignored - different prefix';
  await fs.writeFile(txt4File, txt4Content);
  console.log('⚠️  Created non-matching .txt file: 000025_19_0001.txt (should be ignored)');
  
  console.log('\n📁 Test files created in ~/Documents/input/');
  console.log('   Expected result: 000025_18_result.txt in ~/Documents/results/');
  console.log('   (Using prefix from .bin file, not from .txt files)');
  console.log('   Now run: node watcher.js');
}

createTestFiles().catch(console.error);
