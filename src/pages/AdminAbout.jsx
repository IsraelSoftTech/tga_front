import React from 'react';
import { FaInfoCircle } from 'react-icons/fa';
import AdminHeader from '../components/AdminHeader';
import './AdminCommon.css';

const AdminAbout = () => {
  return (
    <div className="admin-page">
      <AdminHeader />
      
      <section className="admin-section">
        <div className="container">
          <div className="admin-page-header">
            <h1>Admin - About</h1>
            <p>Manage about page content</p>
          </div>

          <div className="admin-page-content">
            <div className="admin-placeholder">
              <FaInfoCircle className="placeholder-icon" />
              <h2>Coming Soon</h2>
              <p>About page management will be added here</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AdminAbout;
