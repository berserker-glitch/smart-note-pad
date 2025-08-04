#!/bin/bash
# Notepad Clone Startup Script for Linux
# This script starts the Electron notepad app with hidden console

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
NOTEPAD_DIR="$SCRIPT_DIR/notepad-clone"

# Change to the notepad-clone directory
cd "$NOTEPAD_DIR" || exit 1

# Check if node_modules exists, if not install dependencies
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install > /dev/null 2>&1
fi

# Kill any existing electron processes for this app to prevent conflicts
pkill -f "electron.*notepad" > /dev/null 2>&1

# Start the Electron app in background with no output
nohup npm start > /dev/null 2>&1 &

# Disown the process so it continues running after script exits
disown

echo "Notepad Clone started in background"