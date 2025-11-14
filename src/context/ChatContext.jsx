import { createContext, useState, useContext, useEffect } from 'react';

const ChatContext = createContext();

// LocalStorage keys
const STORAGE_KEYS = {
  CHATS: 'ai_chat_sessions',
  ACTIVE_CHAT_ID: 'ai_active_chat_id',
  CHAT_COUNTER: 'ai_chat_counter',
};

// Default dummy data for first-time users
const getDefaultChats = () => [
  {
    id: 1,
    title: 'React Best Practices',
    createdAt: new Date().toISOString(),
    messages: [
      { 
        id: 1, 
        role: 'user', 
        content: 'What are some React best practices?',
        timestamp: new Date(Date.now() - 3600000).toISOString()
      },
      { 
        id: 2, 
        role: 'assistant', 
        content: 'Here are some key React best practices:\n\n1. Use functional components and hooks\n2. Keep components small and focused\n3. Use PropTypes or TypeScript for type checking\n4. Implement proper error boundaries\n5. Optimize performance with React.memo and useMemo',
        timestamp: new Date(Date.now() - 3599000).toISOString()
      },
      { 
        id: 3, 
        role: 'user', 
        content: 'Tell me more about hooks',
        timestamp: new Date(Date.now() - 3000000).toISOString()
      },
      { 
        id: 4, 
        role: 'assistant', 
        content: 'React Hooks are functions that let you use state and other React features in functional components. Common hooks include:\n\n- useState: For managing component state\n- useEffect: For side effects\n- useContext: For consuming context\n- useCallback: For memoizing functions\n- useMemo: For memoizing values',
        timestamp: new Date(Date.now() - 2999000).toISOString()
      },
    ],
  },
  {
    id: 2,
    title: 'Tailwind CSS Tips',
    createdAt: new Date().toISOString(),
    messages: [
      { 
        id: 1, 
        role: 'user', 
        content: 'How do I use Tailwind CSS effectively?',
        timestamp: new Date(Date.now() - 2000000).toISOString()
      },
      { 
        id: 2, 
        role: 'assistant', 
        content: 'Tailwind CSS is a utility-first CSS framework. Here are some tips:\n\n1. Use the official documentation\n2. Leverage responsive modifiers (sm:, md:, lg:)\n3. Create custom components for repeated patterns\n4. Use @apply for extracting utility patterns\n5. Configure your tailwind.config.js for custom colors and spacing',
        timestamp: new Date(Date.now() - 1999000).toISOString()
      },
    ],
  },
  {
    id: 3,
    title: 'JavaScript Array Methods',
    createdAt: new Date().toISOString(),
    messages: [
      { 
        id: 1, 
        role: 'user', 
        content: 'What are the most useful JavaScript array methods?',
        timestamp: new Date(Date.now() - 1000000).toISOString()
      },
      { 
        id: 2, 
        role: 'assistant', 
        content: 'The most useful JavaScript array methods include:\n\n- map(): Transform array elements\n- filter(): Filter elements based on condition\n- reduce(): Reduce array to single value\n- find(): Find first matching element\n- forEach(): Iterate over elements\n- some(): Check if any element matches\n- every(): Check if all elements match',
        timestamp: new Date(Date.now() - 999000).toISOString()
      },
    ],
  },
];

// Load chats from localStorage or return default
const loadChatsFromStorage = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.CHATS);
    if (stored) {
      const parsed = JSON.parse(stored);
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : getDefaultChats();
    }
  } catch (error) {
    console.error('Error loading chats from localStorage:', error);
  }
  return getDefaultChats();
};

// Load active chat ID from localStorage
const loadActiveChatId = (chats) => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.ACTIVE_CHAT_ID);
    if (stored) {
      const chatId = parseInt(stored, 10);
      // Verify the chat exists
      if (chats.find(chat => chat.id === chatId)) {
        return chatId;
      }
    }
  } catch (error) {
    console.error('Error loading active chat ID:', error);
  }
  return chats.length > 0 ? chats[0].id : null;
};

// Load or initialize chat counter
const loadChatCounter = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.CHAT_COUNTER);
    return stored ? parseInt(stored, 10) : 1;
  } catch (error) {
    console.error('Error loading chat counter:', error);
    return 1;
  }
};

