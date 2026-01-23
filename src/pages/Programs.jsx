import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FaBook, 
  FaUsers, 
  FaMusic, 
  FaBaby, 
  FaUserFriends, 
  FaHandsHelping,
  FaCalendarAlt,
  FaClock
} from 'react-icons/fa';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './Programs.css';

const Programs = () => {
  const programs = [
    {
      icon: <FaBook />,
      title: 'Sunday Service',
      description: 'Join us every Sunday for worship, prayer, and inspiring messages from the Word. We have two service times to accommodate everyone.',
      time: '9:00 AM & 11:00 AM',
      day: 'Sunday'
    },
    {
      icon: <FaUsers />,
      title: 'Bible Study',
      description: 'Deep dive into Scripture with our weekly Bible study groups for all ages. Multiple groups available throughout the week.',
      time: '7:00 PM',
      day: 'Wednesday'
    },
    {
      icon: <FaMusic />,
      title: 'Worship Night',
      description: 'Experience powerful worship and praise every Friday evening. A time of intimate worship and prayer.',
      time: '7:30 PM',
      day: 'Friday'
    },
    {
      icon: <FaBaby />,
      title: "Children's Ministry",
      description: 'Nurturing young hearts with age-appropriate lessons and activities. Safe, fun, and engaging environment for kids.',
      time: 'During Services',
      day: 'Sunday'
    },
    {
      icon: <FaUserFriends />,
      title: 'Youth Group',
      description: 'Engaging programs for teenagers to grow in faith and build friendships. Relevant messages and fun activities.',
      time: '6:00 PM',
      day: 'Friday'
    },
    {
      icon: <FaHandsHelping />,
      title: 'Community Outreach',
      description: 'Making a difference in our community through service and love. Various outreach programs throughout the year.',
      time: 'Various Times',
      day: 'Various Days'
    }
  ];

  return (
    <div className="programs-page">
      <Header />
      
      <section className="programs-hero">
        <div className="container">
          <h1 className="page-title">Church Programs</h1>
          <p className="page-subtitle">Join us for worship, fellowship, and growth</p>
        </div>
      </section>

      <section className="programs-list">
        <div className="container">
          <div className="programs-grid">
            {programs.map((program, index) => (
              <div key={index} className="program-card-detailed">
                <div className="program-icon-large">
                  {program.icon}
                </div>
                <div className="program-info">
                  <h3>{program.title}</h3>
                  <div className="program-schedule">
                    <span className="schedule-item">
                      <FaCalendarAlt /> {program.day}
                    </span>
                    <span className="schedule-item">
                      <FaClock /> {program.time}
                    </span>
                  </div>
                  <p>{program.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="programs-cta">
        <div className="container">
          <div className="cta-content">
            <h2>Want to Get Involved?</h2>
            <p>We'd love to have you join us! Contact us to learn more about any of our programs.</p>
            <Link to="/contact" className="btn btn-primary">Contact Us</Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Programs;
