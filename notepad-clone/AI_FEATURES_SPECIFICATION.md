# AI Enhancement Features Specification

## Overview
This document outlines the implementation of AI-powered text enhancement features for the Tabbed Notes Plus application using Ollama with the gemma3:4b model.

## Current Status
- ✅ Ollama detection working
- ✅ gemma3:4b model available
- ✅ UI dropdown menu ready
- 🔄 AI functionalities to be implemented

## AI Features to Implement

### 1. Enhance Text
**Purpose**: Improve writing quality, clarity, and style
**Function**: `enhanceText(content)`
**Expected Behavior**:
- Analyze current text for improvement opportunities
- Enhance grammar, vocabulary, and flow
- Maintain original meaning while improving quality
- Return enhanced version with highlighted changes

**Prompt Template**:
```
You are a professional writing assistant. Please enhance the following text to improve its clarity, grammar, and style while maintaining the original meaning and tone:

[USER_TEXT]

Provide the enhanced version with brief explanations of key improvements made.
```

### 2. Rewrite Content
**Purpose**: Provide alternative ways to express the same content
**Function**: `rewriteContent(content)`
**Expected Behavior**:
- Generate 2-3 different versions of the text
- Maintain core message and meaning
- Vary sentence structure and word choice
- Offer different writing styles (formal, casual, concise)

**Prompt Template**:
```
Please rewrite the following text in 3 different styles while maintaining the same core message:

[USER_TEXT]

Provide:
1. Formal/Professional version
2. Casual/Friendly version  
3. Concise/Summary version
```

### 3. Prompt Engineer
**Purpose**: Help users create better prompts for AI interactions
**Function**: `promptEngineer(content)`
**Expected Behavior**:
- Analyze user's prompt or question
- Suggest improvements for clarity and effectiveness
- Provide examples of better phrasing
- Explain why changes improve the prompt

**Prompt Template**:
```
You are a prompt engineering expert. Analyze this prompt and suggest improvements:

[USER_TEXT]

Provide:
1. Improved version of the prompt
2. Explanation of key improvements
3. Alternative phrasings
4. Tips for better prompt writing
```

### 4. Summarize
**Purpose**: Create concise summaries of longer text
**Function**: `summarizeText(content)`
**Expected Behavior**:
- Generate multiple summary lengths (brief, detailed, bullet points)
- Maintain key information and context
- Provide word count and key topics
- Option for different summary styles

**Prompt Template**:
```
Please summarize the following text in multiple formats:

[USER_TEXT]

Provide:
1. One-sentence summary
2. Brief summary (2-3 sentences)
3. Detailed summary (paragraph)
4. Bullet-point key points
5. Word count and main topics
```

### 5. Translate
**Purpose**: Translate text to different languages
**Function**: `translateText(content, targetLanguage)`
**Expected Behavior**:
- Support multiple target languages
- Maintain original formatting
- Provide pronunciation guides for non-Latin scripts
- Offer back-translation for verification

**Prompt Template**:
```
Please translate the following text to [TARGET_LANGUAGE]:

[USER_TEXT]

Provide:
1. Translation
2. Pronunciation guide (if applicable)
3. Cultural notes (if relevant)
4. Back-translation to English for verification
```

### 6. Grammar Check
**Purpose**: Identify and correct grammar, spelling, and style issues
**Function**: `grammarCheck(content)`
**Expected Behavior**:
- Highlight grammar and spelling errors
- Suggest corrections with explanations
- Provide style improvements
- Show before/after comparison

**Prompt Template**:
```
Please perform a comprehensive grammar and style check on this text:

[USER_TEXT]

Provide:
1. List of errors found (grammar, spelling, style)
2. Corrected version
3. Explanations for each correction
4. Style improvement suggestions
```

## Technical Implementation

### Backend API Structure

#### 1. Ollama Integration
```javascript
// src/ollama-client.js
class OllamaClient {
  constructor() {
    this.baseUrl = 'http://localhost:11434'
    this.model = 'gemma3:4b'
  }

  async generateResponse(prompt, options = {}) {
    const response = await fetch(`${this.baseUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: this.model,
        prompt: prompt,
        stream: false,
        ...options
      })
    })
    
    const data = await response.json()
    return data.response
  }
}
```

#### 2. AI Feature Handlers
```javascript
// src/ai-features.js
class AIFeatures {
  constructor() {
    this.ollama = new OllamaClient()
  }

  async enhanceText(content) {
    const prompt = `You are a professional writing assistant...`
    return await this.ollama.generateResponse(prompt)
  }

  async rewriteContent(content) {
    const prompt = `Please rewrite the following text...`
    return await this.ollama.generateResponse(prompt)
  }

