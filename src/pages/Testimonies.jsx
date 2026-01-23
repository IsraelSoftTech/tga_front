import React from 'react';
import { Link } from 'react-router-dom';
import { FaQuoteLeft, FaStar } from 'react-icons/fa';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './Testimonies.css';

const Testimonies = () => {
  const testimonies = [
    {
      quote: "Town Green Assembly has been a blessing in my life. The community here is warm, welcoming, and truly cares about each other. I've found a family here that I never knew I needed.",
      author: "Sarah M.",
      role: "Member since 2018",
      rating: 5
    },
    {
      quote: "I found hope and purpose here. The messages are inspiring and the worship is powerful. This is truly a place where God moves. My life has been transformed since joining.",
      author: "John D.",
      role: "Member since 2020",
      rating: 5
    },
    {
      quote: "My family has grown so much spiritually since joining. The children's ministry is excellent and my kids love coming to church. We're grateful for this community.",
      author: "Maria L.",
      role: "Member since 2019",
      rating: 5
    },
    {
      quote: "The love and support I've received here during difficult times has been incredible. This church truly lives out what it preaches. I'm blessed to be part of this family.",
      author: "Robert K.",
      role: "Member since 2017",
      rating: 5
    },
    {
      quote: "I came here broken and lost, but through the ministry and community, I found healing and restoration. God is truly at work in this place.",
      author: "Jennifer T.",
      role: "Member since 2021",
      rating: 5
    },
    {
      quote: "The teaching is solid, the worship is authentic, and the people are genuine. This is more than a church - it's a family. I'm so grateful to be here.",
      author: "Michael P.",
      role: "Member since 2019",
      rating: 5
    }
  ];

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
                  <div className="author-role">{testimony.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="testimonies-cta">
        <div className="container">
          <div className="cta-content">
            <h2>Share Your Story</h2>
            <p>Have a testimony to share? We'd love to hear how God has worked in your life!</p>
            <Link to="/contact" className="btn btn-primary">Share Your Testimony</Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Testimonies;
