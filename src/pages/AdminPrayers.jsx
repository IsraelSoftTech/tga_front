import React, { useState, useEffect } from 'react';
import { FaSave, FaTrash, FaUpload, FaEdit, FaTimes, FaPrayingHands, FaHeart, FaCheckCircle, FaEnvelope, FaPhone, FaUser, FaSpinner } from 'react-icons/fa';
import AdminHeader from '../components/AdminHeader';
import Toast from '../components/Toast';
import { homeAPI, prayersAPI } from '../api';
import './AdminCommon.css';
import './AdminHome.css';
import './AdminMembership.css';

const AdminPrayers = () => {
  const [content, setContent] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(null);
  const [preview, setPreview] = useState(null);
  const [toast, setToast] = useState(null);
  const [prayerRequests, setPrayerRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [viewingRequest, setViewingRequest] = useState(null);

  useEffect(() => {
    loadContent();
    loadPrayerRequests();
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

  const loadPrayerRequests = async () => {
    try {
      setLoadingRequests(true);
      const response = await prayersAPI.getAll();
      if (response.success) {
        setPrayerRequests(response.data || []);
      }
    } catch (error) {
      console.error('Error loading prayer requests:', error);
      showToast('Failed to load prayer requests', 'error');
    } finally {
      setLoadingRequests(false);
    }
  };

  const handleMarkAsAnswered = async (id) => {
    try {
      const response = await prayersAPI.markAsAnswered(id);
      if (response.success) {
        setPrayerRequests(prev => prev.map(p => p.id === id ? { ...p, is_answered: true } : p));
        showToast('Prayer request marked as answered', 'success');
      }
    } catch (error) {
      console.error('Error marking prayer as answered:', error);
      showToast('Failed to update prayer request', 'error');
    }
  };

  const handleDeleteRequest = async (id) => {
    if (!window.confirm('Are you sure you want to delete this prayer request?')) {
      return;
    }

    try {
      setDeleting(id);
      const response = await prayersAPI.delete(id);
      if (response.success) {
        setPrayerRequests(prev => prev.filter(p => p.id !== id));
        showToast('Prayer request deleted successfully', 'success');
      }
    } catch (error) {
      console.error('Error deleting prayer request:', error);
      showToast('Failed to delete prayer request', 'error');
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

  const handleImageUpload = async (event, section, contentKey) => {
    const file = event.target.files[0];
    if (!file) {
      console.log('No file selected');
      return;
    }

    if (!file.type.startsWith('image/')) {
      showToast('Please select an image file', 'warning');
      return;
    }

    try {
      setSaving(true);
      
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const base64 = reader.result;
          const fileName = file.name;
          const subDir = 'images';
          
          const response = await homeAPI.uploadFile(base64, fileName, subDir);
          
          if (response.success && response.url) {
            await handleSave(section, contentKey, response.url, 'image', 0);
            setPreview(null);
            showToast('🖼️ Image uploaded and saved successfully!', 'success');
          } else {
            const errorMsg = response.error || response.message || 'Unknown error';
            showToast('Upload failed: ' + errorMsg, 'error');
          }
        } catch (error) {
          console.error('❌ Upload error:', error);
          showToast('Failed to upload image: ' + (error.message || 'Unknown error'), 'error');
        } finally {
          setSaving(false);
        }
      };
      
      reader.onerror = (error) => {
        console.error('❌ FileReader error:', error);
        showToast('Failed to read image file', 'error');
        setSaving(false);
      };
      
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('❌ Image upload error:', error);
      showToast('Failed to upload image: ' + (error.message || 'Unknown error'), 'error');
      setSaving(false);
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

      {/* View Request Modal */}
      {viewingRequest && (
        <div className="gallery-comment-modal-overlay" onClick={() => setViewingRequest(null)}>
          <div className="gallery-comment-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-close" onClick={() => setViewingRequest(null)}>
              <FaTimes />
            </div>
            <div className="modal-header">
              <h3>Prayer Request #{viewingRequest.id}</h3>
              <p className="modal-subtitle">Submitted on {formatDate(viewingRequest.created_at)}</p>
            </div>
            <div style={{ padding: '2rem' }}>
              <div style={{ marginBottom: '1rem' }}>
                <strong>Name:</strong> {viewingRequest.is_anonymous ? 'Anonymous' : (viewingRequest.requester_name || 'N/A')}
              </div>
              {viewingRequest.email && (
                <div style={{ marginBottom: '1rem' }}>
                  <strong>Email:</strong> {viewingRequest.email}
                </div>
              )}
              {viewingRequest.phone && (
                <div style={{ marginBottom: '1rem' }}>
                  <strong>Phone:</strong> {viewingRequest.phone}
                </div>
              )}
              <div style={{ marginBottom: '1rem' }}>
                <strong>Status:</strong>{' '}
                <span className={`status-badge ${viewingRequest.is_answered ? 'status-approved' : 'status-pending'}`}>
                  {viewingRequest.is_answered ? 'Answered' : 'Pending'}
                </span>
              </div>
              <div style={{ marginTop: '1.5rem' }}>
                <strong>Prayer Request:</strong>
                <div style={{ 
                  marginTop: '0.5rem', 
                  padding: '1rem', 
                  background: '#f9f9f9', 
                  borderRadius: '8px',
                  whiteSpace: 'pre-wrap',
                  lineHeight: '1.6'
                }}>
                  {viewingRequest.request_text}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <section className="admin-section">
        <div className="container">
          <div className="admin-page-header">
            <h1>Admin - Prayer Requests Page</h1>
            <p>Edit all content displayed on the Prayer Requests page. Changes will be reflected immediately.</p>
          </div>

          <div className="admin-content-editor">
            {/* Hero Section */}
            <div className="admin-content-section">
              <h2 className="section-title">Hero Section</h2>
              <EditableText 
                section="prayers_page" 
                contentKey="hero_title" 
                label="Page Title" 
                defaultValue="Prayer Requests" 
                order={1} 
              />
              <EditableText 
                section="prayers_page" 
                contentKey="hero_subtitle" 
                label="Page Subtitle" 
                defaultValue="We believe in the power of prayer" 
                order={2} 
              />
            </div>

            {/* Intro Section */}
            <div className="admin-content-section">
              <h2 className="section-title">Introduction Section</h2>
              <EditableText 
                section="prayers_page" 
                contentKey="intro_title" 
                label="Intro Title" 
                defaultValue="Share Your Prayer Request" 
                order={3} 
              />
              <EditableText 
                section="prayers_page" 
                contentKey="intro_text1" 
                label="Intro Text (Paragraph 1)" 
                defaultValue="We believe in the power of prayer. Share your prayer requests with us, and our community will lift you up in prayer. Whether you're facing challenges, celebrating victories, or seeking guidance, we're here for you." 
                multiline={true} 
                order={4} 
              />
              <EditableText 
                section="prayers_page" 
                contentKey="intro_text2" 
                label="Intro Text (Paragraph 2)" 
                defaultValue="Your prayer requests are confidential and will be shared with our prayer team. You can choose to remain anonymous if you prefer." 
                multiline={true} 
                order={5} 
              />
            </div>

            {/* Success Message Section */}
            <div className="admin-content-section">
              <h2 className="section-title">Success Message</h2>
              <EditableText 
                section="prayers_page" 
                contentKey="success_title" 
                label="Success Title" 
                defaultValue="Thank You!" 
                order={6} 
              />
              <EditableText 
                section="prayers_page" 
                contentKey="success_message" 
                label="Success Message" 
                defaultValue="Your prayer request has been submitted. Our prayer team will be lifting you up." 
                multiline={true} 
                order={7} 
              />
            </div>

            {/* Info Cards Section */}
            <div className="admin-content-section">
              <h2 className="section-title">Info Cards</h2>
              
              {[1, 2, 3].map((num) => {
                const cardTitles = ['Prayer Team', 'Confidential', 'Response'];
                const cardDescriptions = [
                  'Our dedicated prayer team prays over every request submitted.',
                  'All prayer requests are kept confidential and handled with care.',
                  "We'll follow up with you and keep you in our prayers."
                ];
                
                return (
                  <div key={num} className="program-item-editor">
                    <h3>Info Card {num} - {cardTitles[num - 1]}</h3>
                    <EditableText 
                      section="prayers_page" 
                      contentKey={`info_card${num}_title`} 
                      label={`Card ${num} - Title`} 
                      defaultValue={cardTitles[num - 1]} 
                      order={num * 10 + 10} 
                    />
                    <EditableText 
                      section="prayers_page" 
                      contentKey={`info_card${num}_description`} 
                      label={`Card ${num} - Description`} 
                      defaultValue={cardDescriptions[num - 1]} 
                      multiline={true} 
                      order={num * 10 + 11} 
                    />
                  </div>
                );
              })}
            </div>

            {/* Prayer Requests Section */}
            <div className="admin-content-section">
              <h2 className="section-title">Prayer Requests</h2>
              <p className="field-description">View and manage all prayer requests submitted from the website.</p>
              
              {loadingRequests ? (
                <div style={{ textAlign: 'center', padding: '2rem' }}>
                  <FaSpinner className="spinner" />
                  <p>Loading prayer requests...</p>
                </div>
              ) : prayerRequests.length === 0 ? (
                <div className="admin-placeholder">
                  <FaPrayingHands className="placeholder-icon" />
                  <h3>No Prayer Requests Yet</h3>
                  <p>Prayer requests submitted from the website will appear here.</p>
                </div>
              ) : (
                <div className="membership-table-wrapper">
                  <table className="membership-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Request</th>
                        <th>Anonymous</th>
                        <th>Status</th>
                        <th>Date</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {prayerRequests.map((request) => (
                        <tr key={request.id}>
                          <td>{request.id}</td>
                          <td>
                            <strong>{request.is_anonymous ? 'Anonymous' : (request.requester_name || 'N/A')}</strong>
                          </td>
                          <td>{request.email || 'N/A'}</td>
                          <td>{request.phone || 'N/A'}</td>
                          <td style={{ maxWidth: '300px' }}>
                            <div style={{ 
                              overflow: 'hidden', 
                              textOverflow: 'ellipsis', 
                              whiteSpace: 'nowrap',
                              cursor: 'pointer'
                            }} 
                            onClick={() => setViewingRequest(request)}
                            title="Click to view full request">
                              {request.request_text || 'N/A'}
                            </div>
                          </td>
                          <td>
                            <span className={`status-badge ${request.is_anonymous ? 'status-approved' : 'status-pending'}`}>
                              {request.is_anonymous ? 'Yes' : 'No'}
                            </span>
                          </td>
                          <td>
                            <span className={`status-badge ${request.is_answered ? 'status-approved' : 'status-pending'}`}>
                              {request.is_answered ? 'Answered' : 'Pending'}
                            </span>
                          </td>
                          <td>{formatDate(request.created_at)}</td>
                          <td>
                            {!request.is_answered && (
                              <button
                                onClick={() => handleMarkAsAnswered(request.id)}
                                className="btn-edit-small"
                                title="Mark as answered"
                              >
                                <FaCheckCircle />
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteRequest(request.id)}
                              className="btn-delete-small"
                              title="Delete"
                              disabled={deleting === request.id}
                            >
                              {deleting === request.id ? <FaSpinner className="spinner" /> : <FaTrash />}
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

export default AdminPrayers;
