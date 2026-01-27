import React, { useState, useEffect } from 'react';
import { FaSave, FaTrash, FaUpload, FaEdit, FaTimes } from 'react-icons/fa';
import AdminHeader from '../components/AdminHeader';
import Toast from '../components/Toast';
import { homeAPI } from '../api';
import './AdminCommon.css';
import './AdminHome.css';

const AdminAbout = () => {
  const [content, setContent] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(null);
  const [preview, setPreview] = useState(null);
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

    console.log('📤 Starting image upload:', {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      section,
      contentKey
    });

    try {
      setSaving(true);
      
      // Convert to base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const base64 = reader.result;
          const fileName = file.name;
          const subDir = 'images';
          
          console.log('📤 Uploading to API:', {
            fileName,
            subDir,
            base64Length: base64.length
          });
          
          const response = await homeAPI.uploadFile(base64, fileName, subDir);
          console.log('📥 Upload response:', response);
          
          if (response.success && response.url) {
            console.log('✅ Upload successful, saving to database:', response.url);
            await handleSave(section, contentKey, response.url, 'image', 0);
            setPreview(null);
            showToast('🖼️ Image uploaded and saved successfully!', 'success');
          } else {
            const errorMsg = response.error || response.message || 'Unknown error';
            console.error('❌ Upload failed:', errorMsg);
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

  const EditableImage = ({ section, contentKey, label, order = 0 }) => {
    const imageUrl = getValue(section, contentKey);
    const isEditing = editing === `${section}_${contentKey}`;

    if (isEditing) {
      return (
        <div className="admin-editable-field">
          <label>{label}</label>
          {preview && (
            <div className="image-preview">
              <img src={preview} alt="Preview" />
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files[0];
              if (file) {
                const reader = new FileReader();
                reader.onloadend = () => setPreview(reader.result);
                reader.readAsDataURL(file);
                handleImageUpload(e, section, contentKey);
              }
            }}
            className="admin-file-input"
          />
          <div className="admin-field-actions">
            <button
              onClick={() => {
                setEditing(null);
                setPreview(null);
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
        {imageUrl ? (
          <div className="image-preview">
            <img src={imageUrl} alt={label} />
          </div>
        ) : (
          <div className="no-image">No image uploaded</div>
        )}
        <div className="admin-field-actions">
          <button onClick={() => setEditing(`${section}_${contentKey}`)} className="btn-edit">
            <FaUpload /> {imageUrl ? 'Change' : 'Upload'} Image
          </button>
          {imageUrl && getContentId(section, contentKey) && (
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
            <h1>Admin - About Page Content</h1>
            <p>Edit all content displayed on the about page. Changes will be reflected immediately.</p>
          </div>

          <div className="admin-content-editor">
            {/* Hero Section */}
            <div className="admin-content-section">
              <h2 className="section-title">Hero Section</h2>
              <EditableText 
                section="about_page" 
                contentKey="hero_title" 
                label="Page Title" 
                defaultValue="About Town Green Assembly" 
                order={1} 
              />
              <EditableText 
                section="about_page" 
                contentKey="hero_subtitle" 
                label="Page Subtitle" 
                defaultValue="Building a community of faith, hope, and love" 
                order={2} 
              />
            </div>

            {/* Mission Section */}
            <div className="admin-content-section">
              <h2 className="section-title">Mission Section</h2>
              <EditableText 
                section="about_page" 
                contentKey="mission_title" 
                label="Mission Title" 
                defaultValue="Our Mission" 
                order={3} 
              />
              <EditableText 
                section="about_page" 
                contentKey="mission_text1" 
                label="Mission Text (Paragraph 1)" 
                defaultValue="Town Green Assembly is a vibrant community of believers dedicated to spreading the message of hope, love, and faith. We are committed to building strong relationships with God and each other, creating a welcoming environment for all who seek spiritual growth and fellowship." 
                multiline={true} 
                order={4} 
              />
              <EditableText 
                section="about_page" 
                contentKey="mission_text2" 
                label="Mission Text (Paragraph 2)" 
                defaultValue="Our mission is to serve our community, nurture spiritual development, and make a positive impact in the lives of those around us. We believe in the power of prayer, the importance of community, and the transformative message of the Gospel." 
                multiline={true} 
                order={5} 
              />
              <EditableImage 
                section="about_page" 
                contentKey="mission_image" 
                label="Mission Image" 
                order={6} 
              />
            </div>

            {/* Values Section */}
            <div className="admin-content-section">
              <h2 className="section-title">Values Section</h2>
              <EditableText 
                section="about_page" 
                contentKey="values_title" 
                label="Values Section Title" 
                defaultValue="Our Values" 
                order={7} 
              />
              
              {[1, 2, 3, 4].map((num) => {
                const valueNames = ['Love', 'Service', 'Community', 'Truth'];
                const valueDescriptions = [
                  "We believe in showing unconditional love to everyone, just as Christ loved us.",
                  "We are called to serve our community and make a positive difference in the world.",
                  "We foster genuine relationships and support one another in our faith journey.",
                  "We are committed to teaching and living out the truth of God's Word."
                ];
                
                return (
                  <div key={num} className="program-item-editor">
                    <h3>Value {num} - {valueNames[num - 1]}</h3>
                    <EditableText 
                      section="about_page" 
                      contentKey={`value${num}_title`} 
                      label={`Value ${num} - Title`} 
                      defaultValue={valueNames[num - 1]} 
                      order={num * 10 + 7} 
                    />
                    <EditableText 
                      section="about_page" 
                      contentKey={`value${num}_description`} 
                      label={`Value ${num} - Description`} 
                      defaultValue={valueDescriptions[num - 1]} 
                      multiline={true} 
                      order={num * 10 + 8} 
                    />
                  </div>
                );
              })}
            </div>

            {/* History Section */}
            <div className="admin-content-section">
              <h2 className="section-title">History Section</h2>
              <EditableText 
                section="about_page" 
                contentKey="history_title" 
                label="History Title" 
                defaultValue="Our History" 
                order={50} 
              />
              <EditableText 
                section="about_page" 
                contentKey="history_text1" 
                label="History Text (Paragraph 1)" 
                defaultValue="Founded over 15 years ago, Town Green Assembly began as a small group of believers who wanted to create a place where people could experience the love of God in a genuine and authentic way. What started as a humble gathering has grown into a thriving community of over 500 members." 
                multiline={true} 
                order={51} 
              />
              <EditableText 
                section="about_page" 
                contentKey="history_text2" 
                label="History Text (Paragraph 2)" 
                defaultValue="Throughout our journey, we have remained committed to our core values of love, service, community, and truth. We have seen countless lives transformed, families strengthened, and communities impacted through the power of the Gospel." 
                multiline={true} 
                order={52} 
              />
              <EditableText 
                section="about_page" 
                contentKey="history_text3" 
                label="History Text (Paragraph 3)" 
                defaultValue="Today, we continue to grow and expand our reach, always staying true to our mission of building a community where everyone can find hope, healing, and purpose in Christ." 
                multiline={true} 
                order={53} 
              />
            </div>

            {/* Stats Section */}
            <div className="admin-content-section">
              <h2 className="section-title">Stats Section</h2>
              {[1, 2, 3, 4].map((num) => {
                const statNumbers = ['500+', '15+', '20+', '50+'];
                const statLabels = ['Active Members', 'Years of Service', 'Ministry Programs', 'Community Events'];
                
                return (
                  <div key={num} className="program-item-editor">
                    <h3>Stat {num}</h3>
                    <EditableText 
                      section="about_page" 
                      contentKey={`stat${num}_number`} 
                      label={`Stat ${num} - Number`} 
                      defaultValue={statNumbers[num - 1]} 
                      order={num * 10 + 60} 
                    />
                    <EditableText 
                      section="about_page" 
                      contentKey={`stat${num}_label`} 
                      label={`Stat ${num} - Label`} 
                      defaultValue={statLabels[num - 1]} 
                      order={num * 10 + 61} 
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AdminAbout;
