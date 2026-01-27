import React, { useState, useEffect } from 'react';
import { FaSave, FaTrash, FaEdit, FaTimes, FaPlus } from 'react-icons/fa';
import AdminHeader from '../components/AdminHeader';
import Toast from '../components/Toast';
import { homeAPI } from '../api';
import './AdminCommon.css';
import './AdminTestimonies.css';

const AdminTestimonies = () => {
  const [content, setContent] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    loadContent();
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
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

  // Component for managing testimonies list (dynamic array)
  const TestimoniesManager = ({ section }) => {
    const testimoniesJson = getValue(section, 'testimonies_list', '[]');
    const [testimonies, setTestimonies] = useState([]);
    const [editingIndex, setEditingIndex] = useState(null); // null = not editing, number = editing existing
    const [isAddingNew, setIsAddingNew] = useState(false); // true when adding new testimony
    const [editingTestimony, setEditingTestimony] = useState({ quote: '', author: '', role: '' });

    useEffect(() => {
      try {
        const parsed = JSON.parse(testimoniesJson || '[]');
        setTestimonies(Array.isArray(parsed) ? parsed : []);
      } catch (error) {
        setTestimonies([]);
      }
    }, [testimoniesJson, content]);

    const handleAddTestimony = () => {
      setEditingTestimony({ quote: '', author: '', role: '' });
      setEditingIndex(null);
      setIsAddingNew(true);
    };

    const handleEditTestimony = (index) => {
      setEditingTestimony({ ...testimonies[index] });
      setEditingIndex(index);
      setIsAddingNew(false);
    };

    const handleCancelEdit = () => {
      setEditingIndex(null);
      setIsAddingNew(false);
      setEditingTestimony({ quote: '', author: '', role: '' });
    };

    const handleSaveTestimony = async () => {
      // Validate required fields
      if (!editingTestimony.quote.trim() || !editingTestimony.author.trim()) {
        showToast('Please fill in both Quote and Author Name fields', 'error');
        return;
      }

      try {
        setSaving(true);
        let newTestimonies;
        
        if (isAddingNew) {
          // Adding new testimony
          newTestimonies = [...testimonies, { ...editingTestimony }];
        } else {
          // Updating existing testimony
          newTestimonies = [...testimonies];
          newTestimonies[editingIndex] = { ...editingTestimony };
        }
        
        const testimoniesJsonString = JSON.stringify(newTestimonies);
        await handleSave(section, 'testimonies_list', testimoniesJsonString, 'json', 0);
        setEditingIndex(null);
        setIsAddingNew(false);
        setEditingTestimony({ quote: '', author: '', role: '' });
        showToast(isAddingNew ? '✨ Testimony added successfully!' : '✨ Testimony updated successfully!', 'success');
      } catch (error) {
        console.error('Error saving testimony:', error);
        showToast('Failed to save testimony', 'error');
      } finally {
        setSaving(false);
      }
    };

    const handleRemoveTestimony = async (index) => {
      if (!window.confirm('Are you sure you want to remove this testimony?')) {
        return;
      }

      try {
        setSaving(true);
        const newTestimonies = testimonies.filter((_, i) => i !== index);
        const testimoniesJsonString = JSON.stringify(newTestimonies);
        await handleSave(section, 'testimonies_list', testimoniesJsonString, 'json', 0);
        showToast('🗑️ Testimony removed!', 'success');
      } catch (error) {
        console.error('Error removing testimony:', error);
        showToast('Failed to remove testimony', 'error');
      } finally {
        setSaving(false);
      }
    };

    return (
      <div className="admin-editable-field">
        <label>Testimonies</label>
        
        {/* Edit/Add Form */}
        {(editingIndex !== null || isAddingNew) ? (
          <div className="testimony-form-editor" style={{ display: 'block' }}>
            <div className="testimony-form-header">
              <h3>{isAddingNew ? 'Add New Testimony' : `Edit Testimony #${editingIndex + 1}`}</h3>
            </div>
            
            <div className="testimony-fields">
              <div className="testimony-field">
                <label>Quote *</label>
                <textarea
                  value={editingTestimony.quote}
                  onChange={(e) => setEditingTestimony({ ...editingTestimony, quote: e.target.value })}
                  placeholder="Enter the testimony quote..."
                  rows={4}
                  className="admin-input"
                  disabled={saving}
                />
              </div>
              
              <div className="testimony-field">
                <label>Author Name *</label>
                <input
                  type="text"
                  value={editingTestimony.author}
                  onChange={(e) => setEditingTestimony({ ...editingTestimony, author: e.target.value })}
                  placeholder="Enter author name..."
                  className="admin-input"
                  disabled={saving}
                />
              </div>
              
              <div className="testimony-field">
                <label>Role/Member Info (Optional)</label>
                <input
                  type="text"
                  value={editingTestimony.role}
                  onChange={(e) => setEditingTestimony({ ...editingTestimony, role: e.target.value })}
                  placeholder="e.g., Member since 2018"
                  className="admin-input"
                  disabled={saving}
                />
              </div>
            </div>

            <div className="testimony-form-actions">
              <button
                onClick={handleSaveTestimony}
                disabled={saving}
                className="btn-save"
              >
                <FaSave /> {saving ? 'Saving...' : 'Save Testimony'}
              </button>
              <button
                onClick={handleCancelEdit}
                disabled={saving}
                className="btn-cancel"
              >
                <FaTimes /> Cancel
              </button>
            </div>
          </div>
        ) : null}
        
        {/* Existing Testimonies List */}
        {testimonies.length > 0 && (
          <div className="testimonies-list-admin">
            {testimonies.map((testimony, index) => (
              <div key={index} className="testimony-item-display">
                <div className="testimony-item-header">
                  <h3>Testimony #{index + 1}</h3>
                  <div className="testimony-item-actions">
                    <button
                      onClick={() => handleEditTestimony(index)}
                      className="btn-edit-small"
                      title="Edit testimony"
                      disabled={saving || editingIndex !== null || isAddingNew}
                    >
                      <FaEdit /> Edit
                    </button>
                    <button
                      onClick={() => handleRemoveTestimony(index)}
                      className="btn-delete-small"
                      title="Remove testimony"
                      disabled={saving || editingIndex !== null || isAddingNew}
                    >
                      <FaTrash /> Remove
                    </button>
                  </div>
                </div>
                
                <div className="testimony-display-content">
                  <div className="testimony-display-field">
                    <strong>Quote:</strong>
                    <p>{testimony.quote || <span className="empty-value">(empty)</span>}</p>
                  </div>
                  <div className="testimony-display-field">
                    <strong>Author:</strong>
                    <p>{testimony.author || <span className="empty-value">(empty)</span>}</p>
                  </div>
                  {testimony.role && (
                    <div className="testimony-display-field">
                      <strong>Role:</strong>
                      <p>{testimony.role}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="admin-field-actions">
          <button 
            onClick={handleAddTestimony} 
            className="btn-edit" 
            disabled={saving || editingIndex !== null || isAddingNew}
          >
            <FaPlus /> Add New Testimony
          </button>
          {testimonies.length > 0 && (
            <span className="testimony-count">{testimonies.length} testimony{testimonies.length !== 1 ? 'ies' : ''} added</span>
          )}
        </div>
      </div>
    );
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
      
      <section className="admin-section">
        <div className="container">
          <div className="admin-page-header">
            <h1>Admin - Testimonies Page</h1>
            <p>Edit all content displayed on the Testimonies page. Changes will be reflected immediately.</p>
          </div>

          <div className="admin-content-editor">
            {/* Page Header Section */}
            <div className="admin-content-section">
              <h2 className="section-title">Page Header</h2>
              <EditableText 
                section="testimonies_page" 
                contentKey="title" 
                label="Page Title" 
                defaultValue="Testimonies" 
                order={1} 
              />
              <EditableText 
                section="testimonies_page" 
                contentKey="subtitle" 
                label="Page Subtitle" 
                defaultValue="Stories of transformation and hope" 
                order={2} 
              />
            </div>

            {/* CTA Section */}
            <div className="admin-content-section">
              <h2 className="section-title">Call to Action Section</h2>
              <EditableText 
                section="testimonies_page" 
                contentKey="cta_title" 
                label="CTA Title" 
                defaultValue="Share Your Story" 
                order={10} 
              />
              <EditableText 
                section="testimonies_page" 
                contentKey="cta_description" 
                label="CTA Description" 
                defaultValue="Have a testimony to share? We'd love to hear how God has worked in your life!" 
                multiline={true}
                order={11} 
              />
              <EditableText 
                section="testimonies_page" 
                contentKey="cta_button_text" 
                label="CTA Button Text" 
                defaultValue="Share Your Testimony" 
                order={12} 
              />
              <EditableText 
                section="testimonies_page" 
                contentKey="cta_button_link" 
                label="CTA Button Link" 
                defaultValue="/contact" 
                order={13} 
              />
            </div>

            {/* Testimonies List Section */}
            <div className="admin-content-section">
              <h2 className="section-title">Testimonies List</h2>
              <p className="field-description">
                Manage individual testimonies displayed on the page. Add, edit, or remove testimonies. Each testimony includes a quote, author name, and optional role/member info.
              </p>
              <TestimoniesManager section="testimonies_page" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AdminTestimonies;
