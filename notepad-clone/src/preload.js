const { contextBridge, ipcRenderer } = require('electron')

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // File operations
  newFile: () => ipcRenderer.invoke('new-file'),
  openFile: () => ipcRenderer.invoke('open-file'),
  saveFile: (content) => ipcRenderer.invoke('save-file', content),
  saveAsFile: (content) => ipcRenderer.invoke('save-as-file', content),
  
  // Text operations
  onClearText: (callback) => ipcRenderer.on('clear-text', callback),
  onSetText: (callback) => ipcRenderer.on('set-text', callback),
  onUpdateFileInfo: (callback) => ipcRenderer.on('update-file-info', callback),
  
  // Tab management
  createTab: (title, content, filePath) => ipcRenderer.invoke('create-tab', title, content, filePath),
  switchTab: (tabIndex) => ipcRenderer.invoke('switch-tab', tabIndex),
  closeTab: (tabIndex) => ipcRenderer.invoke('close-tab', tabIndex),
  onTabCreated: (callback) => ipcRenderer.on('tab-created', callback),
  onTabSwitched: (callback) => ipcRenderer.on('tab-switched', callback),
  onTabClosed: (callback) => ipcRenderer.on('tab-closed', callback),
  
  // Window controls
  minimizeWindow: () => ipcRenderer.invoke('minimize-window'),
  maximizeWindow: () => ipcRenderer.invoke('maximize-window'),
  closeWindow: () => ipcRenderer.invoke('close-window'),
  
  // Ollama availability check
  checkOllama: () => ipcRenderer.invoke('check-ollama'),
  
  // AI features
  processAIAction: (action, content) => ipcRenderer.invoke('process-ai-action', action, content),
  switchAIMode: (mode) => ipcRenderer.invoke('switch-ai-mode', mode),
  getAIMode: () => ipcRenderer.invoke('get-ai-mode')
})
