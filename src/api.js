// API Configuration and Endpoints
// Robust configuration that works in both development and production
const getApiBaseUrl = () => {
  // Priority 1: Use runtime config from window object (injected at runtime)
  // This works even if environment variables aren't available at build time
  if (window.__API_CONFIG__ && window.__API_CONFIG__.apiUrl) {
    const apiUrl = window.__API_CONFIG__.apiUrl;
    console.log('🌐 Using API URL from runtime config:', apiUrl);
    return apiUrl;
  }
  
  // Priority 2: Use explicit environment variable if set (build-time)
  if (process.env.REACT_APP_API_URL) {
    console.log('🌐 Using API URL from environment variable:', process.env.REACT_APP_API_URL);
    return process.env.REACT_APP_API_URL;
  }
  
  // Priority 3: Detect environment based on current hostname
  const hostname = window.location.hostname;
  const protocol = window.location.protocol;
  
  // Development environment (localhost)
  if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '') {
    const apiUrl = 'http://localhost:5000/api';
    console.log('🌐 Development mode detected. Using API:', apiUrl);
    return apiUrl;
  }
  
  // Production environment - any non-localhost domain uses production API
  // Backend is at https://tga.api.farmsolutionss.com/ with routes under /api
  const apiUrl = 'https://tga.api.farmsolutionss.com/api';
  console.log('🌐 Production mode detected (hostname:', hostname, '). Using API:', apiUrl);
  return apiUrl;
};

// Get base URL and ensure it doesn't end with a slash
let API_BASE_URL = getApiBaseUrl();
// Remove trailing slash if present to avoid double slashes
API_BASE_URL = API_BASE_URL.replace(/\/+$/, '');

// Log the API configuration (helpful for debugging)
console.log('📡 API Base URL:', API_BASE_URL);
console.log('📍 Current hostname:', window.location.hostname);
console.log('🔧 Environment:', process.env.NODE_ENV);

// Helper function to make API requests
async function apiRequest(endpoint, options = {}) {
  // Ensure endpoint starts with / and base URL doesn't end with /
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${API_BASE_URL}${cleanEndpoint}`;
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // Include cookies for authentication
  };

  // Add authorization token if available (but not for login endpoint)
  const token = localStorage.getItem('authToken');
  if (token && !endpoint.includes('/auth/login')) {
    defaultOptions.headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
    // Add cache control to prevent stale data
    cache: 'no-cache',
  };

  try {
    const response = await fetch(url, config);
    
    // Handle network errors (CORS, connection refused, etc.)
    if (!response.ok && response.status === 0) {
      throw new Error(`Network error: Unable to connect to ${API_BASE_URL}. Please check CORS configuration and API availability.`);
    }
    
    // Handle non-JSON responses
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      throw new Error(text || 'Invalid response from server');
    }

    const data = await response.json();

    // Handle errors
    if (!response.ok) {
      // Backend returns error in 'error' field, not 'message'
      const errorMessage = data.error || data.message || `HTTP error! status: ${response.status}`;
      throw new Error(errorMessage);
    }

    return data;
  } catch (error) {
    // Enhanced error logging for debugging
    console.error('API Request Error:', {
      url,
      endpoint,
      baseUrl: API_BASE_URL,
      error: error.message,
      hostname: window.location.hostname
    });
    
    // Re-throw with more context if it's a network error
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      throw new Error(`Cannot connect to API at ${API_BASE_URL}. Please verify the backend is running and CORS is configured correctly.`);
    }
    
    throw error;
  }
}

// ============================================
// AUTHENTICATION API
// ============================================

export const authAPI = {
  // Admin login
  login: async (username, password) => {
    // Don't use apiRequest for login to avoid adding Authorization header
    const url = `${API_BASE_URL}/auth/login`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ username, password }),
    });
    
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      throw new Error(text || 'Invalid response from server');
    }
    
    const data = await response.json();
    
    if (!response.ok) {
      // Handle different response formats (message or error field)
      const errorMessage = data.message || data.error || `HTTP error! status: ${response.status}`;
      throw new Error(errorMessage);
    }
    
    // Handle both success formats
    if (data.success === false) {
      const errorMessage = data.message || data.error || 'Login failed';
      throw new Error(errorMessage);
    }
    
    return data;
  },

  // Admin logout
  logout: async () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    return apiRequest('/auth/logout', {
      method: 'POST',
    });
  },

  // Check if user is authenticated
  checkAuth: async () => {
    return apiRequest('/auth/check');
  },
};

// ============================================
// SERMONS API
// ============================================

export const sermonsAPI = {
  // Get all sermons
  getAll: async () => {
    return apiRequest('/sermons');
  },

  // Get sermon by ID
  getById: async (id) => {
    return apiRequest(`/sermons/${id}`);
  },

  // Create sermon (admin only)
  create: async (sermonData) => {
    return apiRequest('/sermons', {
      method: 'POST',
      body: JSON.stringify(sermonData),
    });
  },

  // Update sermon (admin only)
  update: async (id, sermonData) => {
    return apiRequest(`/sermons/${id}`, {
      method: 'PUT',
      body: JSON.stringify(sermonData),
    });
  },

  // Delete sermon (admin only)
  delete: async (id) => {
    return apiRequest(`/sermons/${id}`, {
      method: 'DELETE',
    });
  },

  // Like sermon
  like: async (sermonId) => {
    return apiRequest(`/sermons/${sermonId}/like`, {
      method: 'POST',
    });
  },

  // Love sermon
  love: async (sermonId) => {
    return apiRequest(`/sermons/${sermonId}/love`, {
      method: 'POST',
    });
  },

  // Get comments for sermon
  getComments: async (sermonId) => {
    return apiRequest(`/sermons/${sermonId}/comments`);
  },

  // Add comment to sermon
  addComment: async (sermonId, commentText, authorName) => {
    return apiRequest(`/sermons/${sermonId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ 
        comment_text: commentText,
        author_name: authorName || 'Anonymous'
      }),
    });
  },

  // Get reactions for sermon
  getReactions: async (sermonId) => {
    return apiRequest(`/sermons/${sermonId}/reactions`);
  },

  // Track sermon view
  trackView: async (sermonId) => {
    return apiRequest(`/sermons/${sermonId}/view`, {
      method: 'POST',
    });
  },
};

