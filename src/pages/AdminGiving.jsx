import React from 'react';
import { FaHandHoldingHeart } from 'react-icons/fa';
import AdminHeader from '../components/AdminHeader';
import './AdminCommon.css';

const AdminGiving = () => {
  return (
    <div className="admin-page">
      <AdminHeader />
      
      <section className="admin-section">
        <div className="container">
          <div className="admin-page-header">
            <h1>Admin - Giving Records</h1>
            <p>View and manage tithes, offerings, and donations</p>
          </div>

          <div className="admin-page-content">
            <div className="admin-placeholder">
              <FaHandHoldingHeart className="placeholder-icon" />
              <h2>Coming Soon</h2>
              <p>Giving records management will be added here</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AdminGiving;
