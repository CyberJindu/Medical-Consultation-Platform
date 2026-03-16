import React, { useState, useEffect } from 'react';
import { Bookmark, Share2, Calendar, Sparkles } from 'lucide-react';
import { healthFeedAPI } from '../services/api.js';
import ContentDetail from './ContentDetail'; // Import the new component

const HealthFeed = ({ posts: initialPosts = [], isOpen, onClose, userId }) => {
  const [posts, setPosts] = useState(initialPosts);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null); // NEW: State for selected post
  
  useEffect(() => {
    if (initialPosts && initialPosts.length > 0) {
      console.log('✅ Using pre-loaded posts from Dashboard:', initialPosts.length);
      setPosts(initialPosts);
    }
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
      
      if (response.data && response.data.success) {
        const feedData = response.data.data?.feed || [];
        console.log('✅ Personalized feed loaded:', feedData.length, 'posts');
        
        if (feedData.length > 0) {
          console.log('📝 First post:', {
            title: feedData[0]?.title,
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
      
      if (initialPosts && initialPosts.length > 0) {
        console.log('🔄 Using initial posts as fallback');
        setPosts(initialPosts);
      } else {
        console.log('📝 Showing placeholder content');
        setPosts([{
          _id: 'mock-1',
          title: 'Understanding Common Health Concerns',
          content: 'Start a conversation with MediBot to get personalized health articles based on your specific concerns.',
          excerpt: 'Your personalized health feed will appear here.',
          topics: ['health', 'wellness'],
          publishDate: new Date(),
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

  const trackArticleView = async (articleId) => {
    try {
      await healthFeedAPI.trackView(articleId);
    } catch (error) {
      console.error('Failed to track view:', error);
    }
  };

  // NEW: Handle post click to show detail view
  const handlePostClick = (post) => {
    setSelectedPost(post);
    // Track view when opening detail
    if (post._id) {
      trackArticleView(post._id);
    }
  };

  // NEW: Handle back to feed
  const handleBackToFeed = () => {
    setSelectedPost(null);
  };

  // Update handleSaveArticle to work with both feed and detail view
  const handleSaveArticle = async (articleId) => {
    try {
      await healthFeedAPI.saveArticle(articleId);
      // Update posts list
      setPosts(posts.map(post => 
        post._id === articleId 
          ? { ...post, saveCount: (post.saveCount || 0) + 1, saved: true }
          : post
      ));
      // Update selected post if it's the one being saved
      if (selectedPost && selectedPost._id === articleId) {
        setSelectedPost({
          ...selectedPost,
          saveCount: (selectedPost.saveCount || 0) + 1,
          saved: true
        });
      }
    } catch (error) {
      console.error('Failed to save article:', error);
    }
  };

  // Update handleShareArticle to work with both feed and detail view
  const handleShareArticle = async (articleId) => {
    try {
      await healthFeedAPI.shareArticle(articleId);
      // Update posts list
      setPosts(posts.map(post => 
        post._id === articleId 
          ? { ...post, shareCount: (post.shareCount || 0) + 1 }
          : post
      ));
      // Update selected post if it's the one being shared
      if (selectedPost && selectedPost._id === articleId) {
        setSelectedPost({
          ...selectedPost,
          shareCount: (selectedPost.shareCount || 0) + 1
        });
      }
    } catch (error) {
      console.error('Failed to share article:', error);
    }
  };

  // Update view tracking observer
  useEffect(() => {
    if (posts.length > 0 && !selectedPost) { // Only track when not in detail view
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const articleId = entry.target.dataset.articleId;
            if (articleId) {
              trackArticleView(articleId);
              observer.unobserve(entry.target);
            }
          }
        });
      }, { threshold: 0.5 });

      document.querySelectorAll('.post-card').forEach(card => {
        observer.observe(card);
      });

      return () => observer.disconnect();
    }
  }, [posts, selectedPost]);

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (!isOpen) return null;

  // NEW: Show content detail if a post is selected
  if (selectedPost) {
    return (
      <div className={`healthfeed-panel ${isOpen ? 'open' : ''}`}>
        <div className="panel-content" style={{ padding: 0, overflow: 'hidden' }}>
          <ContentDetail 
            post={selectedPost}
            onBack={handleBackToFeed}
            onSave={handleSaveArticle}
            onShare={handleShareArticle}
          />
        </div>
      </div>
    );
  }

  // Original return statement (feed view)
  return (
    <div className={`healthfeed-panel ${isOpen ? 'open' : ''}`}>
      <div className="panel-header">
        <div className="panel-header-content">
          <h2>Health Feed</h2>
          <button onClick={onClose} className="close-button">✕</button>
        </div>
        <p className="panel-subtitle">
          Personalized based on your conversations
        </p>
      </div>

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
              <article 
                key={post._id || `post-${index}`} 
                className="post-card clickable" // Added clickable class
                onClick={() => handlePostClick(post)} // NEW: Make card clickable
                data-article-id={post._id}
              >
                <div className="post-header">
                  <div className="post-date">
                    <Calendar size={14} />
                    {formatDate(post.publishDate || new Date())}
                  </div>
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
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent card click when clicking save
                        post._id && handleSaveArticle(post._id);
                      }}
                      title="Save for later"
                    >
                      <Bookmark size={16} />
                      <span>Save ({post.saveCount || 0})</span>
                    </button>
                    <button 
                      className="post-action"
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent card click when clicking share
                        post._id && handleShareArticle(post._id);
                      }}
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
            User ID: {userId || 'not provided'}
          </div>
        )}
      </div>
    </div>
  );
};

export default HealthFeed;
