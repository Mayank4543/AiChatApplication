# AI Chat Application

A responsive AI Chat Application built with React, Vite, and Tailwind CSS, designed to integrate with Google Gemini API (gemini-2.5-flash).

## 🚀 Features

- ✨ Modern and responsive UI design
- 📱 Mobile-first approach with hamburger menu
- 💬 Multiple chat sessions management
- 💾 **localStorage persistence - chats survive page reload**
- 🔄 **Auto-save on every change**
- 🎨 Beautiful gradient buttons and smooth animations
- 🌓 Clean and intuitive interface
- 📝 Auto-scrolling message list
- ⌨️ Keyboard shortcuts (Enter to send, Shift+Enter for new line)
- ⏰ **Timestamp display on messages**
- 🗑️ **Delete individual chats**
- 🔢 **Auto-naming for new chats (New Chat 1, 2, 3...)**

## 📁 Project Structure

```
src/
 ├── components/
 │    ├── Sidebar.jsx          # Chat sessions sidebar
 │    ├── ChatWindow.jsx        # Main chat interface
 │    ├── MessageList.jsx       # Message display area
 │    ├── MessageItem.jsx       # Individual message component
 │    └── MessageInput.jsx      # Message input with send button
 ├── context/
 │    └── ChatContext.jsx       # Global state management
 ├── utils/
 │    └── geminiApi.js          # Google Gemini API integration (placeholder)
 ├── App.jsx                    # Main app component
 └── main.jsx                   # App entry point
```

## 🛠️ Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:5173`

## 📱 Responsive Design

### Desktop View
- Sidebar and ChatWindow displayed side by side
- Sidebar is always visible (256px width)
- ChatWindow takes remaining space

### Mobile View
- Sidebar hidden by default
- Hamburger menu button in header
- Sidebar slides in from left with overlay
- Full-width chat interface

## 🎨 Styling

The application uses Tailwind CSS for styling with:
- Flexbox layouts for responsive design
- Rounded borders and shadows for modern look
- Gradient buttons for visual appeal
- Smooth transitions and hover effects
- Scrollable message areas

## 📊 Progress Tracker

### ✅ Phase 1 - Base UI & Layout (Complete)
- Responsive design with Tailwind CSS
- Sidebar with chat list
- Message display components
- Input handling

### ✅ Phase 2 - State Management & Persistence (Complete)
- localStorage integration
- Auto-save functionality
- Timestamp support
- Auto-naming for chats
- Delete chat functionality
- Message count display

### 🔮 Phase 3 - API Integration (Next)
- [ ] Integrate Google Gemini API
- [ ] Add environment variables for API key
- [ ] Implement real-time AI responses
- [ ] Add streaming responses
- [ ] Error handling and loading states
- [ ] Additional features (export chat, themes, etc.)

## 📝 Current State

This is **Phase 2 Complete** - Full state management with persistence. The app currently:
- ✅ Has fully responsive layout
- ✅ Multiple chat sessions with switching
- ✅ **localStorage persistence (survives page reload)**
- ✅ **Auto-save on every change**
- ✅ **Timestamps on all messages**
- ✅ **Auto-naming: "New Chat 1", "New Chat 2", etc.**
- ✅ **Delete individual chats**
- ✅ Has working UI interactions
- ❌ Does not make real API calls yet (Phase 3)
- ❌ Uses placeholder responses (Phase 3)

## 🔑 Technologies Used

- **React 19** - UI framework with hooks (useState, useEffect, useContext)
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Context API** - Global state management
- **localStorage** - Client-side data persistence

## 📄 License

MIT
