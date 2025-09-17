# Google Sheets Integration Setup Guide

This guide explains how to set up Google Sheets integration for the CloudCompare File Watcher.

## Prerequisites

1. **Google Cloud Project**: You need a Google Cloud Project with the Google Sheets API enabled
2. **Service Account**: A service account with access to Google Sheets
3. **Google Sheet**: A Google Sheet with the correct structure

## Step 1: Create Google Cloud Project and Service Account

### 1.1 Create a Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Note your project ID

### 1.2 Enable Google Sheets API
1. In the Google Cloud Console, go to "APIs & Services" > "Library"
2. Search for "Google Sheets API"
3. Click on it and press "Enable"

### 1.3 Create Service Account
1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "Service Account"
3. Fill in the details:
   - **Name**: `cloudcompare-watcher`
   - **Description**: `Service account for CloudCompare File Watcher`
4. Click "Create and Continue"
5. Skip the "Grant access" step for now
6. Click "Done"

### 1.4 Generate Service Account Key
1. In the "Credentials" page, find your service account
2. Click on the service account email
3. Go to the "Keys" tab
4. Click "Add Key" > "Create new key"
5. Choose "JSON" format
6. Download the JSON file
7. Rename it to `service-account.json`
8. Place it in your project root directory

## Step 2: Create Google Sheet

### 2.1 Create the Sheet
1. Go to [Google Sheets](https://sheets.google.com/)
2. Create a new spreadsheet
3. Name it something like "CloudCompare Annotations"

### 2.2 Set Up Column Structure
Your sheet should have the following structure:

| A | B | C | ... | O | P | Q | R | S | T | U | V | W |
|---|---|---|-----|---|---|---|---|---|---|---|---|---|
| ID | Filename | ... | ... | Road Surface | Curb | Vehicle | Guard Rails | Protective Barrier | Street Light | Sign and Overhead | Time Taken | Comment |

**Column Details:**
- **Column B**: Filename (prefix like `000102-12`)
- **Columns O-W**: SF category markers and metadata
  - **O**: Road Surface (SF value 1)
  - **P**: Curb (SF value 2) 
  - **Q**: Vehicle (SF value 3)
  - **R**: Guard Rails (SF value 4)
  - **S**: Protective Barrier (SF value 5)
  - **T**: Street Light (SF value 6)
  - **U**: Sign and Overhead (SF value 7)
  - **V**: Time Taken (in minutes)
  - **W**: Comment

### 2.3 Share Sheet with Service Account
1. In your Google Sheet, click "Share" (top right)
2. Add the service account email (from your JSON file)
3. Give it "Editor" permissions
4. Click "Send"

## Step 3: Configure Environment Variables

### 3.1 Get Sheet ID
From your Google Sheet URL:
```
https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit
```
The Sheet ID is: `1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms`

### 3.2 Set Environment Variables

#### For Local Development (Recommended)
1. **Copy the environment template:**
   ```bash
   cp env.example .env
   ```

2. **Edit the `.env` file with your values:**
   ```bash
   SHEET_ID=1rBDxoP7Uxyad554v-TmMIU8iTnb3OYgYkLI-Vqowr0A
   SHEET_NAME=test
   ```

3. **Place your service account file in the project root:**
   - Name it `uploader.json` or `service-account.json`
   - The system will automatically detect it

#### For Docker
Create a `.env` file in your project root:
```bash
SHEET_ID=your_google_sheet_id_here
SHEET_NAME=Sheet1
```

#### For Direct Environment Variables
Export environment variables:
```bash
export SHEET_ID="your_google_sheet_id_here"
export SHEET_NAME="Sheet1"
```

## Step 4: Test the Integration

### 4.1 Test Google Sheets Connection

#### Local Development
```bash
# Test the connection
npm run test-sheets

# Or test directly
node test-sheets-integration.js

# Or test the sheets-sync module directly
node sheets-sync.js
```

#### Docker
```bash
# Build and start the container
docker-compose up --build

# Check logs
docker-compose logs -f
```

## Step 5: Usage

### 5.1 File Processing Flow

#### Local Development
1. **Start the watcher:**
   ```bash
   node watcher.js
   ```

2. **Drop files into `~/Documents/input/`:**
   - `.bin` file: `000025_1_quebec_2022-02-14T11_26_49.029703Z_r30m_fov360deg_margin10.bin`
   - Related `.txt` files: `000025_1_0001.txt`, `000025_1_0002.txt`

3. **The system will:**
   - Extract prefix: `000025_1`
   - Process and merge files
   - Find the row with `000025_1` in column B
   - Update columns O-W with SF analysis results
   - Move `.bin` file to `~/Documents/bin/`
   - Save merged results to `~/Documents/results/`

#### Docker
1. **Start the container:**
   ```bash
   docker-compose up -d
   ```

2. **Drop files into `/tmp/cloudcompare-data/input/`** (or `./data/input/` if you ran `./link-data.sh`)

3. **Results will appear in `/tmp/cloudcompare-data/results/`** (or `./data/results/`)

### 5.2 Expected Google Sheets Updates
For each processed batch, the system will:
- **Columns O-U**: Mark "O" for categories with data, "X" for empty categories
- **Column V**: Time taken (in minutes) since last annotation
- **Column W**: Fixed comment: "Completed. No problem. Review GOOD"

## Troubleshooting

### Common Issues

#### 1. "Service account not found" error
- Ensure `service-account.json` is in the project root
- Check that the file is valid JSON
- Verify the service account email in the JSON file

#### 2. "Permission denied" error
- Make sure you shared the Google Sheet with the service account email
- Verify the service account has "Editor" permissions
- Check that the Google Sheets API is enabled

#### 3. "Filename not found" error
- Ensure the filename in column B matches exactly (including case)
- Check that the sheet name is correct
- Verify the sheet ID is correct

#### 4. Docker volume mounting issues
- Ensure `service-account.json` exists in the project root
- Check Docker Desktop file sharing settings
- Verify the file permissions

### Debug Commands

```bash
# Test Google Sheets connection
node sheets-sync.js

# Check Docker logs
docker-compose logs -f

# Test with specific values
SHEET_ID="your_sheet_id" SHEET_NAME="your_sheet_name" node sheets-sync.js
```

## Security Notes

1. **Never commit `service-account.json`** to version control
2. **Use `.dockerignore`** to prevent credentials from being copied into Docker images
3. **Mount credentials as volumes** rather than copying them into the image
4. **Rotate service account keys** regularly
5. **Use least privilege** - only give the service account access to the specific sheet

## File Structure

After setup, your project should look like:
```
/Users/nampellah/Documents/matrix/
├── service-account.json     # Your Google service account credentials
├── .env                     # Environment variables (create this)
├── env.example             # Example environment variables
├── sheets-sync.js          # Google Sheets integration
├── watcher.js              # Main application (updated)
├── docker-compose.yml      # Docker configuration (updated)
├── .dockerignore           # Prevents credential copying
└── ... (other project files)
```

## Support

If you encounter issues:
1. Check the console logs for error messages
2. Verify all environment variables are set correctly
3. Test the Google Sheets connection independently
4. Ensure the service account has proper permissions
