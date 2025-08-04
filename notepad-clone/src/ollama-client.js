/**
 * Ollama Client for AI text processing
 * Handles communication with the local Ollama server
 */
const http = require('http')
const https = require('https')

class OllamaClient {
  constructor() {
    this.baseUrl = 'http://localhost:11434'
    this.model = 'gemma3:4b'
    this.timeout = 60000 // 60 seconds timeout for complex prompts
  }

  /**
   * Generate a response from the Ollama model
   * @param {string} prompt - The prompt to send to the model
   * @param {object} options - Additional options for the request
   * @returns {Promise<string>} The generated response
   */
  async generateResponse(prompt, options = {}) {
    try {
      console.log('Sending request to Ollama:', { model: this.model, promptLength: prompt.length })
      
      const requestData = JSON.stringify({
        model: this.model,
        prompt: prompt,
        stream: false,
        options: {
          temperature: 0.7,
          top_p: 0.9,
          ...options
        }
      })

      const response = await this.makeRequest('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(requestData)
        },
        body: requestData
      })

      console.log('Ollama response received, length:', response.response?.length || 0)
      return response.response || ''
    } catch (error) {
      console.error('Error generating Ollama response:', error)
      throw new Error(`AI processing failed: ${error.message}`)
    }
  }

  /**
   * Test the connection to Ollama
   * @returns {Promise<boolean>} True if connection is successful
   */
  async testConnection() {
    try {
      const response = await this.makeRequest('/api/tags', {
        method: 'GET'
      })
      return true
    } catch (error) {
      console.error('Ollama connection test failed:', error)
      return false
    }
  }

  /**
   * Make HTTP request using Node.js http module
   * @param {string} path - API path
   * @param {object} options - Request options
   * @returns {Promise<object>} Response data
   */
  makeRequest(path, options = {}) {
    return new Promise((resolve, reject) => {
      const url = new URL(this.baseUrl + path)
      const isHttps = url.protocol === 'https:'
      const client = isHttps ? https : http
      
      const requestOptions = {
        hostname: url.hostname,
        port: url.port || (isHttps ? 443 : 80),
        path: url.pathname + url.search,
        method: options.method || 'GET',
        headers: options.headers || {},
        timeout: this.timeout
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
        reject(new Error('Request timeout - the AI model is taking too long to respond. Try with shorter text or check if Ollama is running properly.'))
      })

      if (options.body) {
        req.write(options.body)
      }
      
      req.end()
    })
  }
}

module.exports = OllamaClient 