import React, { useState, useEffect } from 'react';
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
import { homeAPI, contactAPI } from '../api';
import './Contact.css';

const Contact = () => {
  const [content, setContent] = useState({});
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
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
    return content?.contact_page?.[key]?.value || defaultValue;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await contactAPI.submit(formData);
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setFormData({ name: '', email: '', subject: '', message: '' });
      }, 3000);
    } catch (error) {
      console.error('Error submitting contact form:', error);
      alert('Failed to send message. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="contact-page">
        <Header />
        <div style={{ padding: '3rem', textAlign: 'center' }}>Loading...</div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="contact-page">
      <Header />
      
      <section className="contact-hero">
        <div className="container">
          <h1 className="page-title">{getValue('hero_title', 'Get In Touch')}</h1>
          <p className="page-subtitle">{getValue('hero_subtitle', 'We\'d love to hear from you')}</p>
        </div>
      </section>

      <section className="contact-main">
        <div className="container">
          <div className="contact-content-detailed">
            <div className="contact-info-detailed">
              <h2>{getValue('info_title', 'Contact Information')}</h2>
              <p>{getValue('info_description', 'Feel free to reach out to us through any of the following ways:')}</p>
              
              <div className="contact-items-detailed">
                <div className="contact-item-detailed">
                  <div className="contact-icon-detailed">
                    <FaMapMarkerAlt />
                  </div>
                  <div>
                    <h4>Address</h4>
                    <p dangerouslySetInnerHTML={{ __html: getValue('address', '123 Church Street<br />Town Green, ST 12345') }} />
                  </div>
                </div>
                <div className="contact-item-detailed">
                  <div className="contact-icon-detailed">
                    <FaPhone />
                  </div>
                  <div>
                    <h4>Phone</h4>
                    <p>{getValue('phone', '(555) 123-4567')}</p>
                  </div>
                </div>
                <div className="contact-item-detailed">
                  <div className="contact-icon-detailed">
                    <FaEnvelope />
                  </div>
                  <div>
                    <h4>Email</h4>
                    <p>{getValue('email', 'info@towngreenassembly.org')}</p>
                  </div>
                </div>
                <div className="contact-item-detailed">
                  <div className="contact-icon-detailed">
                    <FaClock />
                  </div>
                  <div>
                    <h4>Service Times</h4>
                    <p dangerouslySetInnerHTML={{ __html: getValue('service_times', 'Sunday: 9:00 AM & 11:00 AM<br />Wednesday: 7:00 PM') }} />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="contact-form-detailed">
              <h2>{getValue('form_title', 'Send Us a Message')}</h2>
              {submitted ? (
                <div className="success-message">
                  <FaCheckCircle />
                  <h3>{getValue('success_title', 'Message Sent!')}</h3>
                  <p>{getValue('success_message', 'Thank you for contacting us. We\'ll get back to you soon.')}</p>
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
