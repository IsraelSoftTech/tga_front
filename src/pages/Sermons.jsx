import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FaCalendarAlt, FaUser, FaBook, FaVideo, FaHeadphones, FaFileAlt, FaThumbsUp, FaHeart, FaComment, FaShare } from 'react-icons/fa';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './Sermons.css';

const Sermons = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedSermon, setSelectedSermon] = useState(null);
  const [filter, setFilter] = useState('all'); // all, video, audio, text
  const [sermonReactions, setSermonReactions] = useState({}); // { sermonId: { likes: 0, loves: 0, userLiked: false, userLoved: false } }
  const [sermonComments, setSermonComments] = useState({}); // { sermonId: [{ id, text, author, date }] }
  const [newComment, setNewComment] = useState(''); // For the comment input
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareUrl, setShareUrl] = useState('');

  // Sample sermons data - will be replaced with data from backend
  const sermons = [
    {
      id: 1,
      date: '2024-01-15',
      topic: 'Walking in Faith',
      anchorScripture: 'Hebrews 11:1',
      speaker: 'Pastor John Smith',
      type: 'video',
      content: 'https://example.com/video1.mp4',
      description: 'A powerful message about living by faith and trusting in God\'s promises.'
    },
    {
      id: 2,
      date: '2024-01-08',
      topic: 'The Power of Prayer',
      anchorScripture: 'James 5:16',
      speaker: 'Pastor John Smith',
      type: 'audio',
      content: 'https://example.com/audio1.mp3',
      description: 'Understanding the importance and power of prayer in our daily lives.'
    },
    {
      id: 3,
      date: '2024-01-01',
      topic: 'New Beginnings',
      anchorScripture: '2 Corinthians 5:17',
      speaker: 'Pastor John Smith',
      type: 'text',
      content: 'Therefore, if anyone is in Christ, the new creation has come: The old has gone, the new is here! This message explores what it means to be a new creation in Christ and how we can embrace the transformation that comes through faith.',
      description: 'A message about starting fresh in Christ and embracing new beginnings.'
    }
  ];

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
  const handleLike = (e, sermonId) => {
    e.stopPropagation();
    const current = getReactions(sermonId);
    setSermonReactions({
      ...sermonReactions,
      [sermonId]: {
        ...current,
        likes: current.userLiked ? current.likes - 1 : current.likes + 1,
        userLiked: !current.userLiked
      }
    });
  };

  // Handle love toggle
  const handleLove = (e, sermonId) => {
    e.stopPropagation();
    const current = getReactions(sermonId);
    setSermonReactions({
      ...sermonReactions,
      [sermonId]: {
        ...current,
        loves: current.userLoved ? current.loves - 1 : current.loves + 1,
        userLoved: !current.userLoved
      }
    });
  };

  // Handle share
  const handleShare = (e, sermon) => {
    e.stopPropagation();
    const url = `${window.location.origin}/sermons?sermon=${sermon.id}`;
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
  const handleCommentSubmit = (e, sermonId) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const comment = {
      id: Date.now(),
      text: newComment.trim(),
      author: 'You', // In a real app, this would come from user authentication
      date: new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    };

    const currentComments = getComments(sermonId);
    setSermonComments({
      ...sermonComments,
      [sermonId]: [...currentComments, comment]
    });
    setNewComment('');
  };

  // Check URL for sermon parameter and open the sermon modal
  useEffect(() => {
    const sermonId = searchParams.get('sermon');
    if (sermonId) {
      const sermon = sermons.find(s => s.id === parseInt(sermonId));
      if (sermon) {
        setSelectedSermon(sermon);
        // Remove the query parameter from URL after opening
        setSearchParams({});
      }
    }
  }, [searchParams, setSearchParams]);

  const filteredSermons = filter === 'all' 
    ? sermons 
    : sermons.filter(sermon => sermon.type === filter);

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
                  <div className="sermon-type-badge">
                    {getTypeIcon(sermon.type)}
                    <span>{sermon.type.charAt(0).toUpperCase() + sermon.type.slice(1)}</span>
                  </div>
                  <div className="sermon-info">
                    <h3 className="sermon-topic">{sermon.topic}</h3>
                    <div className="sermon-meta">
                      <div className="meta-item">
                        <FaCalendarAlt />
                        <span>{formatDate(sermon.date)}</span>
                      </div>
                      <div className="meta-item">
                        <FaUser />
                        <span>{sermon.speaker}</span>
                      </div>
                      <div className="meta-item">
                        <FaBook />
                        <span>{sermon.anchorScripture}</span>
                      </div>
                    </div>
                    <p className="sermon-description">{sermon.description}</p>
                  </div>
                  
                  {/* Reactions and Actions */}
                  <div className="sermon-actions" onClick={(e) => e.stopPropagation()}>
                    <button 
                      className={`action-btn like-btn ${reactions.userLiked ? 'active' : ''}`}
                      onClick={(e) => handleLike(e, sermon.id)}
                      title="Like"
                    >
                      <FaThumbsUp />
                      <span>{reactions.likes}</span>
                    </button>
                    <button 
                      className={`action-btn love-btn ${reactions.userLoved ? 'active' : ''}`}
                      onClick={(e) => handleLove(e, sermon.id)}
                      title="Love"
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
                  </div>
                  
                  <button className="sermon-view-btn">View Sermon</button>
                </div>
              );
            })}
          </div>
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
                >
                  <FaThumbsUp />
                  <span>{getReactions(selectedSermon.id).likes}</span>
                </button>
                <button 
                  className={`action-btn love-btn ${getReactions(selectedSermon.id).userLoved ? 'active' : ''}`}
                  onClick={(e) => handleLove(e, selectedSermon.id)}
                  title="Love"
                >
                  <FaHeart />
                  <span>{getReactions(selectedSermon.id).loves}</span>
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
                  <video controls className="sermon-video">
                    <source src={selectedSermon.content} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                </div>
              )}
              {selectedSermon.type === 'audio' && (
                <div className="media-container">
                  <audio controls className="sermon-audio">
                    <source src={selectedSermon.content} type="audio/mpeg" />
                    Your browser does not support the audio element.
                  </audio>
                </div>
              )}
              {selectedSermon.type === 'text' && (
                <div className="text-content">
                  <p>{selectedSermon.content}</p>
                </div>
              )}
              
              {/* Comments Section */}
              <div className="comments-section" onClick={(e) => e.stopPropagation()}>
                <h3 className="comments-title">
                  <FaComment /> Comments ({getComments(selectedSermon.id).length})
                </h3>
                
                {/* Comment Form */}
                <form className="comment-form" onSubmit={(e) => handleCommentSubmit(e, selectedSermon.id)}>
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
