# CloudCompare File Watcher

This Node.js project automatically watches an `input/` folder inside your Documents directory for CloudCompare output files (.bin and .txt). It organizes and merges them into the correct subfolders.

## 🚀 Workflow

1. A `.bin` file is dropped into `~/Documents/input/`.

   **Example:**
   ```
   000025_1_quebec_2022-02-14T11_26_49.029703Z_r30m_fov360deg_margin10.bin
   ```

2. The script extracts the prefix: `000025_1`

3. Moves the `.bin` file into: `~/Documents/bin/`

4. Related `.txt` files with the same prefix arrive in `~/Documents/input/`.

   **Example:**
   ```
   000025_1_0001.txt
   000025_1_0002.txt
   ```

5. The script merges them (sorted by filename) into: `~/Documents/results/000025_1_result.txt`

## 📂 Folder Structure

```
~/Documents/
├── input/        # Drop .bin + .txt files here
├── results/      # Merged result .txt files + sf_tracking.json
├── bin/          # Organized .bin files
```

The `watcher.js` script lives in your project folder, but all file operations happen inside `Documents/`.

## ⚙️ Setup

### Option 1: Docker (Recommended)

1. **Install Docker and Docker Compose** on your system.

2. **Clone or download this project:**
   ```bash
   git clone <repository-url>
   cd cloudcompare-watcher
   ```

3. **The required directories will be created automatically in `/tmp/cloudcompare-data/`.**

4. **Build and run with Docker Compose:**
   ```bash
   docker-compose up --build
   ```

   Or run in detached mode:
   ```bash
   docker-compose up -d --build
   ```

   **Quick start with convenience script:**
   ```bash
   ./start.sh
   ```

   **Create convenient symlink to data directory:**
   ```bash
   ./link-data.sh
   ```

### Option 2: Local Node.js Setup

1. **Install Node.js** (v18+ recommended).

2. **Clone or download this project:**
   ```bash
   git clone <repository-url>
   cd cloudcompare-watcher
   ```

3. **Run the setup script:**
   ```bash
   ./setup-local.sh
   ```
   
   Or manually:
   ```bash
   # Install dependencies
   npm install
   
   # Create environment file
   cp env.example .env
   # Edit .env with your Google Sheets configuration
   
   # Create required directories
   mkdir -p ~/Documents/input ~/Documents/results ~/Documents/bin
   ```

4. **Configure Google Sheets (optional):**
   - Place your service account JSON file (`uploader.json` or `service-account.json`) in the project root
   - Edit `.env` file with your `SHEET_ID` and `SHEET_NAME`
   - Share your Google Sheet with the service account email

## ▶️ Running the Watcher

### Docker Method (Recommended)

1. **Start the container:**
   ```bash
   docker-compose up -d
   ```

2. **View logs:**
   ```bash
   docker-compose logs -f
   ```

3. **Stop the container:**
   ```bash
   docker-compose down
   ```

4. **Restart the container:**
   ```bash
   docker-compose restart
   ```

5. **Quick stop with convenience script:**
   ```bash
   ./stop.sh
   ```

### Local Node.js Method

Run the watcher from your project folder:

```bash
# Basic run
node watcher.js

# Or with environment variables
SHEET_ID="your_sheet_id" SHEET_NAME="your_sheet_name" node watcher.js

# Or load from .env file (if you have dotenv installed)
# npm install dotenv
# node -r dotenv/config watcher.js
```

**Note**: The watcher will automatically detect your service account file (`uploader.json` or `service-account.json`) in the project root.

### Usage

Once running (either method):

1. Drop a `.bin` file into `/tmp/cloudcompare-data/input/` (or `./data/input/` if you ran `./link-data.sh`).
2. Drop related `.txt` files into `/tmp/cloudcompare-data/input/` (or `./data/input/` if you ran `./link-data.sh`).

The script will:

- Move the `.bin` file into `/tmp/cloudcompare-data/bin/` (or `./data/bin/`).
- Merge the `.txt` files into `/tmp/cloudcompare-data/results/<prefix>_result.txt` (or `./data/results/<prefix>_result.txt`).
- Analyze SF values in the merged file and update `/tmp/cloudcompare-data/results/sf_tracking.json` (or `./data/results/sf_tracking.json`).

## 🖥️ Example Console Output

```
📂 Detected .bin file: 000025_1_quebec_2022-02-14T11_26_49...bin
✅ Prefix extracted: 000025_1
📦 Moved .bin file to ~/Documents/bin/
📄 Detected txt file: 000025_1_0001.txt
📄 Detected txt file: 000025_1_0002.txt
✅ Merged 2 txt files into ~/Documents/results/000025_1_result.txt
```

## 🛠️ Customization

