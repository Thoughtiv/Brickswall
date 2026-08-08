import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import WhatsAppButton from './components/WhatsAppButton';
import EstimateModal from './components/EstimateModal';

import Home from './pages/Home';
import Services from './pages/Services';
import Projects from './pages/Projects';
import Packages from './pages/Packages';
import AboutUs from './pages/AboutUs';
import Blog from './pages/Blog';
import Contact from './pages/Contact';
import AdminDashboard from './pages/AdminDashboard';

import './App.css';

function App() {
  const getInitialPage = () => {
    const path = window.location.pathname;
    if (path === '/admin') return 'admin';
    if (path === '/packages') return 'packages';
    if (path === '/services') return 'services';
    if (path === '/projects') return 'projects';
    if (path === '/about') return 'about';
    if (path === '/blog') return 'blog';
    if (path === '/contact') return 'contact';
    return 'home';
  };

  const [currentPage, setCurrentPageRaw] = useState(getInitialPage);
  const [isEstimateModalOpen, setIsEstimateModalOpen] = useState(false);

  const setCurrentPage = (page) => {
    setCurrentPageRaw(page);
    const path = page === 'home' ? '/' : `/${page}`;
    if (window.location.pathname !== path) {
      window.history.pushState({}, '', path);
    }
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
        return <Home setCurrentPage={setCurrentPage} onOpenEstimate={handleOpenEstimate} />;
      case 'services':
        return <Services onOpenEstimate={handleOpenEstimate} />;
      case 'projects':
        return <Projects onOpenEstimate={handleOpenEstimate} />;
      case 'packages':
        return <Packages onOpenEstimate={handleOpenEstimate} />;
      case 'about':
        return <AboutUs onOpenEstimate={handleOpenEstimate} />;
      case 'blog':
        return <Blog onOpenEstimate={handleOpenEstimate} />;
      case 'contact':
        return <Contact onOpenEstimate={handleOpenEstimate} />;
      case 'admin':
        return <AdminDashboard />;
      default:
        return <Home setCurrentPage={setCurrentPage} onOpenEstimate={handleOpenEstimate} />;
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
      />

      {/* Main Page Body */}
      <main className="main-content-body">
        {renderCurrentPage()}
      </main>

      {/* Footer */}
      <Footer 
        setCurrentPage={setCurrentPage} 
        onOpenEstimate={handleOpenEstimate} 
      />

      {/* Floating Sticky WhatsApp Chat Button */}
      <WhatsAppButton />

      {/* Free Cost Estimate Modal & Lead Form */}
      <EstimateModal 
        isOpen={isEstimateModalOpen} 
        onClose={handleCloseEstimate} 
      />
    </div>
  );
}

export default App;
