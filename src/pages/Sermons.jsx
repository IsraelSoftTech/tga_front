import React, { useState, useEffect } from 'react';
import { FaCalendarAlt, FaUser, FaBook, FaVideo, FaHeadphones, FaFileAlt, FaThumbsUp, FaHeart, FaComment, FaShare, FaEye } from 'react-icons/fa';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { sermonsAPI } from '../api';
import './Sermons.css';

const Sermons = () => {
  const [selectedSermon, setSelectedSermon] = useState(null);
  const [filter, setFilter] = useState('all'); // all, video, audio, text
  const [sermons, setSermons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sermonReactions, setSermonReactions] = useState({}); // { sermonId: { likes: 0, loves: 0, userLiked: false, userLoved: false } }
  const [sermonComments, setSermonComments] = useState({}); // { sermonId: [{ id, text, author, date }] }
  const [newComment, setNewComment] = useState(''); // For the comment input
  const [commentAuthor, setCommentAuthor] = useState(''); // For comment author name
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [loadingReactions, setLoadingReactions] = useState({});
  const [error, setError] = useState(null);
  const [sermonViews, setSermonViews] = useState({}); // { sermonId: viewCount }

  useEffect(() => {
    loadSermons();
  }, []);

  // Initialize view counts from loaded sermons (only if not already set)
  useEffect(() => {
    if (sermons.length > 0) {
      setSermonViews(prev => {
        const updated = { ...prev };
        sermons.forEach(sermon => {
          // Only set if not already in state (to preserve updated counts)
          if (updated[sermon.id] === undefined && sermon.view_count !== undefined) {
            updated[sermon.id] = sermon.view_count || 0;
          }
        });
        return updated;
      });
    }
  }, [sermons]);

  // Track view when sermon modal opens
  useEffect(() => {
    if (selectedSermon) {
      trackSermonView(selectedSermon.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSermon?.id]);

  // Refresh sermons when window regains focus
  useEffect(() => {
    const handleFocus = () => {
      loadSermons();
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  const loadSermons = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await sermonsAPI.getAll();
      if (response.success) {
        const sermonsData = response.data || [];
        setSermons(sermonsData);
        // Load reactions and comments for all sermons
        sermonsData.forEach((sermon) => {
          loadReactions(sermon.id);
          loadComments(sermon.id);
        });
      } else {
        setError('Failed to load sermons. Please try again later.');
      }
    } catch (error) {
      console.error('Error loading sermons:', error);
      setError('Error loading sermons. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadReactions = async (sermonId) => {
    try {
      const response = await sermonsAPI.getReactions(sermonId);
      if (response.success) {
        setSermonReactions(prev => ({
          ...prev,
          [sermonId]: response.data || { likes: 0, loves: 0, userLiked: false, userLoved: false }
        }));
      }
    } catch (error) {
      console.error('Error loading reactions:', error);
    }
  };

  const loadComments = async (sermonId) => {
    try {
      const response = await sermonsAPI.getComments(sermonId);
      if (response.success) {
        setSermonComments(prev => ({
          ...prev,
          [sermonId]: response.data || []
        }));
      }
    } catch (error) {
      console.error('Error loading comments:', error);
    }
  };

  // Determine sermon type based on available content
  const getSermonType = (sermon) => {
    if (sermon.video_url) return 'video';
    if (sermon.audio_url) return 'audio';
    if (sermon.description && !sermon.video_url && !sermon.audio_url) return 'text';
    return 'text';
  };

  // Format sermon for display (convert database format to display format)
  const formatSermonForDisplay = (sermon) => {
    if (!sermon || !sermon.id) {
      console.error('Invalid sermon data:', sermon);
      return null;
    }
    try {
      const type = getSermonType(sermon);
      const viewCount = sermon.view_count || 0;
      // Don't set state here - it causes infinite re-renders!
      // View count will be updated via trackSermonView when modal opens
      return {
        id: sermon.id,
        date: sermon.date,
        topic: sermon.title || 'Untitled Sermon',
        anchorScripture: '', // Not in database schema, can be added later
        speaker: sermon.speaker || '',
        type: type,
        content: type === 'video' ? sermon.video_url : type === 'audio' ? sermon.audio_url : sermon.description,
        description: sermon.description || '',
        thumbnail_url: sermon.thumbnail_url || null,
        view_count: viewCount
      };
    } catch (error) {
      console.error('Error formatting sermon:', error, sermon);
      return null;
    }
  };

  // Initialize reactions for each sermon if not already set
  const getReactions = (sermonId) => {
    if (!sermonReactions[sermonId]) {
      return { likes: 0, loves: 0, userLiked: false, userLoved: false };
    }
    return sermonReactions[sermonId];
  };

  // Initialize comments for each sermon if not already set
  const getComments = (sermonId) => {
    return sermonComments[sermonId] || [];
  };

  // Handle like toggle
  const handleLike = async (e, sermonId) => {
    e.stopPropagation();
    if (loadingReactions[sermonId]) return;
    
    setLoadingReactions(prev => ({ ...prev, [sermonId]: true }));
    try {
      await sermonsAPI.like(sermonId);
      await loadReactions(sermonId);
    } catch (error) {
      console.error('Error toggling like:', error);
    } finally {
      setLoadingReactions(prev => ({ ...prev, [sermonId]: false }));
    }
  };

  // Handle love toggle
  const handleLove = async (e, sermonId) => {
    e.stopPropagation();
    if (loadingReactions[sermonId]) return;
    
    setLoadingReactions(prev => ({ ...prev, [sermonId]: true }));
    try {
      await sermonsAPI.love(sermonId);
      await loadReactions(sermonId);
    } catch (error) {
      console.error('Error toggling love:', error);
    } finally {
      setLoadingReactions(prev => ({ ...prev, [sermonId]: false }));
    }
  };

  // Handle share - simple link to sermons page
  const handleShare = (e, sermon) => {
    e.stopPropagation();
    const url = `${window.location.origin}/sermons`;
    setShareUrl(url);
    setShowShareModal(true);
    
    // Copy to clipboard
    navigator.clipboard.writeText(url).then(() => {
      // Optional: Show a toast notification
    }).catch(() => {
      // Fallback if clipboard API fails
    });
  };

  // Handle comment submission
  const handleCommentSubmit = async (e, sermonId) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      await sermonsAPI.addComment(sermonId, newComment.trim(), commentAuthor.trim() || 'Anonymous');
      setNewComment('');
      setCommentAuthor('');
      await loadComments(sermonId);
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  // Track sermon view when modal opens
  const trackSermonView = async (sermonId) => {
    try {
      const response = await sermonsAPI.trackView(sermonId);
      if (response.success && response.data) {
        // Update view count in state
        setSermonViews(prev => ({
          ...prev,
          [sermonId]: response.data.view_count
        }));
      }
    } catch (error) {
      console.error('Error tracking sermon view:', error);
    }
  };

  // Get view count for a sermon (use state if updated, otherwise use formatted sermon data)
  const getViewCount = (sermonId) => {
    // If we have an updated view count in state, use it
    if (sermonViews[sermonId] !== undefined) {
      return sermonViews[sermonId];
    }
    // Otherwise, get it from the formatted sermon
    const sermon = formattedSermons.find(s => s.id === sermonId);
    return sermon?.view_count || 0;
  };

  // Safely format sermons, handling empty array and filtering out nulls
  const formattedSermons = Array.isArray(sermons) && sermons.length > 0
    ? sermons.map(formatSermonForDisplay).filter(sermon => sermon !== null)
    : [];
  const filteredSermons = filter === 'all' 
    ? formattedSermons 
    : formattedSermons.filter(sermon => sermon.type === filter);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getTypeIcon = (type) => {
    switch(type) {
      case 'video':
        return <FaVideo />;
      case 'audio':
        return <FaHeadphones />;
      case 'text':
        return <FaFileAlt />;
      default:
        return <FaFileAlt />;
    }
  };

  if (loading) {
    return (
      <div className="sermons-page">
        <Header />
        <section className="sermons-hero">
          <div className="container">
            <h1 className="page-title">Sermons</h1>
            <p className="page-subtitle">Messages, teachings, and inspiration from our pulpit</p>
          </div>
        </section>
        <section className="sermons-content">
          <div className="container">
            <div className="loading-message"></div>
          </div>
        </section>
        <Footer />
      </div>
    );
  }

  // Always render the page structure, even if there are errors
  return (
    <div className="sermons-page">
      <Header />
      
      <section className="sermons-hero">
        <div className="container">
          <h1 className="page-title">Sermons</h1>
          <p className="page-subtitle">Messages, teachings, and inspiration from our pulpit</p>
        </div>
      </section>

      <section className="sermons-content">
        <div className="container">
          {error && (
            <div className="error-message" style={{ padding: '20px', color: 'red', textAlign: 'center', marginBottom: '20px' }}>
              <p>{error}</p>
              <button onClick={loadSermons} style={{ marginTop: '10px', padding: '8px 16px', cursor: 'pointer' }}>
                Try Again
              </button>
            </div>
          )}
          {!error && formattedSermons.length === 0 && (
            <div className="empty-sermons">
              <p>No sermons available at this time. Please check back later.</p>
            </div>
          )}
          {!error && formattedSermons.length > 0 && (
            <>
              <div className="sermons-filters">
            <button 
              className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All Sermons
            </button>
            <button 
              className={`filter-btn ${filter === 'video' ? 'active' : ''}`}
              onClick={() => setFilter('video')}
            >
              <FaVideo /> Videos
            </button>
            <button 
              className={`filter-btn ${filter === 'audio' ? 'active' : ''}`}
              onClick={() => setFilter('audio')}
            >
              <FaHeadphones /> Audio
            </button>
            <button 
              className={`filter-btn ${filter === 'text' ? 'active' : ''}`}
              onClick={() => setFilter('text')}
            >
              <FaFileAlt /> Messages
            </button>
          </div>

          <div className="sermons-grid">
            {filteredSermons.map((sermon) => {
              const reactions = getReactions(sermon.id);
              const comments = getComments(sermon.id);
              
              return (
                <div key={sermon.id} className="sermon-card" onClick={() => setSelectedSermon(sermon)}>
                  {/* Thumbnail */}
                  {sermon.thumbnail_url && (
                    <div className="sermon-thumbnail-wrapper">
                      <img src={sermon.thumbnail_url} alt={sermon.topic} className="sermon-thumbnail" />
                      <div className="sermon-type-badge-overlay">
                        {getTypeIcon(sermon.type)}
                        <span>{sermon.type.charAt(0).toUpperCase() + sermon.type.slice(1)}</span>
                      </div>
                    </div>
                  )}
                  
                  {!sermon.thumbnail_url && (
                    <div className="sermon-type-badge">
                      {getTypeIcon(sermon.type)}
                      <span>{sermon.type.charAt(0).toUpperCase() + sermon.type.slice(1)}</span>
                    </div>
                  )}
                  
                  <div className="sermon-info">
                    <h3 className="sermon-topic">{sermon.topic}</h3>
                    <div className="sermon-meta">
                      {sermon.date && (
                        <div className="meta-item">
                          <FaCalendarAlt />
                          <span>{formatDate(sermon.date)}</span>
                        </div>
                      )}
                      {sermon.speaker && (
                        <div className="meta-item">
                          <FaUser />
                          <span>{sermon.speaker}</span>
                        </div>
                      )}
                      {sermon.anchorScripture && (
                        <div className="meta-item">
                          <FaBook />
                          <span>{sermon.anchorScripture}</span>
                        </div>
                      )}
                    </div>
                    {sermon.description && (
                      <p className="sermon-description">{sermon.description.substring(0, 120)}{sermon.description.length > 120 ? '...' : ''}</p>
                    )}
                  </div>
                  
                  {/* Reactions and Actions - Flex Layout */}
                  <div className="sermon-actions" onClick={(e) => e.stopPropagation()}>
                    <button 
                      className={`action-btn like-btn ${reactions.userLiked ? 'active' : ''}`}
                      onClick={(e) => handleLike(e, sermon.id)}
                      title="Like"
                      disabled={loadingReactions[sermon.id]}
                    >
                      <FaThumbsUp />
                      <span>{reactions.likes}</span>
                    </button>
                    <button 
                      className={`action-btn love-btn ${reactions.userLoved ? 'active' : ''}`}
                      onClick={(e) => handleLove(e, sermon.id)}
                      title="Love"
                      disabled={loadingReactions[sermon.id]}
                    >
                      <FaHeart />
                      <span>{reactions.loves}</span>
                    </button>
                    <button 
                      className="action-btn comment-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedSermon(sermon);
                      }}
                      title="Comment"
                    >
                      <FaComment />
                      <span>{comments.length}</span>
                    </button>
                    <button 
                      className="action-btn share-btn"
                      onClick={(e) => handleShare(e, sermon)}
                      title="Share"
                    >
                      <FaShare />
                    </button>
                    <button 
                      className="action-btn view-btn"
                      title="Views"
                      style={{ cursor: 'default' }}
                    >
                      <FaEye />
                      <span>{getViewCount(sermon.id)}</span>
                    </button>
                  </div>
                  
                  <button className="sermon-view-btn">View Sermon</button>
                </div>
              );
            })}
              </div>
            </>
          )}
        </div>
      </section>

      {/* Sermon Modal */}
      {selectedSermon && (
        <div className="sermon-modal-overlay" onClick={() => setSelectedSermon(null)}>
          <div className="sermon-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedSermon(null)}>×</button>
            <div className="modal-header">
              <h2>{selectedSermon.topic}</h2>
              <div className="modal-meta">
                <span><FaCalendarAlt /> {formatDate(selectedSermon.date)}</span>
                <span><FaUser /> {selectedSermon.speaker}</span>
                <span><FaBook /> {selectedSermon.anchorScripture}</span>
              </div>
              
              {/* Modal Reactions and Share */}
              <div className="modal-actions" onClick={(e) => e.stopPropagation()}>
                <button 
                  className={`action-btn like-btn ${getReactions(selectedSermon.id).userLiked ? 'active' : ''}`}
                  onClick={(e) => handleLike(e, selectedSermon.id)}
                  title="Like"
                  disabled={loadingReactions[selectedSermon.id]}
                >
                  <FaThumbsUp />
                  <span>{getReactions(selectedSermon.id).likes}</span>
                </button>
                <button 
                  className={`action-btn love-btn ${getReactions(selectedSermon.id).userLoved ? 'active' : ''}`}
                  onClick={(e) => handleLove(e, selectedSermon.id)}
                  title="Love"
                  disabled={loadingReactions[selectedSermon.id]}
                >
                  <FaHeart />
                  <span>{getReactions(selectedSermon.id).loves}</span>
                </button>
                <button 
                  className="action-btn view-btn"
                  title="Views"
                  style={{ cursor: 'default' }}
                >
                  <FaEye />
                  <span>{getViewCount(selectedSermon.id)}</span>
                </button>
                <button 
                  className="action-btn share-btn"
                  onClick={(e) => handleShare(e, selectedSermon)}
                  title="Share"
                >
                  <FaShare />
                  <span>Share</span>
                </button>
              </div>
            </div>
            <div className="modal-content">
              {selectedSermon.type === 'video' && (
                <div className="media-container">
                  {selectedSermon.content && (selectedSermon.content.includes('youtube.com/embed') || selectedSermon.content.includes('player.vimeo.com')) ? (
                    <iframe
                      src={selectedSermon.content}
                      title={selectedSermon.topic}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      style={{ width: '100%', height: '400px' }}
                    ></iframe>
                  ) : (
                    <video controls className="sermon-video" style={{ width: '100%' }}>
                      <source src={selectedSermon.content} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  )}
                </div>
              )}
              {selectedSermon.type === 'audio' && (
                <div className="media-container">
                  <audio controls className="sermon-audio" style={{ width: '100%' }}>
                    <source src={selectedSermon.content} type="audio/mpeg" />
                    Your browser does not support the audio element.
                  </audio>
                </div>
              )}
              {selectedSermon.type === 'text' && (
                <div className="text-content">
                  <p style={{ whiteSpace: 'pre-wrap', lineHeight: '1.8' }}>{selectedSermon.content}</p>
                </div>
              )}
              
              {/* Comments Section */}
              <div className="comments-section" onClick={(e) => e.stopPropagation()}>
                <h3 className="comments-title">
                  <FaComment /> Comments ({getComments(selectedSermon.id).length})
                </h3>
                
                {/* Comment Form */}
                <form className="comment-form" onSubmit={(e) => handleCommentSubmit(e, selectedSermon.id)}>
                  <input
                    type="text"
                    className="comment-author-input"
                    placeholder="Your name (optional)"
                    value={commentAuthor}
                    onChange={(e) => setCommentAuthor(e.target.value)}
                  />
                  <textarea
                    className="comment-input"
                    placeholder="Write a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    rows="3"
                  />
                  <button type="submit" className="comment-submit-btn">
                    Post Comment
                  </button>
                </form>
                
                {/* Comments List */}
                <div className="comments-list">
                  {getComments(selectedSermon.id).map((comment) => (
                    <div key={comment.id} className="comment-item">
                      <div className="comment-header">
                        <strong className="comment-author">{comment.author}</strong>
                        <span className="comment-date">{comment.date}</span>
                      </div>
                      <p className="comment-text">{comment.text}</p>
                    </div>
                  ))}
                  {getComments(selectedSermon.id).length === 0 && (
                    <p className="no-comments">No comments yet. Be the first to comment!</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && (
        <div className="share-modal-overlay" onClick={() => setShowShareModal(false)}>
          <div className="share-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowShareModal(false)}>×</button>
            <h3>Share This Sermon</h3>
            <p className="share-description">Copy this link to share on any social media platform:</p>
            <div className="share-url-container">
              <input 
                type="text" 
                className="share-url-input" 
                value={shareUrl} 
                readOnly
                onClick={(e) => e.target.select()}
              />
              <button 
                className="copy-btn"
                onClick={() => {
                  navigator.clipboard.writeText(shareUrl);
                  // You could add a toast notification here
                }}
              >
                Copy
              </button>
            </div>
            <div className="social-share-buttons">
              <a 
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="social-share-btn facebook"
              >
                Share on Facebook
              </a>
              <a 
                href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent('Check out this sermon!')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="social-share-btn twitter"
              >
                Share on Twitter
              </a>
              <a 
                href={`https://wa.me/?text=${encodeURIComponent(shareUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="social-share-btn whatsapp"
              >
                Share on WhatsApp
              </a>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default Sermons;
