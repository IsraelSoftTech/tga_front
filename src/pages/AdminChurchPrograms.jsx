import React from 'react';
import { FaBook } from 'react-icons/fa';
import AdminHeader from '../components/AdminHeader';
import './AdminCommon.css';

const AdminChurchPrograms = () => {
  return (
    <div className="admin-page">
      <AdminHeader />
      
      <section className="admin-section">
        <div className="container">
          <div className="admin-page-header">
            <h1>Admin - Church Programs</h1>
            <p>Manage church programs and activities</p>
          </div>

          <div className="admin-page-content">
            <div className="admin-placeholder">
              <FaBook className="placeholder-icon" />
              <h2>Coming Soon</h2>
              <p>Church programs management will be added here</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AdminChurchPrograms;
