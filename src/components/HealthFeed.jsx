import React, { useState, useEffect } from 'react';
import { Bookmark, Share2, Calendar, Rss, Sparkles, TrendingUp } from 'lucide-react';
import { healthFeedAPI } from '../services/api.js';

const HealthFeed = ({ posts: initialPosts = [], isOpen, onClose, userId }) => {
  const [posts, setPosts] = useState(initialPosts);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    if (isOpen && userId) {
      fetchPersonalizedFeed();
    }
  }, [isOpen, userId]);

  const fetchPersonalizedFeed = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await healthFeedAPI.getPersonalizedFeed();
      const feedData = response.data.data?.feed || [];
      setPosts(feedData);
    } catch (error) {
      console.error('Failed to fetch health feed:', error);
      setError('Failed to load personalized content');
      // Fallback to mock data if needed
      if (posts.length === 0) {
        setPosts([{
          title: 'Understanding Common Health Concerns',
          content: 'Start a conversation with MediBot to get personalized health articles based on your specific concerns.',
          excerpt: 'Your personalized health feed will appear here.',
          topics: ['health', 'wellness'],
          publishDate: new Date(),
          relevanceScore: 10
        }]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveArticle = async (articleId) => {
    try {
      await healthFeedAPI.saveArticle(articleId);
      // Update local state to reflect save count
      setPosts(posts.map(post => 
        post._id === articleId 
          ? { ...post, saveCount: (post.saveCount || 0) + 1, saved: true }
          : post
      ));
    } catch (error) {
      console.error('Failed to save article:', error);
    }
  };

  const handleShareArticle = async (articleId) => {
    try {
      await healthFeedAPI.shareArticle(articleId);
      // Update local state to reflect share count
      setPosts(posts.map(post => 
        post._id === articleId 
          ? { ...post, shareCount: (post.shareCount || 0) + 1 }
          : post
      ));
    } catch (error) {
      console.error('Failed to share article:', error);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (!isOpen) return null;

  return (
    <div className={`healthfeed-panel ${isOpen ? 'open' : ''}`}>
      {/* Header */}
      <div className="panel-header">
        <div className="panel-header-content">
          <h2>Health Feed</h2>
          <button onClick={onClose} className="close-button">✕</button>
        </div>
        <p className="panel-subtitle">
          Personalized based on your conversations
        </p>
      </div>

      {/* Posts List */}
      <div className="panel-content">
        {isLoading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Analyzing your conversations for personalized content...</p>
          </div>
        ) : error ? (
          <div className="error-state">
            <p className="error-message">{error}</p>
            <button onClick={fetchPersonalizedFeed} className="retry-button">
              Try Again
            </button>
          </div>
        ) : posts.length === 0 ? (
          <div className="empty-state">
            <Sparkles size={64} className="empty-icon" />
            <h3>Start Chatting for Personalized Content</h3>
            <p className="empty-subtext">
              Chat with MediBot about your health concerns to receive personalized articles and tips.
            </p>
          </div>
        ) : (
          <div className="posts-list">
            {posts.map((post, index) => (
              <article key={post._id || index} className="post-card">
                <div className="post-header">
                  <div className="post-date">
                    <Calendar size={14} />
                    {formatDate(post.publishDate || new Date())}
                  </div>
                  
                  {post.relevanceScore && post.relevanceScore > 50 && (
                    <div className="relevance-badge">
                      <TrendingUp size={14} />
                      <span>{post.relevanceScore}% match</span>
                    </div>
                  )}
                </div>
                
                <h3 className="post-title">{post.title}</h3>
                <p className="post-excerpt">{post.excerpt || post.content.substring(0, 150)}...</p>
                
                {post.topics && post.topics.length > 0 && (
                  <div className="post-topics">
                    {post.topics.slice(0, 3).map((topic, topicIndex) => (
                      <span key={topicIndex} className="topic-tag">
                        {topic}
                      </span>
                    ))}
                    {post.topics.length > 3 && (
                      <span className="topic-tag more-topics">
                        +{post.topics.length - 3} more
                      </span>
                    )}
                  </div>
                )}
                
                <div className="post-footer">
                  <div className="post-stats">
                    {post.readTime && (
                      <span className="read-time">{post.readTime}</span>
                    )}
                    {post.author && (
                      <span className="post-author">By {post.author}</span>
                    )}
                  </div>
                  
                  <div className="post-actions">
                    <button 
                      className="post-action"
                      onClick={() => post._id && handleSaveArticle(post._id)}
                      title="Save for later"
                    >
                      <Bookmark size={16} />
                      <span>Save ({post.saveCount || 0})</span>
                    </button>
                    <button 
                      className="post-action"
                      onClick={() => post._id && handleShareArticle(post._id)}
                      title="Share article"
                    >
                      <Share2 size={16} />
                      <span>Share ({post.shareCount || 0})</span>
                    </button>
                  </div>
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
