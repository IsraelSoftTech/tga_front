import React, { useState } from 'react';
import { FaPrayingHands, FaHeart, FaCheckCircle } from 'react-icons/fa';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './Prayers.css';

const Prayers = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    request: '',
    anonymous: false
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Connect to backend
    console.log('Prayer request submitted:', formData);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: '', email: '', request: '', anonymous: false });
    }, 3000);
  };

  return (
    <div className="prayers-page">
      <Header />
      
      <section className="prayers-hero">
        <div className="container">
          <div className="hero-content-prayers">
            <div className="prayer-icon-hero">
              <FaPrayingHands />
            </div>
            <h1 className="page-title">Prayer Requests</h1>
            <p className="page-subtitle">We believe in the power of prayer</p>
          </div>
        </div>
      </section>

      <section className="prayers-intro">
        <div className="container">
          <div className="intro-content">
            <h2>Share Your Prayer Request</h2>
            <p>
              We believe in the power of prayer. Share your prayer requests with us, 
              and our community will lift you up in prayer. Whether you're facing 
              challenges, celebrating victories, or seeking guidance, we're here for you.
            </p>
            <p>
              Your prayer requests are confidential and will be shared with our prayer 
              team. You can choose to remain anonymous if you prefer.
            </p>
          </div>
        </div>
      </section>

      <section className="prayers-form-section">
        <div className="container">
          <div className="form-container">
            {submitted ? (
              <div className="success-message">
                <FaCheckCircle />
                <h3>Thank You!</h3>
                <p>Your prayer request has been submitted. Our prayer team will be lifting you up.</p>
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
              <h3>Prayer Team</h3>
              <p>Our dedicated prayer team prays over every request submitted.</p>
            </div>
            <div className="info-card">
              <div className="info-icon"><FaHeart /></div>
              <h3>Confidential</h3>
              <p>All prayer requests are kept confidential and handled with care.</p>
            </div>
            <div className="info-card">
              <div className="info-icon"><FaCheckCircle /></div>
              <h3>Response</h3>
              <p>We'll follow up with you and keep you in our prayers.</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Prayers;
