import React from 'react';
import { FaEnvelope } from 'react-icons/fa';
import AdminHeader from '../components/AdminHeader';
import './AdminCommon.css';

const AdminContact = () => {
  return (
    <div className="admin-page">
      <AdminHeader />
      
      <section className="admin-section">
        <div className="container">
          <div className="admin-page-header">
            <h1>Admin - Contact Messages</h1>
            <p>View and manage contact form submissions</p>
          </div>

          <div className="admin-page-content">
            <div className="admin-placeholder">
              <FaEnvelope className="placeholder-icon" />
              <h2>Coming Soon</h2>
              <p>Contact messages management will be added here</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AdminContact;
