const { app, BrowserWindow, dialog, ipcMain } = require("electron")
const path = require("path")
const fs = require("fs")
const { exec } = require('child_process')
const http = require('http')
const AIFeatures = require('./ai-features')

let mainWindow
let currentFilePath = null
let activeTabIndex = 0
let ollamaAvailable = false
let aiFeatures = null

// Check AI availability and initialize features
async function checkAIAvailability() {
  try {
    console.log('Checking AI availability...')
    
    // Initialize AI features if not already done
    if (!aiFeatures) {
      aiFeatures = new AIFeatures()
    }
    
    // Test both local and external connections
    aiFeatures.setMode('local')
    const localStatus = await aiFeatures.testConnection()
    
    aiFeatures.setMode('external')
    const externalStatus = await aiFeatures.testConnection()
    
    // Determine best available option
    let recommendedMode = 'local'
    let status = { installed: false, server: false, model: false }
    
    if (localStatus.connected && localStatus.model) {
      recommendedMode = 'local'
      status = { installed: true, server: true, model: true }
      console.log('Local AI (Ollama) available')
    } else if (externalStatus.connected && externalStatus.model) {
      recommendedMode = 'external'
      status = { installed: true, server: true, model: true }
      console.log('External AI (API) available')
    } else {
      console.log('No AI available')
    }
    
    // Set the recommended mode
    aiFeatures.setMode(recommendedMode)
    
    console.log('AI availability check:', { 
      localStatus, 
      externalStatus, 
      recommendedMode,
      currentMode: aiFeatures.getMode()
    })
    
    return { 
      ...status, 
      mode: recommendedMode, 
      localStatus, 
      externalStatus 
    }
  } catch (error) {
    console.error('Error checking AI availability:', error)
    return { 
      installed: false, 
      server: false, 
      model: false, 
      mode: 'local' 
    }
  }
}

function createNewWindow() {
  mainWindow = new BrowserWindow({
    height: 700,
    width: 1000,
    darkTheme: false,
    title: "Notepad Pro",
    icon: path.join(__dirname, "assets", "ico", "notepad.png"),
    frame: false, // Remove default window frame
    titleBarStyle: 'hidden',
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      devTools: false,
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  mainWindow.loadFile(path.join(__dirname, "index.html"))
}

// File operation handlers
ipcMain.handle('new-file', async () => {
  currentFilePath = null
  mainWindow.webContents.send('clear-text')
  mainWindow.webContents.send('update-file-info', 'Untitled')
  mainWindow.setTitle("Notepad Pro - Untitled")
})

ipcMain.handle('open-file', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters: [
      { name: 'Text Files', extensions: ['txt'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  })

  if (!result.canceled && result.filePaths.length > 0) {
    const filePath = result.filePaths[0]
    try {
      const content = fs.readFileSync(filePath, 'utf8')
      currentFilePath = filePath
      mainWindow.webContents.send('set-text', content)
      mainWindow.webContents.send('update-file-info', path.basename(filePath))
      mainWindow.setTitle(`Notepad Pro - ${path.basename(filePath)}`)
    } catch (error) {
      dialog.showErrorBox('Error', `Failed to open file: ${error.message}`)
    }
  }
})

ipcMain.handle('save-file', async (event, content) => {
  if (!currentFilePath) {
    return await saveAsFile(content)
  }
  
  try {
    fs.writeFileSync(currentFilePath, content, 'utf8')
    return { success: true }
  } catch (error) {
    dialog.showErrorBox('Error', `Failed to save file: ${error.message}`)
    return { success: false, error: error.message }
  }
})

ipcMain.handle('save-as-file', async (event, content) => {
  return await saveAsFile(content)
})

async function saveAsFile(content) {
  const result = await dialog.showSaveDialog(mainWindow, {
    filters: [
      { name: 'Text Files', extensions: ['txt'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  })

  if (!result.canceled && result.filePath) {
    try {
      fs.writeFileSync(result.filePath, content, 'utf8')
      currentFilePath = result.filePath
      mainWindow.webContents.send('update-file-info', path.basename(result.filePath))
      mainWindow.setTitle(`Notepad Pro - ${path.basename(result.filePath)}`)
      return { success: true }
    } catch (error) {
      dialog.showErrorBox('Error', `Failed to save file: ${error.message}`)
      return { success: false, error: error.message }
    }
  }
  return { success: false }
}

// Tab management handlers
ipcMain.handle('create-tab', async (event, title, content, filePath) => {
  mainWindow.webContents.send('tab-created', { title, content, filePath })
})

ipcMain.handle('switch-tab', async (event, tabIndex) => {
  activeTabIndex = tabIndex
  mainWindow.webContents.send('tab-switched', tabIndex)
})

ipcMain.handle('close-tab', async (event, tabIndex) => {
  mainWindow.webContents.send('tab-closed', tabIndex)
})

// Window control handlers
ipcMain.handle('minimize-window', () => {
  mainWindow.minimize()
})

ipcMain.handle('maximize-window', () => {
  if (mainWindow.isMaximized()) {
    mainWindow.unmaximize()
  } else {
    mainWindow.maximize()
  }
})

ipcMain.handle('close-window', () => {
  mainWindow.close()
})

// Ollama availability check
ipcMain.handle('check-ollama', async () => {
  const status = await checkAIAvailability()
  ollamaAvailable = status.installed && status.server && status.model
  return status
})

// AI action handler
ipcMain.handle('process-ai-action', async (event, action, content) => {
  try {
    if (!aiFeatures) {
      throw new Error('AI features not available. Please ensure AI is properly configured.')
    }

    console.log(`Processing AI action: ${action}`)
    
    switch (action) {
      case 'enhance':
        return await aiFeatures.enhanceText(content)
      case 'rewrite':
        return await aiFeatures.rewriteContent(content)
      case 'prompt-engineer':
        return await aiFeatures.promptEngineer(content)
      case 'summarize':
        return await aiFeatures.summarizeText(content)
      case 'translate':
        return await aiFeatures.translateText(content)
      case 'grammar-check':
        return await aiFeatures.grammarCheck(content)
      default:
        throw new Error(`Unknown AI action: ${action}`)
    }
  } catch (error) {
    console.error('AI action error:', error)
    throw error
  }
})

// AI mode switching
ipcMain.handle('switch-ai-mode', async (event, mode) => {
  try {
    if (!aiFeatures) {
      throw new Error('AI features not available')
    }
    aiFeatures.setMode(mode)
    const currentMode = aiFeatures.getMode()
    console.log(`AI mode switched to: ${currentMode}`)
    return { success: true, mode: currentMode }
  } catch (error) {
    console.error('AI mode switch error:', error)
    throw error
  }
})

// Get current AI mode
ipcMain.handle('get-ai-mode', async () => {
  try {
    if (!aiFeatures) {
      return { mode: 'local' }
    }
    const mode = aiFeatures.getMode()
    return { mode }
  } catch (error) {
    console.error('Get AI mode error:', error)
    return { mode: 'local' }
  }
})

app.whenReady()
  .then(() => {
    createNewWindow()

    app.on("activate", () => {
      if (BrowserWindow.getAllWindows().length === 0) createNewWindow()
    })
  })

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit()
})
