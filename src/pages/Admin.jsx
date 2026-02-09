import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaLock, FaUser, FaEye, FaEyeSlash } from 'react-icons/fa';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { authAPI } from '../api';
import './Admin.css';

const Admin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      console.log('Attempting login with:', formData.username);
      const response = await authAPI.login(formData.username, formData.password);
      
      if (response.success) {
        // Store token and user info
        localStorage.setItem('authToken', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        
        // Redirect to admin home
        navigate('/admin/home');
      } else {
        setError(response.message || response.error || 'Invalid credentials');
      }
    } catch (error) {
      console.error('Login error:', error);
      // Handle both error.message and error.error formats
      const errorMsg = error.message || error.error || 'Login failed. Please try again.';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-page">
      <Header />
      
      <section className="admin-login-section">
        <div className="container">
          <div className="login-container">
            <div className="login-header">
              <div className="login-icon">
                <FaLock />
              </div>
              <h1>Admin Login</h1>
              <p>Enter your credentials to access the admin panel</p>
            </div>
            
            <form onSubmit={handleSubmit} className="login-form">
              {error && (
                <div className="error-message">
                  {error}
                </div>
              )}
              
              <div className="form-group">
                <label htmlFor="username">
                  <FaUser /> Username
                </label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  placeholder="Enter your username"
                  autoComplete="username"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="password">
                  <FaLock /> Password
                </label>
                <div className="password-input-wrapper">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    placeholder="Enter your password"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>
              
              <div className="form-options">
                <label className="remember-me">
                  <input type="checkbox" />
                  <span>Remember me</span>
                </label>
                <a href="#" className="forgot-password">Forgot password?</a>
              </div>
              
              <button type="submit" className="btn btn-primary btn-login" disabled={loading}>
                <FaLock /> {loading ? 'Logging in...' : 'Login'}
              </button>
            </form>
            
            <div className="login-footer">
              <p>Secure admin access for Town Green Assembly</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Admin;
