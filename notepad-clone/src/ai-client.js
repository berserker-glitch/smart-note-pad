/**
 * Unified AI Client
 * Supports both local Ollama and external API with seamless switching
 */
const http = require('http')
const https = require('https')

class AIClient {
  constructor() {
    // Configuration
    this.ollamaConfig = {
      baseUrl: 'http://localhost:11434',
      model: 'gemma3:4b',
      timeout: 60000
    }
    
    this.externalApiConfig = {
      baseUrl: 'https://openrouter.ai/api/v1',
      apiKey: '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',
      model: 'openai/gpt-3.5-turbo',
      timeout: 30000
    }
    
    // Default to local mode
    this.currentMode = 'local' // 'local' or 'external'
  }

  /**
   * Switch between local and external AI modes
   * @param {string} mode - 'local' or 'external'
   */
  setMode(mode) {
    if (mode !== 'local' && mode !== 'external') {
      throw new Error('Invalid mode. Use "local" or "external"')
    }
    this.currentMode = mode
    console.log(`AI mode switched to: ${mode}`)
  }

  /**
   * Get current mode
   * @returns {string} Current mode
   */
  getMode() {
    return this.currentMode
  }

  /**
   * Generate response using current mode
   * @param {string} prompt - The prompt to send
   * @param {object} options - Additional options
   * @returns {Promise<string>} Generated response
   */
  async generateResponse(prompt, options = {}) {
    if (this.currentMode === 'local') {
      return this.generateLocalResponse(prompt, options)
    } else {
      return this.generateExternalResponse(prompt, options)
    }
  }

  /**
   * Generate response using local Ollama
   * @param {string} prompt - The prompt to send
   * @param {object} options - Additional options
   * @returns {Promise<string>} Generated response
   */
  async generateLocalResponse(prompt, options = {}) {
    try {
      console.log('Sending request to Ollama:', { 
        model: this.ollamaConfig.model, 
        promptLength: prompt.length 
      })
      
      const requestData = JSON.stringify({
        model: this.ollamaConfig.model,
        prompt: prompt,
        stream: false,
        options: {
          temperature: 0.7,
          top_p: 0.9,
          ...options
        }
      })

      const response = await this.makeRequest(this.ollamaConfig.baseUrl + '/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(requestData)
        },
        body: requestData,
        timeout: this.ollamaConfig.timeout
      })

