
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;


const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent';

/**
 * Default generation configuration
 * These settings control the AI's response behavior
 */
const DEFAULT_CONFIG = {
  temperature: 0.7,      // Controls randomness (0-1). Higher = more creative
  topK: 40,              // Limits vocabulary to top K tokens
  topP: 0.95,            // Nucleus sampling threshold
  maxOutputTokens: 2048, // Maximum length of response
};

/**
 * Safety settings to filter harmful content
 * Blocks medium and high probability harmful content
 */
const SAFETY_SETTINGS = [
  {
    category: 'HARM_CATEGORY_HARASSMENT',
    threshold: 'BLOCK_MEDIUM_AND_ABOVE'
  },
  {
    category: 'HARM_CATEGORY_HATE_SPEECH',
    threshold: 'BLOCK_MEDIUM_AND_ABOVE'
  },
  {
    category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
    threshold: 'BLOCK_MEDIUM_AND_ABOVE'
  },
  {
    category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
    threshold: 'BLOCK_MEDIUM_AND_ABOVE'
  }
];


function validateApiKey() {
  if (!API_KEY || API_KEY === 'your_api_key_here') {
    throw new Error(
      'Gemini API key not configured. Please add VITE_GEMINI_API_KEY to your .env file.'
    );
  }
  return true;
}


function formatConversationHistory(history) {
  return history.map(msg => ({
    role: msg.role === 'user' ? 'user' : 'model',
    parts: [{ text: msg.content }]
  }));
}

/**
 * Builds the contents array for the API request
 * Includes conversation history if provided
 * 
 * @param {string} prompt - Current user message
 * @param {Array} conversationHistory - Previous messages
 * @returns {Array} Contents array for API request
 */
function buildContents(prompt, conversationHistory = []) {
  if (conversationHistory.length > 0) {
    // Include conversation context
    const formattedHistory = formatConversationHistory(conversationHistory);
    
    // Add current prompt
    formattedHistory.push({
      role: 'user',
      parts: [{ text: prompt }]
    });
    
    return formattedHistory;
  } else {
    // Simple single message without context
    return [{
      parts: [{ text: prompt }]
    }];
  }
}

/**
 * Extracts AI response from API response data
 * 
 * @param {Object} data - API response data
 * @returns {string} Extracted AI response text
 * @throws {Error} If no valid response found
 */
function extractAIResponse(data) {
  const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
  
  if (!aiResponse) {
    throw new Error('No response generated from AI');
  }
  
  return aiResponse;
}

/**
 * Generates user-friendly error message based on error type
 * 
 * @param {Error} error - Original error object
 * @returns {string} User-friendly error message
 */
function getErrorMessage(error) {
  const errorMsg = error.message.toLowerCase();
  
  if (errorMsg.includes('api key')) {
    return ' API Key Error: Please configure your Gemini API key in the .env file.';
  }
  
  if (errorMsg.includes('fetch') || errorMsg.includes('network')) {
    return ' Network Error: Unable to reach Gemini API. Please check your internet connection.';
  }
  
  if (errorMsg.includes('quota') || errorMsg.includes('limit')) {
    return ' Quota Exceeded: API quota limit reached. Please try again later.';
  }
  
  if (errorMsg.includes('401') || errorMsg.includes('unauthorized')) {
    return 'Authentication Error: Invalid API key. Please check your credentials.';
  }
  
  if (errorMsg.includes('429')) {
    return ' Rate Limit: Too many requests. Please wait a moment and try again.';
  }
  
  // Generic error message
  return `⚠️ Error: ${error.message}`;
}

// ============================================================================
// MAIN API FUNCTIONS
// ============================================================================

/**
 * Get AI response from Google Gemini API
 * 
 * This is the main function to interact with Gemini API.
 * It sends a prompt and optionally conversation history,
 * then returns the AI's response.
 * 
 * @async
 * @param {string} prompt - User message/prompt to send
 * @param {Array} conversationHistory - Optional array of previous messages for context
 * @returns {Promise<string>} AI response text
 * 
 * @example
 * // Simple usage
 * const response = await getAIResponse("Hello, how are you?");
 * 
 * @example
 * // With conversation history
 * const history = [
 *   { role: 'user', content: 'What is React?' },
 *   { role: 'assistant', content: 'React is a JavaScript library...' }
 * ];
 * const response = await getAIResponse("Tell me more", history);
 */
export async function getAIResponse(prompt, conversationHistory = []) {
  try {
    // Step 1: Validate API key
    validateApiKey();
    
    // Step 2: Build request contents
    const contents = buildContents(prompt, conversationHistory);
    
    // Step 3: Make API request
    const response = await fetch(`${API_URL}?key=${API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents,
        generationConfig: DEFAULT_CONFIG,
        safetySettings: SAFETY_SETTINGS
      })
    });
    
    // Step 4: Check response status
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error?.message || `API request failed with status ${response.status}`;
      throw new Error(errorMessage);
    }
    
    // Step 5: Parse response
    const data = await response.json();
    
    // Step 6: Extract and return AI response
    return extractAIResponse(data);
    
  } catch (error) {
    // Log error for debugging
    console.error('Gemini API Error:', error);
    
    // Return user-friendly error message
    return getErrorMessage(error);
  }
}

/**
 * Legacy function name for backward compatibility
 * Use getAIResponse() instead
 * 
 * @deprecated Use getAIResponse() instead
 * @param {string} message - User message
 * @param {Array} conversationHistory - Previous messages
 * @returns {Promise<string>} AI response
 */
export const sendMessageToGemini = getAIResponse;

/**
 * Stream a response from Gemini (Future Feature)
 * 
 * Note: Streaming requires a different API endpoint and implementation.
 * Currently falls back to regular getAIResponse().
 * This will be implemented in a future update.
 * 
 * @async
 * @param {string} message - User message
 * @param {Array} conversationHistory - Previous messages for context
 * @param {Function} onChunk - Callback function for each chunk of response
 * @returns {Promise<void>}
 * 
 * @example
 * await streamGeminiResponse("Hello", [], (chunk) => {
 *   console.log("Received:", chunk);
 * });
 */
export async function streamGeminiResponse(message, conversationHistory = [], onChunk) {
  console.warn('Streaming feature not yet implemented. Falling back to regular response.');
  
  // Fall back to regular response for now
  const response = await getAIResponse(message, conversationHistory);
  
  // Call the callback with the complete response
  if (typeof onChunk === 'function') {
    onChunk(response);
  }
  
  return response;
}


export default {
  getAIResponse,
  
  streamGeminiResponse
};
