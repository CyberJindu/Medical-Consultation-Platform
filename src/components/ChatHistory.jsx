import React, { useState } from 'react';
import { Calendar, Clock, History, Loader, Trash2 } from 'lucide-react';
import { chatAPI } from '../services/api.js';

const ChatHistory = ({ chats, isOpen, onClose, onSelectChat, onDeleteChat, isLoading = false }) => {
  const [deletingId, setDeletingId] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

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

  const handleDeleteClick = (e, chat) => {
    e.stopPropagation();
    setConfirmDelete(chat.id);
  };

  const handleConfirmDelete = async (e, chatId) => {
    e.stopPropagation();
    setDeletingId(chatId);
    
    try {
      await chatAPI.deleteConversation(chatId);
      onDeleteChat(chatId);
      setConfirmDelete(null);
    } catch (error) {
      console.error('Failed to delete chat:', error);
      alert('Failed to delete conversation. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleCancelDelete = (e) => {
    e.stopPropagation();
    setConfirmDelete(null);
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
              <div
                key={chat.id || index}
                className={`chat-item-wrapper ${confirmDelete === chat.id ? 'deleting' : ''}`}
              >
                <button
                  onClick={() => onSelectChat(chat)}
                  className="chat-item"
                  disabled={confirmDelete === chat.id}
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
                
                {/* Delete button */}
                <button
                  className="chat-delete-button"
                  onClick={(e) => handleDeleteClick(e, chat)}
                  title="Delete conversation"
                  disabled={deletingId === chat.id}
                >
                  <Trash2 size={16} />
                </button>

                {/* Confirmation overlay - FIXED */}
                {confirmDelete === chat.id && (
                  <div 
                    className="delete-confirm-overlay"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCancelDelete(e);
                    }}
                  >
                    <div 
                      className="delete-confirm-popup"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <p>Delete this conversation?</p>
                      <div className="delete-confirm-buttons">
                        <button
                          className="delete-confirm-yes"
                          onClick={(e) => handleConfirmDelete(e, chat.id)}
                          disabled={deletingId === chat.id}
                        >
                          {deletingId === chat.id ? 'Deleting...' : 'Yes'}
                        </button>
                        <button
                          className="delete-confirm-no"
                          onClick={handleCancelDelete}
                        >
                          No
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatHistory;
