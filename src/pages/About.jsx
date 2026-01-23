import React from 'react';
import { FaHeart, FaHandsHelping, FaUsers, FaBook } from 'react-icons/fa';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './About.css';

const About = () => {
  return (
    <div className="about-page">
      <Header />
      
      <section className="about-hero">
        <div className="container">
          <h1 className="page-title">About Town Green Assembly</h1>
          <p className="page-subtitle">Building a community of faith, hope, and love</p>
        </div>
      </section>

      <section className="about-mission">
        <div className="container">
          <div className="mission-content">
            <div className="mission-text">
              <h2>Our Mission</h2>
              <p>
                Town Green Assembly is a vibrant community of believers dedicated to 
                spreading the message of hope, love, and faith. We are committed to 
                building strong relationships with God and each other, creating a 
                welcoming environment for all who seek spiritual growth and fellowship.
              </p>
              <p>
                Our mission is to serve our community, nurture spiritual development, 
                and make a positive impact in the lives of those around us. We believe 
                in the power of prayer, the importance of community, and the transformative 
                message of the Gospel.
              </p>
            </div>
            <div className="mission-image">
              <div className="mission-placeholder">
                <FaHeart />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="about-values">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Our Values</h2>
            <div className="title-underline"></div>
          </div>
          <div className="values-grid">
            <div className="value-card">
              <div className="value-icon"><FaHeart /></div>
              <h3>Love</h3>
              <p>We believe in showing unconditional love to everyone, just as Christ loved us.</p>
            </div>
            <div className="value-card">
              <div className="value-icon"><FaHandsHelping /></div>
              <h3>Service</h3>
              <p>We are called to serve our community and make a positive difference in the world.</p>
            </div>
            <div className="value-card">
              <div className="value-icon"><FaUsers /></div>
              <h3>Community</h3>
              <p>We foster genuine relationships and support one another in our faith journey.</p>
            </div>
            <div className="value-card">
              <div className="value-icon"><FaBook /></div>
              <h3>Truth</h3>
              <p>We are committed to teaching and living out the truth of God's Word.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="about-history">
        <div className="container">
          <div className="history-content">
            <h2>Our History</h2>
            <p>
              Founded over 15 years ago, Town Green Assembly began as a small group 
              of believers who wanted to create a place where people could experience 
              the love of God in a genuine and authentic way. What started as a humble 
              gathering has grown into a thriving community of over 500 members.
            </p>
            <p>
              Throughout our journey, we have remained committed to our core values 
              of love, service, community, and truth. We have seen countless lives 
              transformed, families strengthened, and communities impacted through 
              the power of the Gospel.
            </p>
            <p>
              Today, we continue to grow and expand our reach, always staying true 
              to our mission of building a community where everyone can find hope, 
              healing, and purpose in Christ.
            </p>
          </div>
        </div>
      </section>

      <section className="about-stats">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-number">500+</div>
              <div className="stat-label">Active Members</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">15+</div>
              <div className="stat-label">Years of Service</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">20+</div>
              <div className="stat-label">Ministry Programs</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">50+</div>
              <div className="stat-label">Community Events</div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
