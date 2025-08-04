/**
 * AI Features Handler
 * Provides AI-powered text enhancement capabilities using unified AI client
 */
const AIClient = require('./ai-client')

class AIFeatures {
  constructor() {
    this.aiClient = new AIClient()
  }

  /**
   * Enhance text by improving grammar, clarity, and style
   * @param {string} content - The text to enhance
   * @returns {Promise<object>} Enhanced text with explanations
   */
  async enhanceText(content) {
    if (!content || content.trim().length === 0) {
      throw new Error('No text provided for enhancement')
    }

    // Check text length to prevent timeouts
    if (content.length > 2000) {
      throw new Error('Text is too long for enhancement. Please use text under 2000 characters for best results.')
    }

    const prompt = `You are an expert writing editor. Enhance this text for clarity, grammar, and impact while preserving the original voice.

TEXT: "${content}"

ENHANCE: Grammar, punctuation, word choice, clarity, conciseness, active voice.

RESPONSE FORMAT:
ENHANCED_TEXT:
[Improved version here]

EXPLANATION:
[2-3 specific improvements made]`

    try {
      console.log('Enhancing text, length:', content.length)
      const response = await this.aiClient.generateResponse(prompt)
      
      // Parse the response to extract enhanced text and explanation
      const result = this.parseEnhanceResponse(response)
      
      return {
        original: content,
        enhanced: result.enhanced,
        explanation: result.explanation,
        title: 'Text Enhanced',
        action: 'enhance'
      }
    } catch (error) {
      console.error('Error enhancing text:', error)
      throw new Error(`Failed to enhance text: ${error.message}`)
    }
  }

  /**
   * Parse the AI response to extract enhanced text and explanation
   * @param {string} response - Raw AI response
   * @returns {object} Parsed result with enhanced text and explanation
   */
  parseEnhanceResponse(response) {
    try {
      // Look for the enhanced text section with more flexible matching
      const enhancedMatch = response.match(/ENHANCED_TEXT:\s*([\s\S]*?)(?=EXPLANATION:|$)/i)
      const explanationMatch = response.match(/EXPLANATION:\s*([\s\S]*?)(?=QUALITY STANDARDS:|$)/i)
      
      let enhanced = enhancedMatch ? enhancedMatch[1].trim() : ''
      let explanation = explanationMatch ? explanationMatch[1].trim() : ''
      
      // If parsing failed, try alternative patterns
      if (!enhanced) {
        // Look for text that might be the enhanced version
        const lines = response.split('\n')
        const enhancedLines = []
        let inEnhancedSection = false
        
        for (const line of lines) {
          if (line.toLowerCase().includes('enhanced_text:') || line.toLowerCase().includes('enhanced text:')) {
            inEnhancedSection = true
            continue
          }
          if (line.toLowerCase().includes('explanation:') || line.toLowerCase().includes('quality standards:')) {
            inEnhancedSection = false
            break
          }
          if (inEnhancedSection && line.trim()) {
            enhancedLines.push(line)
          }
        }
        
        enhanced = enhancedLines.join('\n').trim()
      }
      
      // If still no enhanced text, use the entire response
      if (!enhanced && response.trim()) {
        enhanced = response.trim()
        explanation = 'Text has been enhanced for better clarity, grammar, and professional polish.'
      }
      
      // Clean up explanation if it's too long
      if (explanation && explanation.length > 200) {
        explanation = explanation.substring(0, 200) + '...'
      }
      
      return {
        enhanced: enhanced || 'No enhancement generated',
        explanation: explanation || 'Text has been professionally enhanced for better clarity and impact.'
      }
    } catch (error) {
      console.error('Error parsing enhance response:', error)
      return {
        enhanced: response.trim() || 'No enhancement generated',
        explanation: 'Text has been professionally enhanced for better clarity and impact.'
      }
    }
  }

