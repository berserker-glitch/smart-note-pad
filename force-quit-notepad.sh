#!/bin/bash
# Force Quit Notepad Clone for Linux
# Use this script if the app doesn't close properly

echo "Force closing Notepad Clone processes..."

# Kill all electron processes related to notepad
pkill -f "electron.*notepad" > /dev/null 2>&1

# Kill any node processes that might be running npm start for notepad
pkill -f "npm.*start.*notepad" > /dev/null 2>&1

# More aggressive approach - kill all electron processes
pkill electron > /dev/null 2>&1

echo "All Notepad Clone processes have been terminated."