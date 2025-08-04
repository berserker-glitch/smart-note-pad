#!/bin/bash
# Setup script for Linux Mint users
# This script prepares all files for proper execution

echo "Setting up Notepad Clone for Linux Mint..."

# Make shell scripts executable
chmod +x start-notepad.sh
chmod +x force-quit-notepad.sh

# Get the current directory
CURRENT_DIR="$(pwd)"

# Update the desktop file with correct paths
sed -i "s|%d|$CURRENT_DIR|g" Notepad-Clone.desktop

# Make desktop file executable
chmod +x Notepad-Clone.desktop

# Copy desktop file to user's desktop (optional)
if [ -d "$HOME/Desktop" ]; then
    cp Notepad-Clone.desktop "$HOME/Desktop/"
    echo "Desktop shortcut created at: $HOME/Desktop/Notepad-Clone.desktop"
fi

# Install desktop file system-wide (optional, requires user confirmation)
echo ""
read -p "Do you want to install the app in the applications menu? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    mkdir -p "$HOME/.local/share/applications"
    cp Notepad-Clone.desktop "$HOME/.local/share/applications/"
    echo "Application installed in menu: Applications > Utility > Notepad Clone"
fi

echo ""
echo "Setup complete! You can now:"
echo "1. Double-click 'Notepad-Clone.desktop' to launch the app"
echo "2. Run './start-notepad.sh' from terminal"
echo "3. Use './force-quit-notepad.sh' if you need to force-close the app"
echo ""
echo "Note: The app will run in background with no visible terminal window."