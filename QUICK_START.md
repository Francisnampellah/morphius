# Quick Start Guide - Local Development

## 🚀 Get Started in 3 Steps

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Environment
```bash
# Copy the environment template
cp env.example .env

# Edit .env with your Google Sheets configuration
# The file already has your SHEET_ID and SHEET_NAME set
```

### 3. Run the Watcher
```bash
# Start the watcher
node watcher.js
```

## 📁 File Structure

Your service account file (`uploader.json`) is already in place, so the watcher will automatically detect it.

## 🧪 Test Google Sheets Integration

```bash
# Test the connection
npm run test-sheets
```

## 📂 Drop Files

1. **Drop `.bin` files into:** `~/Documents/input/`
2. **Drop related `.txt` files into:** `~/Documents/input/`
3. **Results will appear in:** `~/Documents/results/`
4. **`.bin` files will be moved to:** `~/Documents/bin/`

## 🔧 Configuration

The system is pre-configured with:
- **Sheet ID**: `1rBDxoP7Uxyad554v-TmMIU8iTnb3OYgYkLI-Vqowr0A`
- **Sheet Name**: `test`
- **Service Account**: `uploader.json`

## 🐳 Docker Alternative

If you prefer Docker:
```bash
# Start with Docker
docker-compose up --build
```

## 📊 Expected Google Sheets Updates

For each processed batch, the system will:
- **Columns O-U**: Mark "O" for categories with data, "X" for empty categories
- **Column V**: Time taken (in minutes) since last annotation
- **Column W**: Comment "Completed. No problem. Review GOOD"

## 🆘 Troubleshooting

### Service Account Not Found
- Ensure `uploader.json` is in the project root
- Check file permissions

### Google Sheets Access Denied
- Verify the service account email has access to your Google Sheet
- Check that the Sheet ID and Sheet Name are correct

### Files Not Processing
- Ensure files are in `~/Documents/input/`
- Check that `.bin` files have the correct naming pattern
- Verify the watcher is running and watching the directory

## 📝 Console Output

The watcher provides colored console output:
- ✅ **Green**: Success messages
- ⚠️ **Yellow**: Warnings
- ❌ **Red**: Errors
- 🔄 **Blue**: Processing status
- 📊 **Cyan**: Analysis results

## 🎯 Next Steps

1. **Test with sample files** - Drop a `.bin` and related `.txt` files
2. **Check Google Sheets** - Verify the updates appear in your sheet
3. **Monitor logs** - Watch the console output for any issues
4. **Customize** - Modify the configuration as needed

Happy processing! 🎉
