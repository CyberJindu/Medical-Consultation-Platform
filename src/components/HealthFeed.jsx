import React, { useState, useEffect } from 'react';
import { Bookmark, Share2, Calendar, Rss, Sparkles, TrendingUp } from 'lucide-react';
import { healthFeedAPI } from '../services/api.js';

const HealthFeed = ({ posts: initialPosts = [], isOpen, onClose, userId }) => {
  const [posts, setPosts] = useState(initialPosts);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    // If we receive posts as props, use them directly (from Dashboard pre-load)
    if (initialPosts && initialPosts.length > 0) {
      console.log('✅ Using pre-loaded posts from Dashboard:', initialPosts.length);
      setPosts(initialPosts);
    }
    // Only fetch if we have no posts but we have userId
    else if (userId && (!initialPosts || initialPosts.length === 0)) {
      console.log('🔄 Fetching personalized feed for userId:', userId);
      fetchPersonalizedFeed();
    }
  }, [initialPosts, userId]);

  const fetchPersonalizedFeed = async () => {
    setIsLoading(true);
    setError(null);
    try {
      console.log('📡 Fetching personalized health feed...');
      const response = await healthFeedAPI.getPersonalizedFeed();
      console.log('📊 Feed API response:', response.data);
      
      // Check response structure correctly
      if (response.data && response.data.success) {
        const feedData = response.data.data?.feed || [];
        console.log('✅ Personalized feed loaded:', feedData.length, 'posts');
        
        if (feedData.length > 0) {
          console.log('📝 First post:', {
            title: feedData[0]?.title,
            relevanceScore: feedData[0]?.relevanceScore,
            topics: feedData[0]?.topics
          });
        }
        
        setPosts(feedData);
      } else {
        console.error('❌ Invalid response structure:', response.data);
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('❌ Failed to fetch health feed:', error);
      setError('Failed to load personalized content. Please try again.');
      
      // If we have initial posts, use them as fallback
      if (initialPosts && initialPosts.length > 0) {
        console.log('🔄 Using initial posts as fallback');
        setPosts(initialPosts);
      } else {
        // Only use mock data if no posts at all
        console.log('📝 Showing placeholder content');
        setPosts([{
          _id: 'mock-1',
          title: 'Understanding Common Health Concerns',
          content: 'Start a conversation with MediBot to get personalized health articles based on your specific concerns.',
          excerpt: 'Your personalized health feed will appear here.',
          topics: ['health', 'wellness'],
          publishDate: new Date(),
          relevanceScore: 10,
          author: 'MediGuide',
          readTime: '2 min read',
          shareCount: 0,
          saveCount: 0
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
          {posts.length > 0 && posts[0]?.relevanceScore && (
            <span style={{ marginLeft: '8px', color: 'var(--primary-color)', fontWeight: '500' }}>
              • {posts[0]?.relevanceScore}% match to your interests
            </span>
          )}
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
            <button 
              onClick={() => window.location.href = '/'} 
              className="login-button"
              style={{ marginTop: '16px' }}
            >
              Start a Conversation
            </button>
          </div>
        ) : (
          <div className="posts-list">
            {posts.map((post, index) => (
              <article key={post._id || `post-${index}`} className="post-card">
                <div className="post-header">
                  <div className="post-date">
                    <Calendar size={14} />
                    {formatDate(post.publishDate || new Date())}
                  </div>
                  
                  {post.relevanceScore && post.relevanceScore > 20 && (
                    <div className="relevance-badge" style={{
                      background: post.relevanceScore > 70 ? '#D1FAE5' : 
                                 post.relevanceScore > 40 ? '#FEF3C7' : '#DBEAFE',
                      color: post.relevanceScore > 70 ? '#065F46' : 
                            post.relevanceScore > 40 ? '#92400E' : '#1E40AF',
                      padding: '4px 10px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '500',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <TrendingUp size={12} />
                      <span>{post.relevanceScore}% match</span>
                    </div>
                  )}
                </div>
                
                <h3 className="post-title">{post.title}</h3>
                <p className="post-excerpt">{post.excerpt || post.content?.substring(0, 150) || 'Read more...'}...</p>
                
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
                
                {post.matchingTopics && post.matchingTopics.length > 0 && (
                  <div style={{
                    fontSize: '12px',
                    color: '#6B7280',
                    marginTop: '8px',
                    padding: '4px 8px',
                    background: '#F3F4F6',
                    borderRadius: '6px'
                  }}>
                    <strong>Matches your interests:</strong> {post.matchingTopics.map(mt => mt.userTopic).join(', ')}
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
        
        {/* Debug info - remove in production */}
        {process.env.NODE_ENV === 'development' && posts.length > 0 && (
          <div style={{
            marginTop: '20px',
            padding: '12px',
            background: '#F8F9FA',
            border: '1px dashed #D1D5DB',
            borderRadius: '8px',
            fontSize: '12px',
            color: '#6B7280'
          }}>
            <strong>Debug Info:</strong> Showing {posts.length} posts • 
            User ID: {userId || 'not provided'} • 
            First post relevance: {posts[0]?.relevanceScore || 'N/A'}%
          </div>
        )}
      </div>
    </div>
  );
};

export default HealthFeed;
