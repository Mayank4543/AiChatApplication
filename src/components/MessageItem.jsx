import { useState } from 'react';

const MessageItem = ({ message, onRetry, onSuggestionClick, isLastAIMessage, userQuestion }) => {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);
  const [copiedCode, setCopiedCode] = useState({});
  const isError = message.error === true;

  // Generate intelligent follow-up suggestions based on user question AND AI response
  const generateSuggestions = (aiResponse, userQuery) => {
    const suggestions = [];
    const lowerResponse = aiResponse.toLowerCase();
    const lowerQuery = userQuery?.toLowerCase() || '';

    // Analyze response type and complexity
    const hasCodeBlock = aiResponse.includes('```');
    const hasSteps = /\d+\.|step|first|second|third/i.test(aiResponse);
    const isTechnical = /function|class|const|import|export|async|await/i.test(aiResponse);
    const isExplanation = lowerResponse.includes('because') || lowerResponse.includes('reason') || lowerResponse.includes('explanation');
    
    // Check user's query intent
    const askedHow = /how|what|explain|why/i.test(lowerQuery);
    const askedExample = /example|sample|demo|show/i.test(lowerQuery);
    const askedComparison = /difference|compare|versus|vs|better/i.test(lowerQuery);
    const askedTroubleshoot = /error|problem|issue|fix|debug|not working/i.test(lowerQuery);

    // Smart contextual suggestions based on conversation flow
    if (hasCodeBlock && !askedExample) {
      suggestions.push('Can you explain how this code works?', 'Show me a simpler version', 'What are common mistakes with this?');
    } else if (hasCodeBlock && askedExample) {
      suggestions.push('Can you optimize this code?', 'What about edge cases?', 'How do I test this?');
    } else if (hasSteps && !askedTroubleshoot) {
      suggestions.push('What if I skip a step?', 'Can you automate this process?', 'What are common issues?');
    } else if (isTechnical && !askedHow) {
      suggestions.push('Explain this in simpler terms', 'What are the alternatives?', 'Show me a real-world use case');
    } else if (isExplanation && !askedComparison) {
      suggestions.push('What are the pros and cons?', 'Compare this with alternatives', 'Show me a practical example');
    } else if (askedTroubleshoot) {
      suggestions.push('How can I prevent this in the future?', 'What causes this error?', 'Are there debugging tools for this?');
    } else if (lowerResponse.includes('react') || lowerResponse.includes('component')) {
      suggestions.push('Show me a complete working example', 'What about React hooks for this?', 'Best practices for this in React?');
    } else if (lowerResponse.includes('performance') || lowerResponse.includes('optimize')) {
      suggestions.push('How much improvement can I expect?', 'What are the trade-offs?', 'How do I measure this?');
    } else if (lowerResponse.includes('install') || lowerResponse.includes('setup')) {
      suggestions.push('What dependencies do I need?', 'Any common setup errors?', 'How do I verify installation?');
    } else {
      // Generic but still contextual
      suggestions.push('Can you show me an example?', 'What else should I know?', 'How does this compare to alternatives?');
    }

    return suggestions.slice(0, 3); // Return max 3 suggestions
  };

  // Syntax highlighting for code blocks (using React components)
  const highlightCode = (code, language) => {
    if (!code) return [];
    
    const lines = code.split('\n');
    return lines.map((line, lineIndex) => {
      const tokens = [];
      let remaining = line;
      let tokenKey = 0;
      
      // Process the line to find different token types
      while (remaining.length > 0) {
        let matched = false;
        
        // Comments (highest priority to avoid processing content inside)
        const commentMatch = remaining.match(/^(\/\/.*$|\/\*[\s\S]*?\*\/)/);
        if (commentMatch) {
          tokens.push(<span key={`${lineIndex}-${tokenKey++}`} className="text-gray-500 italic">{commentMatch[0]}</span>);
          remaining = remaining.slice(commentMatch[0].length);
          matched = true;
          continue;
        }
        
        // Strings
        const stringMatch = remaining.match(/^("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)/);
        if (stringMatch) {
          tokens.push(<span key={`${lineIndex}-${tokenKey++}`} className="text-green-400">{stringMatch[0]}</span>);
          remaining = remaining.slice(stringMatch[0].length);
          matched = true;
          continue;
        }
        
        // Keywords
        const keywordMatch = remaining.match(/^(function|const|let|var|if|else|return|for|while|class|import|export|from|async|await|try|catch|throw|new|this|super|extends|implements|interface|type|enum|namespace|module|require|default|case|switch|break|continue|do|in|of|typeof|instanceof|void|delete|yield|static|public|private|protected|abstract|readonly|get|set)\b/);
        if (keywordMatch) {
          tokens.push(<span key={`${lineIndex}-${tokenKey++}`} className="text-purple-400 font-semibold">{keywordMatch[0]}</span>);
          remaining = remaining.slice(keywordMatch[0].length);
          matched = true;
          continue;
        }
        
        // Numbers
        const numberMatch = remaining.match(/^\b(\d+\.?\d*)\b/);
        if (numberMatch) {
          tokens.push(<span key={`${lineIndex}-${tokenKey++}`} className="text-orange-400">{numberMatch[0]}</span>);
          remaining = remaining.slice(numberMatch[0].length);
          matched = true;
          continue;
        }
        
        // Function calls
        const functionMatch = remaining.match(/^([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/);
        if (functionMatch) {
          tokens.push(<span key={`${lineIndex}-${tokenKey++}`} className="text-yellow-300">{functionMatch[1]}</span>);
          remaining = remaining.slice(functionMatch[1].length);
          matched = true;
          continue;
        }
        
        // Default: regular character
        if (!matched) {
          tokens.push(<span key={`${lineIndex}-${tokenKey++}`}>{remaining[0]}</span>);
          remaining = remaining.slice(1);
        }
      }
      
      return (
        <div key={lineIndex}>
          {tokens.length > 0 ? tokens : '\n'}
        </div>
      );
    });
  };

  // Format timestamp for display
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffInSeconds = Math.floor((now - date) / 1000);
      
      if (diffInSeconds < 60) return 'Just now';
      if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
      if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
      if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
      
      // For older messages, show date
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch (error) {
      return '';
    }
  };

  // Format AI message content with markdown-like rendering
  const formatContent = (content) => {
    if (isUser) {
      return <div className="text-gray-800 whitespace-pre-wrap break-words text-sm sm:text-base">{content}</div>;
    }

    // Split content into lines for processing
    const lines = content.split('\n');
    const elements = [];
    let codeBlock = null;
    let codeLines = [];
    let listItems = [];
    let inList = false;

    lines.forEach((line, index) => {
      // Code block detection
      if (line.trim().startsWith('```')) {
        if (codeBlock === null) {
          // Start code block
          codeBlock = line.trim().substring(3).trim() || 'code';
        } else {
          // End code block
          const codeBlockId = `code-${index}`;
          const codeContent = codeLines.join('\n');
          const highlightedCode = highlightCode(codeContent, codeBlock);
          
          elements.push(
            <div key={codeBlockId} className="my-4 rounded-lg overflow-hidden border border-gray-200 shadow-sm max-w-full">
              <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-4 py-2.5 flex items-center justify-between">
                <span className="text-xs text-gray-300 font-semibold uppercase tracking-wide">{codeBlock}</span>
                <button
                  onClick={async (e) => {
                    e.stopPropagation();
                    try {
                      await navigator.clipboard.writeText(codeContent);
                      setCopiedCode(prev => ({ ...prev, [codeBlockId]: true }));
                      setTimeout(() => {
                        setCopiedCode(prev => ({ ...prev, [codeBlockId]: false }));
                      }, 2000);
                    } catch (err) {
                      console.error('Failed to copy code:', err);
                    }
                  }}
                  className="flex items-center gap-1.5 text-xs text-gray-300 hover:text-white bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded transition-colors"
                >
                  {copiedCode[codeBlockId] ? (
                    <>
                      <svg className="w-3.5 h-3.5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Copied!
                    </>
                  ) : (
                    <>
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      Copy
                    </>
                  )}
                </button>
              </div>
              <pre className="bg-[#1e1e1e] text-gray-100 p-3 sm:p-4 overflow-x-auto text-xs sm:text-sm max-w-full">
                <code className="font-mono leading-relaxed block whitespace-pre-wrap break-words">
                  {highlightedCode}
                </code>
              </pre>
            </div>
          );
          codeBlock = null;
          codeLines = [];
        }
        return;
      }

      // Inside code block
      if (codeBlock !== null) {
        codeLines.push(line);
        return;
      }

      // End list if needed
      if (inList && !line.trim().match(/^[-*•]\s/)) {
        elements.push(
          <ul key={`list-${index}`} className="my-3 space-y-2">
            {listItems.map((item, i) => (
              <li key={i} className="flex items-start gap-3 pl-2">
                <span className="text-purple-600 font-bold mt-1 flex-shrink-0">•</span>
                <span className="flex-1 text-gray-800">{formatInlineStyles(item)}</span>
              </li>
            ))}
          </ul>
        );
        listItems = [];
        inList = false;
      }

      // List item
      if (line.trim().match(/^[-*•]\s/)) {
        const item = line.trim().replace(/^[-*•]\s/, '');
        listItems.push(item);
        inList = true;
        return;
      }

      // Headers
      if (line.startsWith('### ')) {
        elements.push(
          <h3 key={index} className="text-lg sm:text-xl font-bold text-gray-900 mt-4 sm:mt-5 mb-2 sm:mb-3 border-b border-gray-200 pb-2 break-words">
            {formatInlineStyles(line.substring(4))}
          </h3>
        );
        return;
      }

      if (line.startsWith('## ')) {
        elements.push(
          <h2 key={index} className="text-xl sm:text-2xl font-bold text-gray-900 mt-5 sm:mt-6 mb-2 sm:mb-3 border-b-2 border-purple-200 pb-2 break-words">
            {formatInlineStyles(line.substring(3))}
          </h2>
        );
        return;
      }

      if (line.startsWith('# ')) {
        elements.push(
          <h1 key={index} className="text-2xl sm:text-3xl font-bold text-gray-900 mt-5 sm:mt-6 mb-3 sm:mb-4 border-b-2 border-purple-300 pb-3 break-words">
            {formatInlineStyles(line.substring(2))}
          </h1>
        );
        return;
      }

      // Numbered list
      if (line.trim().match(/^\d+\.\s/)) {
        const item = line.trim().replace(/^\d+\.\s/, '');
        const number = line.match(/^\d+/)[0];
        elements.push(
          <div key={index} className="flex items-start gap-3 my-2 pl-2">
            <span className="text-purple-600 font-bold flex-shrink-0 min-w-[24px]">{number}.</span>
            <span className="flex-1 text-gray-800">{formatInlineStyles(item)}</span>
          </div>
        );
        return;
      }

      // Blockquote
      if (line.trim().startsWith('> ')) {
        elements.push(
          <blockquote key={index} className="border-l-4 border-purple-500 pl-4 py-3 my-3 italic text-gray-700 bg-purple-50 rounded-r-lg">
            {formatInlineStyles(line.substring(2))}
          </blockquote>
        );
        return;
      }

      // Horizontal rule
      if (line.trim() === '---' || line.trim() === '***') {
        elements.push(<hr key={index} className="my-6 border-t-2 border-gray-200" />);
        return;
      }

      // Regular paragraph
      if (line.trim()) {
        elements.push(
          <p key={index} className="my-2 leading-6 sm:leading-7 text-gray-800 text-sm sm:text-base break-words">
            {formatInlineStyles(line)}
          </p>
        );
      } else {
        elements.push(<div key={index} className="h-3" />);
      }
    });

    // Flush remaining list items
    if (listItems.length > 0) {
      elements.push(
        <ul key="list-end" className="my-3 space-y-2">
          {listItems.map((item, i) => (
            <li key={i} className="flex items-start gap-3 pl-2">
              <span className="text-purple-600 font-bold mt-1 flex-shrink-0">•</span>
              <span className="flex-1 text-gray-800">{formatInlineStyles(item)}</span>
            </li>
          ))}
        </ul>
      );
    }

    return <div className="text-gray-800 text-sm sm:text-base">{elements}</div>;
  };

  // Format inline styles (bold, italic, code, links) - No placeholders approach
  const formatInlineStyles = (text) => {
    if (!text) return null;
    
    const elements = [];
    let remaining = String(text);
    let key = 0;

    while (remaining.length > 0) {
      // Try to match inline code first (highest priority)
      const codeMatch = remaining.match(/^`([^`]+?)`/);
      if (codeMatch) {
        elements.push(
          <code key={key++} className="bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded text-xs sm:text-sm font-mono border border-purple-200 break-all">
            {codeMatch[1]}
          </code>
        );
        remaining = remaining.substring(codeMatch[0].length);
        continue;
      }

      // Try to match bold **text**
      const boldMatch = remaining.match(/^\*\*([^*]+?)\*\*/);
      if (boldMatch) {
        elements.push(
          <strong key={key++} className="font-bold text-gray-900 break-words">
            {boldMatch[1]}
          </strong>
        );
        remaining = remaining.substring(boldMatch[0].length);
        continue;
      }

      // Try to match links [text](url)
      const linkMatch = remaining.match(/^\[([^\]]+)\]\(([^)]+)\)/);
      if (linkMatch) {
        elements.push(
          <a
            key={key++}
            href={linkMatch[2]}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-700 underline font-medium break-all"
          >
            {linkMatch[1]}
          </a>
        );
        remaining = remaining.substring(linkMatch[0].length);
        continue;
      }

      // Try to match italic *text* (single asterisk, not double)
      const italicMatch = remaining.match(/^\*([^*]+?)\*/);
      if (italicMatch && !remaining.startsWith('**')) {
        elements.push(
          <em key={key++} className="italic text-gray-700 break-words">
            {italicMatch[1]}
          </em>
        );
        remaining = remaining.substring(italicMatch[0].length);
        continue;
      }

      // No match found, take one character as plain text
      const nextSpecialChar = remaining.search(/[`*\[]/);
      const plainText = nextSpecialChar === -1 
        ? remaining 
        : remaining.substring(0, nextSpecialChar);
      
      if (plainText) {
        elements.push(plainText);
        remaining = remaining.substring(plainText.length);
      } else {
        // If we can't find special chars but have content, take one char
        elements.push(remaining[0]);
        remaining = remaining.substring(1);
      }
    }

    return elements.length > 0 ? elements : text;
  };

  const handleRetry = () => {
    if (onRetry && message.retryContent) {
      onRetry(message.retryContent, message.id);
    }
  };

  return (
    <div
      className={`
        flex gap-2 sm:gap-3 p-3 sm:p-6 mb-2 sm:mb-4 group hover:bg-opacity-80 transition-all rounded-xl shadow-sm hover:shadow-md
        max-w-full w-full overflow-hidden
        ${isUser ? 'bg-white border-l-4 border-blue-500' : 
          isError ? 'bg-red-50 border-l-4 border-red-500' : 
          'bg-linear-to-r from-purple-50 to-pink-50 border-l-4 border-purple-500'}
      `}
    >
      {/* Avatar */}
      <div
        className={`
          flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shadow-md
          ${isUser ? 'bg-gradient-to-br from-blue-500 to-blue-600' : 
            isError ? 'bg-gradient-to-br from-red-500 to-red-600' :
            'bg-gradient-to-br from-purple-500 to-pink-500'}
        `}
      >
        {isUser ? (
          <svg className="w-4 h-4 sm:w-6 sm:h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
              clipRule="evenodd"
            />
          </svg>
        ) : isError ? (
          <svg className="w-4 h-4 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ) : (
          <svg className="w-4 h-4 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        )}
      </div>

      {/* Message Content */}
      <div className="flex-1 min-w-0 overflow-hidden">
        <div className="flex items-center justify-between mb-1 sm:mb-2 flex-wrap gap-1">
          <span className={`font-bold text-sm ${isUser ? 'text-blue-700' : isError ? 'text-red-700' : 'text-purple-700'}`}>
            {isUser ? 'You' : isError ? 'AI Assistant (Error)' : 'AI Assistant'}
          </span>
          <div className="flex items-center gap-2">
            {message.timestamp && (
              <span className="text-xs text-gray-500">
                {formatTimestamp(message.timestamp)}
              </span>
            )}
            {!isUser && !isError && (
              <button
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(message.content);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  } catch (err) {
                    console.error('Failed to copy:', err);
                  }
                }}
                className="opacity-0 group-hover:opacity-100 transition-all p-1.5 hover:bg-white rounded-lg"
                title={copied ? "Copied!" : "Copy message"}
              >
                {copied ? (
                  <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4 text-gray-500 hover:text-purple-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                )}
              </button>
            )}
          </div>
        </div>
        {formatContent(message.content)}
        
        {/* Retry Button for Error Messages */}
        {isError && message.retryContent && (
          <button
            onClick={handleRetry}
            className="mt-3 flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-all shadow-md hover:shadow-lg"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Retry
          </button>
        )}

        {/* AI Suggestion Chips - Only show on last AI message */}
        {!isUser && !isError && isLastAIMessage && onSuggestionClick && (
          <div className="mt-4">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-xs font-semibold text-gray-600">Follow-up questions:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {generateSuggestions(message.content, userQuestion).map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => onSuggestionClick(suggestion)}
                  className="px-3 py-2 text-sm bg-gradient-to-r from-purple-50 to-blue-50 hover:from-purple-100 hover:to-blue-100 text-purple-700 rounded-lg border border-purple-200 transition-all hover:shadow-md hover:scale-105 active:scale-95 font-medium"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageItem;
