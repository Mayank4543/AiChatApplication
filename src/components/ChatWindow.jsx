import { useChat } from '../context/ChatContext';
import { getAIResponse } from '../utils/geminiApi';
import MessageList from './MessageList';
import MessageInput from './MessageInput';

const ChatWindow = () => {
  const { currentChat, toggleSidebar, addMessage, isLoading, setIsLoading, setError } = useChat();

  const handleSendMessage = async (content) => {
    try {
      // Clear any previous errors
      setError(null);

      // Add user message immediately
      addMessage(content, 'user');

      // Set loading state
      setIsLoading(true);

      // Get conversation history for context (last 10 messages)
      const conversationHistory = currentChat?.messages.slice(-10) || [];

      // Call Gemini API
      const aiResponse = await getAIResponse(content, conversationHistory);

      // Add AI response
      addMessage(aiResponse, 'assistant');

    } catch (error) {
      console.error('Error getting AI response:', error);
      setError(error.message);
      addMessage('⚠️ Sorry, I encountered an error. Please try again.', 'assistant');
    } finally {
      // Always clear loading state
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-4 shadow-sm">
        {/* Hamburger Menu Button (Mobile only) */}
        <button
          onClick={toggleSidebar}
          className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <svg
            className="w-6 h-6 text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>

        {/* Chat Title */}
        <div className="flex-1">
          <h1 className="text-lg font-semibold text-gray-800 truncate">
            {currentChat?.title || 'Select a chat'}
          </h1>
          <p className="text-xs text-gray-500">
            Powered by Google Gemini AI
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600" title="Settings">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <MessageList messages={currentChat?.messages || []} />

      {/* Input Area */}
      <MessageInput onSendMessage={handleSendMessage} />
    </div>
  );
};

export default ChatWindow;
