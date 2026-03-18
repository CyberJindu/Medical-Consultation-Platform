import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { 
  Heart,
  Share2, 
  Calendar, 
  Clock, 
  User, 
  Award,
  ArrowLeft,
  Check,
  ExternalLink
} from 'lucide-react';
import { healthFeedAPI } from '../services/api.js';

const ContentDetail = ({ post, onBack, onSave, onShare }) => {
  const [isSaved, setIsSaved] = useState(post?.saved || false);
  const [saveCount, setSaveCount] = useState(post?.saveCount || 0);
  const [shareCount, setShareCount] = useState(post?.shareCount || 0);
  const [showShareTooltip, setShowShareTooltip] = useState(false);

  if (!post) {
    return (
      <div className="content-detail-error">
        <h3>Content not found</h3>
        <button onClick={onBack} className="back-button">
          <ArrowLeft size={20} />
          Back to Feed
        </button>
      </div>
    );
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // UPDATED: Save handler with toggle functionality using response data
  const handleSave = async () => {
    try {
      const response = await onSave(post._id);
      
      // If onSave returns the response data, use it to update state
      if (response && response.data) {
        setIsSaved(response.data.data.liked);
        setSaveCount(response.data.data.saveCount);
      } else {
        // Fallback to toggle if no response data
        setIsSaved(!isSaved);
        setSaveCount(prev => isSaved ? prev - 1 : prev + 1);
      }
    } catch (error) {
      console.error('Failed to save article:', error);
    }
  };

  const handleShare = async () => {
    try {
      // Try native share first (mobile)
      if (navigator.share) {
        await navigator.share({
          title: post.title,
          text: post.excerpt || `Check out this health article: ${post.title}`,
          url: window.location.href,
        });
        const response = await onShare(post._id);
        if (response && response.data) {
          setShareCount(response.data.data.shareCount);
        } else {
          setShareCount(prev => prev + 1);
        }
      } else {
        // Fallback: copy link to clipboard
        await navigator.clipboard.writeText(window.location.href);
        setShowShareTooltip(true);
        setTimeout(() => setShowShareTooltip(false), 2000);
        const response = await onShare(post._id);
        if (response && response.data) {
          setShareCount(response.data.data.shareCount);
        } else {
          setShareCount(prev => prev + 1);
        }
      }
    } catch (error) {
      console.error('Failed to share article:', error);
    }
  };

  // Custom markdown components for styling
  const MarkdownComponents = {
    // Headers
    h1: ({node, ...props}) => <h1 className="md-h1" {...props} />,
    h2: ({node, ...props}) => <h2 className="md-h2" {...props} />,
    h3: ({node, ...props}) => <h3 className="md-h3" {...props} />,
    h4: ({node, ...props}) => <h4 className="md-h4" {...props} />,
    
    // Text formatting
    strong: ({node, ...props}) => <strong className="md-strong" {...props} />,
    em: ({node, ...props}) => <em className="md-em" {...props} />,
    
    // Lists
    ul: ({node, ...props}) => <ul className="md-ul" {...props} />,
    ol: ({node, ...props}) => <ol className="md-ol" {...props} />,
    li: ({node, ...props}) => <li className="md-li" {...props} />,
    
    // Links
    a: ({node, ...props}) => <a className="md-a" target="_blank" rel="noopener noreferrer" {...props} />,
    
    // Paragraphs
    p: ({node, ...props}) => <p className="md-p" {...props} />,
    
    // Blockquotes
    blockquote: ({node, ...props}) => <blockquote className="md-blockquote" {...props} />,
    
    // Code
    code: ({node, inline, ...props}) => 
      inline ? 
        <code className="md-code-inline" {...props} /> : 
        <code className="md-code-block" {...props} />,
  };

  return (
    <div className="content-detail-container">
      {/* Header with back button and actions */}
      <div className="content-detail-header">
        <button onClick={onBack} className="back-button">
          <ArrowLeft size={20} />
          <span>Back to Feed</span>
        </button>
        
        <div className="header-actions">
          <div className="action-buttons">
            <button 
              className={`action-button save-button ${isSaved ? 'saved' : ''}`}
              onClick={handleSave}
              title={isSaved ? 'Liked' : 'Like this article'}
            >
              <Heart size={20} fill={isSaved ? 'currentColor' : 'none'} />
              <span>{saveCount}</span>
            </button>
            
            <div className="share-container">
              <button 
                className="action-button share-button"
                onClick={handleShare}
                title="Share article"
              >
                <Share2 size={20} />
              </button>
              {showShareTooltip && (
                <div className="share-tooltip">
                  <Check size={14} />
                  Link copied!
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Article Content */}
      <article className="content-detail-article">
        {/* Title */}
        <h1 className="article-title">{post.title}</h1>

        {/* Author and metadata */}
        <div className="article-meta">
          <div className="meta-item">
            <User size={16} />
            <span>{post.author || 'MediGuide Health Team'}</span>
            {post.authorType === 'verified_specialist' && (
              <span className="verified-badge" title="Verified Specialist">
                <Award size={14} />
              </span>
            )}
          </div>
          
          <div className="meta-item">
            <Calendar size={16} />
            <span>{formatDate(post.publishDate)}</span>
          </div>
          
          <div className="meta-item">
            <Clock size={16} />
            <span>{post.readTime || '5 min read'}</span>
          </div>
        </div>

        {/* Specialist info if available */}
        {post.authorSpecialty && (
          <div className="specialist-info">
            <strong>Specialty:</strong> {post.authorSpecialty}
          </div>
        )}

        {/* Topics/Tags */}
        {post.topics && post.topics.length > 0 && (
          <div className="article-topics">
            {post.topics.map((topic, index) => (
              <span key={index} className="topic-tag">{topic}</span>
            ))}
          </div>
        )}

        {/* Main content with markdown */}
        <div className="article-content">
          <ReactMarkdown 
            remarkPlugins={[remarkGfm]}
            components={MarkdownComponents}
          >
            {post.content || ''}
          </ReactMarkdown>
        </div>

        {/* Medical disclaimer */}
        <div className="medical-disclaimer">
          <p>
            <strong>Disclaimer:</strong> This content is for informational purposes only 
            and is not a substitute for professional medical advice. Always consult with 
            a qualified healthcare provider for medical concerns.
          </p>
        </div>

        {/* Related articles section - placeholder for future enhancement */}
        {post.relatedContent && post.relatedContent.length > 0 && (
          <div className="related-articles">
            <h3>Related Articles</h3>
            <div className="related-list">
              {post.relatedContent.map(related => (
                <div key={related._id} className="related-item">
                  <h4>{related.title}</h4>
                  <span className="read-link">
                    Read <ExternalLink size={14} />
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </article>
    </div>
  );
};

export default ContentDetail;
