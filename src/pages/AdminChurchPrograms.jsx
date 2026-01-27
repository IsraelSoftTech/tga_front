import React, { useState, useEffect } from 'react';
import { FaSave, FaTrash, FaUpload, FaEdit, FaTimes, FaPlus, FaCalendarAlt, FaClock, FaMapMarkerAlt } from 'react-icons/fa';
import AdminHeader from '../components/AdminHeader';
import Toast from '../components/Toast';
import { programsAPI, homeAPI } from '../api';
import './AdminCommon.css';
import './AdminChurchPrograms.css';

const AdminChurchPrograms = () => {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [toast, setToast] = useState(null);
  const [uploadProgress, setUploadProgress] = useState({ show: false, progress: 0, fileName: '' });

  // Form state for new/edit program
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    day_of_week: '',
    time: '',
    location: '',
    image_url: ''
  });

  useEffect(() => {
    loadPrograms();
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadPrograms = async () => {
    try {
      setLoading(true);
      const response = await programsAPI.getAll();
      if (response.success) {
        setPrograms(response.data || []);
      }
    } catch (error) {
      console.error('Error loading programs:', error);
      showToast('Failed to load programs. Please refresh the page.', 'error');
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
      title: '',
      description: '',
      day_of_week: '',
      time: '',
      location: '',
      image_url: ''
    });
    setEditing(null);
    setShowAddForm(false);
  };

  const handleSave = async () => {
    if (!formData.title.trim()) {
      showToast('Title is required', 'error');
      return;
    }

    try {
      setSaving(true);
      let response;
      
      if (editing) {
        response = await programsAPI.update(editing.id, formData);
      } else {
        response = await programsAPI.create(formData);
      }

      if (response.success) {
        // Update state directly instead of reloading
        if (editing) {
          setPrograms(prev => prev.map(p => p.id === editing.id ? { ...p, ...formData } : p));
        } else {
          // Add new program to the list
          setPrograms(prev => [...prev, { id: response.data?.id || Date.now(), ...formData }]);
        }
        resetForm();
        showToast(editing ? '✨ Program updated successfully! Changes are now live.' : '✨ Program created successfully!', 'success');
      } else {
        showToast('Failed to save: ' + (response.error || 'Unknown error'), 'error');
      }
    } catch (error) {
      console.error('Error saving program:', error);
      showToast('Failed to save program. Please try again.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (program) => {
    if (!window.confirm(`Are you sure you want to delete "${program.title}"?`)) {
      return;
    }

    try {
      const response = await programsAPI.delete(program.id);
      if (response.success) {
        // Update state directly instead of reloading
        setPrograms(prev => prev.filter(p => p.id !== program.id));
        showToast('🗑️ Program deleted successfully!', 'success');
      } else {
        showToast('Failed to delete: ' + (response.error || 'Unknown error'), 'error');
      }
    } catch (error) {
      console.error('Error deleting program:', error);
      showToast('Failed to delete program. Please try again.', 'error');
    }
  };

  const handleEdit = (program) => {
    setFormData({
      title: program.title || '',
      description: program.description || '',
      day_of_week: program.day_of_week || '',
      time: program.time || '',
      location: program.location || '',
      image_url: program.image_url || ''
    });
    setEditing(program);
    setShowAddForm(true);
  };

  const handleImageUpload = async (event, programId = null) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Please select an image file', 'warning');
      return;
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
          const response = await homeAPI.uploadFile(base64, fileName, 'images');
          setUploadProgress({ show: true, progress: 90, fileName: file.name });

          if (response.success && response.url) {
            setUploadProgress({ show: true, progress: 100, fileName: file.name });
            
            if (programId) {
              // Update existing program
              const program = programs.find(p => p.id === programId);
              if (program) {
                const updatedData = { ...formData, image_url: response.url };
                setFormData(updatedData);
                const updateResponse = await programsAPI.update(programId, updatedData);
                if (updateResponse.success) {
                  // Update state directly instead of reloading
                  setPrograms(prev => prev.map(p => p.id === programId ? { ...p, ...updatedData } : p));
                }
              }
            } else {
              // Set for new program
              setFormData(prev => ({ ...prev, image_url: response.url }));
            }
            
            setUploadProgress({ show: false, progress: 0, fileName: '' });
            showToast(' Image uploaded successfully!', 'success');
          } else {
            setUploadProgress({ show: false, progress: 0, fileName: '' });
            showToast('Upload failed: ' + (response.error || 'Unknown error'), 'error');
          }
        } catch (error) {
          console.error('Upload error:', error);
          setUploadProgress({ show: false, progress: 0, fileName: '' });
          showToast('Failed to upload image: ' + (error.message || 'Unknown error'), 'error');
        } finally {
          setSaving(false);
        }
      };

      reader.onerror = (error) => {
        console.error('❌ FileReader error:', error);
        setUploadProgress({ show: false, progress: 0, fileName: '' });
        showToast('Failed to read image file', 'error');
        setSaving(false);
      };

      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Image upload error:', error);
      setUploadProgress({ show: false, progress: 0, fileName: '' });
      showToast('Failed to upload image: ' + (error.message || 'Unknown error'), 'error');
      setSaving(false);
    }
  };

  const getDayIcon = (day) => {
    const dayIcons = {
      'Sunday': '📅',
      'Monday': '📅',
      'Tuesday': '📅',
      'Wednesday': '📅',
      'Thursday': '📅',
      'Friday': '📅',
      'Saturday': '📅'
    };
    return dayIcons[day] || '📅';
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
            <h1>Admin - Church Programs</h1>
            <p>Manage church programs and activities</p>
          </div>

          <div className="admin-programs-content">
            <div className="admin-programs-header">
              <h2>Programs ({programs.length})</h2>
              <button
                className="btn-add-program"
                onClick={() => {
                  resetForm();
                  setShowAddForm(true);
                }}
                disabled={showAddForm}
              >
                <FaPlus /> Add New Program
              </button>
            </div>

            {/* Add/Edit Form */}
            {showAddForm && (
              <div className="program-form-card">
                <div className="form-header">
                  <h3>{editing ? 'Edit Program' : 'Add New Program'}</h3>
                  <button className="btn-close-form" onClick={resetForm}>
                    <FaTimes />
                  </button>
                </div>
                
                <div className="form-body">
                  <div className="form-row">
                    <div className="form-group">
                      <label>Title *</label>
                      <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        placeholder="e.g., Sunday Service"
                        className="admin-input"
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Description</label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        placeholder="Program description..."
                        rows="4"
                        className="admin-input"
                      />
                    </div>
                  </div>

                  <div className="form-row form-row-2">
                    <div className="form-group">
                      <label>Day of Week</label>
                      <select
                        name="day_of_week"
                        value={formData.day_of_week}
                        onChange={handleInputChange}
                        className="admin-input"
                      >
                        <option value="">Select day</option>
                        <option value="Sunday">Sunday</option>
                        <option value="Monday">Monday</option>
                        <option value="Tuesday">Tuesday</option>
                        <option value="Wednesday">Wednesday</option>
                        <option value="Thursday">Thursday</option>
                        <option value="Friday">Friday</option>
                        <option value="Saturday">Saturday</option>
                        <option value="Various Days">Various Days</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Time</label>
                      <input
                        type="text"
                        name="time"
                        value={formData.time}
                        onChange={handleInputChange}
                        placeholder="e.g., 9:00 AM"
                        className="admin-input"
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Location</label>
                      <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleInputChange}
                        placeholder="e.g., Main Sanctuary"
                        className="admin-input"
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Image</label>
                      {formData.image_url ? (
                        <div className="image-preview-container">
                          <img src={formData.image_url} alt="Program preview" className="image-preview" />
                          <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, image_url: '' }))}
                            className="btn-remove-image"
                          >
                            <FaTimes /> Remove
                          </button>
                        </div>
                      ) : (
                        <label className="btn-upload-image">
                          <FaUpload /> Upload Image
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageUpload(e, editing?.id)}
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
                      <FaSave /> {saving ? 'Saving...' : (editing ? 'Update Program' : 'Create Program')}
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

            {/* Programs List */}
            <div className="programs-list">
              {programs.length === 0 ? (
                <div className="empty-state">
                  <p>No programs yet. Click "Add New Program" to get started.</p>
                </div>
              ) : (
                programs.map((program) => (
                  <div key={program.id} className="program-card-admin">
                    {program.image_url && (
                      <div className="program-image">
                        <img src={program.image_url} alt={program.title} />
                      </div>
                    )}
                    <div className="program-details">
                      <h3>{program.title}</h3>
                      {program.description && <p className="program-description">{program.description}</p>}
                      <div className="program-meta">
                        {program.day_of_week && (
                          <span className="meta-item">
                            <FaCalendarAlt /> {program.day_of_week}
                          </span>
                        )}
                        {program.time && (
                          <span className="meta-item">
                            <FaClock /> {program.time}
                          </span>
                        )}
                        {program.location && (
                          <span className="meta-item">
                            <FaMapMarkerAlt /> {program.location}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="program-actions">
                      <button
                        onClick={() => handleEdit(program)}
                        className="btn-edit-small"
                        title="Edit program"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDelete(program)}
                        className="btn-delete-small"
                        title="Delete program"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                ))
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

export default AdminChurchPrograms;
