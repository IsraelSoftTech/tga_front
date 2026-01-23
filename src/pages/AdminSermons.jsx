import React from 'react';
import { FaVideo } from 'react-icons/fa';
import AdminHeader from '../components/AdminHeader';
import './AdminCommon.css';

const AdminSermons = () => {
  return (
    <div className="admin-page">
      <AdminHeader />
      
      <section className="admin-section">
        <div className="container">
          <div className="admin-page-header">
            <h1>Admin - Sermons</h1>
            <p>Manage sermons, videos, audio, and text messages</p>
          </div>

          <div className="admin-page-content">
            <div className="admin-placeholder">
              <FaVideo className="placeholder-icon" />
              <h2>Coming Soon</h2>
              <p>Sermons management will be added here</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AdminSermons;
