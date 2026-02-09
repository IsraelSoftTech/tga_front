import React, { useState, useEffect } from 'react';
import { FaEdit, FaTrash, FaPrint, FaSave, FaTimes, FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaVenusMars, FaSpinner } from 'react-icons/fa';
import AdminHeader from '../components/AdminHeader';
import { membershipAPI } from '../api';
import './AdminCommon.css';
import './AdminMembership.css';

const AdminMembership = () => {
  const [memberships, setMemberships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit] = useState(10);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    loadMemberships();
  }, [currentPage]);

  const loadMemberships = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await membershipAPI.getAll(currentPage, limit);
      if (response.success) {
        setMemberships(response.data || []);
        setTotalPages(response.pagination?.totalPages || 1);
        setTotal(response.pagination?.total || 0);
      } else {
        setError(response.error || 'Failed to load memberships');
      }
    } catch (err) {
      console.error('Error loading memberships:', err);
      setError(err.message || 'Failed to load memberships');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (membership) => {
    setEditing(membership.id);
    setEditForm({
      full_name: membership.full_name || '',
      email: membership.email || '',
      phone: membership.phone || '',
      address: membership.address || '',
      sex: membership.sex || '',
      status: membership.status || 'pending'
    });
  };

  const handleCancelEdit = () => {
    setEditing(null);
    setEditForm({});
  };

  const handleSave = async (id) => {
    try {
      setSaving(true);
      const response = await membershipAPI.update(id, editForm);
      if (response.success) {
        // Update state directly instead of reloading
        setMemberships(prev => prev.map(m => m.id === id ? { ...m, ...editForm } : m));
        setEditing(null);
        setEditForm({});
      } else {
        setError(response.error || 'Failed to update membership');
      }
    } catch (err) {
      console.error('Error updating membership:', err);
      setError(err.message || 'Failed to update membership');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this membership application?')) {
      return;
    }

    try {
      setDeleting(id);
      const response = await membershipAPI.delete(id);
      if (response.success) {
        // Update state directly instead of reloading
        setMemberships(prev => prev.filter(m => m.id !== id));
        setTotal(prev => Math.max(0, prev - 1));
      } else {
        setError(response.error || 'Failed to delete membership');
      }
    } catch (err) {
      console.error('Error deleting membership:', err);
      setError(err.message || 'Failed to delete membership');
    } finally {
      setDeleting(null);
    }
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Membership Applications - ${new Date().toLocaleDateString()}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { color: #22c55e; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
            th { background-color: #22c55e; color: white; }
            tr:nth-child(even) { background-color: #f9f9f9; }
            .status { padding: 4px 8px; border-radius: 4px; font-weight: bold; }
            .status.pending { background-color: #fef3c7; color: #92400e; }
            .status.approved { background-color: #d1fae5; color: #065f46; }
            .status.rejected { background-color: #fee2e2; color: #991b1b; }
          </style>
        </head>
        <body>
          <h1>Membership Applications</h1>
          <p>Printed on: ${new Date().toLocaleString()}</p>
          <p>Total Applications: ${total}</p>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Address</th>
                <th>Sex</th>
                <th>Status</th>
                <th>Date Submitted</th>
              </tr>
            </thead>
            <tbody>
              ${memberships.map(m => `
                <tr>
                  <td>${m.id}</td>
                  <td>${m.full_name || 'N/A'}</td>
                  <td>${m.email || 'N/A'}</td>
                  <td>${m.phone || 'N/A'}</td>
                  <td>${m.address || 'N/A'}</td>
                  <td>${m.sex || 'N/A'}</td>
                  <td><span class="status ${m.status || 'pending'}">${(m.status || 'pending').toUpperCase()}</span></td>
                  <td>${new Date(m.created_at).toLocaleDateString()}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return 'status-approved';
      case 'rejected':
        return 'status-rejected';
      default:
        return 'status-pending';
    }
  };

  return (
    <div className="admin-page">
      <AdminHeader />
      
      <section className="admin-section">
        <div className="container">
          <div className="admin-page-header">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h1>Admin - Membership Applications</h1>
                <p>View and manage membership applications ({total} total)</p>
              </div>
              <button onClick={handlePrint} className="btn-print" title="Print list">
                <FaPrint /> Print
              </button>
            </div>
          </div>

          {error && (
            <div className="error-message" style={{ 
              padding: '1rem', 
              background: '#fee', 
              color: '#c33', 
              borderRadius: '8px', 
              marginBottom: '1rem',
              border: '1px solid #fcc'
            }}>
              {error}
              <button 
                onClick={() => setError(null)} 
                style={{ float: 'right', background: 'none', border: 'none', color: '#c33', cursor: 'pointer' }}
              >
                ×
              </button>
            </div>
          )}

          <div className="admin-page-content" style={{ padding: '2rem', display: 'block' }}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '3rem' }}>
                <FaSpinner className="spinner" />
                <p>Loading memberships...</p>
              </div>
            ) : memberships.length === 0 ? (
              <div className="admin-placeholder">
                <FaUser className="placeholder-icon" />
                <h2>No Applications Yet</h2>
                <p>Membership applications will appear here when submitted.</p>
              </div>
            ) : (
              <>
                <div className="membership-table-wrapper">
                  <table className="membership-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Address</th>
                        <th>Sex</th>
                        <th>Status</th>
                        <th>Date</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {memberships.map((membership) => (
                        <tr key={membership.id}>
                          {editing === membership.id ? (
                            <>
                              <td>{membership.id}</td>
                              <td>
                                <input
                                  type="text"
                                  value={editForm.full_name || ''}
                                  onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                                  placeholder="Full Name"
                                  className="edit-input"
                                />
                              </td>
                              <td>
                                <input
                                  type="email"
                                  value={editForm.email || ''}
                                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                  className="edit-input"
                                />
                              </td>
                              <td>
                                <input
                                  type="tel"
                                  value={editForm.phone || ''}
                                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                                  className="edit-input"
                                />
                              </td>
                              <td>
                                <textarea
                                  value={editForm.address || ''}
                                  onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                                  className="edit-input"
                                  rows="2"
                                />
                              </td>
                              <td>
                                <select
                                  value={editForm.sex || ''}
                                  onChange={(e) => setEditForm({ ...editForm, sex: e.target.value })}
                                  className="edit-input"
                                >
                                  <option value="">Select</option>
                                  <option value="male">Male</option>
                                  <option value="female">Female</option>
                                </select>
                              </td>
                              <td>
                                <select
                                  value={editForm.status || 'pending'}
                                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                                  className="edit-input"
                                >
                                  <option value="pending">Pending</option>
                                  <option value="approved">Approved</option>
                                  <option value="rejected">Rejected</option>
                                </select>
                              </td>
                              <td>{formatDate(membership.created_at)}</td>
                              <td>
                                <button
                                  onClick={() => handleSave(membership.id)}
                                  disabled={saving}
                                  className="btn-save-small"
                                  title="Save"
                                >
                                  <FaSave />
                                </button>
                                <button
                                  onClick={handleCancelEdit}
                                  disabled={saving}
                                  className="btn-cancel-small"
                                  title="Cancel"
                                >
                                  <FaTimes />
                                </button>
                              </td>
                            </>
                          ) : (
                            <>
                              <td>{membership.id}</td>
                              <td>
                                <strong>{membership.full_name || 'N/A'}</strong>
                              </td>
                              <td>{membership.email || 'N/A'}</td>
                              <td>{membership.phone || 'N/A'}</td>
                              <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {membership.address || 'N/A'}
                              </td>
                              <td>{membership.sex ? membership.sex.charAt(0).toUpperCase() + membership.sex.slice(1) : 'N/A'}</td>
                              <td>
                                <span className={`status-badge ${getStatusClass(membership.status)}`}>
                                  {(membership.status || 'pending').toUpperCase()}
                                </span>
                              </td>
                              <td>{formatDate(membership.created_at)}</td>
                              <td>
                                <button
                                  onClick={() => handleEdit(membership)}
                                  className="btn-edit-small"
                                  title="Edit"
                                  disabled={editing !== null}
                                >
                                  <FaEdit />
                                </button>
                                <button
                                  onClick={() => handleDelete(membership.id)}
                                  className="btn-delete-small"
                                  title="Delete"
                                  disabled={deleting === membership.id || editing !== null}
                                >
                                  {deleting === membership.id ? <FaSpinner className="spinner" /> : <FaTrash />}
                                </button>
                              </td>
                            </>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="pagination">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="pagination-btn"
                    >
                      Previous
                    </button>
                    <span className="pagination-info">
                      Page {currentPage} of {totalPages} ({total} total)
                    </span>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="pagination-btn"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default AdminMembership;
