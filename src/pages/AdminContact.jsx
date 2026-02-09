import React, { useState, useEffect } from 'react';
import { FaSave, FaTrash, FaEdit, FaTimes, FaEnvelope, FaSpinner, FaCheckCircle } from 'react-icons/fa';
import AdminHeader from '../components/AdminHeader';
import Toast from '../components/Toast';
import { homeAPI, contactAPI } from '../api';
import './AdminCommon.css';
import './AdminHome.css';
import './AdminMembership.css';

const AdminContact = () => {
  const [content, setContent] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(null);
  const [toast, setToast] = useState(null);
  const [contactMessages, setContactMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [viewingMessage, setViewingMessage] = useState(null);

  useEffect(() => {
    loadContent();
    loadContactMessages();
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const loadContent = async () => {
    try {
      setLoading(true);
      const response = await homeAPI.getContent();
      if (response.success) {
        setContent(response.data || {});
      }
    } catch (error) {
      console.error('Error loading content:', error);
      showToast('Failed to load content. Please refresh the page.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getValue = (section, key, defaultValue = '') => {
    return content[section]?.[key]?.value || defaultValue;
  };

  const getContentId = (section, key) => {
    return content[section]?.[key]?.id;
  };

  const loadContactMessages = async () => {
    try {
      setLoadingMessages(true);
      const response = await contactAPI.getAll();
      if (response.success) {
        setContactMessages(response.data || []);
      }
    } catch (error) {
      console.error('Error loading contact messages:', error);
      showToast('Failed to load contact messages', 'error');
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      const response = await contactAPI.markAsRead(id);
      if (response.success) {
        setContactMessages(prev => prev.map(m => m.id === id ? { ...m, is_read: true } : m));
        showToast('Message marked as read', 'success');
      }
    } catch (error) {
      console.error('Error marking message as read:', error);
      showToast('Failed to update message', 'error');
    }
  };

  const handleDeleteMessage = async (id) => {
    if (!window.confirm('Are you sure you want to delete this contact message?')) {
      return;
    }

    try {
      setDeleting(id);
      const response = await contactAPI.delete(id);
      if (response.success) {
        setContactMessages(prev => prev.filter(m => m.id !== id));
        showToast('Message deleted successfully', 'success');
      }
    } catch (error) {
      console.error('Error deleting contact message:', error);
      showToast('Failed to delete message', 'error');
    } finally {
      setDeleting(null);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleSave = async (section, key, value, type = 'text', order = 0) => {
    try {
      setSaving(true);
      const response = await homeAPI.updateContent(section, key, value, type, order);
      if (response.success) {
        // Update state directly instead of reloading
        setContent(prev => {
          const newContent = { ...prev };
          if (!newContent[section]) {
            newContent[section] = {};
          }
          newContent[section] = {
            ...newContent[section],
            [key]: {
              id: response.data?.id || getContentId(section, key) || Date.now(),
              value: value,
              type: type,
              order: order
            }
          };
          return newContent;
        });
        setEditing(null);
        showToast('✨ Content saved successfully! Changes are now live.', 'success');
      } else {
        showToast('Failed to save: ' + (response.error || 'Unknown error'), 'error');
      }
    } catch (error) {
      console.error('Error saving content:', error);
      showToast('Failed to save content. Please try again.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (section, key) => {
    if (!window.confirm('Are you sure you want to delete this content?')) {
      return;
    }

    try {
      const contentId = getContentId(section, key);
      const contentValue = getValue(section, key);
      
      if (!contentId) {
        showToast('Content not found', 'error');
        return;
      }

      const response = await homeAPI.deleteContent(contentId, contentValue);
      if (response.success) {
        // Update state directly instead of reloading
        setContent(prev => {
          const newContent = { ...prev };
          if (newContent[section] && newContent[section][key]) {
            const { [key]: removed, ...rest } = newContent[section];
            newContent[section] = rest;
          }
          return newContent;
        });
        showToast('🗑️ Content deleted successfully!', 'success');
      } else {
        showToast('Failed to delete: ' + (response.error || 'Unknown error'), 'error');
      }
    } catch (error) {
      console.error('Error deleting content:', error);
      showToast('Failed to delete content. Please try again.', 'error');
    }
  };

  const EditableText = ({ section, contentKey, label, defaultValue, multiline = false, order = 0 }) => {
    const [value, setValue] = useState(getValue(section, contentKey, defaultValue));
    const isEditing = editing === `${section}_${contentKey}`;

    useEffect(() => {
      setValue(getValue(section, contentKey, defaultValue));
    }, [content, section, contentKey, defaultValue]);

    if (isEditing) {
      return (
        <div className="admin-editable-field">
          <label>{label}</label>
          {multiline ? (
            <textarea
              value={value}
              onChange={(e) => setValue(e.target.value)}
              rows={multiline === true ? 4 : multiline}
              className="admin-input"
            />
          ) : (
            <input
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="admin-input"
            />
          )}
          <div className="admin-field-actions">
            <button
              onClick={() => handleSave(section, contentKey, value, 'text', order)}
              disabled={saving}
              className="btn-save"
            >
              <FaSave /> Save
            </button>
            <button
              onClick={() => {
                setEditing(null);
                setValue(getValue(section, contentKey, defaultValue));
              }}
              className="btn-cancel"
            >
              <FaTimes /> Cancel
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="admin-editable-field">
        <label>{label}</label>
        <div className="admin-display-value">
          {value || <span className="empty-value">(empty)</span>}
        </div>
        <div className="admin-field-actions">
          <button onClick={() => setEditing(`${section}_${contentKey}`)} className="btn-edit">
            <FaEdit /> Edit
          </button>
          {getContentId(section, contentKey) && (
            <button
              onClick={() => handleDelete(section, contentKey)}
              className="btn-delete"
            >
              <FaTrash /> Delete
            </button>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="admin-page">
        <AdminHeader />
        <div className="admin-loading">Loading content...</div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <AdminHeader />
      
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
          duration={4000}
        />
      )}

      {/* View Message Modal */}
      {viewingMessage && (
        <div className="gallery-comment-modal-overlay" onClick={() => setViewingMessage(null)}>
          <div className="gallery-comment-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-close" onClick={() => setViewingMessage(null)}>
              <FaTimes />
            </div>
            <div className="modal-header">
              <h3>Contact Message #{viewingMessage.id}</h3>
              <p className="modal-subtitle">Received on {formatDate(viewingMessage.created_at)}</p>
            </div>
            <div style={{ padding: '2rem' }}>
              <div style={{ marginBottom: '1rem' }}>
                <strong>Name:</strong> {viewingMessage.name || 'N/A'}
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <strong>Email:</strong> {viewingMessage.email || 'N/A'}
              </div>
              {viewingMessage.subject && (
                <div style={{ marginBottom: '1rem' }}>
                  <strong>Subject:</strong> {viewingMessage.subject}
                </div>
              )}
              <div style={{ marginBottom: '1rem' }}>
                <strong>Status:</strong>{' '}
                <span className={`status-badge ${viewingMessage.is_read ? 'status-approved' : 'status-pending'}`}>
                  {viewingMessage.is_read ? 'Read' : 'Unread'}
                </span>
              </div>
              <div style={{ marginTop: '1.5rem' }}>
                <strong>Message:</strong>
                <div style={{ 
                  marginTop: '0.5rem', 
                  padding: '1rem', 
                  background: '#f9f9f9', 
                  borderRadius: '8px',
                  whiteSpace: 'pre-wrap',
                  lineHeight: '1.6'
                }}>
                  {viewingMessage.message}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <section className="admin-section">
        <div className="container">
          <div className="admin-page-header">
            <h1>Admin - Contact Page</h1>
            <p>Edit all content displayed on the Contact page. Changes will be reflected immediately.</p>
          </div>

          <div className="admin-content-editor">
            {/* Hero Section */}
            <div className="admin-content-section">
              <h2 className="section-title">Hero Section</h2>
              <EditableText 
                section="contact_page" 
                contentKey="hero_title" 
                label="Page Title" 
                defaultValue="Get In Touch" 
                order={1} 
              />
              <EditableText 
                section="contact_page" 
                contentKey="hero_subtitle" 
                label="Page Subtitle" 
                defaultValue="We'd love to hear from you" 
                order={2} 
              />
            </div>

            {/* Contact Information Section */}
            <div className="admin-content-section">
              <h2 className="section-title">Contact Information</h2>
              <EditableText 
                section="contact_page" 
                contentKey="info_title" 
                label="Info Section Title" 
                defaultValue="Contact Information" 
                order={3} 
              />
              <EditableText 
                section="contact_page" 
                contentKey="info_description" 
                label="Info Section Description" 
                defaultValue="Feel free to reach out to us through any of the following ways:" 
                multiline={true} 
                order={4} 
              />
              <EditableText 
                section="contact_page" 
                contentKey="address" 
                label="Address" 
                defaultValue="123 Church Street<br />Town Green, ST 12345" 
                multiline={true} 
                order={5} 
              />
              <EditableText 
                section="contact_page" 
                contentKey="phone" 
                label="Phone" 
                defaultValue="(555) 123-4567" 
                order={6} 
              />
              <EditableText 
                section="contact_page" 
                contentKey="email" 
                label="Email" 
                defaultValue="info@towngreenassembly.org" 
                order={7} 
              />
              <EditableText 
                section="contact_page" 
                contentKey="service_times" 
                label="Service Times" 
                defaultValue="Sunday: 9:00 AM & 11:00 AM<br />Wednesday: 7:00 PM" 
                multiline={true} 
                order={8} 
              />
            </div>

            {/* Form Section */}
            <div className="admin-content-section">
              <h2 className="section-title">Contact Form</h2>
              <EditableText 
                section="contact_page" 
                contentKey="form_title" 
                label="Form Title" 
                defaultValue="Send Us a Message" 
                order={9} 
              />
            </div>

            {/* Success Message Section */}
            <div className="admin-content-section">
              <h2 className="section-title">Success Message</h2>
              <EditableText 
                section="contact_page" 
                contentKey="success_title" 
                label="Success Title" 
                defaultValue="Message Sent!" 
                order={10} 
              />
              <EditableText 
                section="contact_page" 
                contentKey="success_message" 
                label="Success Message" 
                defaultValue="Thank you for contacting us. We'll get back to you soon." 
                multiline={true} 
                order={11} 
              />
            </div>

            {/* Contact Messages Section */}
            <div className="admin-content-section">
              <h2 className="section-title">Contact Messages</h2>
              <p className="field-description">View and manage all contact messages submitted from the website.</p>
              
              {loadingMessages ? (
                <div style={{ textAlign: 'center', padding: '2rem' }}>
                  <FaSpinner className="spinner" />
                  <p>Loading contact messages...</p>
                </div>
              ) : contactMessages.length === 0 ? (
                <div className="admin-placeholder">
                  <FaEnvelope className="placeholder-icon" />
                  <h3>No Messages Yet</h3>
                  <p>Contact messages submitted from the website will appear here.</p>
                </div>
              ) : (
                <div className="membership-table-wrapper">
                  <table className="membership-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Subject</th>
                        <th>Message</th>
                        <th>Status</th>
                        <th>Date</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {contactMessages.map((message) => (
                        <tr key={message.id} className={!message.is_read ? 'unread-message' : ''}>
                          <td>{message.id}</td>
                          <td>
                            <strong>{message.name || 'N/A'}</strong>
                          </td>
                          <td>{message.email || 'N/A'}</td>
                          <td>{message.subject || 'No Subject'}</td>
                          <td style={{ maxWidth: '300px' }}>
                            <div style={{ 
                              overflow: 'hidden', 
                              textOverflow: 'ellipsis', 
                              whiteSpace: 'nowrap',
                              cursor: 'pointer'
                            }} 
                            onClick={() => setViewingMessage(message)}
                            title="Click to view full message">
                              {message.message || 'N/A'}
                            </div>
                          </td>
                          <td>
                            <span className={`status-badge ${message.is_read ? 'status-approved' : 'status-pending'}`}>
                              {message.is_read ? 'Read' : 'Unread'}
                            </span>
                          </td>
                          <td>{formatDate(message.created_at)}</td>
                          <td>
                            {!message.is_read && (
                              <button
                                onClick={() => handleMarkAsRead(message.id)}
                                className="btn-edit-small"
                                title="Mark as read"
                              >
                                <FaCheckCircle />
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteMessage(message.id)}
                              className="btn-delete-small"
                              title="Delete"
                              disabled={deleting === message.id}
                            >
                              {deleting === message.id ? <FaSpinner className="spinner" /> : <FaTrash />}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AdminContact;
