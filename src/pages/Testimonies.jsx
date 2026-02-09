import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaQuoteLeft, FaStar } from 'react-icons/fa';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { homeAPI } from '../api';
import './Testimonies.css';

const Testimonies = () => {
  const [content, setContent] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    try {
      setLoading(true);
      const response = await homeAPI.getContent();
      if (response.success) {
        setContent(response.data || {});
      }
    } catch (error) {
      console.error('Error loading content:', error);
    } finally {
      setLoading(false);
    }
  };

  const getValue = (section, key, defaultValue = '') => {
    return content[section]?.[key]?.value || defaultValue;
  };

  // Build testimonies array from content (JSON array)
  const testimoniesJson = getValue('testimonies_page', 'testimonies_list', '[]');
  let testimonies = [];
  
  try {
    const parsed = JSON.parse(testimoniesJson || '[]');
    testimonies = Array.isArray(parsed) 
      ? parsed
          .filter(t => t.quote || t.author) // Only include testimonies with content
          .map(t => ({
            quote: t.quote || '',
            author: t.author || '',
            role: t.role || '',
            rating: 5
          }))
      : [];
  } catch (error) {
    console.error('Error parsing testimonies:', error);
    testimonies = [];
  }

  if (loading) {
    return (
      <div className="testimonies-page">
        <Header />
        <section className="testimonies-hero">
          <div className="container">
            <h1 className="page-title">Testimonies</h1>
            <p className="page-subtitle">Stories of transformation and hope</p>
          </div>
        </section>
        <section className="testimonies-list">
          <div className="container">
            <div className="loading-message">Loading testimonies...</div>
          </div>
        </section>
        <Footer />
      </div>
    );
  }

  return (
    <div className="testimonies-page">
      <Header />
      
      <section className="testimonies-hero">
        <div className="container">
          <h1 className="page-title">{getValue('testimonies_page', 'title', 'Testimonies')}</h1>
          <p className="page-subtitle">{getValue('testimonies_page', 'subtitle', 'Stories of transformation and hope')}</p>
        </div>
      </section>

      <section className="testimonies-list">
        <div className="container">
          {testimonies.length === 0 ? (
            <div className="empty-testimonies">
              <p>No testimonies available at this time. Please check back later.</p>
            </div>
          ) : (
            <div className="testimonies-grid">
              {testimonies.map((testimony, index) => (
                <div key={index} className="testimony-card-detailed">
                  <div className="testimony-quote-icon">
                    <FaQuoteLeft />
                  </div>
                  <div className="testimony-rating">
                    {[...Array(testimony.rating)].map((_, i) => (
                      <FaStar key={i} />
                    ))}
                  </div>
                  <p className="testimony-text-detailed">{testimony.quote}</p>
                  <div className="testimony-author-detailed">
                    <div className="author-name">{testimony.author}</div>
                    {testimony.role && <div className="author-role">{testimony.role}</div>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="testimonies-cta">
        <div className="container">
          <div className="cta-content">
            <h2>{getValue('testimonies_page', 'cta_title', 'Share Your Story')}</h2>
            <p>{getValue('testimonies_page', 'cta_description', "Have a testimony to share? We'd love to hear how God has worked in your life!")}</p>
            <Link 
              to={getValue('testimonies_page', 'cta_button_link', '/contact')} 
              className="btn btn-primary"
            >
              {getValue('testimonies_page', 'cta_button_text', 'Share Your Testimony')}
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Testimonies;