// ============================================
// PRAYER REQUESTS API
// ============================================

export const prayersAPI = {
  // Submit prayer request
  submit: async (prayerData) => {
    return apiRequest('/prayers', {
      method: 'POST',
      body: JSON.stringify(prayerData),
    });
  },

  // Get all prayer requests (admin only)
  getAll: async () => {
    return apiRequest('/prayers');
  },

  // Mark prayer request as answered
  markAsAnswered: async (id) => {
    return apiRequest(`/prayers/${id}/answered`, {
      method: 'PUT',
    });
  },

  // Delete prayer request
  delete: async (id) => {
    return apiRequest(`/prayers/${id}`, {
      method: 'DELETE',
    });
  },
};

// ============================================
// CONTACT MESSAGES API
// ============================================

export const contactAPI = {
  // Submit contact message
  submit: async (messageData) => {
    return apiRequest('/contact', {
      method: 'POST',
      body: JSON.stringify(messageData),
    });
  },

  // Get all messages (admin only)
  getAll: async () => {
    return apiRequest('/contact');
  },

  // Mark message as read
  markAsRead: async (id) => {
    return apiRequest(`/contact/${id}/read`, {
      method: 'PUT',
    });
  },

  // Delete contact message
  delete: async (id) => {
    return apiRequest(`/contact/${id}`, {
      method: 'DELETE',
    });
  },
};



export const membershipAPI = {
  // Submit membership application
  submit: async (applicationData) => {
    return apiRequest('/membership', {
      method: 'POST',
      body: JSON.stringify(applicationData),
    });
  },

  // Get all applications with pagination (admin only)
  getAll: async (page = 1, limit = 10) => {
    return apiRequest(`/membership?page=${page}&limit=${limit}`);
  },

  // Get membership by ID
  getById: async (id) => {
    return apiRequest(`/membership/${id}`);
  },

  // Update membership application (admin only)
  update: async (id, membershipData) => {
    return apiRequest(`/membership/${id}`, {
      method: 'PUT',
      body: JSON.stringify(membershipData),
    });
  },

  // Delete membership application (admin only)
  delete: async (id) => {
    return apiRequest(`/membership/${id}`, {
      method: 'DELETE',
    });
  },
};

// ============================================
// TESTIMONIES API
// ============================================

export const testimoniesAPI = {
  // Get all testimonies
  getAll: async () => {
    return apiRequest('/testimonies');
  },

  // Submit testimony
  submit: async (testimonyData) => {
    return apiRequest('/testimonies', {
      method: 'POST',
      body: JSON.stringify(testimonyData),
    });
  },
};