  // ... other methods
}
```

### Frontend Integration

#### 1. UI State Management
```javascript
// Enhanced dropdown menu with loading states
const aiMenuItems = document.querySelectorAll('.ai-menu-item')
aiMenuItems.forEach(item => {
  item.addEventListener('click', async (e) => {
    const action = e.currentTarget.dataset.action
    const content = notepad.value
    
    // Show loading state
    showAILoading(action)
    
    try {
      const result = await window.electronAPI.processAIAction(action, content)
      displayAIResult(result)
    } catch (error) {
      showAIError(error)
    }
  })
})
```

#### 2. Result Display
```javascript
// Modal for displaying AI results
function displayAIResult(result) {
  const modal = createResultModal(result)
  document.body.appendChild(modal)
}

function createResultModal(result) {
  return `
    <div class="ai-result-modal">
      <div class="modal-header">
        <h3>${result.title}</h3>
        <button class="close-btn">×</button>
      </div>
      <div class="modal-content">
        <div class="original-text">
          <h4>Original</h4>
          <div class="text-content">${result.original}</div>
        </div>
        <div class="ai-result">
          <h4>Enhanced</h4>
          <div class="text-content">${result.enhanced}</div>
        </div>
      </div>
      <div class="modal-actions">
        <button class="apply-btn">Apply Changes</button>
        <button class="copy-btn">Copy Result</button>
        <button class="cancel-btn">Cancel</button>
      </div>
    </div>
  `
}
```

### IPC Communication

#### 1. Main Process Handlers
```javascript
// src/notepad.js
const AIFeatures = require('./ai-features')
const aiFeatures = new AIFeatures()

ipcMain.handle('process-ai-action', async (event, action, content) => {
  try {
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
        throw new Error('Unknown AI action')
    }
  } catch (error) {
    console.error('AI action error:', error)
    throw error
  }
})
```

#### 2. Preload Script
```javascript
// src/preload.js
contextBridge.exposeInMainWorld('electronAPI', {
  // ... existing methods
  
  // AI features
  processAIAction: (action, content) => ipcRenderer.invoke('process-ai-action', action, content),
  onAIProgress: (callback) => ipcRenderer.on('ai-progress', callback),
  onAIComplete: (callback) => ipcRenderer.on('ai-complete', callback),
  onAIError: (callback) => ipcRenderer.on('ai-error', callback)
})
```

## UI/UX Design

### 1. Loading States
- Show spinner in dropdown menu during processing
- Display progress indicator for long operations
- Disable menu items during processing

### 2. Result Modal Design
```css
.ai-result-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
}

.modal-content {
  background: #2d2d2d;
  border-radius: 12px;
  padding: 24px;
  max-width: 800px;
  max-height: 80vh;
  overflow-y: auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}
```

### 3. Error Handling
- Graceful error messages
- Retry options
- Fallback suggestions

## Implementation Phases

### Phase 1: Core Infrastructure
1. ✅ Ollama client setup
2. ✅ Basic AI feature handlers
3. ✅ IPC communication
4. ✅ Error handling

### Phase 2: Basic Features
1. 🔄 Enhance Text
2. 🔄 Grammar Check
3. 🔄 Summarize

### Phase 3: Advanced Features
1. 🔄 Rewrite Content
2. 🔄 Prompt Engineer
3. 🔄 Translate

### Phase 4: Polish
1. 🔄 UI/UX improvements
2. 🔄 Performance optimization
3. 🔄 User feedback integration

## Testing Strategy

### 1. Unit Tests
```javascript
// tests/ai-features.test.js
describe('AIFeatures', () => {
  test('enhanceText should improve text quality', async () => {
    const ai = new AIFeatures()
    const result = await ai.enhanceText('bad grammar text')
    expect(result).toContain('improved')
  })
})
```

### 2. Integration Tests
- Test Ollama connection
- Test IPC communication
- Test UI interactions

### 3. User Acceptance Tests
- Test each AI feature with real text
- Verify result quality
- Test error scenarios

## Performance Considerations

### 1. Response Time
- Target: <5 seconds for most operations
- Implement progress indicators
- Cache common results

### 2. Resource Usage
- Monitor memory usage
- Implement request queuing
- Handle large text inputs

### 3. User Experience
- Non-blocking UI during processing
- Cancel operation option
- Auto-save before AI operations

## Security Considerations

### 1. Input Validation
- Sanitize user input
- Limit text length
- Prevent injection attacks

### 2. Privacy
- Local processing only
- No data sent to external services
- Clear data handling policies

## Future Enhancements

### 1. Advanced Features
- Custom prompt templates
- Batch processing
- Export AI results

### 2. Model Management
- Multiple model support
- Model switching
- Performance comparison

### 3. User Preferences
- Custom AI settings
- Saved prompts
- Usage statistics

## Success Metrics

### 1. Technical Metrics
- Response time <5 seconds
- Success rate >95%
- Error rate <2%

### 2. User Metrics
- Feature adoption rate
- User satisfaction
- Usage frequency

### 3. Quality Metrics
- Text improvement accuracy
- User acceptance of suggestions
- Reduction in manual editing

---

**Next Steps**:
1. Implement Ollama client class
2. Create basic AI feature handlers
3. Set up IPC communication
4. Build result display UI
5. Add error handling and loading states 