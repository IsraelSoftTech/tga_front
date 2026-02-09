import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FaBook, 
  FaUsers, 
  FaMusic, 
  FaBaby, 
  FaUserFriends, 
  FaHandsHelping,
  FaCalendarAlt,
  FaClock,
  FaMapMarkerAlt,
  FaShare
} from 'react-icons/fa';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { programsAPI } from '../api';
import './Programs.css';

const Programs = () => {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareUrl, setShareUrl] = useState('');

  const loadPrograms = async () => {
    try {
      setLoading(true);
      console.log('🔄 Loading programs...');
      const response = await programsAPI.getAll();
      console.log('📥 Programs API response:', response);
      
      if (response.success) {
        const programsData = response.data || [];
        // Show most recent programs first (by creation date)
        const sorted = [...programsData].sort((a, b) => {
          const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
          const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
          return dateB - dateA;
        });
        console.log(`✅ Loaded ${sorted.length} programs:`, sorted);
        setPrograms(sorted);
      } else {
        console.error('❌ API returned success=false:', response);
        setPrograms([]);
      }
    } catch (error) {
      console.error('❌ Error loading programs:', error);
      setPrograms([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPrograms();
  }, []);

  // Refresh programs when window regains focus (helps when admin updates data)
  useEffect(() => {
    const handleFocus = () => {
      loadPrograms();
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  // Map program titles to icons (fallback if no image)
  const getProgramIcon = (title) => {
    const titleLower = title.toLowerCase();
    if (titleLower.includes('sunday') || titleLower.includes('service')) {
      return <FaBook />;
    } else if (titleLower.includes('bible') || titleLower.includes('study')) {
      return <FaUsers />;
    } else if (titleLower.includes('worship')) {
      return <FaMusic />;
    } else if (titleLower.includes('children') || titleLower.includes('kids')) {
      return <FaBaby />;
    } else if (titleLower.includes('youth') || titleLower.includes('teen')) {
      return <FaUserFriends />;
    } else if (titleLower.includes('outreach') || titleLower.includes('community')) {
      return <FaHandsHelping />;
    }
    return <FaBook />; // Default icon
  };

  // Handle share - simple link to programs page
  const handleShare = (e, program) => {
    e.stopPropagation();
    const url = `${window.location.origin}/programs`;
    setShareUrl(url);
    setShowShareModal(true);
    
    // Copy to clipboard
    navigator.clipboard.writeText(url).then(() => {
      // Optional: Show a toast notification
    }).catch(() => {
      // Fallback if clipboard API fails
    });
  };

  if (loading) {
    return (
      <div className="programs-page">
        <Header />
        <section className="programs-hero">
          <div className="container">
            <h1 className="page-title">Church Programs</h1>
            <p className="page-subtitle">Join us for worship, fellowship, and growth</p>
          </div>
        </section>
        <section className="programs-list">
          <div className="container">
            <div className="loading-message"></div>
          </div>
        </section>
        <Footer />
      </div>
    );
  }

  return (
    <div className="programs-page">
      <Header />
      
      <section className="programs-hero">
        <div className="container">
          <h1 className="page-title">Church Programs</h1>
          <p className="page-subtitle">Join us for worship, fellowship, and growth</p>
        </div>
      </section>

      <section className="programs-list">
        <div className="container">
          {programs.length === 0 ? (
            <div className="empty-programs">
              <p>No programs available at this time. Please check back later.</p>
            </div>
          ) : (
            <div className="programs-grid">
              {programs.map((program) => (
                <div key={program.id} className="program-card-detailed">
                  {program.image_url ? (
                    <div className="program-image-large">
                      <img src={program.image_url} alt={program.title} />
                    </div>
                  ) : (
                    <div className="program-icon-large">
                      {getProgramIcon(program.title)}
                    </div>
                  )}
                  <div className="program-info">
                    <h3>{program.title}</h3>
                    <div className="program-schedule">
                      {program.day_of_week && (
                        <span className="schedule-item">
                          <FaCalendarAlt /> {program.day_of_week}
                        </span>
                      )}
                      {program.time && (
                        <span className="schedule-item">
                          <FaClock /> {program.time}
                        </span>
                      )}
                      {program.location && (
                        <span className="schedule-item">
                          <FaMapMarkerAlt /> {program.location}
                        </span>
                      )}
                    </div>
                    {program.description && <p>{program.description}</p>}
                  </div>
                  <div className="program-actions">
                    <button 
                      className="action-btn share-btn"
                      onClick={(e) => handleShare(e, program)}
                      title="Share"
                    >
                      <FaShare />
                      <span>Share</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="programs-cta">
        <div className="container">
          <div className="cta-content">
            <h2>Want to Get Involved?</h2>
            <p>We'd love to have you join us! Contact us to learn more about any of our programs.</p>
            <Link to="/contact" className="btn btn-primary">Contact Us</Link>
          </div>
        </div>
      </section>

      {/* Share Modal */}
      {showShareModal && (
        <div className="share-modal-overlay" onClick={() => setShowShareModal(false)}>
          <div className="share-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowShareModal(false)}>×</button>
            <h3>Share This Program</h3>
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
                href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent('Check out this church program!')}`}
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

export default Programs;
