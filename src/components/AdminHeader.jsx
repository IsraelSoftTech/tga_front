import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaHome, FaInfoCircle, FaBook, FaVideo, FaComments, FaPrayingHands, FaEnvelope, FaUserPlus, FaHandHoldingHeart, FaSignOutAlt, FaBars, FaTimes } from 'react-icons/fa';
import './AdminHeader.css';

const AdminHeader = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Close menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    navigate('/admin');
  };

  const adminMenuItems = [
    { path: '/admin/home', label: 'Home', icon: <FaHome /> },
    { path: '/admin/about', label: 'About', icon: <FaInfoCircle /> },
    { path: '/admin/programs', label: 'Church Programs', icon: <FaBook /> },
    { path: '/admin/sermons', label: 'Sermons', icon: <FaVideo /> },
    { path: '/admin/testimonies', label: 'Testimonies', icon: <FaComments /> },
    { path: '/admin/prayers', label: 'Prayers', icon: <FaPrayingHands /> },
    { path: '/admin/contact', label: 'Contact', icon: <FaEnvelope /> },
    { path: '/admin/membership', label: 'Membership', icon: <FaUserPlus /> },
    { path: '/admin/giving', label: 'Giving', icon: <FaHandHoldingHeart /> },
  ];

  return (
    <>
      {/* Sidebar for all screen sizes */}
      <nav className={`admin-sidebar ${isMenuOpen ? 'mobile-open' : ''}`}>
        <div className="admin-sidebar-header">
          <Link to="/admin/home" className="admin-logo-link">
            <h2 className="admin-church-name">TGA Admin Panel</h2>
          </Link>
          <button className="admin-sidebar-close-btn" onClick={() => setIsMenuOpen(false)}>
            <FaTimes />
          </button>
        </div>
        <div className="admin-sidebar-nav-links">
          {adminMenuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`admin-sidebar-nav-link ${location.pathname === item.path ? 'active' : ''}`}
              onClick={() => setIsMenuOpen(false)}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          ))}
        </div>
        <div className="admin-sidebar-footer">
          <button className="admin-sidebar-logout-btn" onClick={handleLogout}>
            <FaSignOutAlt /> Logout
          </button>
        </div>
      </nav>

      {/* Mobile overlay */}
      <div className={`admin-sidebar-overlay ${isMenuOpen ? 'active' : ''}`} onClick={() => setIsMenuOpen(false)}></div>

      {/* Mobile menu toggle button */}
      <button className="admin-mobile-menu-toggle" onClick={() => setIsMenuOpen(!isMenuOpen)}>
        {isMenuOpen ? <FaTimes /> : <FaBars />}
      </button>
    </>
  );
};

export default AdminHeader;
