#!/usr/bin/env node

// Test the prefix extraction function
function extractPrefix(filename) {
  if (filename.endsWith('.bin')) {
    // For .bin files: extract everything before the first underscore after the date/time pattern
    // Pattern: 000025_18_quebec_2022-02-14T11_27_05.918683Z_r30m_fov360deg_margin10.bin
    // We want: 000025-18 (convert underscore to dash)
    const match = filename.match(/^(\d+_\d+)_/);
    if (match) {
      return match[1].replace('_', '-');
    }
  } else if (filename.endsWith('.txt')) {
    // For .txt files: extract everything before the last underscore
    // Pattern: 000025_18_0001.txt -> 000025-18 (convert underscore to dash)
    const lastUnderscoreIndex = filename.lastIndexOf('_');
    if (lastUnderscoreIndex > 0) {
      const prefix = filename.substring(0, lastUnderscoreIndex);
      return prefix.replace('_', '-');
    }
  }
  return null;
}

// Test cases
const testFiles = [
  '000025_18_quebec_2022-02-14T11_27_05.918683Z_r30m_fov360deg_margin10.bin',
  '000025_18_0001.txt',
  '000025_18_0002.txt',
  '000025_1_quebec_2022-02-14T11_26_49.029703Z_r30m_fov360deg_margin10.bin',
  '000025_1_0001.txt'
];

console.log('Testing prefix extraction:');
testFiles.forEach(file => {
  const prefix = extractPrefix(file);
  console.log(`${file} -> ${prefix}`);
});
