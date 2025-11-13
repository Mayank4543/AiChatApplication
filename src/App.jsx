import { ChatProvider } from './context/ChatContext';
import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';

function App() {
  return (
    <ChatProvider>
      <div className="flex h-screen overflow-hidden bg-gray-100">
     
        <Sidebar />
        

        <ChatWindow />
      </div>
    </ChatProvider>
  );
}

export default App;
