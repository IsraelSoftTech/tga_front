import React from 'react';
import { FaPrayingHands } from 'react-icons/fa';
import AdminHeader from '../components/AdminHeader';
import './AdminCommon.css';

const AdminPrayers = () => {
  return (
    <div className="admin-page">
      <AdminHeader />
      
      <section className="admin-section">
        <div className="container">
          <div className="admin-page-header">
            <h1>Admin - Prayer Requests</h1>
            <p>View and manage prayer requests</p>
          </div>

          <div className="admin-page-content">
            <div className="admin-placeholder">
              <FaPrayingHands className="placeholder-icon" />
              <h2>Coming Soon</h2>
              <p>Prayer requests management will be added here</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AdminPrayers;