      console.log('Ollama response received, length:', response.response?.length || 0)
      return response.response || ''
    } catch (error) {
      console.error('Error generating Ollama response:', error)
      throw new Error(`Local AI processing failed: ${error.message}`)
    }
  }

  /**
   * Generate response using external API
   * @param {string} prompt - The prompt to send
   * @param {object} options - Additional options
   * @returns {Promise<string>} Generated response
   */
  async generateExternalResponse(prompt, options = {}) {
    try {
      console.log('Sending request to external API:', { 
        model: this.externalApiConfig.model, 
        promptLength: prompt.length 
      })
      
      const requestData = JSON.stringify({
        model: this.externalApiConfig.model,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 1000,
        temperature: 0.7,
        stream: false,
        ...options
      })

      const response = await this.makeRequest(this.externalApiConfig.baseUrl + '/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.externalApiConfig.apiKey}`,
          'HTTP-Referer': 'https://notepad-clone.local',
          'X-Title': 'Notepad Pro AI',
          'Content-Length': Buffer.byteLength(requestData)
        },
        body: requestData,
        timeout: this.externalApiConfig.timeout
      })

      console.log('External API response received, length:', response.choices?.[0]?.message?.content?.length || 0)
      return response.choices?.[0]?.message?.content || ''
    } catch (error) {
      console.error('Error generating external API response:', error)
      
      // Provide more specific error messages for common API issues
      if (error.message.includes('401')) {
        throw new Error('OpenRouter API key is invalid or expired. Please check your API key configuration.')
      } else if (error.message.includes('403')) {
        throw new Error('OpenRouter API access denied. Please check your API key permissions.')
      } else if (error.message.includes('429')) {
        throw new Error('OpenRouter API rate limit exceeded. Please try again later.')
      } else if (error.message.includes('404')) {
        throw new Error('OpenRouter API endpoint not found. Please check the API configuration.')
      } else if (error.message.includes('400') && error.message.includes('not a valid model ID')) {
        throw new Error('OpenRouter model not found. Please check the model configuration or try a different model.')
      } else {
        throw new Error(`OpenRouter AI processing failed: ${error.message}`)
      }
    }
  }

  /**
   * Test connection for current mode
   * @returns {Promise<object>} Connection status
   */
  async testConnection() {
    if (this.currentMode === 'local') {
      return this.testLocalConnection()
    } else {
      return this.testExternalConnection()
    }
  }

  /**
   * Test local Ollama connection
   * @returns {Promise<object>} Connection status
   */
  async testLocalConnection() {
    try {
      const response = await this.makeRequest(this.ollamaConfig.baseUrl + '/api/tags', {
        method: 'GET',
        timeout: 10000
      })
      
      // Check if gemma3:4b model is available
      const models = response.models || []
      const hasModel = models.some(model => model.name === this.ollamaConfig.model)
      
      return {
        connected: true,
        model: hasModel,
        message: hasModel ? 'Ollama ready with gemma3:4b' : 'Ollama running but gemma3:4b not found'
      }
    } catch (error) {
      console.error('Local connection test failed:', error)
      return {
        connected: false,
        model: false,
        message: 'Ollama not available'
      }
    }
  }

  /**
   * Test external API connection
   * @returns {Promise<object>} Connection status
   */
  async testExternalConnection() {
    try {
      const response = await this.makeRequest(this.externalApiConfig.baseUrl + '/models', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.externalApiConfig.apiKey}`,
          'HTTP-Referer': 'https://notepad-clone.local',
          'X-Title': 'Notepad Pro AI'
        },
        timeout: 10000
      })
      
      // Check if the model is available in the response
      const models = response.data || []
      const hasModel = models.some(model => 
        model.id === this.externalApiConfig.model || 
        model.id.includes('gpt-3.5-turbo')
      )
      
      return {
        connected: true,
        model: hasModel,
        message: hasModel ? 'OpenRouter API ready with model' : 'OpenRouter API ready but model not found'
      }
    } catch (error) {
      console.error('External connection test failed:', error)
      return {
        connected: false,
        model: false,
        message: 'OpenRouter API not available'
      }
    }
  }

  /**
   * Make HTTP request using Node.js http module
   * @param {string} url - Full URL
   * @param {object} options - Request options
   * @returns {Promise<object>} Response data
   */
  makeRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
      const urlObj = new URL(url)
      const isHttps = urlObj.protocol === 'https:'
      const client = isHttps ? https : http
      
      const requestOptions = {
        hostname: urlObj.hostname,
        port: urlObj.port || (isHttps ? 443 : 80),
        path: urlObj.pathname + urlObj.search,
        method: options.method || 'GET',
        headers: options.headers || {},
        timeout: options.timeout || 30000
      }

      const req = client.request(requestOptions, (res) => {
        let data = ''
        
        res.on('data', (chunk) => {
          data += chunk
        })
        
        res.on('end', () => {
          try {
            if (res.statusCode >= 200 && res.statusCode < 300) {
              const responseData = JSON.parse(data)
              resolve(responseData)
            } else {
              reject(new Error(`HTTP error! status: ${res.statusCode}, message: ${data}`))
            }
          } catch (error) {
            reject(new Error(`Failed to parse response: ${error.message}`))
          }
        })
      })

      req.on('error', (error) => {
        reject(new Error(`Request failed: ${error.message}`))
      })

      req.on('timeout', () => {
        req.destroy()
        const mode = this.currentMode === 'local' ? 'Ollama' : 'OpenRouter API'
        reject(new Error(`Request timeout - ${mode} is taking too long to respond. Try with shorter text.`))
      })

      if (options.body) {
        req.write(options.body)
      }
      
      req.end()
    })
  }
}

module.exports = AIClient 