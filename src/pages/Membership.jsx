import React, { useState } from 'react';
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaVenusMars, FaCheckCircle } from 'react-icons/fa';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './Membership.css';

const Membership = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    sex: '',
    address: '',
    phone: '',
    email: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Connect to backend
    console.log('Membership form submitted:', formData);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ fullName: '', sex: '', address: '', phone: '', email: '' });
    }, 3000);
  };

  return (
    <div className="membership-page">
      <Header />
      
      <section className="membership-hero">
        <div className="container">
          <h1 className="page-title">Become our member</h1>
          <p className="page-subtitle">Join our community of faith, hope, and love</p>
        </div>
      </section>

      <section className="membership-form-section">
        <div className="container">
          <div className="form-wrapper">
            {submitted ? (
              <div className="success-message">
                <FaCheckCircle />
                <h3>Thank You!</h3>
                <p>Your membership application has been submitted successfully. We'll be in touch with you soon!</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="membership-form">
                <div className="form-group">
                  <label htmlFor="fullName">
                    <FaUser /> Full Name *
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                    placeholder="Enter your full name"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="sex">
                    <FaVenusMars /> Sex *
                  </label>
                  <select
                    id="sex"
                    name="sex"
                    value={formData.sex}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select your sex</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="address">
                    <FaMapMarkerAlt /> Address *
                  </label>
                  <textarea
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    required
                    rows="3"
                    placeholder="Enter your full address"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="phone">
                    <FaPhone /> Phone Number *
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    placeholder="Enter your phone number"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">
                    <FaEnvelope /> Email (Optional)
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email address"
                  />
                </div>

                <button type="submit" className="submit-btn">
                  Submit Application
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      <section className="membership-info">
        <div className="container">
          <div className="info-content">
            <h2>Why Become a Member?</h2>
            <p>
              Becoming a member of Town Green Assembly means joining a family committed to 
              growing in faith, serving our community, and supporting one another in our 
              spiritual journey. As a member, you'll have opportunities to:
            </p>
            <ul>
              <li>Participate in church governance and decision-making</li>
              <li>Join specialized ministry groups and programs</li>
              <li>Receive pastoral care and support</li>
              <li>Connect with a community of believers</li>
              <li>Grow in your faith through discipleship programs</li>
            </ul>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Membership;
