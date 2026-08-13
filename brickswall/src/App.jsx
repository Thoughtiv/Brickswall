import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import Chatbot from './components/Chatbot';
import EstimateModal from './components/EstimateModal';

import Home from './pages/Home';
import Services from './pages/Services';
import Projects from './pages/Projects';
import Packages from './pages/Packages';
import AboutUs from './pages/AboutUs';
import Blog from './pages/Blog';
import Contact from './pages/Contact';
import AdminDashboard from './pages/AdminDashboard';
import { getSettings } from './utils/api';

import './App.css';

function App() {
  const getInitialPage = () => {
    const path = window.location.pathname;
    if (path === '/dm-admin') return 'admin';
    if (path === '/packages') return 'packages';
    if (path === '/services') return 'services';
    if (path === '/projects') return 'projects';
    if (path === '/about') return 'about';
    if (path === '/blog') return 'blog';
    if (path === '/contact') return 'contact';
    return 'home';
  };

  const [currentPage, setCurrentPageRaw] = useState(getInitialPage);
  const [serviceTab, setServiceTab] = useState('residential');
  const [projectFilter, setProjectFilter] = useState('all');
  const [initialProject, setInitialProject] = useState(null);
  const [isEstimateModalOpen, setIsEstimateModalOpen] = useState(false);
  const [settings, setSettings] = useState({
    phone_primary: '+91 9949249091',
    phone_secondary: '+91 9160202008',
    whatsapp: '+91 9160202008',
    email: 'Hello@brickswall.in',
    address: 'Lakshmi Narsimha Colony, Road No.12, Dattatreya Nivas, No.591, Nagole, Hyderabad, Telangana, Bharath (India)',
    office_hours: 'Mon - Sat: 9:00 AM - 6:30 PM'
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await getSettings();
        if (data && Object.keys(data).length > 0) {
          setSettings(prev => ({ ...prev, ...data }));
        }
      } catch (err) {
        console.warn('Could not load settings from server, using default settings.');
      }
    };
    fetchSettings();
  }, []);

  const setCurrentPage = (page) => {
    setCurrentPageRaw(page);
    const path = page === 'home' ? '/' : page === 'admin' ? '/dm-admin' : `/${page}`;
    if (window.location.pathname !== path) {
      window.history.pushState({}, '', path);
    }
  };

  // Navigate to a specific service tab
  const navigateToService = (tabId) => {
    setServiceTab(tabId);
    setCurrentPage('services');
    setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 50);
  };

  // Navigate to specific project or category
  const navigateToProject = (category, project = null) => {
    setProjectFilter(category);
    setInitialProject(project);
    setCurrentPage('projects');
    setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 50);
  };

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPageRaw(getInitialPage());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleOpenEstimate = () => {
    setIsEstimateModalOpen(true);
  };

  const handleCloseEstimate = () => {
    setIsEstimateModalOpen(false);
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'home':
        return <Home setCurrentPage={setCurrentPage} navigateToService={navigateToService} navigateToProject={navigateToProject} onOpenEstimate={handleOpenEstimate} settings={settings} />;
      case 'services':
        return <Services onOpenEstimate={handleOpenEstimate} initialTab={serviceTab} />;
      case 'projects':
        return <Projects onOpenEstimate={handleOpenEstimate} initialFilter={projectFilter} initialProject={initialProject} />;
      case 'packages':
        return <Packages onOpenEstimate={handleOpenEstimate} />;
      case 'about':
        return <AboutUs onOpenEstimate={handleOpenEstimate} />;
      case 'blog':
        return <Blog onOpenEstimate={handleOpenEstimate} />;
      case 'contact':
        return <Contact onOpenEstimate={handleOpenEstimate} settings={settings} />;
      case 'admin':
        return <AdminDashboard />;
      default:
        return <Home setCurrentPage={setCurrentPage} onOpenEstimate={handleOpenEstimate} settings={settings} />;
    }
  };

  if (currentPage === 'admin') {
    return <AdminDashboard />;
  }

  return (
    <div className="app-main-wrapper">
      {/* Top Header Navigation */}
      <Header
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        onOpenEstimate={handleOpenEstimate}
        settings={settings}
      />

      {/* Main Page Body */}
      <main className="main-content-body">
        {renderCurrentPage()}
      </main>

      {/* Footer */}
      <Footer
        setCurrentPage={setCurrentPage}
        onOpenEstimate={handleOpenEstimate}
        settings={settings}
      />

      {/* Floating Sticky AI Chatbot */}
      <Chatbot />

      {/* Free Cost Estimate Modal & Lead Form */}
      <EstimateModal
        isOpen={isEstimateModalOpen}
        onClose={handleCloseEstimate}
      />
    </div>
  );
}

export default App;
