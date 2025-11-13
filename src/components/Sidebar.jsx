import { useState } from 'react';
import { useChat } from '../context/ChatContext';

const Sidebar = () => {
  const { chats, currentChatId, createNewChat, selectChat, renameChat, deleteChat, isSidebarOpen, toggleSidebar } = useChat();
  const [editingChatId, setEditingChatId] = useState(null);
  const [editingTitle, setEditingTitle] = useState('');

  const handleDelete = (e, chatId) => {
    e.stopPropagation(); // Prevent triggering selectChat
    if (chats.length === 1) {
      alert('Cannot delete the last chat. Create a new one first!');
      return;
    }
    if (window.confirm('Are you sure you want to delete this chat?')) {
      deleteChat(chatId);
    }
  };

  const handleStartRename = (e, chat) => {
    e.stopPropagation();
    setEditingChatId(chat.id);
    setEditingTitle(chat.title);
  };

  const handleRename = (e, chatId) => {
    e.preventDefault();
    e.stopPropagation();
    if (editingTitle.trim()) {
      renameChat(chatId, editingTitle.trim());
    }
    setEditingChatId(null);
    setEditingTitle('');
  };

  const handleCancelRename = (e) => {
    if (e) e.stopPropagation();
    setEditingChatId(null);
    setEditingTitle('');
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={toggleSidebar}
        ></div>
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          w-64 bg-gray-900 text-white
          transform transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          flex flex-col
        `}
      >
        {/* Logo & Brand */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center gap-3 mb-4">
           
            <div className="relative w-10 h-10 shrink-0">
              <div className="absolute inset-0 bg-linear-to-br from-blue-500 via-purple-500 to-pink-500 rounded-xl rotate-6 opacity-80"></div>
              <div className="absolute inset-0 bg-linear-to-tr from-purple-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
            {/* Brand Name */}
            <div className="flex-1">
              <h1 className="text-lg font-bold bg-linear-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                AI Chat Pro
              </h1>
              <p className="text-xs text-gray-400">Smart Conversations</p>
            </div>
          </div>
          
          {/* New Chat Button */}
          <button
            onClick={createNewChat}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg font-medium transition-all shadow-lg hover:shadow-xl"
          >
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
                d="M12 4v16m8-8H4"
              />
            </svg>
            New Chat
          </button>
        </div>

        {/* Chat Sessions List */}
        <div className="flex-1 overflow-y-auto p-2">
          <div className="space-y-1">
            {chats.map((chat) => (
              <div
                key={chat.id}
                className={`
                  relative rounded-lg
                  transition-all duration-200
                  ${
                    currentChatId === chat.id
                      ? 'bg-gray-800 text-white shadow-md'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }
                  group
                `}
              >
                {editingChatId === chat.id ? (
                  // Rename mode
                  <form
                    onSubmit={(e) => handleRename(e, chat.id)}
                    className="px-4 py-3 pr-10"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      type="text"
                      value={editingTitle}
                      onChange={(e) => setEditingTitle(e.target.value)}
                      onBlur={(e) => handleRename(e, chat.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Escape') handleCancelRename(e);
                      }}
                      className="w-full bg-gray-700 text-white px-2 py-1 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      autoFocus
                      maxLength={50}
                    />
                  </form>
                ) : (
                  // Normal mode
                  <button
                    onClick={() => selectChat(chat.id)}
                    className="w-full text-left px-4 py-3 pr-16"
                  >
                    <div className="flex items-start gap-2">
                      <svg
                        className="w-5 h-5 mt-0.5 shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                        />
                      </svg>
                      <div className="flex-1 min-w-0">
                        <span className="block truncate text-sm font-medium">
                          {chat.title}
                        </span>
                        <span className="text-xs text-gray-500">
                          {chat.messages.length} message{chat.messages.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                  </button>
                )}
                
                {/* Action Buttons */}
                {editingChatId !== chat.id && (
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {/* Rename Button */}
                    <button
                      onClick={(e) => handleStartRename(e, chat)}
                      className="p-1.5 rounded hover:bg-blue-600 transition-all"
                      title="Rename chat"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                    </button>
                    {/* Delete Button */}
                    <button
                      onClick={(e) => handleDelete(e, chat.id)}
                      className="p-1.5 rounded hover:bg-red-600 transition-all"
                      title="Delete chat"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-700">
          <div className="text-xs text-gray-400 text-center">
            <span className="font-semibold bg-linear-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">AI Chat Pro</span>
            <div className="mt-1 text-gray-500">
              {chats.length} chat{chats.length !== 1 ? 's' : ''} • Saved locally
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
