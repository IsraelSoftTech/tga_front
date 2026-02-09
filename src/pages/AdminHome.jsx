import React, { useState, useEffect } from 'react';
import { FaHome, FaSave, FaTrash, FaUpload, FaImage, FaEdit, FaTimes, FaVideo } from 'react-icons/fa';
import AdminHeader from '../components/AdminHeader';
import Toast from '../components/Toast';
import { homeAPI } from '../api';
import './AdminCommon.css';
import './AdminHome.css';

const AdminHome = () => {
  const [content, setContent] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(null);
  const [preview, setPreview] = useState(null);
  const [toast, setToast] = useState(null);
  const [uploadProgress, setUploadProgress] = useState({ show: false, progress: 0, fileName: '' });

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

  // Get API base URL (same logic as api.js)
  const getApiBaseUrl = () => {
    if (process.env.REACT_APP_API_URL) {
      return process.env.REACT_APP_API_URL;
    }
    const hostname = window.location.hostname;
    if (hostname === 'towngreen.onrender.com' || hostname.includes('towngreen.onrender.com')) {
      return 'https://api.farmsolutionss.com/api';
    }
    if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '') {
      return 'http://localhost:5000/api';
    }
    return 'https://api.farmsolutionss.com/api';
  };

  // Custom upload function with progress tracking
  const uploadFileWithProgress = async (base64, fileName, subDir, onProgress) => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const apiBaseUrl = getApiBaseUrl();
      const url = `${apiBaseUrl}/home/upload`;
      
      // Track upload progress
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percentComplete = Math.round((e.loaded / e.total) * 100);
          if (onProgress) {
            onProgress(percentComplete);
          }
        }
      });
      
      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            resolve(response);
          } catch (error) {
            reject(new Error('Failed to parse response'));
          }
        } else {
          try {
            const error = JSON.parse(xhr.responseText);
            reject(new Error(error.error || error.message || 'Upload failed'));
          } catch {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        }
      });
      
      xhr.addEventListener('error', () => {
        reject(new Error('Network error during upload'));
      });
      
      xhr.addEventListener('abort', () => {
        reject(new Error('Upload aborted'));
      });
      
      xhr.open('POST', url);
      
      // Add authorization header
      const token = localStorage.getItem('authToken');
      if (token) {
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      }
      xhr.setRequestHeader('Content-Type', 'application/json');
      
      const payload = JSON.stringify({
        file: base64,
        fileName: fileName,
        subDir: subDir
      });
      
      xhr.send(payload);
    });
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
          const subDir = contentKey && contentKey.includes('logo') ? 'logos' : 'images';
          
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

  // Component for managing multiple hero background images
  const HeroBackgroundImages = ({ section }) => {
    const imagesJson = getValue(section, 'background_images', '[]');
    const [images, setImages] = useState([]);

    useEffect(() => {
      try {
        const parsed = JSON.parse(imagesJson || '[]');
        setImages(Array.isArray(parsed) ? parsed : []);
      } catch (error) {
        setImages([]);
      }
    }, [imagesJson, content]);

    const handleAddImage = async (event) => {
      const file = event.target.files[0];
      if (!file || !file.type.startsWith('image/')) {
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
            const response = await homeAPI.uploadFile(base64, fileName, 'images');
            
            if (response.success && response.url) {
              const newImages = [...images, response.url];
              const imagesJsonString = JSON.stringify(newImages);
              await handleSave(section, 'background_images', imagesJsonString, 'json', 0);
              showToast('🖼️ Background image added successfully!', 'success');
            } else {
              showToast('Upload failed: ' + (response.error || 'Unknown error'), 'error');
            }
          } catch (error) {
            console.error('Upload error:', error);
            showToast('Failed to upload image', 'error');
          } finally {
            setSaving(false);
          }
        };
        reader.readAsDataURL(file);
      } catch (error) {
        console.error('Image upload error:', error);
        showToast('Failed to upload image', 'error');
        setSaving(false);
      }
    };

    const handleRemoveImage = async (imageUrl, index) => {
      if (!window.confirm('Are you sure you want to remove this background image?')) {
        return;
      }

      try {
        // Remove from array
        const newImages = images.filter((_, i) => i !== index);
        const imagesJsonString = JSON.stringify(newImages);
        await handleSave(section, 'background_images', imagesJsonString, 'json', 0);
        showToast('🗑️ Background image removed!', 'success');
      } catch (error) {
        console.error('Error removing image:', error);
        showToast('Failed to remove image', 'error');
      }
    };

    return (
      <div className="admin-editable-field">
        <label>Hero Background Images (Slideshow)</label>
        <p className="field-description">Add multiple images for a slideshow. Images will change every 3 seconds.</p>
        
        {images.length > 0 && (
          <div className="images-grid">
            {images.map((imageUrl, index) => (
              <div key={index} className="image-item">
                <div className="image-preview">
                  <img src={imageUrl} alt={`Background ${index + 1}`} />
                </div>
                <div className="image-item-actions">
                  <span className="image-index">#{index + 1}</span>
                  <button
                    onClick={() => handleRemoveImage(imageUrl, index)}
                    className="btn-delete-small"
                    title="Remove image"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="admin-field-actions">
          <label className="btn-edit" style={{ margin: 0, cursor: 'pointer' }}>
            <FaUpload /> Add Background Image
            <input
              type="file"
              accept="image/*"
              onChange={handleAddImage}
              style={{ display: 'none' }}
              disabled={saving}
            />
          </label>
          {images.length > 0 && (
            <span className="image-count">{images.length} image{images.length !== 1 ? 's' : ''} added</span>
          )}
        </div>
      </div>
    );
  };

  // Component for managing gallery items (images and videos)
  const GalleryManager = ({ section }) => {
    const galleryJson = getValue(section, 'items', '[]');
    const [items, setItems] = useState([]);

    useEffect(() => {
      try {
        const parsed = JSON.parse(galleryJson || '[]');
        setItems(Array.isArray(parsed) ? parsed : []);
      } catch (error) {
        setItems([]);
      }
    }, [galleryJson, content]);

    const handleAddImage = async (event) => {
      const file = event.target.files[0];
      if (!file || !file.type.startsWith('image/')) {
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
            const response = await homeAPI.uploadFile(base64, fileName, 'images');
            
            if (response.success && response.url) {
              const newItems = [...items, { type: 'image', url: response.url, caption: '' }];
              const itemsJsonString = JSON.stringify(newItems);
              await handleSave(section, 'items', itemsJsonString, 'json', 0);
              showToast('🖼️ Image added to gallery!', 'success');
            } else {
              showToast('Upload failed: ' + (response.error || 'Unknown error'), 'error');
            }
          } catch (error) {
            console.error('Upload error:', error);
            showToast('Failed to upload image', 'error');
          } finally {
            setSaving(false);
          }
        };
        reader.readAsDataURL(file);
      } catch (error) {
        console.error('Image upload error:', error);
        showToast('Failed to upload image', 'error');
        setSaving(false);
      }
    };

    const handleAddVideoFile = async (event) => {
      const file = event.target.files[0];
      if (!file) {
        console.log('No file selected');
        return;
      }

      if (!file.type.startsWith('video/')) {
        showToast('Please select a video file', 'warning');
        return;
      }

      // Check file size (100MB = 100 * 1024 * 1024 bytes)
      const maxSize = 100 * 1024 * 1024; // 100MB
      const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
      
      if (file.size > maxSize) {
        showToast(`File size (${fileSizeMB} MB) exceeds maximum allowed size of 100 MB`, 'error');
        return;
      }

      console.log('📤 Starting video upload:', {
        fileName: file.name,
        fileSize: file.size,
        fileSizeMB: fileSizeMB,
        fileType: file.type
      });

      try {
        setSaving(true);
        setUploadProgress({ show: true, progress: 0, fileName: file.name });
        
        // Read file to base64 (same as image upload)
        const reader = new FileReader();
        reader.onloadend = async () => {
          try {
            setUploadProgress({ show: true, progress: 10, fileName: file.name });
            const base64 = reader.result;
            
            if (!base64) {
              throw new Error('Failed to read file. File may be corrupted or too large.');
            }
            
            console.log(`📦 File read successfully. Base64 length: ${base64.length} characters`);
            const fileName = file.name;
            
            // Use the same upload method as images
            setUploadProgress({ show: true, progress: 30, fileName: file.name });
            console.log(`🚀 Sending to server...`);
            const response = await homeAPI.uploadFile(base64, fileName, 'videos');
            console.log(`📥 Server response:`, response);
            setUploadProgress({ show: true, progress: 90, fileName: file.name });
            
            if (response.success && response.url) {
              setUploadProgress({ show: true, progress: 100, fileName: file.name });
              const newItems = [...items, { type: 'video', url: response.url, caption: '', isFile: true }];
              const itemsJsonString = JSON.stringify(newItems);
              await handleSave(section, 'items', itemsJsonString, 'json', 0);
              setUploadProgress({ show: false, progress: 0, fileName: '' });
              showToast('🎥 Video uploaded and added to gallery!', 'success');
            } else {
              setUploadProgress({ show: false, progress: 0, fileName: '' });
              showToast('Upload failed: ' + (response.error || 'Unknown error'), 'error');
            }
          } catch (error) {
            console.error('Upload error:', error);
            setUploadProgress({ show: false, progress: 0, fileName: '' });
            showToast('Failed to upload video: ' + (error.message || 'Unknown error'), 'error');
          } finally {
            setSaving(false);
          }
        };
        
        reader.onerror = (error) => {
          console.error('❌ FileReader error:', error);
          setUploadProgress({ show: false, progress: 0, fileName: '' });
          showToast('Failed to read video file', 'error');
          setSaving(false);
        };
        
        reader.readAsDataURL(file);
      } catch (error) {
        console.error('Video upload error:', error);
        setUploadProgress({ show: false, progress: 0, fileName: '' });
        showToast('Failed to upload video', 'error');
        setSaving(false);
      }
    };

    const handleAddVideoUrl = async () => {
      const videoUrl = window.prompt('Enter video URL (YouTube, Vimeo, etc.):');
      if (!videoUrl) return;

      // Convert YouTube URL to embed format if needed
      let embedUrl = videoUrl;
      if (videoUrl.includes('youtube.com/watch')) {
        const videoId = videoUrl.split('v=')[1]?.split('&')[0];
        if (videoId) {
          embedUrl = `https://www.youtube.com/embed/${videoId}`;
        }
      } else if (videoUrl.includes('youtu.be/')) {
        const videoId = videoUrl.split('youtu.be/')[1]?.split('?')[0];
        if (videoId) {
          embedUrl = `https://www.youtube.com/embed/${videoId}`;
        }
      } else if (videoUrl.includes('vimeo.com/')) {
        const videoId = videoUrl.split('vimeo.com/')[1]?.split('?')[0];
        if (videoId) {
          embedUrl = `https://player.vimeo.com/video/${videoId}`;
        }
      }

      try {
        const newItems = [...items, { type: 'video', url: embedUrl, caption: '', isFile: false }];
        const itemsJsonString = JSON.stringify(newItems);
        await handleSave(section, 'items', itemsJsonString, 'json', 0);
        showToast('🎥 Video added to gallery!', 'success');
      } catch (error) {
        console.error('Error adding video:', error);
        showToast('Failed to add video', 'error');
      }
    };

    const handleRemoveItem = async (index) => {
      if (!window.confirm('Are you sure you want to remove this item from the gallery?')) {
        return;
      }

      try {
        const newItems = items.filter((_, i) => i !== index);
        const itemsJsonString = JSON.stringify(newItems);
        await handleSave(section, 'items', itemsJsonString, 'json', 0);
        showToast('🗑️ Item removed from gallery!', 'success');
      } catch (error) {
        console.error('Error removing item:', error);
        showToast('Failed to remove item', 'error');
      }
    };

    const handleUpdateCaption = async (index, caption) => {
      try {
        const newItems = [...items];
        newItems[index].caption = caption;
        const itemsJsonString = JSON.stringify(newItems);
        await handleSave(section, 'items', itemsJsonString, 'json', 0);
      } catch (error) {
        console.error('Error updating caption:', error);
      }
    };

    return (
      <div className="admin-editable-field">
        <label>Gallery Items</label>
        <p className="field-description">Add images or videos to the church gallery. Items will display in a responsive grid.</p>
        
        {items.length > 0 && (
          <div className="gallery-items-grid">
            {items.map((item, index) => (
              <div key={index} className="gallery-item-admin">
                {item.type === 'image' ? (
                  <div className="gallery-item-preview">
                    <img src={item.url} alt={`Gallery ${index + 1}`} />
                    <div className="gallery-item-type">Image</div>
                  </div>
                ) : (
                  <div className="gallery-item-preview">
                    {item.isFile ? (
                      <video
                        src={item.url}
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                        muted
                      />
                    ) : (
                      <div className="gallery-video-preview">
                        <FaVideo style={{ fontSize: '2rem', color: '#666' }} />
                      </div>
                    )}
                    <div className="gallery-item-type">Video {item.isFile ? '(File)' : '(URL)'}</div>
                  </div>
                )}
                <input
                  type="text"
                  placeholder="Caption (optional)"
                  value={item.caption || ''}
                  onChange={(e) => {
                    const newItems = [...items];
                    newItems[index].caption = e.target.value;
                    setItems(newItems);
                  }}
                  onBlur={() => handleUpdateCaption(index, items[index].caption || '')}
                  className="gallery-caption-input"
                />
                <button
                  onClick={() => handleRemoveItem(index)}
                  className="btn-delete-small"
                  title="Remove item"
                >
                  <FaTrash /> Remove
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="admin-field-actions">
          <label className="btn-edit" style={{ margin: 0, cursor: 'pointer' }}>
            <FaUpload /> Add Image
            <input
              type="file"
              accept="image/*"
              onChange={handleAddImage}
              style={{ display: 'none' }}
              disabled={saving}
            />
          </label>
          <label className="btn-edit" style={{ margin: 0, cursor: 'pointer' }}>
            <FaUpload /> Add Video File
            <input
              type="file"
              accept="video/*"
              onChange={handleAddVideoFile}
              style={{ display: 'none' }}
              disabled={saving}
            />
          </label>
          <button onClick={handleAddVideoUrl} className="btn-edit" disabled={saving}>
            <FaVideo /> Add Video URL
          </button>
          {items.length > 0 && (
            <span className="image-count">{items.length} item{items.length !== 1 ? 's' : ''} in gallery</span>
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

      {/* Upload Progress Bar */}
      {uploadProgress.show && (
        <div className="upload-progress-overlay">
          <div className="upload-progress-container">
            <div className="upload-progress-header">
              <h3>Uploading Video</h3>
              <span className="upload-progress-close" onClick={() => setUploadProgress({ show: false, progress: 0, fileName: '' })}>
                <FaTimes />
              </span>
            </div>
            <div className="upload-progress-file-name">{uploadProgress.fileName}</div>
            <div className="upload-progress-bar-wrapper">
              <div className="upload-progress-bar">
                <div 
                  className="upload-progress-bar-fill" 
                  style={{ width: `${uploadProgress.progress}%` }}
                ></div>
              </div>
              <div className="upload-progress-percentage">{uploadProgress.progress}%</div>
            </div>
            <div className="upload-progress-status">
              {uploadProgress.progress < 100 ? 'Uploading...' : 'Processing...'}
            </div>
          </div>
        </div>
      )}
      
      <section className="admin-section">
        <div className="container">
          <div className="admin-page-header">
            <h1>Admin - Home Page Content</h1>
            <p>Edit all content displayed on the home page. Changes will be reflected immediately.</p>
          </div>

          <div className="admin-content-editor">
            {/* Logo Section */}
            <div className="admin-content-section">
              <h2 className="section-title">Logo</h2>
              <EditableImage section="site" contentKey="logo" label="Main Logo" order={1} />
              <EditableImage section="site" contentKey="logo_footer" label="Footer Logo (Optional)" order={2} />
              <EditableImage section="site" contentKey="favicon" label="Favicon (Optional)" order={3} />
            </div>

            {/* Gallery Section */}
            <div className="admin-content-section">
              <h2 className="section-title">Church Gallery</h2>
              <EditableText section="gallery" contentKey="title" label="Section Title" defaultValue="Church Gallery" order={1} />
              <GalleryManager section="gallery" />
            </div>

            {/* Hero Section */}
            <div className="admin-content-section">
              <h2 className="section-title">Hero Section</h2>
              <HeroBackgroundImages section="hero" />
              <EditableText section="hero" contentKey="title" label="Hero Title" defaultValue="Welcome to Town Green Assembly" order={2} />
              <EditableText section="hero" contentKey="subtitle" label="Hero Subtitle" defaultValue="A community of faith, hope, and love" order={3} />
              <EditableText section="hero" contentKey="button1_text" label="Button 1 Text" defaultValue="Learn More" order={4} />
              <EditableText section="hero" contentKey="button1_link" label="Button 1 Link" defaultValue="/about" order={5} />
              <EditableText section="hero" contentKey="button2_text" label="Button 2 Text" defaultValue="Get Involved" order={6} />
              <EditableText section="hero" contentKey="button2_link" label="Button 2 Link" defaultValue="/contact" order={7} />
            </div>

            {/* About Section */}
            <div className="admin-content-section">
              <h2 className="section-title">About Section</h2>
              <EditableText section="about" contentKey="title" label="Section Title" defaultValue="About Us" order={1} />
              <EditableText section="about" contentKey="text1" label="About Text (Paragraph 1)" defaultValue="Town Green Assembly is a vibrant community of believers dedicated to spreading the message of hope, love, and faith. We are committed to building strong relationships with God and each other, creating a welcoming environment for all who seek spiritual growth and fellowship." multiline={true} order={2} />
              <EditableText section="about" contentKey="text2" label="About Text (Paragraph 2)" defaultValue="Our mission is to serve our community, nurture spiritual development, and make a positive impact in the lives of those around us. We believe in the power of prayer, the importance of community, and the transformative message of the Gospel." multiline={true} order={3} />
              <EditableText section="about" contentKey="stat1_number" label="Stat 1 - Number" defaultValue="500+" order={4} />
              <EditableText section="about" contentKey="stat1_label" label="Stat 1 - Label" defaultValue="Members" order={5} />
              <EditableText section="about" contentKey="stat2_number" label="Stat 2 - Number" defaultValue="15+" order={6} />
              <EditableText section="about" contentKey="stat2_label" label="Stat 2 - Label" defaultValue="Years" order={7} />
              <EditableText section="about" contentKey="stat3_number" label="Stat 3 - Number" defaultValue="20+" order={8} />
              <EditableText section="about" contentKey="stat3_label" label="Stat 3 - Label" defaultValue="Programs" order={9} />
            </div>

            {/* Programs Section */}
            <div className="admin-content-section">
              <h2 className="section-title">Programs Section</h2>
              <EditableText section="programs" contentKey="title" label="Section Title" defaultValue="Church Programs" order={1} />
              
              {[1, 2, 3, 4, 5, 6].map((num) => (
                <div key={num} className="program-item-editor">
                  <h3>Program {num}</h3>
                  <EditableText section="programs" contentKey={`program${num}_title`} label={`Program ${num} - Title`} defaultValue={num === 1 ? "Sunday Service" : num === 2 ? "Bible Study" : num === 3 ? "Worship Night" : num === 4 ? "Children's Ministry" : num === 5 ? "Youth Group" : "Community Outreach"} order={num * 10 + 1} />
                  <EditableText section="programs" contentKey={`program${num}_description`} label={`Program ${num} - Description`} defaultValue={num === 1 ? "Join us every Sunday for worship, prayer, and inspiring messages from the Word." : num === 2 ? "Deep dive into Scripture with our weekly Bible study groups for all ages." : num === 3 ? "Experience powerful worship and praise every Friday evening." : num === 4 ? "Nurturing young hearts with age-appropriate lessons and activities." : num === 5 ? "Engaging programs for teenagers to grow in faith and build friendships." : "Making a difference in our community through service and love."} multiline={true} order={num * 10 + 2} />
                </div>
              ))}
            </div>

            {/* Testimonies Section */}
            <div className="admin-content-section">
              <h2 className="section-title">Testimonies Section</h2>
              <EditableText section="testimonies" contentKey="title" label="Section Title" defaultValue="Testimonies" order={1} />
              
              {[1, 2, 3].map((num) => (
                <div key={num} className="testimony-item-editor">
                  <h3>Testimony {num}</h3>
                  <EditableText section="testimonies" contentKey={`testimony${num}_text`} label={`Testimony ${num} - Text`} defaultValue={num === 1 ? "Town Green Assembly has been a blessing in my life. The community here is warm, welcoming, and truly cares about each other." : num === 2 ? "I found hope and purpose here. The messages are inspiring and the worship is powerful. This is truly a place where God moves." : "My family has grown so much spiritually since joining. The children's ministry is excellent and my kids love coming to church."} multiline={true} order={num * 10 + 1} />
                  <EditableText section="testimonies" contentKey={`testimony${num}_author`} label={`Testimony ${num} - Author`} defaultValue={num === 1 ? "Sarah M." : num === 2 ? "John D." : "Maria L."} order={num * 10 + 2} />
                </div>
              ))}
            </div>

            {/* Prayer Section */}
            <div className="admin-content-section">
              <h2 className="section-title">Prayer Section</h2>
              <EditableText section="prayer" contentKey="title" label="Section Title" defaultValue="Prayer Requests" order={1} />
              <EditableText section="prayer" contentKey="description" label="Prayer Description" defaultValue="We believe in the power of prayer. Share your prayer requests with us, and our community will lift you up in prayer. Whether you're facing challenges, celebrating victories, or seeking guidance, we're here for you." multiline={true} order={2} />
              <EditableText section="prayer" contentKey="button_text" label="Button Text" defaultValue="Submit Prayer Request" order={3} />
              <EditableText section="prayer" contentKey="button_link" label="Button Link" defaultValue="/prayers" order={4} />
              <EditableImage section="prayer" contentKey="image" label="Prayer Section Image" order={5} />
            </div>

            {/* Contact Section */}
            <div className="admin-content-section">
              <h2 className="section-title">Contact Section</h2>
              <EditableText section="contact" contentKey="title" label="Section Title" defaultValue="Get In Touch" order={1} />
              <EditableText section="contact" contentKey="address" label="Address" defaultValue="123 Church Street<br />Town Green, ST 12345" multiline={true} order={2} />
              <EditableText section="contact" contentKey="phone" label="Phone" defaultValue="(555) 123-4567" order={3} />
              <EditableText section="contact" contentKey="email" label="Email" defaultValue="info@towngreenassembly.org" order={4} />
              <EditableText section="contact" contentKey="service_times" label="Service Times" defaultValue="Sunday: 9:00 AM & 11:00 AM<br />Wednesday: 7:00 PM" multiline={true} order={5} />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AdminHome;
