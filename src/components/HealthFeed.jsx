import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Heart, Share2, Calendar, Sparkles, User } from 'lucide-react';
import { healthFeedAPI } from '../services/api.js';
import ContentDetail from './ContentDetail';

const HealthFeed = ({ posts: initialPosts = [], isOpen, onClose, userId }) => {
  const [posts, setPosts] = useState(initialPosts);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);
  // Track viewed articles to prevent double-counting
  const [viewedArticles, setViewedArticles] = useState(new Set());
  
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
      console.log('📊 FULL FEED RESPONSE:', JSON.stringify(response.data, null, 2));
      console.log('📊 Feed API response:', response.data);
      
      if (response.data && response.data.success) {
        const feedData = response.data.data?.feed || [];
        
        // Map the data to include 'saved' from backend's likedByUser
        const processedFeed = feedData.map(post => ({
          ...post,
          saved: post.likedByUser || false,
          saveCount: post.saveCount || 0 // Ensure saveCount exists
        }));

        console.log('🔍 First post saved status:', processedFeed[0]?.saved, 'from likedByUser:', processedFeed[0]?.likedByUser);

        console.log('✅ Personalized feed loaded:', processedFeed.length, 'posts');
        
        if (processedFeed.length > 0) {
          console.log('📝 First post:', {
            title: processedFeed[0]?.title,
            topics: processedFeed[0]?.topics
          });
        }
        
        setPosts(processedFeed);
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
          saveCount: 0,
          authorProfilePic: null
        }]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const trackArticleView = async (articleId) => {
    // Check if already viewed in this session
    if (viewedArticles.has(articleId)) {
      console.log('⏭️ Article already viewed in this session, skipping:', articleId);
      return;
    }
    
    try {
      await healthFeedAPI.trackView(articleId);
      // Mark as viewed to prevent double-counting
      setViewedArticles(prev => new Set(prev).add(articleId));
      console.log('👁️ View tracked for article:', articleId);
    } catch (error) {
      console.error('Failed to track view:', error);
    }
  };

  // Handle post click to show detail view and track view
  const handlePostClick = (post) => {
    setSelectedPost({
      ...post,
      saved: post.saved || false
    });
    // Track view only when clicking to open details
    if (post._id) {
      trackArticleView(post._id);
    }
  };

  // Handle back to feed
  const handleBackToFeed = () => {
    setSelectedPost(null);
  };

  const handleSaveArticle = async (articleId) => {
    try {
      const response = await healthFeedAPI.saveArticle(articleId);
      
      // Update posts list with the response data
      setPosts(posts.map(post => 
        post._id === articleId 
          ? { 
              ...post, 
              saveCount: response.data.data.saveCount, 
              saved: response.data.data.liked 
            }
          : post
      ));
      
      // Update selected post if it's the one being saved
      if (selectedPost && selectedPost._id === articleId) {
        setSelectedPost({
          ...selectedPost,
          saveCount: response.data.data.saveCount,
          saved: response.data.data.liked
        });
      }
    } catch (error) {
      console.error('Failed to save article:', error);
    }
  };

  const handleShareArticle = async (articleId, postTitle, postExcerpt) => {
    try {
      // Try native share first (mobile)
      if (navigator.share) {
        await navigator.share({
        title: postTitle,
        text: postExcerpt || `Check out this health article: ${postTitle}`,
        url: window.location.origin + '/dashboard', // You can customize this URL
      });
    } else {
      // Fallback: copy link to clipboard
      await navigator.clipboard.writeText(window.location.origin + '/dashboard');
      // You could show a toast notification here
      alert('Link copied to clipboard!');
    }
    
    // After successful share, call the API to increment count
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

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Custom markdown components for card rendering
  const CardMarkdownComponents = {
    h1: ({node, ...props}) => <strong className="card-heading" {...props} />,
    h2: ({node, ...props}) => <strong className="card-heading" {...props} />,
    h3: ({node, ...props}) => <strong className="card-heading" {...props} />,
    h4: ({node, ...props}) => <strong className="card-heading" {...props} />,
    strong: ({node, ...props}) => <strong className="card-strong" {...props} />,
    em: ({node, ...props}) => <em className="card-em" {...props} />,
    ul: ({node, ...props}) => <span className="card-list" {...props} />,
    ol: ({node, ...props}) => <span className="card-list" {...props} />,
    li: ({node, ...props}) => <span className="card-list-item">• {props.children}</span>,
    a: ({node, ...props}) => <span className="card-link" {...props} />,
    p: ({node, ...props}) => <span className="card-paragraph" {...props} />,
    blockquote: ({node, ...props}) => <span className="card-blockquote" {...props} />,
    code: ({node, inline, ...props}) => 
      <span className="card-code" {...props} />,
  };

  if (!isOpen) return null;

  // Show content detail if a post is selected
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

  // Feed view
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
                className="post-card clickable"
                onClick={() => handlePostClick(post)}
                data-article-id={post._id}
              >
                <div className="post-header">
                  <div className="post-date">
                    <Calendar size={14} />
                    {formatDate(post.publishDate || new Date())}
                  </div>
                </div>
                
                {/* Title with markdown */}
                <h3 className="post-title">
                  <ReactMarkdown components={CardMarkdownComponents}>
                    {post.title || ''}
                  </ReactMarkdown>
                </h3>
                
                {/* Excerpt with markdown */}
                <div className="post-excerpt">
                  <ReactMarkdown components={CardMarkdownComponents}>
                    {post.excerpt || post.content?.substring(0, 150) || 'Read more...'}
                  </ReactMarkdown>
                </div>
                
                <div className="post-footer">
                  {/* Author section with profile pic and name */}
                  <div className="post-author-info">
                    {post.authorProfilePic ? (
                      <img 
                        src={post.authorProfilePic} 
                        alt={post.author}
                        className="author-avatar"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.style.display = 'none';
                          e.target.parentNode.querySelector('.author-avatar-fallback').style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div 
                      className="author-avatar-fallback"
                      style={{ display: post.authorProfilePic ? 'none' : 'flex' }}
                    >
                      <User size={14} />
                    </div>
                    <span className="author-name">
                      {post.author || 'MediGuide Health Team'}
                    </span>
                  </div>
                  
                  {/* Action buttons */}
                  <div className="post-actions">
                    <button 
                      className={`post-action save-button ${post.saved ? 'saved' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        post._id && handleSaveArticle(post._id);
                      }}
                      title={post.saved ? 'Liked' : 'Like this article'}
                    >
                      <Heart 
                        size={16} 
                        fill={post.saved ? 'currentColor' : 'none'} 
                      />
                      <span>{post.saveCount || 0}</span>
                    </button>
                    <button 
                      className="post-action share-button"
                      onClick={(e) => {
                        e.stopPropagation();
                        post._id && handleShareArticle(post._id, post.title, post.excerpt);
                      }}
                      title="Share article"
                    >
                      <Share2 size={16} />
                      
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
