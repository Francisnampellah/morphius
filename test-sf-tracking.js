
#!/usr/bin/env node

// Test SF value tracking with sample data
import fs from 'fs/promises';
import path from 'path';

const DOCUMENTS_PATH = path.join(process.env.HOME, 'Documents');
const INPUT_DIR = path.join(DOCUMENTS_PATH, 'input');

async function createTestWithSFValues() {
  console.log('🧪 Creating test files with SF values...');
  
  // Create .bin file
  const binContent = 'Test binary content for CloudCompare - 000025_18';
  const binFile = path.join(INPUT_DIR, '000025_18_quebec_2022-02-14T11_27_05.918683Z_r30m_fov360deg_margin10.bin');
  await fs.writeFile(binFile, binContent);
  console.log('✅ Created .bin file: 000025_18_quebec_2022-02-14T11_27_05.918683Z_r30m_fov360deg_margin10.bin');
  
  // Create .txt files with SF values
  const txt1Content = `-0.62886816 -27.54355812 -2.18630981 1.000000
-1.23456789 -28.12345678 -3.12345678 2.000000
-2.34567890 -29.23456789 -4.23456789 1.000000
-3.45678901 -30.34567890 -5.34567890 3.000000`;
  
  const txt2Content = `-4.56789012 -31.45678901 -6.45678901 4.000000
-5.67890123 -32.56789012 -7.56789012 5.000000
-6.78901234 -33.67890123 -8.67890123 6.000000
-7.89012345 -34.78901234 -9.78901234 7.000000`;
  
  const txt3Content = `-8.90123456 -35.89012345 -10.89012345 1.000000
-9.01234567 -36.90123456 -11.90123456 2.000000
-10.12345678 -37.01234567 -12.01234567 3.000000
-11.23456789 -38.12345678 -13.12345678 1.000000`;
  
  const txt1File = path.join(INPUT_DIR, 'as_000001.txt');
  const txt2File = path.join(INPUT_DIR, 'as_000002.txt');
  const txt3File = path.join(INPUT_DIR, 'as_000003.txt');
  
  await fs.writeFile(txt1File, txt1Content);
  await fs.writeFile(txt2File, txt2Content);
  await fs.writeFile(txt3File, txt3Content);
  
  console.log('✅ Created .txt files with SF values:');
  console.log('   as_000001.txt - SF values: 1, 2, 1, 3');
  console.log('   as_000002.txt - SF values: 4, 5, 6, 7');
  console.log('   as_000003.txt - SF values: 1, 2, 3, 1');
  
  console.log('\n📁 Expected SF analysis:');
  console.log('   Road Surface (1): 4 points');
  console.log('   cubs (2): 2 points');
  console.log('   vehicles (3): 2 points');
  console.log('   guard rails (4): 1 point');
  console.log('   protective barrier (5): 1 point');
  console.log('   streetlight (6): 1 point');
  console.log('   sign and overhead (7): 1 point');
  console.log('   Total: 12 points');
  
  console.log('\n📁 Test files created in ~/Documents/input/');
  console.log('   Expected result: 000025_18_result.txt in ~/Documents/results/');
  console.log('   Expected tracking: sf_tracking.json in ~/Documents/');
  console.log('   Now run: node watcher.js');
}

createTestWithSFValues().catch(console.error);
