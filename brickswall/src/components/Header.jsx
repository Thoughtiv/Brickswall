import React, { useState, useEffect } from 'react';
import { Phone, MapPin, Menu, X, ArrowRight, ShieldCheck, ChevronDown, User } from 'lucide-react';

const Header = ({ currentPage, setCurrentPage, onOpenEstimate, settings }) => {
  const phonePrimary = settings?.phone_primary || '+91 9949249091';
  const phoneSecondary = settings?.phone_secondary || '+91 9160202008';
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { id: 'home', label: 'Home' },
    { id: 'services', label: 'Services' },
    { id: 'projects', label: 'Projects' },
    { id: 'packages', label: 'Packages' },
    { id: 'about', label: 'About Us' },
    { id: 'blog', label: 'Blog' },
    { id: 'contact', label: 'Contact' },
  ];

  const handleNavClick = (pageId) => {
    setCurrentPage(pageId);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="site-header">
      {/* Top Banner Bar */}
      <div className="top-bar">
        <div className="container top-bar-container">
          <div className="top-bar-left">
            <span className="location-badge">
              <MapPin size={14} className="icon" />
              <strong>Hyderabad</strong> &amp; Surrounding Areas
            </span>
            <span className="divider">|</span>
            <span className="exp-text">
              <ShieldCheck size={14} className="icon" />
              15+ Years Exp &bull; 50+ Projects Handover
            </span>
          </div>

          <div className="top-bar-right">
            <a href={`tel:${phonePrimary.replace(/\s+/g, '')}`} className="phone-link">
               <Phone size={14} />
               <span>{phonePrimary}</span>
             </a>
             <a href={`tel:${phoneSecondary.replace(/\s+/g, '')}`} className="phone-link hide-mobile">
               <span>{phoneSecondary}</span>
             </a>
            <button
              onClick={onOpenEstimate}
              className="btn btn-primary btn-sm top-quote-btn"
            >
              Get Free Estimate
            </button>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <nav className={`main-nav ${isScrolled ? 'scrolled' : ''}`}>
        <div className="container nav-container">
          {/* Logo */}
          <div className="logo-wrapper" onClick={() => handleNavClick('home')}>
            <img
              src="/Brickswall-logo_birefnet.png"
              alt="Bricks Wall - Hyderabad Construction Experts"
              className="brand-logo"
            />
          </div>

          {/* Desktop Nav Links */}
          <div className="desktop-nav">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => handleNavClick(link.id)}
                className={`nav-link ${currentPage === link.id ? 'active' : ''}`}
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* Action CTAs */}
          <div className="nav-actions">
            <button
              onClick={onOpenEstimate}
              className="btn btn-primary nav-cta-btn"
            >
              <User size={16} />
              <span className="cta-full-text">Request Free Estimate</span>
              <span className="cta-short-text">Estimate</span>
            </button>

            {/* Mobile Hamburger Toggle */}
            <button
              className="mobile-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="mobile-drawer animate-fade-in">
          <div className="mobile-drawer-header">
            <img src="/Brickswall-logo_birefnet.png" alt="Bricks Wall" className="mobile-logo" />
            <button onClick={() => setMobileMenuOpen(false)}>
              <X size={24} />
            </button>
          </div>
          <div className="mobile-nav-list">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => handleNavClick(link.id)}
                className={`mobile-nav-item ${currentPage === link.id ? 'active' : ''}`}
              >
                <span>{link.label}</span>
                <ArrowRight size={16} />
              </button>
            ))}
          </div>

          <div className="mobile-drawer-footer">
            <p className="mobile-contact-title">Quick Connect</p>
            <a href={`tel:${phonePrimary.replace(/\s+/g, '')}`} className="mobile-phone-btn">
               <Phone size={16} /> Call {phonePrimary}
             </a>
            <button
              onClick={() => { setMobileMenuOpen(false); onOpenEstimate(); }}
              className="mobile-estimate-btn"
            >
              Get Free Estimate
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
