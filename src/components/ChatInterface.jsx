import React, { useState, useRef, useEffect } from 'react';
import MessageBubble from './MessageBubble';
import { Send, Camera, X, Upload } from 'lucide-react';

const ChatInterface = ({ messages, onSendMessage, onSendImageMessage, isLoading }) => {
  const [inputMessage, setInputMessage] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [showCameraMenu, setShowCameraMenu] = useState(false);
  const [isSendingImage, setIsSendingImage] = useState(false);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const fileInputRef = useRef(null);
  const cameraMenuRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'nearest'
    });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const newHeight = Math.min(textareaRef.current.scrollHeight, 120);
      textareaRef.current.style.height = newHeight + 'px';
    }
  }, [inputMessage]);

  // Close camera menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (cameraMenuRef.current && !cameraMenuRef.current.contains(event.target)) {
        setShowCameraMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleTakePhoto = async () => {
    try {
      // Check if on mobile - use camera
      if (navigator.userAgent.match(/Android|iPhone|iPad|iPod/i)) {
        // On mobile, we'll use the file input with camera capture
        setShowCameraMenu(false);
        // Trigger camera with capture attribute
        const cameraInput = document.createElement('input');
        cameraInput.type = 'file';
        cameraInput.accept = 'image/*';
        cameraInput.capture = 'environment';
        cameraInput.onchange = handleFileSelect;
        cameraInput.click();
      } else {
        // On desktop, try to access camera
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: true 
        });
        console.log('Camera accessed:', stream);
        setShowCameraMenu(false);
        
        // For demo purposes, trigger file input
        fileInputRef.current?.click();
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      }
    } catch (error) {
      console.error('Camera error:', error);
      setShowCameraMenu(false);
      fileInputRef.current?.click();
    }
  };

  const handleUploadImage = () => {
    // Clear any capture attribute for upload
    if (fileInputRef.current) {
      fileInputRef.current.removeAttribute('capture');
    }
    fileInputRef.current?.click();
    setShowCameraMenu(false);
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file (JPEG, PNG, etc.)');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }

      setSelectedImage(file);
      
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
      setImagePreview(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  
  if ((!inputMessage.trim() && !selectedImage) || isLoading) {
    return;
  }

  // Save message before clearing
  const messageToSend = inputMessage;
  const imageToSend = selectedImage;
  
  // CLEAR TEXT IMMEDIATELY
  setInputMessage('');
  removeImage();
  
  // Reset textarea height
  if (textareaRef.current) {
    textareaRef.current.style.height = 'auto';
  }

  setIsSendingImage(true);
  
  try {
    if (imageToSend) {
      // Send image + text
      await onSendImageMessage(messageToSend, imageToSend);
    } else {
      // Send text only
      await onSendMessage(messageToSend);
    }
  } finally {
    setIsSendingImage(false);
  }
};

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="chat-container">
      {/* Messages Container */}
      <div 
        ref={messagesContainerRef}
        className="messages-container"
      >
        {messages.length === 0 ? (
          <div className="empty-chat">
            <div className="empty-chat-content">
              <h3>Welcome to MediGuide</h3>
              <p>Start a conversation about your health concerns</p>
            </div>
          </div>
        ) : (
          <div className="messages-list">
            {messages.map((message, index) => (
              <MessageBubble
                key={index}
                message={message.text}
                isUser={message.isUser}
                imageUrl={message.imageUrl}
              />
            ))}
            {isLoading && (
              <div className="loading-message">
                <div className="typing-indicator">
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Image Preview Area */}
      {imagePreview && !isSendingImage && (
        <div className="image-preview-container">
          <div className="image-preview">
            <img src={imagePreview} alt="Preview" className="preview-image" />
            <button 
              onClick={removeImage}
              className="remove-image-button"
              aria-label="Remove image"
            >
              <X size={16} />
            </button>
          </div>
          <p className="image-caption-hint">
            Add a description of what you're showing (optional)
          </p>
        </div>
      )}

      {/* Camera Menu Popup */}
      {showCameraMenu && (
        <div className="camera-menu-overlay">
          <div ref={cameraMenuRef} className="camera-menu">
            <button 
              onClick={handleTakePhoto}
              className="camera-menu-option"
            >
              <Camera size={20} />
              <span>Take Photo</span>
            </button>
            <button 
              onClick={handleUploadImage}
              className="camera-menu-option"
            >
              <Upload size={20} />
              <span>Upload Image</span>
            </button>
            <button 
              onClick={() => setShowCameraMenu(false)}
              className="camera-menu-cancel"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Hidden file input - FIXED: No capture attribute by default */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />

      {/* Input Area */}
      <div className="input-area">
        <form onSubmit={handleSubmit} className="input-form">
          <div className="input-wrapper">
            <textarea
              ref={textareaRef}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={selectedImage ? "Describe the image (optional)..." : "Describe your health concerns..."}
              className="message-textarea"
              disabled={isLoading}
              rows={1}
              style={{
                resize: 'none',
                minHeight: '44px',
                maxHeight: '120px',
                paddingRight: '44px'
              }}
            />
            <button
              type="button"
              onClick={() => setShowCameraMenu(!showCameraMenu)}
              className="camera-icon-button"
              disabled={isLoading}
              aria-label="Add image"
            >
              <Camera size={20} />
            </button>
          </div>
          <button
            type="submit"
            disabled={(!inputMessage.trim() && !selectedImage) || isLoading}
            className="send-button"
            style={{
              height: '44px',
              width: '44px',
              flexShrink: 0
            }}
          >
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;


