import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import ChatInterface from '../components/ChatInterface';
import SpecialistRecommendation from '../components/SpecialistRecommendation';
import ChatHistory from '../components/ChatHistory';
import HealthFeed from '../components/HealthFeed';
import { useChat } from '../hooks/useChat.js';
import { chatAPI, healthFeedAPI } from '../services/api.js';

const Dashboard = ({ user, onLogout }) => {
  const [activeView, setActiveView] = useState('chat');
  const [chatHistory, setChatHistory] = useState([]);
  const [healthFeed, setHealthFeed] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isLoadingFeed, setIsLoadingFeed] = useState(false);

  // Use real chat hook
  const {
    messages,
    isLoading: isLoadingChat,
    specialistRecommendation,
    sendMessage,
    startNewChat,
    loadChat,
    clearRecommendation
  } = useChat();

  // Load chat history and health feed on component mount
  useEffect(() => {
    loadChatHistory();
    loadHealthFeed();
  }, []);

  const loadChatHistory = async () => {
    try {
      setIsLoadingHistory(true);
      const response = await chatAPI.getConversations();
      setChatHistory(response.data.data.conversations || []);
    } catch (error) {
      console.error('Failed to load chat history:', error);
      setChatHistory([]);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const loadHealthFeed = async () => {
    try {
      setIsLoadingFeed(true);
      const response = await healthFeedAPI.getPersonalizedFeed();
      setHealthFeed(response.data.data.feed || []);
    } catch (error) {
      console.error('Failed to load health feed:', error);
      setHealthFeed([]);
    } finally {
      setIsLoadingFeed(false);
    }
  };

  const handleNewChat = () => {
    startNewChat();
    setActiveView('chat');
  };

  const handleShowHistory = () => {
    setActiveView(activeView === 'history' ? 'chat' : 'history');
  };

  const handleShowHealthFeed = () => {
    setActiveView(activeView === 'healthFeed' ? 'chat' : 'healthFeed');
  };

  const handleShowSpecialists = () => {
    setActiveView(activeView === 'specialists' ? 'chat' : 'specialists');
  };

  const handleSelectChat = async (chat) => {
    try {
      const response = await chatAPI.getConversation(chat.id);
      loadChat(response.data.data.conversation.messages);
      setActiveView('chat');
    } catch (error) {
      console.error('Failed to load conversation:', error);
    }
  };

  // Check if any panel is open (for split-screen layout)
  const isPanelOpen = activeView !== 'chat';

  return (
    <div className={`dashboard-container ${isPanelOpen ? 'panel-open' : ''}`}>
      {/* Header - Now moves with chat on desktop */}
      <div className={`dashboard-main ${isPanelOpen ? 'main-shifted' : ''}`}>
        <Header
          onNewChat={handleNewChat}
          onShowHistory={handleShowHistory}
          onShowHealthFeed={handleShowHealthFeed}
          onShowSpecialists={handleShowSpecialists}
          hasNewRecommendations={specialistRecommendation?.triggered}
        />

        {/* Main Content */}
        <div className="dashboard-content">
          {/* Chat Interface */}
          <div className="chat-main">
            <ChatInterface
              messages={messages}
              onSendMessage={sendMessage}
              isLoading={isLoadingChat}
            />
          </div>
        </div>
      </div>

      {/* Side Panels */}
      <SpecialistRecommendation
        specialists={specialistRecommendation?.specialists || []}
        isOpen={activeView === 'specialists'}
        onClose={() => setActiveView('chat')}
        onChatWithSpecialist={(specialist) => {
          console.log('Chat with:', specialist);
          setActiveView('chat');
        }}
      />

      <ChatHistory
        chats={chatHistory}
        isOpen={activeView === 'history'}
        onClose={() => setActiveView('chat')}
        onSelectChat={handleSelectChat}
        isLoading={isLoadingHistory}
      />

      <HealthFeed
        posts={healthFeed}
        isOpen={activeView === 'healthFeed'}
        onClose={() => setActiveView('chat')}
        isLoading={isLoadingFeed}
      />
    </div>
  );
};

export default Dashboard;