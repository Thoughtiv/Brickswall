import React, { useState, useRef } from 'react';
import { 
  Home as HomeIcon, 
  Building2,
  Building,
  Store, 
  GraduationCap, 
  Wrench, 
  Armchair, 
  Paintbrush,
  CheckCircle2, 
  ArrowRight,
  ShieldCheck,
  Phone,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const Services = ({ onOpenEstimate }) => {
  const [activeTab, setActiveTab] = useState('residential');
  const tabsRef = useRef(null);

  const scrollTabs = (direction) => {
    if (tabsRef.current) {
      const scrollAmount = direction === 'left' ? -250 : 250;
      tabsRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const services = [
    {
      id: 'residential',
      title: 'Residential Construction',
      icon: <HomeIcon className="w-6 h-6" />,
      tagline: "Build custom homes around your family's lifestyle and budget.",
      description: "Your dream home deserves careful planning, quality construction, and experienced professionals. Bricks Wall delivers custom residential construction solutions tailored to your budget, lifestyle, and future needs in Hyderabad.",
      image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80',
      highlights: [
        'Custom duplex & triplex house designs',
        'Transparent bill of quantities (BOQ) with zero cost variance',
        'Top-grade 53 Grade Cement & Fe550 TMT Steel',
        'In-house structural engineering & plan approvals',
        '10-Year structural integrity guarantee'
      ]
    },
    {
      id: 'villa',
      title: 'Villa Construction',
      icon: <Building className="w-6 h-6" />,
      tagline: 'Premium luxury villas with modern architecture & superior finishes.',
      description: 'We specialize in premium villa construction with elegant architecture, spacious layouts, and high-quality finishes that enhance both comfort and property value.',
      image: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1000&q=80',
      highlights: [
        'Contemporary architectural facade & elevation designs',
        'Double-height living rooms & landscaped courtyard planning',
        'High-end Italian marble & wooden flooring options',
        'Smart home automation and solar readiness',
        'Custom swimming pool & gazebo construction'
      ]
    },
    {
      id: 'commercial',
      title: 'Commercial Construction',
      icon: <Store className="w-6 h-6" />,
      tagline: 'High-performance offices, retail spaces, & commercial complexes.',
      description: 'Our commercial construction services include office buildings, retail spaces, commercial complexes, and business facilities built to modern engineering and safety standards.',
      image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1000&q=80',
      highlights: [
        'Heavy-duty commercial foundation engineering',
        'Fire safety & HVAC ducting integration',
        'Glass facade & aluminum composite panel cladding',
        'Multi-level basement parking execution',
        'Fast-track delivery for commercial ROI'
      ]
    },
    {
      id: 'school',
      title: 'School Construction',
      icon: <GraduationCap className="w-6 h-6" />,
      tagline: 'Safe, durable, and functional educational infrastructure.',
      description: 'Educational buildings require thoughtful planning and durable construction. We create safe, functional, and efficient school infrastructure designed for long-term performance and high student occupancy.',
      image: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=1000&q=80',
      highlights: [
        'Spacious, ventilated classrooms & laboratory spaces',
        'Seismic-resistant structural frame design',
        'Auditorium, library & sports field layout execution',
        'Child-safe anti-skid flooring & fire safety systems',
        'Strict adherence to school infrastructure norms'
      ]
    },
    {
      id: 'renovation',
      title: 'Renovation & Remodeling',
      icon: <Wrench className="w-6 h-6" />,
      tagline: 'Modernize existing structures with updated layouts & fresh aesthetics.',
      description: 'Refresh your property with modern renovation solutions that improve aesthetics, usability, structural integrity, and property resale value.',
      image: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1000&q=80',
      highlights: [
        'Structural load reinforcement & wall modifications',
        'Complete kitchen & bathroom remodeling',
        'Plumbing, rewiring, and waterproofing upgrades',
        'Exterior elevation overhaul',
        'Minimal disruption turn-key execution'
      ]
    },
    {
      id: 'interior',
      title: 'Interior Design',
      icon: <Paintbrush className="w-6 h-6" />,
      tagline: 'Turnkey interior execution matching architectural style.',
      description: 'Complete interior design and execution services including custom modular kitchens, wardrobes, false ceilings, lighting design, and premium wood carpentry.',
      image: 'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1000&q=80',
      highlights: [
        '3D architectural interior rendering & walkthroughs',
        'Custom modular kitchen & factory-finished wardrobes',
        'Designer false ceiling with concealed LED strip lighting',
        'Premium wall paint, texture & wallpaper accents',
        'Bespoke furniture & lighting fixtures'
      ]
    }
  ];

  const currentService = services.find((s) => s.id === activeTab);

  return (
    <div className="services-page">
      {/* Subpage Header */}
      <section className="subpage-hero">
        <div className="container">
          <span className="section-subtitle badge-orange text-white">Our Expertise</span>
          <h1 className="subpage-title">Construction Services in Hyderabad</h1>
          <p className="subpage-desc">
            With 15 years of construction experience, we provide end-to-end building solutions from structural engineering to turnkey interior design.
          </p>
        </div>
      </section>

      {/* Tabs & Content */}
      <section className="section-padding">
        <div className="container">
          {/* Interactive Sliding Bar Container */}
          <div className="service-tabs-container-outer">
            <button 
              className="tabs-scroll-btn tabs-scroll-left"
              onClick={() => scrollTabs('left')}
              aria-label="Scroll left"
            >
              <ChevronLeft size={18} />
            </button>

            <div className="service-tabs-wrapper" ref={tabsRef}>
              {services.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`service-tab-btn ${activeTab === item.id ? 'active' : ''}`}
                >
                  {item.icon}
                  <span>{item.title}</span>
                </button>
              ))}
            </div>

            <button 
              className="tabs-scroll-btn tabs-scroll-right"
              onClick={() => scrollTabs('right')}
              aria-label="Scroll right"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Service Details Card */}
          {currentService && (
            <div className="service-detail-card animate-fade-in">
              <div className="service-detail-grid">
                <div className="service-detail-content">
                  <span className="ref-service-pill mb-4">{currentService.title}</span>
                  <h2 className="service-detail-title">{currentService.tagline}</h2>
                  <p className="service-detail-desc">{currentService.description}</p>

                  <h4 className="service-highlights-heading">Key Service Highlights:</h4>
                  <ul className="service-highlights-list">
                    {currentService.highlights.map((h, i) => (
                      <li key={i}>
                        <CheckCircle2 size={18} className="text-orange shrink-0" />
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="service-detail-cta-row">
                    <button onClick={onOpenEstimate} className="ref-btn-primary">
                      Get Estimate for {currentService.title}
                    </button>
                    <a href="tel:+919876543210" className="ref-service-discuss-btn">
                      <Phone size={18} /> Discuss Project
                    </a>
                  </div>
                </div>

                <div className="service-detail-img-box">
                  <img src={currentService.image} alt={currentService.title} />
                  <div className="img-overlay-badge">
                    <div className="overlay-badge-icon">
                      <ShieldCheck size={22} className="text-orange" />
                    </div>
                    <div>
                      <strong className="block text-sm font-bold text-white">Guaranteed Quality</strong>
                      <p className="text-xs text-slate-300 m-0">50+ Projects Handed Over Across Hyderabad</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Services Grid Summary */}
      <section className="section-padding bg-subtle">
        <div className="container">
          <div className="section-title-wrapper">
            <span className="section-subtitle">Full Capability</span>
            <h2 className="section-heading">All Services At A Glance</h2>
          </div>

          <div className="grid grid-3 gap-6">
            {services.map((item) => (
              <div 
                key={item.id} 
                onClick={() => { setActiveTab(item.id); window.scrollTo({ top: 400, behavior: 'smooth' }); }}
                className="service-overview-card clickable"
              >
                <div className="icon-wrapper mb-3">{item.icon}</div>
                <h3>{item.title}</h3>
                <p className="text-muted text-xs mb-3">{item.tagline}</p>
                <span className="text-orange text-xs font-bold flex items-center gap-1">
                  Learn Details <ArrowRight size={14} />
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Callout */}
      <section className="cta-banner-section">
        <div className="container">
          <div className="cta-box">
            <h2>Need Custom Engineering Advice?</h2>
            <p>Speak directly with our senior site engineers for a site assessment and customized scope quotation.</p>
            <div className="cta-buttons mt-6">
              <button onClick={onOpenEstimate} className="btn btn-primary btn-lg">
                Request Free Estimate
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Services;