By default:

- `.bin` files → `~/Documents/bin/`
- merged `.txt` files → `~/Documents/results/`

You can modify `watcher.js` if you want to:

- Delete original `.txt` files after merging (already implemented)
- Change output folder names
- Modify the prefix extraction logic
- Add additional file processing

## 🔧 Features

- **Automatic file detection**: Watches for both `.bin` and `.txt` files
- **Smart prefix extraction**: Handles different naming patterns
- **File organization**: Moves `.bin` files to dedicated folder
- **Text file merging**: Combines multiple `.txt` files with same prefix
- **SF value tracking**: Analyzes and categorizes SF values in merged files
- **Google Sheets integration**: Automatically updates Google Sheets with SF analysis results
- **Duplicate prevention**: Avoids processing the same file multiple times
- **Colored console output**: Easy to read status messages
- **Graceful shutdown**: Handles Ctrl+C properly

## 📊 SF Value Tracking

The watcher automatically analyzes SF values in merged files and creates a tracking JSON file:

- **SF Categories**: 0-other, 1-Road Surface, 2-cubs, 3-vehicles, 4-guard rails, 5-protective barrier, 6-streetlight, 7-sign and overhead
- **Tracking File**: `~/Documents/results/sf_tracking.json`
- **Data Format**: Each merged file gets an entry with SF value counts and categories
- **Real-time Analysis**: Updates automatically after each merge operation

## 📈 Google Sheets Integration

The watcher can automatically sync SF analysis results to Google Sheets:

- **Automatic Updates**: After each batch is processed, results are written to Google Sheets
- **Row Lookup**: Searches for filename (prefix) in column B of the specified sheet
- **SF Category Mapping**: Maps SF values to O/X marks in columns O-U
- **Time Tracking**: Calculates time taken since last annotation (column V)
- **Comments**: Adds fixed comment "Completed. No problem. Review GOOD" (column W)

### Google Sheets Setup
1. **Create Service Account**: Set up Google Cloud service account with Sheets API access
2. **Download Credentials**: Get `service-account.json` file
3. **Create Google Sheet**: Set up sheet with proper column structure
4. **Share Sheet**: Give service account editor access to the sheet
5. **Set Environment Variables**: Configure `SHEET_ID` and `SHEET_NAME`

For detailed setup instructions, see [GOOGLE_SHEETS_SETUP.md](GOOGLE_SHEETS_SETUP.md).

### Environment Variables
```bash
SHEET_ID=your_google_sheet_id_here
SHEET_NAME=Sheet1
```

## 🐳 Docker Configuration

### Docker Features

- **Multi-stage build** for optimized image size
- **Non-root user** for security
- **Health checks** for container monitoring
- **Volume mapping** to access host Documents directory
- **Resource limits** to prevent excessive resource usage
- **Logging configuration** for better debugging

### Docker Commands

```bash
# Build the image
docker build -t cloudcompare-watcher .

# Run the container
docker run -d \
  --name cloudcompare-watcher \
  -v ~/Documents:/app/data:rw \
  cloudcompare-watcher

# View logs
docker logs -f cloudcompare-watcher

# Stop the container
docker stop cloudcompare-watcher

# Remove the container
docker rm cloudcompare-watcher
```

### Docker Compose Commands

```bash
# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Rebuild and start
docker-compose up --build -d

# View service status
docker-compose ps
```

### Volume Mapping

The Docker setup maps your system directories as follows:

- `/tmp/cloudcompare-data/input` → `/app/data/input` (container)
- `/tmp/cloudcompare-data/results` → `/app/data/results` (container)
- `/tmp/cloudcompare-data/bin` → `/app/data/bin` (container)

This ensures that files processed by the container are accessible in `/tmp/cloudcompare-data/` on your system.

### Troubleshooting Docker Volume Issues

The current setup uses a local `data` directory to avoid Docker Desktop file sharing issues. If you still encounter problems:

1. **Check Directory Permissions**: Ensure the `data` directory has proper permissions:
   ```bash
   ls -la ./data
   chmod -R 755 ./data
   ```

2. **Alternative Volume Mapping**: If you prefer to use your Documents directory, you can modify the `docker-compose.yml`:
   ```yaml
   volumes:
     - /Users/nampellah/Documents:/app/data:rw
   ```
   Then ensure Docker Desktop has file sharing enabled for that directory.

3. **Reset Docker**: If issues persist, try resetting Docker Desktop or restarting the Docker service.

## 📋 Requirements

### Docker Method
- Docker and Docker Compose installed
- Write permissions to `~/Documents/` directory

### Local Node.js Method
- Node.js v18 or higher
- chokidar package for file watching
- Write permissions to `~/Documents/` directory
