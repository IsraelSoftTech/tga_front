import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FaBook, 
  FaUsers, 
  FaMusic, 
  FaBaby, 
  FaUserFriends, 
  FaHandsHelping,
  FaCalendarAlt,
  FaClock,
  FaMapMarkerAlt
} from 'react-icons/fa';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { programsAPI } from '../api';
import './Programs.css';

const Programs = () => {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadPrograms = async () => {
    try {
      setLoading(true);
      console.log('🔄 Loading programs...');
      const response = await programsAPI.getAll();
      console.log('📥 Programs API response:', response);
      
      if (response.success) {
        const programsData = response.data || [];
        console.log(`✅ Loaded ${programsData.length} programs:`, programsData);
        setPrograms(programsData);
      } else {
        console.error('❌ API returned success=false:', response);
        setPrograms([]);
      }
    } catch (error) {
      console.error('❌ Error loading programs:', error);
      setPrograms([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPrograms();
  }, []);

  // Refresh programs when window regains focus (helps when admin updates data)
  useEffect(() => {
    const handleFocus = () => {
      loadPrograms();
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  // Map program titles to icons (fallback if no image)
  const getProgramIcon = (title) => {
    const titleLower = title.toLowerCase();
    if (titleLower.includes('sunday') || titleLower.includes('service')) {
      return <FaBook />;
    } else if (titleLower.includes('bible') || titleLower.includes('study')) {
      return <FaUsers />;
    } else if (titleLower.includes('worship')) {
      return <FaMusic />;
    } else if (titleLower.includes('children') || titleLower.includes('kids')) {
      return <FaBaby />;
    } else if (titleLower.includes('youth') || titleLower.includes('teen')) {
      return <FaUserFriends />;
    } else if (titleLower.includes('outreach') || titleLower.includes('community')) {
      return <FaHandsHelping />;
    }
    return <FaBook />; // Default icon
  };

  if (loading) {
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
            <div className="loading-message"></div>
          </div>
        </section>
        <Footer />
      </div>
    );
  }

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
          {programs.length === 0 ? (
            <div className="empty-programs">
              <p>No programs available at this time. Please check back later.</p>
            </div>
          ) : (
            <div className="programs-grid">
              {programs.map((program) => (
                <div key={program.id} className="program-card-detailed">
                  {program.image_url ? (
                    <div className="program-image-large">
                      <img src={program.image_url} alt={program.title} />
                    </div>
                  ) : (
                    <div className="program-icon-large">
                      {getProgramIcon(program.title)}
                    </div>
                  )}
                  <div className="program-info">
                    <h3>{program.title}</h3>
                    <div className="program-schedule">
                      {program.day_of_week && (
                        <span className="schedule-item">
                          <FaCalendarAlt /> {program.day_of_week}
                        </span>
                      )}
                      {program.time && (
                        <span className="schedule-item">
                          <FaClock /> {program.time}
                        </span>
                      )}
                      {program.location && (
                        <span className="schedule-item">
                          <FaMapMarkerAlt /> {program.location}
                        </span>
                      )}
                    </div>
                    {program.description && <p>{program.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
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
