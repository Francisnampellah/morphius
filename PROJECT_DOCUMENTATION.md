# CloudCompare File Watcher Project - Complete Technical Documentation

## Project Overview

The **CloudCompare File Watcher** is a Node.js-based automation system designed to monitor, organize, and process CloudCompare output files. It automatically watches for `.bin` and `.txt` files in a designated input directory, extracts meaningful prefixes from filenames, organizes files into appropriate directories, and performs data analysis on the merged content.

## Core Functionality

### Primary Workflow
1. **File Detection**: Monitors an input directory for new `.bin` and `.txt` files using the `chokidar` file watcher
2. **Prefix Extraction**: Extracts batch identifiers from `.bin` filenames using regex pattern matching (e.g., `000025_1` from `000025_1_quebec_2022-02-14T11_26_49.029703Z_r30m_fov360deg_margin10.bin`)
3. **File Organization**: Moves `.bin` files to a dedicated `bin/` directory
4. **Text File Merging**: Combines multiple `.txt` files with matching prefixes into a single result file
5. **SF Value Analysis**: Analyzes and categorizes SF (Surface Feature) values in merged files
6. **Data Tracking**: Maintains a JSON tracking file with SF value statistics and metadata

### File Processing Logic
- **Batch Processing**: Groups files by extracted prefix for coordinated processing
- **Timeout Mechanism**: Waits 10 seconds for additional `.txt` files before processing a batch
- **Duplicate Prevention**: Tracks processed files to avoid infinite loops
- **Error Handling**: Graceful error handling with colored console output for debugging

## Technical Architecture

### Core Dependencies
- **Node.js v18+**: Runtime environment
- **chokidar v3.5.3**: File system watching library
- **ES Modules**: Modern JavaScript module system

### Directory Structure
```
~/Documents/
├── input/        # Drop .bin + .txt files here
├── results/      # Merged result .txt files + sf_tracking.json
├── bin/          # Organized .bin files
```

### Key Components

#### 1. File Watcher (`watcher.js`)
- **Main Entry Point**: 504-line Node.js application
- **Configuration**: Environment-based path configuration
- **State Management**: Tracks current batch processing state
- **SF Categories**: Maps SF values to semantic categories (0-other, 1-Road Surface, 2-cubs, 3-vehicles, etc.)

#### 2. Docker Integration
- **Multi-stage Build**: Optimized Alpine-based container
- **Security**: Non-root user execution
- **Health Checks**: Container monitoring and restart capabilities
- **Volume Mapping**: Host directory access for file operations
- **Resource Limits**: Memory constraints for stability

#### 3. SF Value Analysis
- **Pattern Recognition**: Extracts SF values from point cloud data lines
- **Categorization**: Maps integer SF values to semantic categories
- **Statistics Tracking**: Maintains counts and metadata per file
- **JSON Persistence**: Stores analysis results in `sf_tracking.json`

## Deployment Options

### Option 1: Docker (Recommended)
- **Containerization**: Full Docker Compose setup
- **Volume Mapping**: `/tmp/cloudcompare-data` → container data directory
- **Convenience Scripts**: `start.sh`, `stop.sh`, `link-data.sh`
- **Health Monitoring**: Built-in health checks and logging

### Option 2: Local Node.js
- **Direct Execution**: `node watcher.js`
- **Dependency Management**: `npm install chokidar`
- **Manual Setup**: Directory creation and configuration

## File Processing Details

### Input File Patterns
- **Binary Files**: `{prefix}_{location}_{timestamp}_{parameters}.bin`
- **Text Files**: `{prefix}_{sequence}.txt`
- **Prefix Extraction**: Regex pattern `^(\d+_\d+)_` for batch identification

### Output Organization
- **Binary Files**: Moved to `bin/` directory with original filename
- **Merged Text**: Combined into `{prefix}_result.txt` in `results/` directory
- **Tracking Data**: JSON file with SF analysis and metadata

### SF Value Categories
```javascript
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
```

## Configuration and Environment

