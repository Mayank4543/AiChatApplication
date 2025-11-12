const MessageItem = ({ message }) => {
  const isUser = message.role === 'user';

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
      return <div className="text-gray-800 whitespace-pre-wrap break-words">{content}</div>;
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
          elements.push(
            <div key={`code-${index}`} className="my-3">
              <div className="bg-gray-900 rounded-t-lg px-4 py-2 flex items-center justify-between">
                <span className="text-xs text-gray-400 font-mono">{codeBlock}</span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(codeLines.join('\n'));
                  }}
                  className="text-xs text-gray-400 hover:text-white transition-colors"
                >
                  Copy
                </button>
              </div>
              <pre className="bg-gray-950 text-gray-100 p-4 rounded-b-lg overflow-x-auto">
                <code className="text-sm font-mono">{codeLines.join('\n')}</code>
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
          <ul key={`list-${index}`} className="my-2 ml-4 space-y-1">
            {listItems.map((item, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-purple-600 mt-1">•</span>
                <span className="flex-1">{formatInlineStyles(item)}</span>
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
          <h3 key={index} className="text-lg font-bold text-gray-900 mt-4 mb-2">
            {line.substring(4)}
          </h3>
        );
        return;
      }

      if (line.startsWith('## ')) {
        elements.push(
          <h2 key={index} className="text-xl font-bold text-gray-900 mt-4 mb-2">
            {line.substring(3)}
          </h2>
        );
        return;
      }

      if (line.startsWith('# ')) {
        elements.push(
          <h1 key={index} className="text-2xl font-bold text-gray-900 mt-4 mb-2">
            {line.substring(2)}
          </h1>
        );
        return;
      }

      // Numbered list
      if (line.trim().match(/^\d+\.\s/)) {
        const item = line.trim().replace(/^\d+\.\s/, '');
        elements.push(
          <div key={index} className="flex items-start gap-2 my-1">
            <span className="text-purple-600 font-semibold">{line.match(/^\d+/)[0]}.</span>
            <span className="flex-1">{formatInlineStyles(item)}</span>
          </div>
        );
        return;
      }

      // Blockquote
      if (line.trim().startsWith('> ')) {
        elements.push(
          <blockquote key={index} className="border-l-4 border-purple-600 pl-4 py-2 my-2 italic text-gray-700 bg-purple-50 rounded-r">
            {formatInlineStyles(line.substring(2))}
          </blockquote>
        );
        return;
      }

      // Horizontal rule
      if (line.trim() === '---' || line.trim() === '***') {
        elements.push(<hr key={index} className="my-4 border-gray-300" />);
        return;
      }

      // Regular paragraph
      if (line.trim()) {
        elements.push(
          <p key={index} className="my-2 leading-relaxed">
            {formatInlineStyles(line)}
          </p>
        );
      } else {
        elements.push(<div key={index} className="h-2" />);
      }
    });

    // Flush remaining list items
    if (listItems.length > 0) {
      elements.push(
        <ul key="list-end" className="my-2 ml-4 space-y-1">
          {listItems.map((item, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="text-purple-600 mt-1">•</span>
              <span className="flex-1">{formatInlineStyles(item)}</span>
            </li>
          ))}
        </ul>
      );
    }

    return <div className="text-gray-800">{elements}</div>;
  };

  // Format inline styles (bold, italic, code, links)
  const formatInlineStyles = (text) => {
    const parts = [];
    let currentText = text;
    let key = 0;

    // Inline code (must be before bold/italic to avoid conflicts)
    currentText = currentText.replace(/`([^`]+)`/g, (match, code) => {
      const placeholder = `__CODE_${key}__`;
      parts.push({
        type: 'code',
        content: code,
        placeholder
      });
      key++;
      return placeholder;
    });

    // Bold (**text** or __text__)
    currentText = currentText.replace(/(\*\*|__)((?!\1).+?)\1/g, (match, marker, bold) => {
      const placeholder = `__BOLD_${key}__`;
      parts.push({
        type: 'bold',
        content: bold,
        placeholder
      });
      key++;
      return placeholder;
    });

    // Italic (*text* or _text_) - but not if it's part of ** or __
    currentText = currentText.replace(/(?<!\*)\*(?!\*)([^*]+?)\*(?!\*)/g, (match, italic) => {
      const placeholder = `__ITALIC_${key}__`;
      parts.push({
        type: 'italic',
        content: italic,
        placeholder
      });
      key++;
      return placeholder;
    });

    // Links [text](url)
    currentText = currentText.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, text, url) => {
      const placeholder = `__LINK_${key}__`;
      parts.push({
        type: 'link',
        content: text,
        url: url,
        placeholder
      });
      key++;
      return placeholder;
    });

    // Replace placeholders with React elements
    const segments = currentText.split(/(__(?:CODE|BOLD|ITALIC|LINK)_\d+__)/g);
    
    return segments.map((segment, index) => {
      const part = parts.find(p => p.placeholder === segment);
      
      if (part) {
        if (part.type === 'code') {
          return (
            <code key={index} className="bg-purple-100 text-purple-800 px-2 py-0.5 rounded text-sm font-mono border border-purple-200">
              {part.content}
            </code>
          );
        }
        if (part.type === 'bold') {
          return <strong key={index} className="font-bold text-gray-900">{part.content}</strong>;
        }
        if (part.type === 'italic') {
          return <em key={index} className="italic text-gray-700">{part.content}</em>;
        }
        if (part.type === 'link') {
          return (
            <a
              key={index}
              href={part.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-700 underline font-medium"
            >
              {part.content}
            </a>
          );
        }
      }
      
      return segment;
    });
  };

  return (
    <div
      className={`
        flex gap-3 p-6 mb-4 group hover:bg-opacity-80 transition-all
        ${isUser ? 'bg-white border-l-4 border-blue-500' : 'bg-gradient-to-r from-purple-50 to-pink-50 border-l-4 border-purple-500'}
        rounded-xl shadow-sm hover:shadow-md
      `}
    >
      {/* Avatar */}
      <div
        className={`
          flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center shadow-md
          ${isUser ? 'bg-gradient-to-br from-blue-500 to-blue-600' : 'bg-gradient-to-br from-purple-500 to-pink-500'}
        `}
      >
        {isUser ? (
          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
              clipRule="evenodd"
            />
          </svg>
        ) : (
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        )}
      </div>

      {/* Message Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-2">
          <span className={`font-bold text-sm ${isUser ? 'text-blue-700' : 'text-purple-700'}`}>
            {isUser ? 'You' : 'AI Assistant'}
          </span>
          <div className="flex items-center gap-2">
            {message.timestamp && (
              <span className="text-xs text-gray-500">
                {formatTimestamp(message.timestamp)}
              </span>
            )}
            {!isUser && (
              <button
                onClick={() => {
                  navigator.clipboard.writeText(message.content);
                }}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-white rounded-lg"
                title="Copy message"
              >
                <svg className="w-4 h-4 text-gray-500 hover:text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
            )}
          </div>
        </div>
        {formatContent(message.content)}
      </div>
    </div>
  );
};

export default MessageItem;
