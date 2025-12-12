import React from 'react';

// Simple markdown parser for MediBot responses
const parseMarkdown = (text) => {
  if (!text) return text;
  
  // Convert **bold** to <strong>
  let formattedText = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  
  // Convert * list items to bullet points
  formattedText = formattedText.replace(/^\s*\*\s+(.*)$/gm, '• $1');
  
  // Convert numbered lists
  formattedText = formattedText.replace(/^\s*(\d+)\.\s+(.*)$/gm, '$1. $2');
  
  // Convert line breaks to proper HTML
  formattedText = formattedText.replace(/\n/g, '<br />');
  
  return formattedText;
};

const MessageBubble = ({ message, isUser, imageUrl }) => {
  // For bot messages, parse markdown; for user messages, keep as plain text
  const displayMessage = isUser ? message : parseMarkdown(message);

  return (
    <div className={`message-container ${isUser ? 'message-user-container' : 'message-bot-container'}`}>
      {/* Display image ABOVE bubble like ChatGPT */}
      {imageUrl && (
        <div className={`message-image-above-wrapper ${isUser ? 'message-image-user' : 'message-image-bot'}`}>
          <img 
            src={imageUrl} 
            alt="Uploaded content" 
            className="message-image-above"
            loading="lazy"
          />
        </div>
      )}
      
      <div className={`message-bubble ${isUser ? 'message-user' : 'message-bot'}`}>
        {/* Display text message */}
        {message && (isUser ? (
          // User message - preserve new lines with whiteSpace: pre-wrap
          <div 
            className="message-text user-message-text"
            style={{ whiteSpace: 'pre-wrap' }}
          >
            {message}
          </div>
        ) : (
          // Bot message - with HTML formatting
          <div 
            className="message-text"
            dangerouslySetInnerHTML={{ __html: displayMessage }}
          />
        ))}
        
        <div className={`message-time ${isUser ? 'message-time-user' : 'message-time-bot'}`}>
          {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
