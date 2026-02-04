import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import About from './pages/About';
import Programs from './pages/Programs';
import Sermons from './pages/Sermons';
import Testimonies from './pages/Testimonies';
import Prayers from './pages/Prayers';
import Contact from './pages/Contact';
import Membership from './pages/Membership';
import Giving from './pages/Giving';
import Admin from './pages/Admin';
import AdminHome from './pages/AdminHome';
import AdminAbout from './pages/AdminAbout';
import AdminChurchPrograms from './pages/AdminChurchPrograms';
import AdminSermons from './pages/AdminSermons';
import AdminTestimonies from './pages/AdminTestimonies';
import AdminPrayers from './pages/AdminPrayers';
import AdminContact from './pages/AdminContact';
import AdminMembership from './pages/AdminMembership';
import AdminGiving from './pages/AdminGiving';
import { homeAPI } from './api';
import './App.css';

function App() {
  // Load and set favicon dynamically
  useEffect(() => {
    let isMounted = true;
    const loadFavicon = async () => {
      try {
        const response = await homeAPI.getContent();
        if (!isMounted) return;
        
        if (response.success && response.data?.site?.favicon?.value) {
          const faviconUrl = response.data.site.favicon.value;
          // Remove existing favicon links to avoid duplicates
          const existingLinks = document.querySelectorAll("link[rel*='icon']");
          existingLinks.forEach(link => link.remove());
          
          // Create and add new favicon link
          const link = document.createElement('link');
          link.type = 'image/x-icon';
          link.rel = 'shortcut icon';
          link.href = faviconUrl;
          document.getElementsByTagName('head')[0].appendChild(link);
        }
      } catch (error) {
        // Silently fail - favicon is not critical
        if (isMounted) {
          console.error('Error loading favicon:', error);
        }
      }
    };
    loadFavicon();
    
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/programs" element={<Programs />} />
        <Route path="/sermons" element={<Sermons />} />
        <Route path="/testimonies" element={<Testimonies />} />
        <Route path="/prayers" element={<Prayers />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/membership" element={<Membership />} />
        <Route path="/giving" element={<Giving />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/admin/home" element={<AdminHome />} />
        <Route path="/admin/about" element={<AdminAbout />} />
        <Route path="/admin/programs" element={<AdminChurchPrograms />} />
        <Route path="/admin/sermons" element={<AdminSermons />} />
        <Route path="/admin/testimonies" element={<AdminTestimonies />} />
        <Route path="/admin/prayers" element={<AdminPrayers />} />
        <Route path="/admin/contact" element={<AdminContact />} />
        <Route path="/admin/membership" element={<AdminMembership />} />
        <Route path="/admin/giving" element={<AdminGiving />} />
        {/* Handle /index.html - should be handled by script in index.html before React loads */}
        <Route path="/index.html" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
