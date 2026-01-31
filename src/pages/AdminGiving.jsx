import React, { useState, useEffect } from 'react';
import { FaSave, FaTrash, FaEdit, FaTimes } from 'react-icons/fa';
import AdminHeader from '../components/AdminHeader';
import Toast from '../components/Toast';
import { homeAPI } from '../api';
import './AdminCommon.css';
import './AdminHome.css';

const AdminGiving = () => {
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
      
      <section className="admin-section">
        <div className="container">
          <div className="admin-page-header">
            <h1>Admin - Giving Page</h1>
            <p>Edit all content displayed on the Giving page. Changes will be reflected immediately.</p>
          </div>

          <div className="admin-content-editor">
            {/* Hero Section */}
            <div className="admin-content-section">
              <h2 className="section-title">Hero Section</h2>
              <EditableText 
                section="giving_page" 
                contentKey="hero_title" 
                label="Page Title" 
                defaultValue="Giving" 
                order={1} 
              />
              <EditableText 
                section="giving_page" 
                contentKey="hero_subtitle" 
                label="Page Subtitle" 
                defaultValue="Support the ministry and make a difference" 
                order={2} 
              />
            </div>

            {/* Step 1 Section */}
            <div className="admin-content-section">
              <h2 className="section-title">Step 1 - Select Giving Type</h2>
              <EditableText 
                section="giving_page" 
                contentKey="step1_title" 
                label="Step 1 Title" 
                defaultValue="Select Giving Type" 
                order={3} 
              />
              <EditableText 
                section="giving_page" 
                contentKey="step1_subtitle" 
                label="Step 1 Subtitle" 
                defaultValue="Choose how you would like to give" 
                order={4} 
              />
            </div>

            {/* Giving Types */}
            <div className="admin-content-section">
              <h2 className="section-title">Giving Types</h2>
              
              {[1, 2, 3].map((num) => {
                const typeNames = ['Tithe', 'Offering', 'Help'];
                const typeDescriptions = [
                  'Give your tithe as commanded in Malachi 3:10',
                  'Give a freewill offering to support the ministry',
                  'Support special projects and community outreach'
                ];
                
                return (
                  <div key={num} className="program-item-editor">
                    <h3>Giving Type {num} - {typeNames[num - 1]}</h3>
                    <EditableText 
                      section="giving_page" 
                      contentKey={`giving_type${num}_name`} 
                      label={`Type ${num} - Name`} 
                      defaultValue={typeNames[num - 1]} 
                      order={num * 10 + 10} 
                    />
                    <EditableText 
                      section="giving_page" 
                      contentKey={`giving_type${num}_description`} 
                      label={`Type ${num} - Description`} 
                      defaultValue={typeDescriptions[num - 1]} 
                      multiline={true} 
                      order={num * 10 + 11} 
                    />
                  </div>
                );
              })}
            </div>

            {/* Step 2 Section */}
            <div className="admin-content-section">
              <h2 className="section-title">Step 2 - Payment Information</h2>
              <EditableText 
                section="giving_page" 
                contentKey="step2_title" 
                label="Step 2 Title" 
                defaultValue="Payment Information" 
                order={40} 
              />
              <EditableText 
                section="giving_page" 
                contentKey="step2_subtitle_template" 
                label="Step 2 Subtitle Template" 
                defaultValue="Send your {type} to the number below" 
                order={41} 
              />
              <EditableText 
                section="giving_page" 
                contentKey="momo_number" 
                label="Mobile Money Number" 
                defaultValue="0244123456" 
                order={42} 
              />
              <EditableText 
                section="giving_page" 
                contentKey="momo_note_template" 
                label="Mobile Money Note Template" 
                defaultValue="Please use this number when sending your {type}. Include your name as reference." 
                multiline={true} 
                order={43} 
              />
            </div>

            {/* Thank You Section */}
            <div className="admin-content-section">
              <h2 className="section-title">Thank You Message</h2>
              <EditableText 
                section="giving_page" 
                contentKey="thank_you_title" 
                label="Thank You Title" 
                defaultValue="Thank You for Your Generosity" 
                order={50} 
              />
              <EditableText 
                section="giving_page" 
                contentKey="thank_you_message" 
                label="Thank You Message" 
                defaultValue="Your giving helps us continue our mission of spreading the Gospel, supporting our community, and making a positive impact in the lives of many. We appreciate your faithfulness and generosity." 
                multiline={true} 
                order={51} 
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AdminGiving;