export const ChatProvider = ({ children }) => {
  // Initialize state from localStorage
  const [chats, setChats] = useState(() => loadChatsFromStorage());
  const [currentChatId, setCurrentChatId] = useState(() => loadActiveChatId(loadChatsFromStorage()));
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [chatCounter, setChatCounter] = useState(() => loadChatCounter());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const currentChat = chats.find(chat => chat.id === currentChatId);

  // Save chats to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CHATS, JSON.stringify(chats));
    } catch (error) {
      console.error('Error saving chats to localStorage:', error);
    }
  }, [chats]);

  // Save active chat ID to localStorage whenever it changes
  useEffect(() => {
    if (currentChatId !== null) {
      try {
        localStorage.setItem(STORAGE_KEYS.ACTIVE_CHAT_ID, currentChatId.toString());
      } catch (error) {
        console.error('Error saving active chat ID:', error);
      }
    }
  }, [currentChatId]);

  // Save chat counter to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CHAT_COUNTER, chatCounter.toString());
    } catch (error) {
      console.error('Error saving chat counter:', error);
    }
  }, [chatCounter]);

  const createNewChat = () => {
    const newChat = {
      id: Date.now(),
      title: `New Chat ${chatCounter}`,
      createdAt: new Date().toISOString(),
      messages: [],
    };
    setChats([newChat, ...chats]);
    setCurrentChatId(newChat.id);
    setIsSidebarOpen(false);
    setChatCounter(chatCounter + 1);
  };

  const selectChat = (chatId) => {
    setCurrentChatId(chatId);
    setIsSidebarOpen(false);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const generateSmartTitle = (message) => {
    // Clean the message
    const cleaned = message.trim();
    
    // If message is short enough, use as is
    if (cleaned.length <= 40) {
      return cleaned;
    }
    
    // Try to extract meaningful title
    // 1. Check if it's a question
    const questionMatch = cleaned.match(/^(what|how|why|when|where|who|can|could|should|is|are|do|does|explain|tell|show|write|create|make|help)/i);
    if (questionMatch) {
      // Take first sentence or first 40 chars
      const firstSentence = cleaned.split(/[.!?]/)[0];
      if (firstSentence.length <= 40) {
        return firstSentence;
      }
      // Take first 40 chars and find last complete word
      const truncated = cleaned.substring(0, 40);
      const lastSpace = truncated.lastIndexOf(' ');
      return lastSpace > 20 ? truncated.substring(0, lastSpace) : truncated;
    }
    
    // 2. For other messages, take first complete sentence or phrase
    const firstSentence = cleaned.split(/[.!?]/)[0];
    if (firstSentence.length <= 40) {
      return firstSentence;
    }
    
    // 3. Take first 40 chars and find last complete word (no ...)
    const truncated = cleaned.substring(0, 40);
    const lastSpace = truncated.lastIndexOf(' ');
    return lastSpace > 20 ? truncated.substring(0, lastSpace) : truncated.substring(0, 37);
  };

  const addMessage = (content, role = 'user') => {
    const newMessage = {
      id: Date.now(),
      role,
      content,
      timestamp: new Date().toISOString(),
    };

    setChats(prevChats => prevChats.map(chat => {
      if (chat.id === currentChatId) {
        const updatedMessages = [...chat.messages, newMessage];
        return {
          ...chat,
          messages: updatedMessages,
          // Auto-generate smart title from first user message
          title: chat.messages.length === 0 && role === 'user' 
            ? generateSmartTitle(content)
            : chat.title,
        };
      }
      return chat;
    }));
  };

  const renameChat = (chatId, newTitle) => {
    setChats(prevChats => prevChats.map(chat => 
      chat.id === chatId ? { ...chat, title: newTitle } : chat
    ));
  };

  const deleteChat = (chatId) => {
    const updatedChats = chats.filter(chat => chat.id !== chatId);
    setChats(updatedChats);
    
    // If deleting the current chat, switch to another one
    if (chatId === currentChatId) {
      setCurrentChatId(updatedChats.length > 0 ? updatedChats[0].id : null);
    }
  };

  const deleteMessage = (messageId) => {
    setChats(prevChats => prevChats.map(chat => {
      if (chat.id === currentChatId) {
        return {
          ...chat,
          messages: chat.messages.filter(msg => msg.id !== messageId),
        };
      }
      return chat;
    }));
  };

  const updateMessage = (messageId, updates) => {
    setChats(prevChats => prevChats.map(chat => {
      if (chat.id === currentChatId) {
        return {
          ...chat,
          messages: chat.messages.map(msg => 
            msg.id === messageId ? { ...msg, ...updates } : msg
          ),
        };
      }
      return chat;
    }));
  };

  const clearAllChats = () => {
    const newChat = {
      id: Date.now(),
      title: 'New Chat 1',
      createdAt: new Date().toISOString(),
      messages: [],
    };
    setChats([newChat]);
    setCurrentChatId(newChat.id);
    setChatCounter(2);
  };

  return (
    <ChatContext.Provider
      value={{
        chats,
        currentChat,
        currentChatId,
        isSidebarOpen,
        isLoading,
        error,
        createNewChat,
        selectChat,
        toggleSidebar,
        addMessage,
        renameChat,
        deleteChat,
        deleteMessage,
        updateMessage,
        clearAllChats,
        setIsLoading,
        setError,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
