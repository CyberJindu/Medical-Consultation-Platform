import React from 'react';
import { Calendar, Clock, History, Loader } from 'lucide-react';

const ChatHistory = ({ chats, isOpen, onClose, onSelectChat, isLoading = false }) => {
  if (!isOpen) return null;

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={`history-panel ${isOpen ? 'open' : ''}`}>
        {/* Header */}
        <div className="panel-header">
          <div className="panel-header-content">
            <h2>Chat History</h2>
            <button 
              onClick={onClose}
              className="close-button"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Chats List */}
        <div className="panel-content">
          {isLoading ? (
            <div className="loading-state">
              <Loader size={48} className="loading-icon" />
              <p>Loading your chat history...</p>
            </div>
          ) : chats.length === 0 ? (
            <div className="empty-state">
              <History size={48} className="empty-icon" />
              <p>No chat history yet.</p>
              <p className="empty-subtext">Start a conversation with MediBot to see your history here.</p>
            </div>
          ) : (
            <div className="chats-list">
              {chats.map((chat, index) => (
                <button
                  key={chat.id || index}
                  onClick={() => onSelectChat(chat)}
                  className="chat-item"
                >
                  <div className="chat-meta">
                    <div className="chat-date">
                      <Calendar size={14} />
                      {formatDate(chat.lastUpdated || chat.date)}
                    </div>
                    <div className="chat-time">
                      <Clock size={14} />
                      {formatTime(chat.lastUpdated || chat.date)}
                    </div>
                  </div>
                  <p className="chat-preview">
                    {chat.preview || chat.title || 'No preview available'}
                  </p>
                  {chat.messageCount && (
                    <div className="chat-stats">
                      <span className="message-count">{chat.messageCount} messages</span>
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
     
    
  );
};

export default ChatHistory;