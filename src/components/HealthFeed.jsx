import React from 'react';
import { Bookmark, Share2, Calendar, Rss, Sparkles } from 'lucide-react';

const HealthFeed = ({ posts, isOpen, onClose, isLoading = false }) => {
  if (!isOpen) return null;

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Show coming soon message if no content yet
  const showComingSoon = posts.length === 0;

  return (
    <div className={`healthfeed-panel ${isOpen ? 'open' : ''}`}>
        {/* Header */}
        <div className="panel-header">
          <div className="panel-header-content">
            <h2>Health Feed</h2>
            <button 
              onClick={onClose}
              className="close-button"
            >
              ✕
            </button>
          </div>
          <p className="panel-subtitle">
            {showComingSoon ? 'AI-Powered Content Coming Soon' : 'Personalized for you'}
          </p>
        </div>

        {/* Posts List */}
        <div className="panel-content">
          {isLoading ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Loading your personalized health content...</p>
            </div>
          ) : showComingSoon ? (
            <div className="coming-soon-state">
              <Sparkles size={64} className="coming-soon-icon" />
              <h3>📰 AI-Powered Health Content</h3>
              <p className="coming-soon-message">
                Our health experts and AI are working together to create personalized health articles just for you.
              </p>
              
              <div className="feature-list">
                <h4>Content You'll Receive:</h4>
                <ul>
                  <li>🎯 Articles based on your health conversations</li>
                  <li>💡 Preventive care and wellness tips</li>
                  <li>🏥 Condition-specific guidance</li>
                  <li>🧠 Mental health and wellness content</li>
                  <li>📊 Personalized health insights</li>
                </ul>
              </div>

              <div className="ai-preview">
                <h4>How It Works:</h4>
                <p>
                  MediBot analyzes your conversations to understand your health interests and concerns, 
                  then our AI generates relevant articles written and reviewed by medical professionals.
                </p>
              </div>

              <div className="cta-section">
                <p className="update-notice">
                  <strong>Start chatting with MediBot to help us understand your health interests!</strong>
                </p>
                <p className="launch-timeline">
                  First articles coming in the next update! 🌟
                </p>
              </div>
            </div>
          ) : (
            <div className="posts-list">
              {posts.map((post, index) => (
                <article key={index} className="post-card">
                  <div className="post-date">
                    <Calendar size={14} />
                    {formatDate(post.publishDate)}
                  </div>
                  
                  <h3 className="post-title">{post.title}</h3>
                  <p className="post-content">
                    {post.content}
                  </p>
                  
                  {post.topics && (
                    <div className="post-topics">
                      {post.topics.map((topic, topicIndex) => (
                        <span 
                          key={topicIndex}
                          className="topic-tag"
                        >
                          {topic}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  <div className="post-actions">
                    <button className="post-action">
                      <Bookmark size={16} />
                      <span>Save</span>
                    </button>
                    <button className="post-action">
                      <Share2 size={16} />
                      <span>Share</span>
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    
    
  );
};

export default HealthFeed;