const TypingIndicator = () => {
  return (
    <div className="flex gap-4 p-4 mb-4 bg-gray-50 rounded-lg shadow-sm">
      {/* AI Avatar */}
      <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-purple-600 text-white">
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
          <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
        </svg>
      </div>

      {/* Typing Animation */}
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-sm text-gray-700 mb-2">
          AI Assistant
        </div>
        <div className="flex items-center gap-1">
          <span className="text-gray-600 text-sm">Thinking</span>
          <div className="flex gap-1">
            <span className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
            <span className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
            <span className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TypingIndicator;
