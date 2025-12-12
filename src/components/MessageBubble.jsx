import React from 'react';

const parseMarkdown = (text) => {
  if (!text) return text;

  let formattedText = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  formattedText = formattedText.replace(/^\s*\*\s+(.*)$/gm, '• $1');
  formattedText = formattedText.replace(/^\s*(\d+)\.\s+(.*)$/gm, '$1. $2');
  formattedText = formattedText.replace(/\n/g, '<br />');

  return formattedText;
};

const MessageBubble = ({ message, isUser, imageUrl }) => {
  const displayMessage = isUser ? message : parseMarkdown(message);

  return (
    <div className={`message-container ${isUser ? 'message-user-container' : 'message-bot-container'}`}>

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
        {message && (isUser ? (
          <div 
            className="message-text user-message-text"
            style={{ whiteSpace: 'pre-wrap' }}
          >
            {message}
          </div>
        ) : (
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
