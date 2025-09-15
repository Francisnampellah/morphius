#!/usr/bin/env node

// Create test files with the correct naming pattern
import fs from 'fs/promises';
import path from 'path';

const DOCUMENTS_PATH = path.join(process.env.HOME, 'Documents');
const INPUT_DIR = path.join(DOCUMENTS_PATH, 'input');

async function createCorrectTestFiles() {
  console.log('🧪 Creating test files with correct naming pattern...');
  
  // Create test .bin file with the correct pattern
  const binContent = 'Test binary content for CloudCompare - 000025_18';
  const binFile = path.join(INPUT_DIR, '000025_18_quebec_2022-02-14T11_27_05.918683Z_r30m_fov360deg_margin10.bin');
  await fs.writeFile(binFile, binContent);
  console.log('✅ Created test .bin file: 000025_18_quebec_2022-02-14T11_27_05.918683Z_r30m_fov360deg_margin10.bin');
  
  // Create test .txt files with matching prefix
  const txt1Content = 'Line 1 from file 0001\nLine 2 from file 0001\nLine 3 from file 0001';
  const txt2Content = 'Line 1 from file 0002\nLine 2 from file 0002\nLine 3 from file 0002';
  const txt3Content = 'Line 1 from file 0003\nLine 2 from file 0003\nLine 3 from file 0003';
  
  const txt1File = path.join(INPUT_DIR, '000025_18_0001.txt');
  const txt2File = path.join(INPUT_DIR, '000025_18_0002.txt');
  const txt3File = path.join(INPUT_DIR, '000025_18_0003.txt');
  
  await fs.writeFile(txt1File, txt1Content);
  await fs.writeFile(txt2File, txt2Content);
  await fs.writeFile(txt3File, txt3Content);
  
  console.log('✅ Created test .txt files: 000025_18_0001.txt, 000025_18_0002.txt, 000025_18_0003.txt');
  
  console.log('\n📁 Test files created in ~/Documents/input/');
  console.log('   Expected result: 000025_18_result.txt in ~/Documents/results/');
  console.log('   Now run: node watcher.js');
}

createCorrectTestFiles().catch(console.error);
