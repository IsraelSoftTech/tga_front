import React, { useState, useEffect } from 'react';
import { FaHeart, FaHandsHelping, FaUsers, FaBook } from 'react-icons/fa';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { homeAPI } from '../api';
import './About.css';

const About = () => {
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState({});

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    try {
      const response = await homeAPI.getContent();
      if (response.success) {
        setContent(response.data || {});
      }
    } catch (error) {
      console.error('Error loading about content:', error);
      // Continue with default content if API fails
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 500);
    }
  };

  const getValue = (section, key, defaultValue = '') => {
    return content[section]?.[key]?.value || defaultValue;
  };

  const valueIcons = [FaHeart, FaHandsHelping, FaUsers, FaBook];

  if (loading) {
    return (
      <div className="about-page">
        <Header />
        <div style={{ padding: '4rem 0', textAlign: 'center' }}>Loading...</div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="about-page">
      <Header />
      
      <section className="about-hero">
        <div className="container">
          <h1 className="page-title">{getValue('about_page', 'hero_title', 'About Town Green Assembly')}</h1>
          <p className="page-subtitle">{getValue('about_page', 'hero_subtitle', 'Building a community of faith, hope, and love')}</p>
        </div>
      </section>

      <section className="about-mission">
        <div className="container">
          <div className="mission-content">
            <div className="mission-text">
              <h2>{getValue('about_page', 'mission_title', 'Our Mission')}</h2>
              <p dangerouslySetInnerHTML={{ __html: getValue('about_page', 'mission_text1', 'Town Green Assembly is a vibrant community of believers dedicated to spreading the message of hope, love, and faith. We are committed to building strong relationships with God and each other, creating a welcoming environment for all who seek spiritual growth and fellowship.').replace(/\n/g, '<br />') }} />
              <p dangerouslySetInnerHTML={{ __html: getValue('about_page', 'mission_text2', 'Our mission is to serve our community, nurture spiritual development, and make a positive impact in the lives of those around us. We believe in the power of prayer, the importance of community, and the transformative message of the Gospel.').replace(/\n/g, '<br />') }} />
            </div>
            <div className="mission-image">
              {getValue('about_page', 'mission_image') ? (
                <div style={{
                  width: '300px',
                  height: '300px',
                  borderRadius: '50%',
                  overflow: 'hidden',
                  boxShadow: '0 10px 30px rgba(34, 197, 94, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <img 
                    src={getValue('about_page', 'mission_image')} 
                    alt="Mission" 
                    style={{ 
                      width: '100%', 
                      height: '100%', 
                      objectFit: 'cover' 
                    }}
                  />
                </div>
              ) : (
                <div className="mission-placeholder">
                  <FaHeart />
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="about-values">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">{getValue('about_page', 'values_title', 'Our Values')}</h2>
            <div className="title-underline"></div>
          </div>
          <div className="values-grid">
            {[1, 2, 3, 4].map((num) => {
              const IconComponent = valueIcons[num - 1];
              const defaultTitles = ['Love', 'Service', 'Community', 'Truth'];
              const defaultDescriptions = [
                "We believe in showing unconditional love to everyone, just as Christ loved us.",
                "We are called to serve our community and make a positive difference in the world.",
                "We foster genuine relationships and support one another in our faith journey.",
                "We are committed to teaching and living out the truth of God's Word."
              ];
              
              return (
                <div key={num} className="value-card">
                  <div className="value-icon"><IconComponent /></div>
                  <h3>{getValue('about_page', `value${num}_title`, defaultTitles[num - 1])}</h3>
                  <p>{getValue('about_page', `value${num}_description`, defaultDescriptions[num - 1])}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="about-history">
        <div className="container">
          <div className="history-content">
            <h2>{getValue('about_page', 'history_title', 'Our History')}</h2>
            <p dangerouslySetInnerHTML={{ __html: getValue('about_page', 'history_text1', 'Founded over 15 years ago, Town Green Assembly began as a small group of believers who wanted to create a place where people could experience the love of God in a genuine and authentic way. What started as a humble gathering has grown into a thriving community of over 500 members.').replace(/\n/g, '<br />') }} />
            <p dangerouslySetInnerHTML={{ __html: getValue('about_page', 'history_text2', 'Throughout our journey, we have remained committed to our core values of love, service, community, and truth. We have seen countless lives transformed, families strengthened, and communities impacted through the power of the Gospel.').replace(/\n/g, '<br />') }} />
            <p dangerouslySetInnerHTML={{ __html: getValue('about_page', 'history_text3', 'Today, we continue to grow and expand our reach, always staying true to our mission of building a community where everyone can find hope, healing, and purpose in Christ.').replace(/\n/g, '<br />') }} />
          </div>
        </div>
      </section>

      <section className="about-stats">
        <div className="container">
          <div className="stats-grid">
            {[1, 2, 3, 4].map((num) => {
              const defaultNumbers = ['500+', '15+', '20+', '50+'];
              const defaultLabels = ['Active Members', 'Years of Service', 'Ministry Programs', 'Community Events'];
              
              return (
                <div key={num} className="stat-card">
                  <div className="stat-number">{getValue('about_page', `stat${num}_number`, defaultNumbers[num - 1])}</div>
                  <div className="stat-label">{getValue('about_page', `stat${num}_label`, defaultLabels[num - 1])}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
