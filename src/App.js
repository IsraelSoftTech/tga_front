import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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
import './App.css';

function App() {
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
      </Routes>
    </Router>
  );
}

export default App;
