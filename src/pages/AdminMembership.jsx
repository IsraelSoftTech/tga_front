import React from 'react';
import { FaUserPlus } from 'react-icons/fa';
import AdminHeader from '../components/AdminHeader';
import './AdminCommon.css';

const AdminMembership = () => {
  return (
    <div className="admin-page">
      <AdminHeader />
      
      <section className="admin-section">
        <div className="container">
          <div className="admin-page-header">
            <h1>Admin - Membership Applications</h1>
            <p>View and manage membership applications</p>
          </div>

          <div className="admin-page-content">
            <div className="admin-placeholder">
              <FaUserPlus className="placeholder-icon" />
              <h2>Coming Soon</h2>
              <p>Membership applications management will be added here</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AdminMembership;
