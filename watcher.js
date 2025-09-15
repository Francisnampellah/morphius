#!/usr/bin/env node

import chokidar from 'chokidar';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const DOCUMENTS_PATH = process.env.DOCUMENTS_PATH || path.join(process.env.HOME, 'Documents');
const INPUT_DIR = path.join(DOCUMENTS_PATH, 'input');
const RESULTS_DIR = path.join(DOCUMENTS_PATH, 'results');
const BIN_DIR = path.join(DOCUMENTS_PATH, 'bin');
const TRACKING_FILE = path.join(RESULTS_DIR, 'sf_tracking.json');

// Track current batch processing
let currentBatch = {
  binPrefix: null,
  binFile: null,
  txtFiles: [],
  isProcessing: false
};

// Track processed files to avoid infinite loops
const processedFiles = new Set();

// SF value mapping
const SF_CATEGORIES = {
  0: 'other',
  1: 'Road Surface',
  2: 'cubs',
  3: 'vehicles',
  4: 'guard rails',
  5: 'protective barrier',
  6: 'streetlight',
  7: 'sign and overhead'
};

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  red: '\x1b[31m'
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

// Ensure directories exist
async function ensureDirectories() {
  try {
    await fs.mkdir(INPUT_DIR, { recursive: true });
    await fs.mkdir(RESULTS_DIR, { recursive: true });
    await fs.mkdir(BIN_DIR, { recursive: true });
    log('📁 Directories initialized:', colors.green);
    log(`   Input: ${INPUT_DIR}`, colors.cyan);
    log(`   Results: ${RESULTS_DIR}`, colors.cyan);
    log(`   Bin: ${BIN_DIR}`, colors.cyan);
  } catch (error) {
    log(`❌ Error creating directories: ${error.message}`, colors.red);
    process.exit(1);
  }
}

// Extract prefix from .bin filename
function extractBinPrefix(filename) {
  // Pattern: 000025_18_quebec_2022-02-14T11_27_05.918683Z_r30m_fov360deg_margin10.bin
  // We want: 000025_18
  const match = filename.match(/^(\d+_\d+)_/);
  if (match) {
    return match[1];
  }
  return null;
}

// Check if .txt file matches current batch prefix
function matchesCurrentBatch(filename) {
  if (!currentBatch.binPrefix) return false;
  
  // Extract prefix from .txt file (everything before last underscore)
  const lastUnderscoreIndex = filename.lastIndexOf('_');
  if (lastUnderscoreIndex > 0) {
    const txtPrefix = filename.substring(0, lastUnderscoreIndex);
    return txtPrefix === currentBatch.binPrefix;
  }
  return false;
}

// Check if .txt file should be included in current batch (more flexible matching)
function shouldIncludeInBatch(filename) {
  if (!currentBatch.binPrefix) return false;
  
  // If we have a .bin file, include all .txt files in the current batch
  // This is more flexible and handles cases where .txt files don't match the .bin prefix exactly
  return filename.endsWith('.txt');
}

// Extract SF values from a line of data
function extractSFValue(line) {
  // Pattern: -0.62886816 -27.54355812 -2.18630981 1.000000
  // We want the last number (SF value)
  const parts = line.trim().split(/\s+/);
  if (parts.length >= 4) {
    const sfValue = parseFloat(parts[parts.length - 1]);
    if (!isNaN(sfValue)) {
      return Math.round(sfValue); // Round to get integer SF value
    }
  }
  return null;
}

// Count SF values in content
function countSFValues(content) {
  const lines = content.split('\n').filter(line => line.trim());
  const sfCounts = {};
  
  for (const line of lines) {
    const sfValue = extractSFValue(line);
    if (sfValue !== null) {
      sfCounts[sfValue] = (sfCounts[sfValue] || 0) + 1;
    }
  }
  
  return sfCounts;
}

