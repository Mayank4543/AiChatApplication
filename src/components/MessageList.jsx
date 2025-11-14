import { useEffect, useRef } from 'react';
import { useChat } from '../context/ChatContext';
import MessageItem from './MessageItem';
import TypingIndicator from './TypingIndicator';

const MessageList = ({ messages, onRetry, onSuggestionClick }) => {
  const messagesEndRef = useRef(null);
  const { isLoading } = useChat();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  return (
    <div className="flex-1 overflow-y-auto overflow-x-hidden p-2 sm:p-4 space-y-2 w-full">
      {messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-gray-400">
          <svg
            className="w-16 h-16 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          <p className="text-lg font-medium">Start a conversation</p>
          <p className="text-sm mt-2">Type a message to begin chatting with AI</p>
        </div>
      ) : (
        <>
          {messages.map((message, index) => {
            // Check if this is the last AI message (not loading)
            const isLastAIMessage = !isLoading && 
              message.role === 'assistant' && 
              index === messages.length - 1;
            
            // Find the user question that prompted this AI response
            const userQuestion = message.role === 'assistant' && index > 0 
              ? messages[index - 1]?.content 
              : null;
            
            return (
              <MessageItem 
                key={message.id} 
                message={message} 
                onRetry={onRetry}
                onSuggestionClick={onSuggestionClick}
                isLastAIMessage={isLastAIMessage}
                userQuestion={userQuestion}
              />
            );
          })}
          {isLoading && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </>
      )}
    </div>
  );
};

export default MessageList;