### Environment Variables
- `DOCUMENTS_PATH`: Base directory for file operations (default: `~/Documents`)
- `NODE_ENV`: Runtime environment (production/development)
- `HOME`: User home directory for path resolution

### Docker Configuration
- **Base Image**: `node:18-alpine`
- **Working Directory**: `/app`
- **User**: Non-root `nodejs` user (UID 1001)
- **Ports**: Exposes port 3000 for health checks
- **Memory Limits**: 512MB limit, 256MB reservation

## Testing and Development

### Test Files
- `test-watcher.js`: Creates sample files for testing
- `test-correct-files.js`: Validates file processing logic
- `test-final.js`: End-to-end testing
- `test-fixes.js`: Regression testing
- `test-prefix.js`: Prefix extraction testing
- `test-sf-tracking.js`: SF analysis validation

### Development Features
- **Colored Console Output**: Status messages with color coding
- **Graceful Shutdown**: SIGINT handling for clean exits
- **Error Recovery**: Comprehensive error handling and logging
- **Batch State Management**: Prevents concurrent processing conflicts

## Usage Examples

### Starting the Service
```bash
# Docker method
./start.sh
# or
docker-compose up -d

# Local method
node watcher.js
```

### File Processing Flow
1. Drop `.bin` file: `000025_1_quebec_2022-02-14T11_26_49.029703Z_r30m_fov360deg_margin10.bin`
2. System extracts prefix: `000025_1`
3. Drop related `.txt` files: `000025_1_0001.txt`, `000025_1_0002.txt`
4. System merges text files into: `000025_1_result.txt`
5. SF values analyzed and tracked in `sf_tracking.json`

### Console Output Example
```
📂 Detected .bin file: 000025_1_quebec_2022-02-14T11_26_49...bin
✅ Prefix extracted: 000025_1
📦 Moved .bin file to ~/Documents/bin/
📄 Detected txt file: 000025_1_0001.txt
📄 Detected txt file: 000025_1_0002.txt
✅ Merged 2 txt files into ~/Documents/results/000025_1_result.txt
📊 SF Analysis for 000025_1_result.txt:
   Total points: 1500
   Road Surface: 1200 points
   vehicles: 300 points
```

## Advanced Features

### Batch Processing Logic
- **Timeout-based Processing**: 10-second wait for additional files
- **State Management**: Prevents concurrent batch processing
- **File Cleanup**: Automatically removes processed files from input directory
- **Error Recovery**: Continues processing even if individual files fail

### SF Value Analysis
- **Real-time Processing**: Analyzes SF values during merge operations
- **Statistical Tracking**: Maintains counts and categories per file
- **Metadata Storage**: Timestamps, total points, and category breakdowns
- **JSON Persistence**: Structured data storage for analysis and reporting

### Docker Features
- **Health Monitoring**: Built-in health checks every 30 seconds
- **Log Management**: JSON logging with size and rotation limits
- **Resource Control**: Memory limits and reservations
- **Volume Persistence**: Data survives container restarts

## Maintenance and Troubleshooting

### Common Issues
- **Docker Volume Permissions**: Ensure proper directory permissions
- **File Sharing**: Docker Desktop file sharing configuration
- **Memory Usage**: Monitor container resource usage
- **Log Analysis**: Use `docker-compose logs -f` for debugging

### Monitoring Commands
```bash
# View logs
docker-compose logs -f

# Check status
docker-compose ps

# Restart service
docker-compose restart

# Stop service
docker-compose down
```

## Project Structure

```
/Users/nampellah/Documents/matrix/
├── data/                    # Symlinked data directory
│   ├── bin/                # Processed .bin files
│   ├── input/              # Input directory for new files
│   └── results/            # Merged results and tracking data
├── docker-compose.yml      # Docker Compose configuration
├── Dockerfile             # Docker container definition
├── link-data.sh           # Creates symlink to data directory
├── package.json           # Node.js dependencies and scripts
├── start.sh               # Docker startup script
├── stop.sh                # Docker stop script
├── watcher.js             # Main application (504 lines)
├── test-*.js              # Various test files
└── README.md              # Basic project documentation
```

