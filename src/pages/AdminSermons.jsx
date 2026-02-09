import React, { useState, useEffect } from 'react';
import { FaSave, FaTrash, FaUpload, FaEdit, FaTimes, FaPlus, FaCalendarAlt, FaUser, FaVideo, FaHeadphones, FaImage } from 'react-icons/fa';
import AdminHeader from '../components/AdminHeader';
import Toast from '../components/Toast';
import { sermonsAPI, homeAPI } from '../api';
import './AdminCommon.css';
import './AdminSermons.css';

const AdminSermons = () => {
  const [sermons, setSermons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [toast, setToast] = useState(null);
  const [uploadProgress, setUploadProgress] = useState({ show: false, progress: 0, fileName: '' });

  // Form state for new/edit sermon
  const [formData, setFormData] = useState({
    sermon_type: 'text', // 'text', 'audio', or 'video'
    title: '',
    speaker: '',
    date: '',
    description: '',
    audio_url: '',
    video_url: '',
    thumbnail_url: ''
  });

  useEffect(() => {
    loadSermons();
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadSermons = async () => {
    try {
      setLoading(true);
      const response = await sermonsAPI.getAll();
      if (response.success) {
        setSermons(response.data || []);
      }
    } catch (error) {
      console.error('Error loading sermons:', error);
      showToast('Failed to load sermons. Please refresh the page.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({
      sermon_type: 'text',
      title: '',
      speaker: '',
      date: '',
      description: '',
      audio_url: '',
      video_url: '',
      thumbnail_url: ''
    });
    setEditing(null);
    setShowAddForm(false);
  };

  const handleSave = async () => {
    if (!formData.title.trim()) {
      showToast('Title is required', 'error');
      return;
    }

    // Validate based on sermon type
    if (formData.sermon_type === 'text' && !formData.description.trim()) {
      showToast('Description is required for text sermons', 'error');
      return;
    }
    if (formData.sermon_type === 'audio' && !formData.audio_url.trim()) {
      showToast('Audio URL or file is required for audio sermons', 'error');
      return;
    }
    if (formData.sermon_type === 'video' && !formData.video_url.trim()) {
      showToast('Video URL or file is required for video sermons', 'error');
      return;
    }

    try {
      setSaving(true);
      
      // Prepare data based on sermon type - only include relevant fields
      const sermonData = {
        title: formData.title,
        speaker: formData.speaker || null,
        date: formData.date || null,
        description: formData.sermon_type === 'text' ? formData.description : null,
        audio_url: formData.sermon_type === 'audio' ? formData.audio_url : null,
        video_url: formData.sermon_type === 'video' ? formData.video_url : null,
        thumbnail_url: formData.thumbnail_url || null
      };
      
      let response;
      if (editing) {
        response = await sermonsAPI.update(editing.id, sermonData);
      } else {
        response = await sermonsAPI.create(sermonData);
      }

      if (response.success) {
        // Update state directly instead of reloading
        if (editing) {
          setSermons(prev => prev.map(s => s.id === editing.id ? { ...s, ...sermonData } : s));
        } else {
          // Add new sermon to the list
          setSermons(prev => [...prev, { id: response.data?.id || Date.now(), ...sermonData }]);
        }
        resetForm();
        showToast(editing ? '✨ Sermon updated successfully! Changes are now live.' : '✨ Sermon created successfully!', 'success');
      } else {
        showToast('Failed to save: ' + (response.error || 'Unknown error'), 'error');
      }
    } catch (error) {
      console.error('Error saving sermon:', error);
      showToast('Failed to save sermon. Please try again.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (sermon) => {
    if (!window.confirm(`Are you sure you want to delete "${sermon.title}"?`)) {
      return;
    }

    try {
      const response = await sermonsAPI.delete(sermon.id);
      if (response.success) {
        // Update state directly instead of reloading
        setSermons(prev => prev.filter(s => s.id !== sermon.id));
        showToast('🗑️ Sermon deleted successfully!', 'success');
      } else {
        showToast('Failed to delete: ' + (response.error || 'Unknown error'), 'error');
      }
    } catch (error) {
      console.error('Error deleting sermon:', error);
      showToast('Failed to delete sermon. Please try again.', 'error');
    }
  };

  const handleEdit = (sermon) => {
    // Determine sermon type based on available content
    let sermonType = 'text';
    if (sermon.video_url) {
      sermonType = 'video';
    } else if (sermon.audio_url) {
      sermonType = 'audio';
    } else if (sermon.description && !sermon.video_url && !sermon.audio_url) {
      sermonType = 'text';
    }
    
    setFormData({
      sermon_type: sermonType,
      title: sermon.title || '',
      speaker: sermon.speaker || '',
      date: sermon.date ? sermon.date.split('T')[0] : '', // Format date for input
      description: sermon.description || '',
      audio_url: sermon.audio_url || '',
      video_url: sermon.video_url || '',
      thumbnail_url: sermon.thumbnail_url || ''
    });
    setEditing(sermon);
    setShowAddForm(true);
  };

  const handleFileUpload = async (event, fileType) => {
    const file = event.target.files[0];
    if (!file) return;

    let expectedType = '';
    let subDir = '';
    
    if (fileType === 'audio') {
      expectedType = 'audio/';
      subDir = 'audio';
      if (!file.type.startsWith('audio/')) {
        showToast('Please select an audio file', 'warning');
        return;
      }
    } else if (fileType === 'video') {
      expectedType = 'video/';
      subDir = 'videos';
      if (!file.type.startsWith('video/')) {
        showToast('Please select a video file', 'warning');
        return;
      }
    } else if (fileType === 'thumbnail') {
      expectedType = 'image/';
      subDir = 'images';
      if (!file.type.startsWith('image/')) {
        showToast('Please select an image file', 'warning');
        return;
      }
    }

    try {
      setSaving(true);
      setUploadProgress({ show: true, progress: 0, fileName: file.name });

      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          setUploadProgress({ show: true, progress: 10, fileName: file.name });
          const base64 = reader.result;
          const fileName = file.name;

          setUploadProgress({ show: true, progress: 30, fileName: file.name });
          const response = await homeAPI.uploadFile(base64, fileName, subDir);
          setUploadProgress({ show: true, progress: 90, fileName: file.name });

          if (response.success && response.url) {
            setUploadProgress({ show: true, progress: 100, fileName: file.name });
            
            const urlField = fileType === 'audio' ? 'audio_url' : fileType === 'video' ? 'video_url' : 'thumbnail_url';
            setFormData(prev => ({ ...prev, [urlField]: response.url }));
            
            setUploadProgress({ show: false, progress: 0, fileName: '' });
            showToast(`🖼️ ${fileType === 'audio' ? 'Audio' : fileType === 'video' ? 'Video' : 'Thumbnail'} uploaded successfully!`, 'success');
          } else {
            setUploadProgress({ show: false, progress: 0, fileName: '' });
            showToast('Upload failed: ' + (response.error || 'Unknown error'), 'error');
          }
        } catch (error) {
          console.error('Upload error:', error);
          setUploadProgress({ show: false, progress: 0, fileName: '' });
          showToast('Failed to upload file: ' + (error.message || 'Unknown error'), 'error');
        } finally {
          setSaving(false);
        }
      };

      reader.onerror = (error) => {
        console.error('❌ FileReader error:', error);
        setUploadProgress({ show: false, progress: 0, fileName: '' });
        showToast('Failed to read file', 'error');
        setSaving(false);
      };

      reader.readAsDataURL(file);
    } catch (error) {
      console.error('File upload error:', error);
      setUploadProgress({ show: false, progress: 0, fileName: '' });
      showToast('Failed to upload file: ' + (error.message || 'Unknown error'), 'error');
      setSaving(false);
    }
  };

  const getSermonType = (sermon) => {
    if (sermon.video_url) return 'video';
    if (sermon.audio_url) return 'audio';
    if (sermon.description && !sermon.video_url && !sermon.audio_url) return 'text';
    return 'text';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No date';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  if (loading) {
    return (
      <div className="admin-page">
        <AdminHeader />
        <div className="admin-section">
          <div className="container">
            <div className="admin-page-content">
              <div className="loading-spinner"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <AdminHeader />
      
      <section className="admin-section">
        <div className="container">
          <div className="admin-page-header">
            <h1>Admin - Sermons</h1>
            <p>Manage sermons, videos, audio, and text messages</p>
          </div>

          <div className="admin-sermons-content">
            <div className="admin-sermons-header">
              <h2>Sermons ({sermons.length})</h2>
              <button
                className="btn-add-sermon"
                onClick={() => {
                  resetForm();
                  setShowAddForm(true);
                }}
                disabled={showAddForm}
              >
                <FaPlus /> Add New Sermon
              </button>
            </div>

            {/* Add/Edit Form */}
            {showAddForm && (
              <div className="sermon-form-card">
                <div className="form-header">
                  <h3>{editing ? 'Edit Sermon' : 'Add New Sermon'}</h3>
                  <button className="btn-close-form" onClick={resetForm}>
                    <FaTimes />
                  </button>
                </div>
                
                <div className="form-body">
                  {/* Sermon Type Selector */}
                  <div className="form-row">
                    <div className="form-group">
                      <label>Sermon Type *</label>
                      <select
                        name="sermon_type"
                        value={formData.sermon_type}
                        onChange={(e) => {
                          const newType = e.target.value;
                          setFormData(prev => ({
                            ...prev,
                            sermon_type: newType,
                            // Clear content fields when switching types
                            description: newType !== 'text' ? '' : prev.description,
                            audio_url: newType !== 'audio' ? '' : prev.audio_url,
                            video_url: newType !== 'video' ? '' : prev.video_url
                          }));
                        }}
                        className="admin-input"
                      >
                        <option value="text">Text/Message</option>
                        <option value="audio">Audio</option>
                        <option value="video">Video</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Title *</label>
                      <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        placeholder="e.g., Walking in Faith"
                        className="admin-input"
                      />
                    </div>
                  </div>

                  <div className="form-row form-row-2">
                    <div className="form-group">
                      <label>Speaker</label>
                      <input
                        type="text"
                        name="speaker"
                        value={formData.speaker}
                        onChange={handleInputChange}
                        placeholder="e.g., Pastor John Smith"
                        className="admin-input"
                      />
                    </div>

                    <div className="form-group">
                      <label>Date</label>
                      <input
                        type="date"
                        name="date"
                        value={formData.date}
                        onChange={handleInputChange}
                        className="admin-input"
                      />
                    </div>
                  </div>

                  {/* Text Sermon Fields */}
                  {formData.sermon_type === 'text' && (
                    <div className="form-row">
                      <div className="form-group">
                        <label>Description/Message *</label>
                        <textarea
                          name="description"
                          value={formData.description}
                          onChange={handleInputChange}
                          placeholder="Enter the full sermon message or description..."
                          rows="8"
                          className="admin-input"
                          required
                        />
                      </div>
                    </div>
                  )}

                  {/* Audio Sermon Fields */}
                  {formData.sermon_type === 'audio' && (
                    <div className="form-row">
                      <div className="form-group">
                        <label>Audio *</label>
                        <div className="url-input-group">
                          <input
                            type="text"
                            name="audio_url"
                            value={formData.audio_url}
                            onChange={handleInputChange}
                            placeholder="Direct audio file URL or upload file below"
                            className="admin-input"
                            required
                          />
                          <label className="btn-upload-file">
                            <FaUpload /> Upload Audio
                            <input
                              type="file"
                              accept="audio/*"
                              onChange={(e) => handleFileUpload(e, 'audio')}
                              style={{ display: 'none' }}
                              disabled={saving}
                            />
                          </label>
                        </div>
                        {formData.audio_url && (
                          <div className="preview-container">
                            <audio src={formData.audio_url} controls style={{ width: '100%' }}></audio>
                            <button
                              type="button"
                              onClick={() => setFormData(prev => ({ ...prev, audio_url: '' }))}
                              className="btn-remove-file"
                            >
                              <FaTimes /> Remove
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Video Sermon Fields */}
                  {formData.sermon_type === 'video' && (
                    <div className="form-row">
                      <div className="form-group">
                        <label>Video *</label>
                        <div className="url-input-group">
                          <input
                            type="text"
                            name="video_url"
                            value={formData.video_url}
                            onChange={handleInputChange}
                            placeholder="YouTube/Vimeo embed URL, direct video URL, or upload file below"
                            className="admin-input"
                            required
                          />
                          <label className="btn-upload-file">
                            <FaUpload /> Upload Video
                            <input
                              type="file"
                              accept="video/*"
                              onChange={(e) => handleFileUpload(e, 'video')}
                              style={{ display: 'none' }}
                              disabled={saving}
                            />
                          </label>
                        </div>
                        {formData.video_url && (
                          <div className="preview-container">
                            {formData.video_url.includes('youtube.com/embed') || formData.video_url.includes('player.vimeo.com') ? (
                              <iframe src={formData.video_url} width="100%" height="200" frameBorder="0" allowFullScreen></iframe>
                            ) : (
                              <video src={formData.video_url} controls width="100%" height="200" style={{ maxWidth: '100%' }}></video>
                            )}
                            <button
                              type="button"
                              onClick={() => setFormData(prev => ({ ...prev, video_url: '' }))}
                              className="btn-remove-file"
                            >
                              <FaTimes /> Remove
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Optional Thumbnail for all types */}
                  <div className="form-row">
                    <div className="form-group">
                      <label>Thumbnail Image (Optional)</label>
                      {formData.thumbnail_url ? (
                        <div className="image-preview-container">
                          <img src={formData.thumbnail_url} alt="Thumbnail preview" className="image-preview" />
                          <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, thumbnail_url: '' }))}
                            className="btn-remove-image"
                          >
                            <FaTimes /> Remove
                          </button>
                        </div>
                      ) : (
                        <label className="btn-upload-image">
                          <FaUpload /> Upload Thumbnail
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleFileUpload(e, 'thumbnail')}
                            style={{ display: 'none' }}
                            disabled={saving}
                          />
                        </label>
                      )}
                    </div>
                  </div>

                  <div className="form-actions">
                    <button
                      onClick={handleSave}
                      disabled={saving || !formData.title.trim()}
                      className="btn-save"
                    >
                      <FaSave /> {saving ? 'Saving...' : (editing ? 'Update Sermon' : 'Create Sermon')}
                    </button>
                    <button
                      onClick={resetForm}
                      className="btn-cancel"
                      disabled={saving}
                    >
                      <FaTimes /> Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Sermons List */}
            <div className="sermons-list">
              {sermons.length === 0 ? (
                <div className="empty-state">
                  <p>No sermons yet. Click "Add New Sermon" to get started.</p>
                </div>
              ) : (
                sermons.map((sermon) => {
                  const sermonType = getSermonType(sermon);
                  return (
                    <div key={sermon.id} className="sermon-card-admin">
                      {sermon.thumbnail_url && (
                        <div className="sermon-thumbnail">
                          <img src={sermon.thumbnail_url} alt={sermon.title} />
                        </div>
                      )}
                      <div className="sermon-details">
                        <div className="sermon-header">
                          <h3>{sermon.title}</h3>
                          <span className={`sermon-type-badge ${sermonType}`}>
                            {sermonType === 'video' && <FaVideo />}
                            {sermonType === 'audio' && <FaHeadphones />}
                            {sermonType === 'text' && <FaUser />}
                            {sermonType.charAt(0).toUpperCase() + sermonType.slice(1)}
                          </span>
                        </div>
                        {sermon.speaker && (
                          <p className="sermon-speaker">
                            <FaUser /> {sermon.speaker}
                          </p>
                        )}
                        {sermon.date && (
                          <p className="sermon-date">
                            <FaCalendarAlt /> {formatDate(sermon.date)}
                          </p>
                        )}
                        {sermon.description && (
                          <p className="sermon-description">{sermon.description.substring(0, 150)}{sermon.description.length > 150 ? '...' : ''}</p>
                        )}
                        <div className="sermon-urls">
                          {sermon.video_url && (
                            <span className="url-badge">
                              <FaVideo /> Video
                            </span>
                          )}
                          {sermon.audio_url && (
                            <span className="url-badge">
                              <FaHeadphones /> Audio
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="sermon-actions">
                        <button
                          onClick={() => handleEdit(sermon)}
                          className="btn-edit-small"
                          title="Edit sermon"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDelete(sermon)}
                          className="btn-delete-small"
                          title="Delete sermon"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </section>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Upload Progress Bar */}
      {uploadProgress.show && (
        <div className="progress-overlay">
          <div className="progress-bar-container">
            <div className="progress-header">
              <h3>{uploadProgress.fileName}</h3>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${uploadProgress.progress}%` }}></div>
              <div className="progress-text">{uploadProgress.progress}%</div>
            </div>
            <p className="progress-status">Uploading...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSermons;