// Load existing tracking data
async function loadTrackingData() {
  try {
    const data = await fs.readFile(TRACKING_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    // File doesn't exist or is invalid, return empty structure
    return {};
  }
}

// Save tracking data
async function saveTrackingData(data) {
  try {
    await fs.writeFile(TRACKING_FILE, JSON.stringify(data, null, 2));
    log(`💾 Updated SF tracking data`, colors.green);
  } catch (error) {
    log(`❌ Error saving tracking data: ${error.message}`, colors.red);
  }
}

// Update tracking data with SF values from merged file
async function updateSFTracking(mergedFilePath, sfCounts) {
  try {
    const trackingData = await loadTrackingData();
    const filename = path.basename(mergedFilePath);
    
    // Create entry for this file
    const fileEntry = {
      filename: filename,
      timestamp: new Date().toISOString(),
      totalPoints: Object.values(sfCounts).reduce((sum, count) => sum + count, 0),
      sfCounts: sfCounts,
      sfCategories: {}
    };
    
    // Map SF values to categories
    for (const [sfValue, count] of Object.entries(sfCounts)) {
      const category = SF_CATEGORIES[parseInt(sfValue)] || 'unknown';
      fileEntry.sfCategories[category] = count;
    }
    
    // Update tracking data
    trackingData[filename] = fileEntry;
    
    // Save updated data
    await saveTrackingData(trackingData);
    
    // Log summary
    log(`📊 SF Analysis for ${filename}:`, colors.blue);
    log(`   Total points: ${fileEntry.totalPoints}`, colors.cyan);
    for (const [category, count] of Object.entries(fileEntry.sfCategories)) {
      if (count > 0) {
        log(`   ${category}: ${count} points`, colors.cyan);
      }
    }
    
  } catch (error) {
    log(`❌ Error updating SF tracking: ${error.message}`, colors.red);
  }
}

// Move .bin file to bin directory
async function moveBinFile(filePath) {
  try {
    const filename = path.basename(filePath);
    const destPath = path.join(BIN_DIR, filename);
    
    await fs.rename(filePath, destPath);
    log(`📦 Moved .bin file to ~/Documents/bin/`, colors.green);
    return true;
  } catch (error) {
    log(`❌ Error moving .bin file: ${error.message}`, colors.red);
    return false;
  }
}

// Merge txt files for current batch
async function mergeTxtFiles() {
  if (currentBatch.txtFiles.length === 0) {
    log(`⚠️  No .txt files to merge for batch: ${currentBatch.binPrefix}`, colors.yellow);
    return;
  }

  try {
    // Sort files by filename to ensure consistent order
    currentBatch.txtFiles.sort();

    const mergedContent = [];
    let totalLines = 0;

    log(`📄 Merging ${currentBatch.txtFiles.length} .txt files for batch: ${currentBatch.binPrefix}`, colors.blue);

    for (const filePath of currentBatch.txtFiles) {
      try {
        const content = await fs.readFile(filePath, 'utf8');
        const lines = content.split('\n').filter(line => line.trim());
        mergedContent.push(...lines);
        totalLines += lines.length;
        
        log(`   ✅ Read: ${path.basename(filePath)} (${lines.length} lines)`, colors.cyan);
      } catch (error) {
        log(`⚠️  Warning: Could not read ${path.basename(filePath)}: ${error.message}`, colors.yellow);
      }
    }

    // Write merged content using the .bin prefix
    const resultFilename = `${currentBatch.binPrefix}_result.txt`;
    const resultPath = path.join(RESULTS_DIR, resultFilename);
    const mergedContentString = mergedContent.join('\n');
    await fs.writeFile(resultPath, mergedContentString);

    log(`✅ Merged ${currentBatch.txtFiles.length} txt files into ~/Documents/results/${resultFilename}`, colors.green);
    log(`   Total lines: ${totalLines}`, colors.cyan);

    // Analyze SF values and update tracking
    const sfCounts = countSFValues(mergedContentString);
    if (Object.keys(sfCounts).length > 0) {
      await updateSFTracking(resultPath, sfCounts);
    } else {
      log(`⚠️  No SF values found in merged file`, colors.yellow);
    }

  } catch (error) {
    log(`❌ Error merging txt files: ${error.message}`, colors.red);
  }
}

// Clear input directory after processing
async function clearInputDirectory() {
  try {
    const files = await fs.readdir(INPUT_DIR);
    if (files.length > 0) {
      log(`🧹 Clearing input directory (${files.length} files remaining)`, colors.yellow);
      
      for (const file of files) {
        const filePath = path.join(INPUT_DIR, file);
        try {
          await fs.unlink(filePath);
          log(`   🗑️  Deleted: ${file}`, colors.yellow);
        } catch (error) {
          log(`⚠️  Warning: Could not delete ${file}: ${error.message}`, colors.yellow);
        }
      }
    }
  } catch (error) {
    log(`❌ Error clearing input directory: ${error.message}`, colors.red);
  }
}

// Process current batch completely
async function processCurrentBatch() {
  if (currentBatch.isProcessing) {
    log(`⏳ Batch already being processed: ${currentBatch.binPrefix}`, colors.yellow);
    return;
  }

  currentBatch.isProcessing = true;
  log(`🚀 Processing batch: ${currentBatch.binPrefix}`, colors.bright);

  try {
    // 1. Move .bin file
    if (currentBatch.binFile) {
      await moveBinFile(currentBatch.binFile);
    }

    // 2. Merge .txt files
    await mergeTxtFiles();

    // 3. Clear input directory
    await clearInputDirectory();

    log(`✅ Batch completed: ${currentBatch.binPrefix}`, colors.green);
    log('', colors.reset);

  } catch (error) {
    log(`❌ Error processing batch: ${error.message}`, colors.red);
  } finally {
  // Reset for next batch
  currentBatch = {
    binPrefix: null,
    binFile: null,
    txtFiles: [],
    isProcessing: false
  };
  
  // Clear processed files for next batch
  processedFiles.clear();
  }
}

// Handle .bin file detection
async function handleBinFile(filePath) {
  const filename = path.basename(filePath);
  
  // Check if already processed to avoid duplicates
  if (processedFiles.has(filePath)) {
    log(`⏭️  Already processed .bin file: ${filename}`, colors.yellow);
    return;
  }

  if (currentBatch.isProcessing) {
    log(`⏳ Previous batch still processing, queuing .bin file: ${filename}`, colors.yellow);
    return;
  }

  log(`📂 Detected .bin file: ${filename}`, colors.blue);
  
  const prefix = extractBinPrefix(filename);
  if (!prefix) {
    log(`⚠️  Could not extract prefix from: ${filename}`, colors.yellow);
    return;
  }

  log(`✅ Prefix extracted: ${prefix}`, colors.green);
  
  // Start new batch
  currentBatch.binPrefix = prefix;
  currentBatch.binFile = filePath;
  currentBatch.txtFiles = [];
  processedFiles.add(filePath);
  
  log(`🔄 Started new batch: ${prefix}`, colors.cyan);
  log(`   Waiting for .txt files...`, colors.cyan);
}

// Handle .txt file detection
async function handleTxtFile(filePath) {
  const filename = path.basename(filePath);
  
  if (!currentBatch.binPrefix) {
    log(`⏳ No active batch, waiting for .bin file. Ignoring: ${filename}`, colors.yellow);
    return;
  }

  if (!shouldIncludeInBatch(filename)) {
    log(`⚠️  .txt file not included in current batch: ${filename}`, colors.yellow);
    return;
  }

  // Check if already processed to avoid duplicates
  if (processedFiles.has(filePath)) {
    log(`⏭️  Already processed: ${filename}`, colors.yellow);
    return;
  }

  log(`📄 Detected .txt file for batch: ${filename}`, colors.magenta);
  currentBatch.txtFiles.push(filePath);
  processedFiles.add(filePath);
  
  log(`   Batch now has ${currentBatch.txtFiles.length} .txt files`, colors.cyan);
}

// Handle file detection
async function handleFile(filePath) {
  const filename = path.basename(filePath);
  
  if (filename.endsWith('.bin')) {
    await handleBinFile(filePath);
  } else if (filename.endsWith('.txt')) {
    await handleTxtFile(filePath);
  }
}

// Process existing files on startup
async function processExistingFiles() {
  try {
    const files = await fs.readdir(INPUT_DIR);
    const txtFiles = files.filter(file => file.endsWith('.txt'));
    const binFiles = files.filter(file => file.endsWith('.bin'));
    
    if (txtFiles.length > 0 || binFiles.length > 0) {
      log(`📁 Found ${txtFiles.length} .txt files and ${binFiles.length} .bin files in input directory`, colors.blue);
      
      // Process .bin files first
      for (const file of binFiles) {
        const filePath = path.join(INPUT_DIR, file);
        await handleBinFile(filePath);
      }
      
      // Process .txt files
      for (const file of txtFiles) {
        const filePath = path.join(INPUT_DIR, file);
        await handleTxtFile(filePath);
      }
      
      // Process the batch if we have files
      if (currentBatch.binPrefix) {
        await processCurrentBatch();
      }
    }
  } catch (error) {
    log(`⚠️  Error processing existing files: ${error.message}`, colors.yellow);
  }
}

// Main function
async function main() {
  log('🚀 CloudCompare File Watcher Starting...', colors.bright);
  log('', colors.reset);

  // Ensure directories exist
  await ensureDirectories();
  log('', colors.reset);
  
  // Process existing files
  await processExistingFiles();
  log('', colors.reset);

  // Watch for new files in the input directory
  const watcher = chokidar.watch(INPUT_DIR, {
    ignored: /(^|[\/\\])\../, // ignore dotfiles
    persistent: true,
    ignoreInitial: true // Don't process existing files again (we already did)
  });

  watcher
    .on('add', async (filePath) => {
      await handleFile(filePath);
      
      // If we have a complete batch, process it
      if (currentBatch.binPrefix && currentBatch.binFile && currentBatch.txtFiles.length > 0) {
        // Wait a bit to see if more .txt files arrive
        setTimeout(async () => {
          if (currentBatch.binPrefix && !currentBatch.isProcessing) {
            await processCurrentBatch();
          }
        }, 1000); // Wait 1 second for more files
      }
    })
    .on('error', error => {
      log(`❌ Watcher error: ${error.message}`, colors.red);
    });

  log('👀 Watching for files in ~/Documents/input/', colors.cyan);
  log('   Drop .bin file first, then related .txt files!', colors.cyan);
  log('', colors.reset);
  log('Press Ctrl+C to stop the watcher', colors.yellow);
  log('', colors.reset);

  // Handle graceful shutdown
  process.on('SIGINT', () => {
    log('\n🛑 Shutting down watcher...', colors.yellow);
    watcher.close();
    process.exit(0);
  });
}

// Start the watcher
main().catch(error => {
  log(`❌ Fatal error: ${error.message}`, colors.red);
  process.exit(1);
});