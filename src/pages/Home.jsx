import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FaBook, 
  FaUsers, 
  FaMusic, 
  FaBaby, 
  FaUserFriends, 
  FaHandsHelping,
  FaPrayingHands,
  FaThumbsUp,
  FaHeart,
  FaComment,
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
  FaClock
} from 'react-icons/fa';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { homeAPI, galleryAPI } from '../api';
import './Home.css';

// Hero Section Component with Slideshow
const HeroSection = ({ content, currentImageIndex, getValue }) => {
  const imagesJson = getValue('hero', 'background_images', '[]');
  let images = [];
  try {
    images = JSON.parse(imagesJson || '[]');
  } catch (error) {
    images = [];
  }

  // Fallback to single background_image if no slideshow images
  const singleImage = getValue('hero', 'background_image');
  if (images.length === 0 && singleImage) {
    images = [singleImage];
  }

  const currentImage = images.length > 0 ? images[currentImageIndex] : null;

  return (
    <section id="home" className="hero-section">
      {/* Background images for slideshow */}
      {images.length > 0 && (
        <div className="hero-backgrounds">
          {images.map((imageUrl, index) => (
            <div
              key={index}
              className={`hero-bg-image ${index === currentImageIndex ? 'active' : ''}`}
              style={{
                backgroundImage: `url(${imageUrl})`
              }}
            />
          ))}
        </div>
      )}
      
      <div className="hero-content">
        <h1 className="hero-title">{getValue('hero', 'title', 'Welcome to Town Green Assembly')}</h1>
        <p className="hero-subtitle">{getValue('hero', 'subtitle', 'A community of faith, hope, and love')}</p>
        <div className="hero-buttons">
          <Link to={getValue('hero', 'button1_link', '/about')} className="btn btn-primary">{getValue('hero', 'button1_text', 'Learn More')}</Link>
          <Link to={getValue('hero', 'button2_link', '/contact')} className="btn btn-secondary">{getValue('hero', 'button2_text', 'Get Involved')}</Link>
        </div>
      </div>
      {images.length > 1 && (
        <div className="hero-slideshow-indicators">
          {images.map((_, index) => (
            <span
              key={index}
              className={`indicator ${index === currentImageIndex ? 'active' : ''}`}
            />
          ))}
        </div>
      )}
    </section>
  );
};

