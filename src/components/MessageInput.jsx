import { useState, useRef, useEffect } from 'react';
import { useChat } from '../context/ChatContext';

const MessageInput = ({ onSendMessage }) => {
  const [message, setMessage] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const textareaRef = useRef(null);
  const recognitionRef = useRef(null);
  const { isLoading } = useChat();

  const MAX_CHARS = 2000;



  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 128)}px`;
    }
  }, [message]);

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setMessage(prev => prev + ' ' + transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = () => {
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && !isLoading && message.length <= MAX_CHARS) {
      onSendMessage(message);
      setMessage('');
      
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const toggleVoiceInput = () => {
    if (!recognitionRef.current) {
      alert('Voice input is not supported in your browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

 

  const handleMessageChange = (e) => {
    const newMessage = e.target.value;
    if (newMessage.length <= MAX_CHARS) {
      setMessage(newMessage);
      if (newMessage.trim()) {
        setShowSuggestions(false);
      }
    }
  };

  const clearMessage = () => {
    setMessage('');
    setShowSuggestions(true);
    textareaRef.current?.focus();
  };

  const charCount = message.length;
  const isNearLimit = charCount > MAX_CHARS * 0.8;
  const isOverLimit = charCount > MAX_CHARS;

  return (
    <div className="border-t border-gray-200 bg-white w-full max-w-full overflow-x-hidden">
      <form onSubmit={handleSubmit} className="p-2 sm:p-4 w-full">
        <div className="flex gap-1 sm:gap-2 items-end w-full max-w-full">
          {/* Voice Input Button */}
          <button
            type="button"
            onClick={toggleVoiceInput}
            disabled={isLoading}
            className={`p-2 sm:p-3 rounded-lg transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 ${
              isListening 
                ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse' 
                : 'bg-linear-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white'
            }`}
            title={isListening ? "Stop listening" : "Voice input"}
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isListening ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              )}
            </svg>
          </button>

          {/* Textarea Container */}
          <div className="flex-1 relative min-w-0 overflow-hidden">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={handleMessageChange}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              placeholder={isListening ? "🎤 Listening..." : isLoading ? "AI is responding..." : "Type your message... "}
              className={`w-full resize-none rounded-lg border px-2 sm:px-4 py-2 sm:py-3 pr-16 sm:pr-20 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-10 sm:min-h-14 max-h-32 disabled:bg-gray-50 disabled:cursor-not-allowed transition-colors ${
                isOverLimit ? 'border-red-500' : isNearLimit ? 'border-yellow-500' : 'border-gray-300'
              }`}
              rows="1"
            />
            
            {/* Character Counter & Clear Button */}
            {message && (
              <div className="absolute bottom-1.5 sm:bottom-2 right-1.5 sm:right-2 flex items-center gap-1 bg-white bg-opacity-90 rounded px-1">
                {!isLoading && (
                  <button
                    type="button"
                    onClick={clearMessage}
                    className="p-0.5 sm:p-1 hover:bg-gray-200 rounded transition-colors"
                    title="Clear message"
                  >
                    <svg className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
                <span className={`text-[10px] sm:text-xs font-medium whitespace-nowrap ${
                  isOverLimit ? 'text-red-600' : isNearLimit ? 'text-yellow-600' : 'text-gray-400'
                }`}>
                  {charCount}/{MAX_CHARS}
                </span>
              </div>
            )}
          </div>

          {/* Send Button */}
          <button
            type="submit"
            disabled={!message.trim() || isLoading || isOverLimit}
            className="px-3 sm:px-6 py-2 sm:py-3 bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-all shadow-md hover:shadow-lg flex items-center gap-1 sm:gap-2 min-h-10 sm:min-h-14 flex-shrink-0"
          >
            {isLoading ? (
              <>
                <span className="hidden sm:inline text-sm sm:text-base">Sending</span>
                <svg className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </>
            ) : (
              <>
                <span className="hidden sm:inline text-sm sm:text-base">Send</span>
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
              </>
            )}
          </button>
        </div>

        {/* Listening Indicator */}
        {isListening && (
          <div className="mt-2 flex items-center gap-2 text-xs sm:text-sm text-red-600">
            <svg className="w-3 h-3 sm:w-4 sm:h-4 animate-pulse flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
            </svg>
            <span className="truncate">Listening... Speak now</span>
          </div>
        )}
      </form>
    </div>
  );
};

export default MessageInput;