  /**
   * Grammar check functionality with detailed analysis
   * @param {string} content - The text to check
   * @returns {Promise<object>} Grammar check results
   */
  async grammarCheck(content) {
    if (!content || content.trim().length === 0) {
      throw new Error('No text provided for grammar check')
    }

    // Check text length to prevent timeouts
    if (content.length > 2000) {
      throw new Error('Text is too long for grammar check. Please use text under 2000 characters for best results.')
    }

    const prompt = `You are an expert grammarian. Analyze and correct this text.

TEXT: "${content}"

CHECK: Grammar, spelling, punctuation, style, clarity.

RESPONSE FORMAT:
CORRECTED_TEXT:
[Corrected version]

ERRORS_FOUND:
[Key errors found]

IMPROVEMENTS:
[Main improvements made]

GRAMMAR_TIPS:
[1-2 relevant tips]`

    try {
      console.log('Performing grammar check, length:', content.length)
      const response = await this.aiClient.generateResponse(prompt)
      
      // Parse the response to extract corrected text and analysis
      const result = this.parseGrammarResponse(response)
      
      return {
        original: content,
        corrected: result.corrected,
        errors: result.errors,
        improvements: result.improvements,
        tips: result.tips,
        title: 'Grammar Check Complete',
        action: 'grammar-check'
      }
    } catch (error) {
      console.error('Error performing grammar check:', error)
      throw new Error(`Failed to perform grammar check: ${error.message}`)
    }
  }

  /**
   * Parse the grammar check response
   * @param {string} response - Raw AI response
   * @returns {object} Parsed result with corrected text and analysis
   */
  parseGrammarResponse(response) {
    try {
      // Look for the corrected text section
      const correctedMatch = response.match(/CORRECTED_TEXT:\s*([\s\S]*?)(?=ERRORS_FOUND:|$)/i)
      const errorsMatch = response.match(/ERRORS_FOUND:\s*([\s\S]*?)(?=IMPROVEMENTS:|$)/i)
      const improvementsMatch = response.match(/IMPROVEMENTS:\s*([\s\S]*?)(?=GRAMMAR_TIPS:|$)/i)
      const tipsMatch = response.match(/GRAMMAR_TIPS:\s*([\s\S]*?)$/i)
      
      let corrected = correctedMatch ? correctedMatch[1].trim() : ''
      let errors = errorsMatch ? errorsMatch[1].trim() : ''
      let improvements = improvementsMatch ? improvementsMatch[1].trim() : ''
      let tips = tipsMatch ? tipsMatch[1].trim() : ''
      
      // If parsing failed, use the entire response as corrected text
      if (!corrected && response.trim()) {
        corrected = response.trim()
        errors = 'Grammar analysis completed.'
        improvements = 'Text has been reviewed for grammar and style improvements.'
        tips = 'Consider reviewing your text for clarity and consistency.'
      }
      
      return {
        corrected: corrected || 'No corrections generated',
        errors: errors || 'No specific errors identified',
        improvements: improvements || 'Grammar check completed',
        tips: tips || 'Review your text for clarity and consistency.'
      }
    } catch (error) {
      console.error('Error parsing grammar response:', error)
      return {
        corrected: response.trim() || 'No corrections generated',
        errors: 'Grammar analysis completed.',
        improvements: 'Text has been reviewed for grammar and style improvements.',
        tips: 'Consider reviewing your text for clarity and consistency.'
      }
    }
  }

  /**
   * Summarize text functionality (placeholder for future implementation)
   * @param {string} content - The text to summarize
   * @returns {Promise<object>} Summary results
   */
  async summarizeText(content) {
    // Placeholder for future implementation
    throw new Error('Summarize feature not yet implemented')
  }

  /**
   * Rewrite content functionality (placeholder for future implementation)
   * @param {string} content - The text to rewrite
   * @returns {Promise<object>} Rewrite results
   */
  async rewriteContent(content) {
    // Placeholder for future implementation
    throw new Error('Rewrite feature not yet implemented')
  }

  /**
   * Prompt engineer functionality (placeholder for future implementation)
   * @param {string} content - The prompt to improve
   * @returns {Promise<object>} Improved prompt results
   */
  async promptEngineer(content) {
    // Placeholder for future implementation
    throw new Error('Prompt engineer feature not yet implemented')
  }

  /**
   * Translate text functionality (placeholder for future implementation)
   * @param {string} content - The text to translate
   * @param {string} targetLanguage - Target language
   * @returns {Promise<object>} Translation results
   */
  async translateText(content, targetLanguage = 'Spanish') {
    // Placeholder for future implementation
    throw new Error('Translate feature not yet implemented')
  }

  /**
   * Switch between local and external AI modes
   * @param {string} mode - 'local' or 'external'
   */
  setMode(mode) {
    this.aiClient.setMode(mode)
  }

  /**
   * Get current AI mode
   * @returns {string} Current mode
   */
  getMode() {
    return this.aiClient.getMode()
  }

  /**
   * Test connection for current mode
   * @returns {Promise<object>} Connection status
   */
  async testConnection() {
    return await this.aiClient.testConnection()
  }
}

module.exports = AIFeatures 