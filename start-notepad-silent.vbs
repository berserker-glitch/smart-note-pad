' Notepad Clone Silent Startup Script
' This VBScript starts the Electron notepad app with no visible console

Set objShell = CreateObject("WScript.Shell")
Set objFSO = CreateObject("Scripting.FileSystemObject")

' Get the directory where this script is located
scriptPath = objFSO.GetParentFolderName(WScript.ScriptFullName)
notepadPath = scriptPath & "\notepad-clone"

' Change to the notepad-clone directory and check if node_modules exists
If Not objFSO.FolderExists(notepadPath & "\node_modules") Then
    ' Install dependencies silently
    objShell.Run "cmd /c cd /d """ & notepadPath & """ && npm install", 0, True
End If

' Kill any existing electron processes
objShell.Run "taskkill /f /im electron.exe", 0, False

' Start the Electron app completely hidden (0 = hidden window, False = don't wait)
objShell.Run "cmd /c cd /d """ & notepadPath & """ && npm start", 0, False