// Gallery Section Component
const GallerySection = ({ content, getValue }) => {
  const galleryJson = getValue('gallery', 'items', '[]');
  let galleryItems = [];
  try {
    galleryItems = JSON.parse(galleryJson || '[]');
  } catch (error) {
    galleryItems = [];
  }

  const [reactions, setReactions] = useState({}); // { itemUrl: { likes: 0, loves: 0, userLiked: false, userLoved: false } }
  const [comments, setComments] = useState({}); // { itemUrl: [comments] }
  const [selectedItem, setSelectedItem] = useState(null); // For comment modal
  const [newComment, setNewComment] = useState('');
  const [commentAuthor, setCommentAuthor] = useState('');
  const [loadingReactions, setLoadingReactions] = useState({});

  // Load reactions and comments for all items
  useEffect(() => {
    galleryItems.forEach((item) => {
      loadReactions(item.url);
      loadComments(item.url);
    });
  }, [galleryJson]);

  const loadReactions = async (itemUrl) => {
    try {
      const response = await galleryAPI.getReactions(itemUrl);
      if (response.success) {
        setReactions(prev => ({
          ...prev,
          [itemUrl]: response.data
        }));
      }
    } catch (error) {
      console.error('Error loading reactions:', error);
    }
  };

  const loadComments = async (itemUrl) => {
    try {
      const response = await galleryAPI.getComments(itemUrl);
      if (response.success) {
        setComments(prev => ({
          ...prev,
          [itemUrl]: response.data
        }));
      }
    } catch (error) {
      console.error('Error loading comments:', error);
    }
  };

  const handleLike = async (e, itemUrl) => {
    e.stopPropagation();
    if (loadingReactions[itemUrl]) return;
    
    setLoadingReactions(prev => ({ ...prev, [itemUrl]: true }));
    try {
      await galleryAPI.like(itemUrl);
      await loadReactions(itemUrl);
    } catch (error) {
      console.error('Error toggling like:', error);
    } finally {
      setLoadingReactions(prev => ({ ...prev, [itemUrl]: false }));
    }
  };

  const handleLove = async (e, itemUrl) => {
    e.stopPropagation();
    if (loadingReactions[itemUrl]) return;
    
    setLoadingReactions(prev => ({ ...prev, [itemUrl]: true }));
    try {
      await galleryAPI.love(itemUrl);
      await loadReactions(itemUrl);
    } catch (error) {
      console.error('Error toggling love:', error);
    } finally {
      setLoadingReactions(prev => ({ ...prev, [itemUrl]: false }));
    }
  };

  const handleCommentSubmit = async (e, itemUrl) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      await galleryAPI.addComment(itemUrl, newComment.trim(), commentAuthor.trim() || 'Anonymous');
      setNewComment('');
      setCommentAuthor('');
      await loadComments(itemUrl);
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const getReactions = (itemUrl) => {
    return reactions[itemUrl] || { likes: 0, loves: 0, userLiked: false, userLoved: false };
  };

  const getComments = (itemUrl) => {
    return comments[itemUrl] || [];
  };

  if (galleryItems.length === 0) {
    return null; // Don't show gallery if no items
  }

  return (
    <>
      <section id="gallery" className="gallery-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">{getValue('gallery', 'title', 'Church Gallery')}</h2>
            <div className="title-underline"></div>
          </div>
          <div className="gallery-grid">
            {galleryItems.map((item, index) => {
              const itemReactions = getReactions(item.url);
              const itemComments = getComments(item.url);
              
              return (
                <div key={index} className="gallery-item">
                  {item.type === 'video' ? (
                    <div className="gallery-video">
                      {item.isFile || (!item.url.includes('youtube.com/embed') && !item.url.includes('player.vimeo.com') && !item.url.includes('youtu.be') && !item.url.includes('vimeo.com')) ? (
                        <video
                          src={item.url}
                          controls
                          style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                          }}
                        >
                          Your browser does not support the video tag.
                        </video>
                      ) : (
                        <iframe
                          src={item.url}
                          title={`Gallery video ${index + 1}`}
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        ></iframe>
                      )}
                      {item.caption && (
                        <div className="gallery-caption">{item.caption}</div>
                      )}
                    </div>
                  ) : (
                    <div className="gallery-image">
                      <img src={item.url} alt={item.caption || `Gallery image ${index + 1}`} />
                      {item.caption && (
                        <div className="gallery-caption">{item.caption}</div>
                      )}
                    </div>
                  )}
                  
                  {/* Reactions and Actions */}
                  <div className="gallery-actions" onClick={(e) => e.stopPropagation()}>
                    <button
                      className={`gallery-action-btn like-btn ${itemReactions.userLiked ? 'active' : ''}`}
                      onClick={(e) => handleLike(e, item.url)}
                      title="Like"
                      disabled={loadingReactions[item.url]}
                    >
                      <FaThumbsUp />
                      <span>{itemReactions.likes}</span>
                    </button>
                    <button
                      className={`gallery-action-btn love-btn ${itemReactions.userLoved ? 'active' : ''}`}
                      onClick={(e) => handleLove(e, item.url)}
                      title="Love"
                      disabled={loadingReactions[item.url]}
                    >
                      <FaHeart />
                      <span>{itemReactions.loves}</span>
                    </button>
                    <button
                      className="gallery-action-btn comment-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedItem({ ...item, url: item.url });
                      }}
                      title="Comment"
                    >
                      <FaComment />
                      <span>{itemComments.length}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Comment Modal */}
      {selectedItem && (
        <div className="gallery-comment-modal-overlay" onClick={() => setSelectedItem(null)}>
          <div className="gallery-comment-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedItem(null)}>×</button>
            <div className="modal-header">
              <h3>Comments</h3>
              {selectedItem.caption && <p className="modal-subtitle">{selectedItem.caption}</p>}
            </div>
            
            {/* Comment Form */}
            <form className="comment-form" onSubmit={(e) => handleCommentSubmit(e, selectedItem.url)}>
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
                required
              />
              <button type="submit" className="comment-submit-btn">
                Post Comment
              </button>
            </form>
            
            {/* Comments List */}
            <div className="comments-list">
              {getComments(selectedItem.url).map((comment) => (
                <div key={comment.id} className="comment-item">
                  <div className="comment-header">
                    <strong className="comment-author">{comment.author}</strong>
                    <span className="comment-date">{comment.date}</span>
                  </div>
                  <p className="comment-text">{comment.text}</p>
                </div>
              ))}
              {getComments(selectedItem.url).length === 0 && (
                <p className="no-comments">No comments yet. Be the first to comment!</p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const Home = () => {
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState({});
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    loadContent();
  }, []);

  // Handle background images slideshow
  useEffect(() => {
    const imagesJson = content['hero']?.['background_images']?.value || '[]';
    let images = [];
    try {
      images = JSON.parse(imagesJson || '[]');
    } catch (error) {
      images = [];
    }

    // Fallback to single image
    if (images.length === 0) {
      const singleImage = content['hero']?.['background_image']?.value;
      if (singleImage) {
        images = [singleImage];
      }
    }

    if (images.length > 1) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
      }, 3000); // Change image every 3 seconds

      return () => clearInterval(interval);
    } else {
      setCurrentImageIndex(0);
    }
  }, [content]);

  const loadContent = async () => {
    try {
      const response = await homeAPI.getContent();
      if (response.success) {
        setContent(response.data || {});
      }
    } catch (error) {
      console.error('Error loading home content:', error);
      // Continue with default content if API fails
    } finally {
      // Simulate loading effect
      setTimeout(() => {
        setLoading(false);
      }, 1000);
    }
  };

  const getValue = (section, key, defaultValue = '') => {
    return content[section]?.[key]?.value || defaultValue;
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-content">
          <div className="loading-text">Town Green</div>
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="home">
      <Header />
      
      {/* Hero Section */}
      <HeroSection 
        content={content}
        currentImageIndex={currentImageIndex}
        getValue={getValue}
      />

      {/* Gallery Section */}
      <GallerySection content={content} getValue={getValue} />

      {/* About Section */}
      <section id="about" className="about-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">{getValue('about', 'title', 'About Us')}</h2>
            <div className="title-underline"></div>
          </div>
          <div className="about-content">
            <div className="about-text">
              <p dangerouslySetInnerHTML={{ __html: getValue('about', 'text1', 'Town Green Assembly is a vibrant community of believers dedicated to spreading the message of hope, love, and faith. We are committed to building strong relationships with God and each other, creating a welcoming environment for all who seek spiritual growth and fellowship.').replace(/\n/g, '<br />') }} />
              <p dangerouslySetInnerHTML={{ __html: getValue('about', 'text2', 'Our mission is to serve our community, nurture spiritual development, and make a positive impact in the lives of those around us. We believe in the power of prayer, the importance of community, and the transformative message of the Gospel.').replace(/\n/g, '<br />') }} />
            </div>
            <div className="about-stats">
              <div className="stat-item">
                <div className="stat-number">{getValue('about', 'stat1_number', '500+')}</div>
                <div className="stat-label">{getValue('about', 'stat1_label', 'Members')}</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">{getValue('about', 'stat2_number', '15+')}</div>
                <div className="stat-label">{getValue('about', 'stat2_label', 'Years')}</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">{getValue('about', 'stat3_number', '20+')}</div>
                <div className="stat-label">{getValue('about', 'stat3_label', 'Programs')}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Programs Section */}
      <section id="programs" className="programs-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">{getValue('programs', 'title', 'Church Programs')}</h2>
            <div className="title-underline"></div>
          </div>
          <div className="programs-grid">
            {[1, 2, 3, 4, 5, 6].map((num) => {
              const icons = [FaBook, FaUsers, FaMusic, FaBaby, FaUserFriends, FaHandsHelping];
              const Icon = icons[num - 1];
              const title = getValue('programs', `program${num}_title`, '');
              const description = getValue('programs', `program${num}_description`, '');
              
              if (!title && !description) return null;
              
              return (
                <div key={num} className="program-card">
                  <div className="program-icon"><Icon /></div>
                  <h3>{title}</h3>
                  <p>{description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonies Section */}
      <section id="testimonies" className="testimonies-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">{getValue('testimonies', 'title', 'Testimonies')}</h2>
            <div className="title-underline"></div>
          </div>
          <div className="testimonies-grid">
            {[1, 2, 3].map((num) => {
              const text = getValue('testimonies', `testimony${num}_text`, '');
              const author = getValue('testimonies', `testimony${num}_author`, '');
              
              if (!text && !author) return null;
              
              return (
                <div key={num} className="testimony-card">
                  <div className="testimony-quote">"</div>
                  <p className="testimony-text">{text}</p>
                  <div className="testimony-author">- {author}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Prayer Section */}
      <section id="prayers" className="prayer-section">
        <div className="container">
          <div className="prayer-content">
            <div className="prayer-text">
              <h2 className="section-title">{getValue('prayer', 'title', 'Prayer Requests')}</h2>
              <div className="title-underline"></div>
              <p>{getValue('prayer', 'description', 'We believe in the power of prayer. Share your prayer requests with us, and our community will lift you up in prayer. Whether you\'re facing challenges, celebrating victories, or seeking guidance, we\'re here for you.')}</p>
              <Link to={getValue('prayer', 'button_link', '/prayers')} className="btn btn-primary">{getValue('prayer', 'button_text', 'Submit Prayer Request')}</Link>
            </div>
            <div className="prayer-image">
              {getValue('prayer', 'image') ? (
                <img src={getValue('prayer', 'image')} alt="Prayer" style={{ width: '300px', height: '300px', objectFit: 'cover', borderRadius: '50%' }} />
              ) : (
                <div className="prayer-placeholder">
                  <FaPrayingHands />
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="contact-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Get In Touch</h2>
            <div className="title-underline"></div>
          </div>
          <div className="contact-content">
            <div className="contact-info">
              <div className="contact-item">
                <div className="contact-icon"><FaMapMarkerAlt /></div>
                <div>
                  <h4>Address</h4>
                  <p dangerouslySetInnerHTML={{ __html: getValue('contact', 'address', '123 Church Street<br />Town Green, ST 12345') }} />
                </div>
              </div>
              <div className="contact-item">
                <div className="contact-icon"><FaPhone /></div>
                <div>
                  <h4>Phone</h4>
                  <p>{getValue('contact', 'phone', '(555) 123-4567')}</p>
                </div>
              </div>
              <div className="contact-item">
                <div className="contact-icon"><FaEnvelope /></div>
                <div>
                  <h4>Email</h4>
                  <p>{getValue('contact', 'email', 'info@towngreenassembly.org')}</p>
                </div>
              </div>
              <div className="contact-item">
                <div className="contact-icon"><FaClock /></div>
                <div>
                  <h4>Service Times</h4>
                  <p dangerouslySetInnerHTML={{ __html: getValue('contact', 'service_times', 'Sunday: 9:00 AM & 11:00 AM<br />Wednesday: 7:00 PM') }} />
                </div>
              </div>
            </div>
            <div className="contact-form">
              <form>
                <div className="form-group">
                  <input type="text" placeholder="Your Name" required />
                </div>
                <div className="form-group">
                  <input type="email" placeholder="Your Email" required />
                </div>
                <div className="form-group">
                  <textarea placeholder="Your Message" rows="5" required></textarea>
                </div>
                <button type="submit" className="btn btn-primary">Send Message</button>
              </form>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
