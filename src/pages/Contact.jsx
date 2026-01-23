import React, { useState } from 'react';
import { 
  FaMapMarkerAlt, 
  FaPhone, 
  FaEnvelope, 
  FaClock,
  FaPaperPlane,
  FaCheckCircle
} from 'react-icons/fa';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './Contact.css';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
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
    console.log('Contact form submitted:', formData);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: '', email: '', subject: '', message: '' });
    }, 3000);
  };

  return (
    <div className="contact-page">
      <Header />
      
      <section className="contact-hero">
        <div className="container">
          <h1 className="page-title">Get In Touch</h1>
          <p className="page-subtitle">We'd love to hear from you</p>
        </div>
      </section>

      <section className="contact-main">
        <div className="container">
          <div className="contact-content-detailed">
            <div className="contact-info-detailed">
              <h2>Contact Information</h2>
              <p>Feel free to reach out to us through any of the following ways:</p>
              
              <div className="contact-items-detailed">
                <div className="contact-item-detailed">
                  <div className="contact-icon-detailed">
                    <FaMapMarkerAlt />
                  </div>
                  <div>
                    <h4>Address</h4>
                    <p>123 Church Street<br />Town Green, ST 12345</p>
                  </div>
                </div>
                <div className="contact-item-detailed">
                  <div className="contact-icon-detailed">
                    <FaPhone />
                  </div>
                  <div>
                    <h4>Phone</h4>
                    <p>(555) 123-4567</p>
                  </div>
                </div>
                <div className="contact-item-detailed">
                  <div className="contact-icon-detailed">
                    <FaEnvelope />
                  </div>
                  <div>
                    <h4>Email</h4>
                    <p>info@towngreenassembly.org</p>
                  </div>
                </div>
                <div className="contact-item-detailed">
                  <div className="contact-icon-detailed">
                    <FaClock />
                  </div>
                  <div>
                    <h4>Service Times</h4>
                    <p>Sunday: 9:00 AM & 11:00 AM<br />Wednesday: 7:00 PM</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="contact-form-detailed">
              <h2>Send Us a Message</h2>
              {submitted ? (
                <div className="success-message">
                  <FaCheckCircle />
                  <h3>Message Sent!</h3>
                  <p>Thank you for contacting us. We'll get back to you soon.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
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
                    <label htmlFor="subject">Subject *</label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      placeholder="What is this regarding?"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="message">Message *</label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows="6"
                      placeholder="Your message here..."
                    />
                  </div>
                  <button type="submit" className="btn btn-primary">
                    <FaPaperPlane /> Send Message
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Contact;
