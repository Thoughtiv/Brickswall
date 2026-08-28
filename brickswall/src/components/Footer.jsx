import React from 'react';
import {
  Phone,
  Mail,
  MapPin,
  MessageSquare,
  ArrowUp,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Headphones,
  ChevronRight
} from 'lucide-react';

const Footer = ({ setCurrentPage, onOpenEstimate, settings }) => {
  const phonePrimary = settings?.phone_primary || '+91 9949249091';
  const phoneSecondary = settings?.phone_secondary || '+91 9160202008';
  const whatsapp = settings?.whatsapp || '+91 9160202008';
  const email = settings?.email || 'Hello@brickswall.in';
  const address = settings?.address || 'Lakshmi Narsimha Colony, Road No.12, Dattatreya Nivas, No.591, Nagole, Hyderabad, Telangana, Bharath (India)';
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigate = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bw-footer-section">
      {/* Top Pre-Footer Orange Banner - Full Width */}
      <div className="bw-prefooter-wrapper">
        <div className="bw-footer-container">
          <div className="bw-prefooter-content">
            <div className="bw-prefooter-left">
              <div className="bw-prefooter-icon-circle">
                <Headphones size={28} className="text-white" />
              </div>
              <div className="bw-prefooter-text">
                <h2>Ready to Build Your Dream Property in Hyderabad?</h2>
                <p>Contact Bricks Wall today for a transparent estimate and free expert consultation.</p>
              </div>
            </div>

            <div className="bw-prefooter-actions">
              <button onClick={onOpenEstimate} className="bw-btn-prefooter-white">
                <Calendar size={18} className="bw-icon-orange" />
                <span>Get Free Consultation</span>
              </button>
              <a href={`tel:${phonePrimary.replace(/\s+/g, '')}`} className="bw-btn-prefooter-outline">
                <Phone size={18} />
                <span>Call {phonePrimary}</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Body - Full Width Light Grey Background */}
      <div className="bw-main-footer-body">
        <div className="bw-footer-container">
          <div className="bw-footer-grid">
            {/* Column 1: Company Profile */}
            <div className="bw-footer-col bw-brand-col">
              <img
                src="/Brickswall-logo_birefnet.png"
                alt="Bricks Wall Hyderabad"
                className="bw-footer-logo"
              />
              <p className="bw-footer-desc">
                Building Quality. Building Trust. Building Hyderabad. Over 15 years of construction excellence delivering 50+ homes, commercial spaces, and educational infrastructure.
              </p>

              {/* Trust Badges */}
              <div className="bw-footer-badges">
                <span className="bw-badge-warranty">
                  <ShieldCheck size={14} /> We Provide Warranty
                </span>
                <span className="bw-badge-transparency">
                  <CheckCircle2 size={14} /> 100% Transparency
                </span>
              </div>

              {/* Social Media Icons with Inline SVGs */}
              <div className="bw-footer-socials">
                <a href="https://www.facebook.com/brickswallin" target="_blank" rel="noreferrer" aria-label="Facebook" className="bw-social-btn">
                  <svg width="15" height="15" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H7.5v-3H10V9.5C10 7.01 11.49 5.65 13.75 5.65c1.08 0 2.21.19 2.21.19v2.43h-1.25c-1.23 0-1.61.77-1.61 1.56V12h2.74l-.44 3h-2.3v6.8c4.56-.93 8-4.96 8-9.8z" />
                  </svg>
                </a>
                <a href="https://www.instagram.com/brickswallin" target="_blank" rel="noreferrer" aria-label="Instagram" className="bw-social-btn">
                  <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                  </svg>
                </a>
                <a href="#linkedin" aria-label="LinkedIn" className="bw-social-btn">
                  <svg width="15" height="15" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.25V10.9H6.46M7.86 6.72a1.49 1.49 0 1 0 0 2.98 1.49 1.49 0 0 0 0-2.98z" />
                  </svg>
                </a>
                <a href="#youtube" aria-label="YouTube" className="bw-social-btn">
                  <svg width="15" height="15" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Column 2: Navigation Links */}
            <div className="bw-footer-col">
              <h4 className="bw-footer-col-title">Navigation</h4>
              <div className="bw-title-underline"></div>
              <ul className="bw-footer-nav-list">
                <li>
                  <button onClick={() => handleNavigate('home')}>
                    <ChevronRight size={14} className="bw-arrow-icon" />
                    <span>Home</span>
                  </button>
                </li>
                <li>
                  <button onClick={() => handleNavigate('services')}>
                    <ChevronRight size={14} className="bw-arrow-icon" />
                    <span>Our Services</span>
                  </button>
                </li>
                {/* <li>
                  <button onClick={() => handleNavigate('projects')}>
                    <ChevronRight size={14} className="bw-arrow-icon" />
                    <span>Featured Projects</span>
                  </button>
                </li> */}
                <li>
                  <button onClick={() => handleNavigate('packages')}>
                    <ChevronRight size={14} className="bw-arrow-icon" />
                    <span>Construction Packages</span>
                  </button>
                </li>
                <li>
                  <button onClick={() => handleNavigate('about')}>
                    <ChevronRight size={14} className="bw-arrow-icon" />
                    <span>About Bricks Wall</span>
                  </button>
                </li>
                <li>
                  <button onClick={() => handleNavigate('blog')}>
                    <ChevronRight size={14} className="bw-arrow-icon" />
                    <span>Blog &amp; Cost Guides</span>
                  </button>
                </li>
                <li>
                  <button onClick={() => handleNavigate('contact')}>
                    <ChevronRight size={14} className="bw-arrow-icon" />
                    <span>Contact Us</span>
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 3: Construction Services */}
            <div className="bw-footer-col">
              <h4 className="bw-footer-col-title">Services</h4>
              <div className="bw-title-underline"></div>
              <ul className="bw-footer-services-list">
                <li>
                  <button onClick={() => handleNavigate('services')}>Residential Construction</button>
                </li>
                <li>
                  <button onClick={() => handleNavigate('services')}>Luxury Villa Construction</button>
                </li>
                <li>
                  <button onClick={() => handleNavigate('services')}>Commercial Buildings</button>
                </li>
                <li>
                  <button onClick={() => handleNavigate('services')}>School &amp; Educational Infrastructure</button>
                </li>
                <li>
                  <button onClick={() => handleNavigate('services')}>Renovation &amp; Remodeling</button>
                </li>
                <li>
                  <button onClick={() => handleNavigate('services')}>Interior Design Services</button>
                </li>
              </ul>
            </div>

            {/* Column 4: Contact & Location */}
            <div className="bw-footer-col bw-contact-col">
              <h4 className="bw-footer-col-title">Contact &amp; Location</h4>
              <div className="bw-title-underline"></div>
              <div className="bw-contact-block">
                <div className="bw-contact-item">
                  <MapPin size={18} className="bw-contact-icon shrink-0 mt-1" />
                  <div>
                    <strong className="bw-contact-label">Office Address (VISIT US):</strong>
                    <p className="bw-contact-val">Head Office: {address}</p>
                  </div>
                </div>

                <div className="bw-contact-item">
                  <Phone size={18} className="bw-contact-icon" />
                  <div>
                    <strong className="bw-contact-label">Phone Numbers:</strong>
                    <p className="bw-contact-val">
                      <a href={`tel:${phonePrimary.replace(/\s+/g, '')}`}>{phonePrimary}</a>
                    </p>
                    {phoneSecondary && (
                      <p className="bw-contact-val">
                        <a href={`tel:${phoneSecondary.replace(/\s+/g, '')}`}>{phoneSecondary}</a>
                      </p>
                    )}
                  </div>
                </div>

                <div className="bw-contact-item">
                  <MessageSquare size={18} className="bw-contact-icon" />
                  <div>
                    <strong className="bw-contact-label">WhatsApp:</strong>
                    <p className="bw-contact-val">
                      <a href={`https://wa.me/${whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer">{whatsapp}</a>
                    </p>
                  </div>
                </div>

                <div className="bw-contact-item">
                  <Mail size={18} className="bw-contact-icon" />
                  <div>
                    <strong className="bw-contact-label">Email:</strong>
                    <p className="bw-contact-val">
                      <a href={`mailto:${email}`}>{email}</a>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Directory / Popular Regions Section */}
          <div className="bw-footer-regions-section">
            <div className="bw-regions-title">
              <MapPin size={15} className="bw-icon-orange" />
              <span>POPULAR CONSTRUCTION LOCATIONS IN HYDERABAD</span>
            </div>
            <div className="bw-regions-list">
              <span>HITEC City</span>
              <span className="bw-pipe">|</span>
              <span>Jubilee Hills</span>
              <span className="bw-pipe">|</span>
              <span>Banjara Hills</span>
              <span className="bw-pipe">|</span>
              <span>Gachibowli</span>
              <span className="bw-pipe">|</span>
              <span>Kondapur</span>
              <span className="bw-pipe">|</span>
              <span>Kokapet</span>
              <span className="bw-pipe">|</span>
              <span>Tellapur</span>
              <span className="bw-pipe">|</span>
              <span>Madhapur</span>
            </div>
            <div className="bw-regions-list bw-mt-1">
              <span>Financial District</span>
              <span className="bw-pipe">|</span>
              <span>Nanakramguda</span>
              <span className="bw-pipe">|</span>
              <span>Manikonda</span>
              <span className="bw-pipe">|</span>
              <span>Narsingi</span>
              <span className="bw-pipe">|</span>
              <span>Kukatpally</span>
              <span className="bw-pipe">|</span>
              <span>Bachupally</span>
              <span className="bw-pipe">|</span>
              <span>Miyapur</span>
              <span className="bw-pipe">|</span>
              <span>Nagole</span>
            </div>
            <div className="bw-regions-list bw-mt-1">
              <span>Dilsukhnagar</span>
              <span className="bw-pipe">|</span>
              <span>Uppal</span>
              <span className="bw-pipe">|</span>
              <span>LB Nagar</span>
              <span className="bw-pipe">|</span>
              <span>Begumpet</span>
              <span className="bw-pipe">|</span>
              <span>Somajiguda</span>
              <span className="bw-pipe">|</span>
              <span>Himayatnagar</span>
              <span className="bw-pipe">|</span>
              <span>Secunderabad</span>
            </div>
          </div>

          {/* Bottom Copyright & Back to Top */}
          <div className="bw-footer-bottom-row">
            <p className="bw-copyright-text">
              &copy; {new Date().getFullYear()} Bricks Wall Construction Co. All rights reserved. Hyderabad's Trusted Construction Experts.
            </p>
            <button onClick={scrollToTop} className="bw-back-to-top-btn" title="Back to top">
              <span className="bw-circle-arrow"><ArrowUp size={14} /></span>
              <span>Back to Top</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
