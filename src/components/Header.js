import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaBars, FaTimes } from 'react-icons/fa';
import { homeAPI } from '../api';
import './Header.css';

const Header = () => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [logo, setLogo] = useState(null);

  // Close menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  // Load logo
  useEffect(() => {
    const loadLogo = async () => {
      try {
        const response = await homeAPI.getContent();
        if (response.success && response.data?.site?.logo?.value) {
          setLogo(response.data.site.logo.value);
        }
      } catch (error) {
        console.error('Error loading logo:', error);
      }
    };
    loadLogo();
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      const sidebar = document.querySelector('.mobile-sidebar');
      const overlay = document.querySelector('.mobile-sidebar-overlay');
      const toggle = document.querySelector('.mobile-menu-toggle');
      
      if (isMenuOpen && 
          !sidebar?.contains(event.target) && 
          !toggle?.contains(event.target) &&
          (overlay?.contains(event.target) || !event.target.closest('.header'))) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <>
      <header className="header">
        <div className="header-container">
          <Link to="/" className="logo-section">
            {logo ? (
              <img src={logo} alt="Church Logo" className="church-logo" />
            ) : (
              <div className="logo-placeholder">
                {/* Logo will be uploaded by admin */}
              </div>
            )}
            <h1 className="church-name">Fgm Town Green B'da</h1>
          </Link>
          <nav className="nav-menu desktop-menu">
            <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>Home</Link>
            <Link to="/about" className={`nav-link ${location.pathname === '/about' ? 'active' : ''}`}>About</Link>
            <Link to="/programs" className={`nav-link ${location.pathname === '/programs' ? 'active' : ''}`}>Church Programs</Link>
            <Link to="/sermons" className={`nav-link ${location.pathname === '/sermons' ? 'active' : ''}`}>Sermons</Link>
            <Link to="/testimonies" className={`nav-link ${location.pathname === '/testimonies' ? 'active' : ''}`}>Testimonies</Link>
            <Link to="/prayers" className={`nav-link ${location.pathname === '/prayers' ? 'active' : ''}`}>Prayers</Link>
            <Link to="/contact" className={`nav-link ${location.pathname === '/contact' ? 'active' : ''}`}>Contact</Link>
            <Link to="/membership" className={`nav-link ${location.pathname === '/membership' ? 'active' : ''}`}>Membership</Link>
            <Link to="/giving" className={`nav-link ${location.pathname === '/giving' ? 'active' : ''}`}>Giving</Link>
            <Link to="/admin" className="nav-link admin-link">Admin</Link>
          </nav>
          <button className="mobile-menu-toggle" onClick={toggleMenu} aria-label="Toggle menu">
            {isMenuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
      </header>
      
      {/* Mobile Sidebar */}
      <div className={`mobile-sidebar-overlay ${isMenuOpen ? 'active' : ''}`} onClick={() => setIsMenuOpen(false)}></div>
      <nav className={`mobile-sidebar ${isMenuOpen ? 'active' : ''}`}>
        <div className="mobile-sidebar-header">
          <h2>Fgm Town Green B'da</h2>
          <button className="mobile-close-btn" onClick={toggleMenu} aria-label="Close menu">
            <FaTimes />
          </button>
        </div>
        <div className="mobile-nav-links">
          <Link to="/" className={`mobile-nav-link ${location.pathname === '/' ? 'active' : ''}`} onClick={toggleMenu}>
            Home
          </Link>
          <Link to="/about" className={`mobile-nav-link ${location.pathname === '/about' ? 'active' : ''}`} onClick={toggleMenu}>
            About
          </Link>
          <Link to="/programs" className={`mobile-nav-link ${location.pathname === '/programs' ? 'active' : ''}`} onClick={toggleMenu}>
            Church Programs
          </Link>
          <Link to="/sermons" className={`mobile-nav-link ${location.pathname === '/sermons' ? 'active' : ''}`} onClick={toggleMenu}>
            Sermons
          </Link>
          <Link to="/testimonies" className={`mobile-nav-link ${location.pathname === '/testimonies' ? 'active' : ''}`} onClick={toggleMenu}>
            Testimonies
          </Link>
          <Link to="/prayers" className={`mobile-nav-link ${location.pathname === '/prayers' ? 'active' : ''}`} onClick={toggleMenu}>
            Prayers
          </Link>
          <Link to="/contact" className={`mobile-nav-link ${location.pathname === '/contact' ? 'active' : ''}`} onClick={toggleMenu}>
            Contact
          </Link>
          <Link to="/membership" className={`mobile-nav-link ${location.pathname === '/membership' ? 'active' : ''}`} onClick={toggleMenu}>
            Membership
          </Link>
          <Link to="/giving" className={`mobile-nav-link ${location.pathname === '/giving' ? 'active' : ''}`} onClick={toggleMenu}>
            Giving
          </Link>
          <Link to="/admin" className="mobile-nav-link admin-link-mobile" onClick={toggleMenu}>
            Admin
          </Link>
        </div>
      </nav>
    </>
  );
};

export default Header;
