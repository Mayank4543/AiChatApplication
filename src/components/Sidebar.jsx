import { useChat } from '../context/ChatContext';

const Sidebar = () => {
  const { chats, currentChatId, createNewChat, selectChat, deleteChat, isSidebarOpen, toggleSidebar } = useChat();

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
        {/* Header with New Chat Button */}
        <div className="p-4 border-b border-gray-700">
          <button
            onClick={createNewChat}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg font-medium transition-all shadow-lg hover:shadow-xl"
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
                <button
                  onClick={() => selectChat(chat.id)}
                  className="w-full text-left px-4 py-3 pr-10"
                >
                  <div className="flex items-start gap-2">
                    <svg
                      className="w-5 h-5 mt-0.5 flex-shrink-0"
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
                
                {/* Delete Button */}
                <button
                  onClick={(e) => handleDelete(e, chat.id)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded opacity-0 group-hover:opacity-100 hover:bg-red-600 transition-all"
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
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-700">
          <div className="text-xs text-gray-400 text-center">
            AI Chat Application
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
