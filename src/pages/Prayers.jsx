import React, { useState, useEffect } from 'react';
import { FaPrayingHands, FaHeart, FaCheckCircle } from 'react-icons/fa';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { homeAPI, prayersAPI } from '../api';
import './Prayers.css';

const Prayers = () => {
  const [content, setContent] = useState({});
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    request: '',
    anonymous: false
  });
  const [submitted, setSubmitted] = useState(false);

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

  const getValue = (key, defaultValue = '') => {
    return content?.prayers_page?.[key]?.value || defaultValue;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await prayersAPI.submit({
        requester_name: formData.anonymous ? 'Anonymous' : formData.name,
        request_text: formData.request,
        is_anonymous: formData.anonymous,
        email: formData.email,
        phone: formData.phone
      });
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setFormData({ name: '', email: '', phone: '', request: '', anonymous: false });
      }, 3000);
    } catch (error) {
      console.error('Error submitting prayer request:', error);
      alert('Failed to submit prayer request. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="prayers-page">
        <Header />
        <div style={{ padding: '3rem', textAlign: 'center' }}>Loading...</div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="prayers-page">
      <Header />
      
      <section className="prayers-hero">
        <div className="container">
          <div className="hero-content-prayers">
            <div className="prayer-icon-hero">
              <FaPrayingHands />
            </div>
            <h1 className="page-title">{getValue('hero_title', 'Prayer Requests')}</h1>
            <p className="page-subtitle">{getValue('hero_subtitle', 'We believe in the power of prayer')}</p>
          </div>
        </div>
      </section>

      <section className="prayers-intro">
        <div className="container">
          <div className="intro-content">
            <h2>{getValue('intro_title', 'Share Your Prayer Request')}</h2>
            <p>{getValue('intro_text1', 'We believe in the power of prayer. Share your prayer requests with us, and our community will lift you up in prayer. Whether you\'re facing challenges, celebrating victories, or seeking guidance, we\'re here for you.')}</p>
            <p>{getValue('intro_text2', 'Your prayer requests are confidential and will be shared with our prayer team. You can choose to remain anonymous if you prefer.')}</p>
          </div>
        </div>
      </section>

      <section className="prayers-form-section">
        <div className="container">
          <div className="form-container">
            {submitted ? (
              <div className="success-message">
                <FaCheckCircle />
                <h3>{getValue('success_title', 'Thank You!')}</h3>
                <p>{getValue('success_message', 'Your prayer request has been submitted. Our prayer team will be lifting you up.')}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="prayer-form">
                <div className="form-group">
                  <label htmlFor="name">Your Name *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Enter your name"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="email">Your Email *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="Enter your email"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="phone">Phone Number</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Enter your phone number (optional)"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="request">Prayer Request *</label>
                  <textarea
                    id="request"
                    name="request"
                    value={formData.request}
                    onChange={handleChange}
                    required
                    rows="6"
                    placeholder="Share your prayer request here..."
                  />
                </div>
                <div className="form-group checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      name="anonymous"
                      checked={formData.anonymous}
                      onChange={handleChange}
                    />
                    <span>Submit anonymously</span>
                  </label>
                </div>
                <button type="submit" className="btn btn-primary">
                  <FaHeart /> Submit Prayer Request
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      <section className="prayers-info">
        <div className="container">
          <div className="info-grid">
            <div className="info-card">
              <div className="info-icon"><FaPrayingHands /></div>
              <h3>{getValue('info_card1_title', 'Prayer Team')}</h3>
              <p>{getValue('info_card1_description', 'Our dedicated prayer team prays over every request submitted.')}</p>
            </div>
            <div className="info-card">
              <div className="info-icon"><FaHeart /></div>
              <h3>{getValue('info_card2_title', 'Confidential')}</h3>
              <p>{getValue('info_card2_description', 'All prayer requests are kept confidential and handled with care.')}</p>
            </div>
            <div className="info-card">
              <div className="info-icon"><FaCheckCircle /></div>
              <h3>{getValue('info_card3_title', 'Response')}</h3>
              <p>{getValue('info_card3_description', 'We\'ll follow up with you and keep you in our prayers.')}</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Prayers;