## Key Functions and Methods

### Core Functions in `watcher.js`

#### File Processing
- `extractBinPrefix(filename)`: Extracts batch prefix from .bin filenames
- `matchesCurrentBatch(filename)`: Checks if .txt file belongs to current batch
- `shouldIncludeInBatch(filename)`: Determines if file should be included in batch
- `moveBinFile(filePath)`: Moves .bin file to bin directory
- `mergeTxtFiles()`: Combines multiple .txt files into single result

#### SF Value Analysis
- `extractSFValue(line)`: Extracts SF value from data line
- `countSFValues(content)`: Counts SF values in merged content
- `updateSFTracking(mergedFilePath, sfCounts)`: Updates tracking JSON
- `loadTrackingData()`: Loads existing tracking data
- `saveTrackingData(data)`: Saves tracking data to JSON

#### Batch Management
- `processCurrentBatch()`: Processes complete batch of files
- `handleBinFile(filePath)`: Handles .bin file detection
- `handleTxtFile(filePath)`: Handles .txt file detection
- `clearInputDirectory()`: Cleans up processed files

#### Utility Functions
- `ensureDirectories()`: Creates required directories
- `log(message, color)`: Colored console output
- `processExistingFiles()`: Processes files present on startup

## Configuration Details

### Docker Compose Configuration
```yaml
services:
  cloudcompare-watcher:
    build: .
    container_name: cloudcompare-watcher
    restart: unless-stopped
    volumes:
      - /tmp/cloudcompare-data:/app/data:rw
    environment:
      - NODE_ENV=production
      - HOME=/app
      - DOCUMENTS_PATH=/app/data
    deploy:
      resources:
        limits:
          memory: 512M
        reservations:
          memory: 256M
    healthcheck:
      test: ["CMD", "node", "-e", "console.log('Health check passed')"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
```

### Package.json Configuration
```json
{
  "name": "cloudcompare-watcher",
  "version": "1.0.0",
  "description": "Automatically watches and organizes CloudCompare output files (.bin and .txt)",
  "main": "watcher.js",
  "type": "module",
  "scripts": {
    "start": "node watcher.js",
    "dev": "node watcher.js"
  },
  "dependencies": {
    "chokidar": "^3.5.3"
  }
}
```

## Error Handling and Logging

### Console Output Colors
- **Green**: Success messages and completed operations
- **Blue**: Information and status updates
- **Yellow**: Warnings and timeouts
- **Red**: Errors and failures
- **Cyan**: File operations and batch information
- **Magenta**: Text file detection
- **Bright**: Important startup messages

### Error Recovery
- **File Processing Errors**: Individual file failures don't stop batch processing
- **Directory Creation**: Automatic creation of required directories
- **Permission Issues**: Clear error messages for permission problems
- **Docker Health Checks**: Automatic container restart on failures

## Performance Considerations

### Memory Management
- **Batch Processing**: Processes one batch at a time to limit memory usage
- **File Cleanup**: Removes processed files to prevent disk space issues
- **Resource Limits**: Docker memory limits prevent excessive resource usage

### File System Efficiency
- **Chokidar Watcher**: Efficient file system monitoring
- **Batch Timeout**: 10-second wait prevents premature processing
- **Duplicate Prevention**: Tracks processed files to avoid reprocessing

## Security Features

### Docker Security
- **Non-root User**: Container runs as `nodejs` user (UID 1001)
- **Minimal Base Image**: Alpine Linux for reduced attack surface
- **Resource Limits**: Prevents resource exhaustion attacks

### File System Security
- **Path Validation**: Validates file paths before processing
- **Permission Checks**: Ensures proper directory permissions
- **Error Boundaries**: Prevents crashes from malicious file content

This CloudCompare File Watcher represents a complete automation solution for processing point cloud data files, with robust error handling, Docker containerization, and comprehensive data analysis capabilities.
