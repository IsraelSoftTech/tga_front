import React from 'react';
import { FaComments } from 'react-icons/fa';
import AdminHeader from '../components/AdminHeader';
import './AdminCommon.css';

const AdminTestimonies = () => {
  return (
    <div className="admin-page">
      <AdminHeader />
      
      <section className="admin-section">
        <div className="container">
          <div className="admin-page-header">
            <h1>Admin - Testimonies</h1>
            <p>Manage member testimonies and stories</p>
          </div>

          <div className="admin-page-content">
            <div className="admin-placeholder">
              <FaComments className="placeholder-icon" />
              <h2>Coming Soon</h2>
              <p>Testimonies management will be added here</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AdminTestimonies;