// ============================================
// PROGRAMS API
// ============================================

export const programsAPI = {
  // Get all programs
  getAll: async () => {
    return apiRequest('/programs');
  },

  // Get program by ID
  getById: async (id) => {
    return apiRequest(`/programs/${id}`);
  },

  // Create program
  create: async (programData) => {
    return apiRequest('/programs', {
      method: 'POST',
      body: JSON.stringify(programData),
    });
  },

  // Update program
  update: async (id, programData) => {
    return apiRequest(`/programs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(programData),
    });
  },

  // Delete program
  delete: async (id) => {
    return apiRequest(`/programs/${id}`, {
      method: 'DELETE',
    });
  },

  // Get reactions for program
  getReactions: async (programId) => {
    return apiRequest(`/programs/${programId}/reactions`);
  },

  // Like program
  like: async (programId) => {
    return apiRequest(`/programs/${programId}/like`, {
      method: 'POST',
    });
  },

  // Love program
  love: async (programId) => {
    return apiRequest(`/programs/${programId}/love`, {
      method: 'POST',
    });
  },

  // Get comments for program
  getComments: async (programId) => {
    return apiRequest(`/programs/${programId}/comments`);
  },

  // Add comment to program
  addComment: async (programId, commentText, authorName) => {
    return apiRequest(`/programs/${programId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ 
        comment_text: commentText,
        author_name: authorName || 'Anonymous'
      }),
    });
  },
};

// ============================================
// HOME CONTENT API
// ============================================

export const homeAPI = {
  // Get all home content
  getContent: async () => {
    return apiRequest('/home/content');
  },

  // Update home content
  updateContent: async (sectionName, contentKey, contentValue, contentType = 'text', displayOrder = 0) => {
    return apiRequest('/home/content', {
      method: 'POST',
      body: JSON.stringify({
        section_name: sectionName,
        content_key: contentKey,
        content_value: contentValue,
        content_type: contentType,
        display_order: displayOrder
      }),
    });
  },

  // Delete home content
  deleteContent: async (contentId, contentValue) => {
    return apiRequest('/home/content/delete', {
      method: 'POST',
      body: JSON.stringify({
        content_id: contentId,
        content_value: contentValue
      }),
    });
  },

  // Upload file/image
  uploadFile: async (file, fileName, subDir = 'images') => {
    return apiRequest('/home/upload', {
      method: 'POST',
      body: JSON.stringify({
        file: file,
        fileName: fileName,
        subDir: subDir
      }),
    });
  },
};

// ============================================
// HEALTH CHECK API
// ============================================

export const healthAPI = {
  // Check server health
  check: async () => {
    return apiRequest('/health');
  },

  // Test database connection
  testDb: async () => {
    return apiRequest('/test-db');
  },
};

// ============================================
// GALLERY API
// ============================================

export const galleryAPI = {
  // Get reactions for a gallery item
  getReactions: async (itemUrl) => {
    return apiRequest(`/home/gallery/reactions?item_url=${encodeURIComponent(itemUrl)}`);
  },

  // Like a gallery item
  like: async (itemUrl) => {
    return apiRequest('/home/gallery/like', {
      method: 'POST',
      body: JSON.stringify({ item_url: itemUrl }),
    });
  },

  // Love a gallery item
  love: async (itemUrl) => {
    return apiRequest('/home/gallery/love', {
      method: 'POST',
      body: JSON.stringify({ item_url: itemUrl }),
    });
  },

  // Get comments for a gallery item
  getComments: async (itemUrl) => {
    return apiRequest(`/home/gallery/comments?item_url=${encodeURIComponent(itemUrl)}`);
  },

  // Add comment to a gallery item
  addComment: async (itemUrl, commentText, authorName) => {
    return apiRequest('/home/gallery/comments', {
      method: 'POST',
      body: JSON.stringify({
        item_url: itemUrl,
        comment_text: commentText,
        author_name: authorName,
      }),
    });
  },
};

// Export default API object
export default {
  auth: authAPI,
  home: homeAPI,
  sermons: sermonsAPI,
  prayers: prayersAPI,
  contact: contactAPI,
  membership: membershipAPI,
  testimonies: testimoniesAPI,
  programs: programsAPI,
  health: healthAPI,
  gallery: galleryAPI,
};
