import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Building2,
  CheckCircle2,
  ArrowRight,
  Phone,
  Award,
  Users,
  Clock,
  FileCheck,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Calculator,
  Home as HomeIcon,
  Sparkles,
  MapPin,
  Maximize2,
  HardHat,
  Boxes,
  Blocks,
  Star,
  Tag,
  User,
  MessageSquare,
  Scale,
  GraduationCap,
  Wrench,
  Armchair,
  Store
} from 'lucide-react';
import { submitInquiry, getProjects, getTestimonials, getPricing } from '../utils/api';

const Home = ({ setCurrentPage, navigateToService, navigateToProject, onOpenEstimate, settings }) => {
  const [activeFaq, setActiveFaq] = useState(0);
  const [heroForm, setHeroForm] = useState({ name: '', phone: '', plotLocation: 'Hyderabad' });
  const [heroSubmitted, setHeroSubmitted] = useState(false);

  const handleHeroSubmit = async (e) => {
    e.preventDefault();

    const inquiryData = {
      type: 'contact',
      name: heroForm.name,
      phone: heroForm.phone,
      serviceType: 'Consultation',
      location: heroForm.plotLocation,
      message: 'Callback requested from hero section Consultation form.'
    };

    try {
      await submitInquiry(inquiryData);
      setHeroSubmitted(true);
    } catch (err) {
      console.error('Failed to submit consultation lead:', err.message);
      setHeroSubmitted(true);
    }
  };

  const servicesList = [
    {
      id: 'residential',
      title: 'Residential Construction',
      desc: "We build modern, functional, and durable homes designed around your family's lifestyle and future needs.",
      img: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
      tag: 'Custom Homes'
    },
    {
      id: 'villa',
      title: 'Villa Construction',
      desc: 'Premium villas with contemporary architecture, elegant finishes, and superior construction quality.',
      img: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=800&q=80',
      tag: 'Luxury Living'
    },
    {
      id: 'commercial',
      title: 'Commercial Construction',
      desc: 'Professional construction services for offices, retail spaces, commercial complexes, and business establishments.',
      img: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80',
      tag: 'Business Hubs'
    },
    {
      id: 'school',
      title: 'School Construction',
      desc: 'Safe, spacious, and functional educational infrastructure designed for long-term use.',
      img: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=800&q=80',
      tag: 'Educational'
    },
    {
      id: 'renovation',
      title: 'Renovation & Remodeling',
      desc: 'Upgrade your existing property with modern layouts, improved functionality, and quality finishes.',
      img: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=800&q=80',
      tag: 'Modern Upgrades'
    }
  ];

  const whyChooseList = [
    {
      icon: <Award className="w-8 h-8 text-orange" />,
      title: '15 Years of Experience',
      desc: 'A proven track record in residential and commercial construction in Hyderabad.'
    },
    {
      icon: <Building2 className="w-8 h-8 text-orange" />,
      title: '50+ Successfully Completed Projects',
      desc: 'Homes, schools, commercial buildings, and complexes built with precision.'
    },
    {
      icon: <ShieldCheck className="w-8 h-8 text-orange" />,
      title: 'Quality Construction',
      desc: 'We use trusted construction methods and premium-quality materials.'
    },
    {
      icon: <FileCheck className="w-8 h-8 text-orange" />,
      title: 'Transparent Pricing',
      desc: 'Clear quotations with no unnecessary surprises or hidden costs.'
    },
    {
      icon: <Users className="w-8 h-8 text-orange" />,
      title: 'Experienced Team',
      desc: 'Qualified engineers, skilled supervisors, and experienced construction professionals.'
    },
    {
      icon: <Clock className="w-8 h-8 text-orange" />,
      title: 'Timely Delivery',
      desc: 'Projects are managed efficiently to meet agreed timelines guaranteed.'
    }
  ];

  const processSteps = [
    { step: '01', title: 'Free Consultation', desc: 'Understand your requirements, budget, and project goals.' },
    { step: '02', title: 'Site Visit', desc: 'Detailed site inspection and feasibility assessment.' },
    { step: '03', title: 'Planning & Design', desc: 'Prepare layouts, architectural concepts, and project planning.' },
    { step: '04', title: 'Quotation & Agreement', desc: 'Transparent project estimate with clear scope of work.' },
    { step: '05', title: 'Construction', desc: 'Professional execution using quality materials and experienced engineers.' },
    { step: '06', title: 'Final Inspection & Handover', desc: 'Comprehensive quality checks before delivering your completed project.' }
  ];

  const goToPackages = () => {
    setCurrentPage('packages');
    setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 50);
  };

  const [featuredProjects, setFeaturedProjects] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [packageTiers, setPackageTiers] = useState([]);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const liveProjects = await getProjects();
        if (liveProjects && liveProjects.length > 0) {
          setFeaturedProjects(liveProjects.map(p => ({
            ...p,
            type: p.categoryLabel
          })));
        } else {
          setFeaturedProjects(DEFAULT_FEATURED_PROJECTS);
        }
      } catch (err) {
        setFeaturedProjects(DEFAULT_FEATURED_PROJECTS);
      }

      try {
        const liveTestimonials = await getTestimonials();
        if (liveTestimonials && liveTestimonials.length > 0) {
          setTestimonials(liveTestimonials);
        } else {
          setTestimonials(DEFAULT_TESTIMONIALS);
        }
      } catch (err) {
        setTestimonials(DEFAULT_TESTIMONIALS);
      }

      const livePricing = await getPricing();
      setPackageTiers(
        ['basic', 'premium', 'luxury']
          .map(id => livePricing?.[id])
          .filter(Boolean)
      );
    };
    fetchHomeData();
  }, []);

  const DEFAULT_FEATURED_PROJECTS = [
    {
      title: 'The Crest Luxury Villa',
      location: 'Jubilee Hills, Hyderabad',
      size: '5,500 sq.ft',
      type: 'Luxury Villa',
      category: 'villa',
      categoryLabel: 'Luxury Villa',
      duration: '11 Months',
      description: 'A modern 3-story ultra-luxury villa featuring Italian marble flooring, floating staircase, private courtyard pool, and smart home automation.',
      image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80'
    },
    {
      title: 'Gachibowli Horizon Residency',
      location: 'Gachibowli, Hyderabad',
      size: '3,800 sq.ft',
      type: 'Independent Home',
      category: 'homes',
      categoryLabel: 'Independent Home',
      duration: '9 Months',
      description: 'Contemporary G+2 independent duplex home with spacious balconies, rooftop solar installation, and premium teak wood joinery.',
      image: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=800&q=80'
    },
    {
      title: 'Aura Commercial Center',
      location: 'Madhapur, Hyderabad',
      size: '12,000 sq.ft',
      type: 'Commercial Complex',
      category: 'commercial',
      categoryLabel: 'Commercial Building',
      duration: '14 Months',
      description: 'Commercial 5-floor office building with modern glass curtain walls, double basement parking, and high-speed elevators.',
      image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80'
    },
    {
      title: 'Greenwood Academy Infrastructure',
      location: 'Kukatpally, Hyderabad',
      size: '18,500 sq.ft',
      type: 'Educational Institution',
      category: 'school',
      categoryLabel: 'Educational Institution',
      duration: '15 Months',
      description: 'Spacious, fire-safe educational campus building featuring 24 classrooms, science laboratories, and indoor sports hall.',
      image: 'https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&w=800&q=80'
    },
    {
      title: 'Tellapur Modern Duplex',
      location: 'Tellapur, Hyderabad',
      size: '4,200 sq.ft',
      type: 'Residential Home',
      image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80'
    },
    {
      title: 'Banjara Hills Renovation & Interiors',
      location: 'Banjara Hills, Hyderabad',
      size: '3,100 sq.ft',
      type: 'Renovation',
      image: 'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=800&q=80'
    }
  ];

  const DEFAULT_TESTIMONIALS = [
    {
      name: 'Ramesh Reddy',
      location: 'Jubilee Hills, Hyderabad',
      role: 'Villa Owner',
      quote: 'Bricks Wall delivered our 5,000 sq.ft villa in Jubilee Hills on time with unbelievable material quality. Their transparent daily progress reports gave us peace of mind.',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
      rating: 5
    },
    {
      name: 'Srinivas Rao',
      location: 'Gachibowli, Hyderabad',
      role: 'Commercial Developer',
      quote: 'We hired Bricks Wall for our commercial complex in Gachibowli. Their engineering team is top-notch, keeping every item within transparent budget bounds.',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
      rating: 5
    },
    {
      name: 'Dr. Priya Sharma',
      location: 'Kondapur, Hyderabad',
      role: 'Homeowner',
      quote: 'From site visit to final handover, the 6-step construction process was smooth. No hidden charges! Highly recommended construction company in Hyderabad.',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
      rating: 5
    }
  ];

  const faqs = [
    {
      q: 'Do you construct only in Hyderabad?',
      a: 'Yes. Bricks Wall currently provides construction services exclusively within Hyderabad and surrounding areas, ensuring dedicated quality supervision.'
    },
    {
      q: 'Do you provide both residential and commercial construction?',
      a: 'Yes. We undertake residential independent homes, villas, commercial buildings, schools, and commercial complexes.'
    },
    {
      q: 'Can you help with planning and design?',
      a: 'Yes. We assist clients from planning and architectural design through construction, structural approval, and project completion.'
    },
    {
      q: 'Do you provide renovation services?',
      a: 'Yes. We offer complete renovation and remodeling services for both residential and commercial properties across Hyderabad.'
    }
  ];

  return (
    <div className="home-page">
      {/* Reference Matched Hero Section */}
      <section className="ref-hero-section">
        <div className="ref-hero-backdrop">
          <img
            src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1920&q=80"
            alt="Hyderabad Construction Experts"
            className="ref-hero-bg"
          />
          <div className="ref-hero-gradient-overlay"></div>
        </div>

        <div className="container ref-hero-container">
          {/* Left Column Content */}
          <div className="ref-hero-left">
            <div className="ref-hero-pill">
              <Star size={14} className="text-orange fill-orange" />
              <span>Hyderabad's #1 Construction Company</span>
            </div>

            <h1 className="ref-hero-title">
              Building Dreams.<br />
              <span className="text-orange">Creating</span> Landmarks.
            </h1>

            <p className="ref-hero-desc">
              Trusted construction solutions for homes, businesses, and communities across Hyderabad.
            </p>

            <div className="ref-hero-accent-line"></div>

            {/* 3 Circle Icon Feature Chips */}
            <div className="ref-chips-row">
              <div className="ref-chip-item">
                <span className="ref-chip-icon"><CheckCircle2 size={16} /></span>
                <span className="ref-chip-text">Quality Construction</span>
              </div>
              <div className="ref-chip-item">
                <span className="ref-chip-icon"><Tag size={16} /></span>
                <span className="ref-chip-text">Transparent Pricing</span>
              </div>
              <div className="ref-chip-item">
                <span className="ref-chip-icon"><Clock size={16} /></span>
                <span className="ref-chip-text">On-Time Delivery</span>
              </div>
            </div>

            {/* CTA Action Buttons */}
            <div className="ref-cta-row">
              <button onClick={onOpenEstimate} className="ref-btn-primary">
                <span>Get Free Consultation</span>
                <ArrowRight size={18} />
              </button>
              <button onClick={() => setCurrentPage('packages')} className="ref-btn-outline">
                <span>Explore Packages</span>
                <ArrowRight size={18} />
              </button>
            </div>
          </div>

          {/* Right Column Form Card */}
          <div className="ref-hero-card">
            <h3 className="ref-card-title">Talk to Our Construction Expert</h3>
            <p className="ref-card-sub">Get instant cost estimate &amp; architectural guidance</p>

            {!heroSubmitted ? (
              <form onSubmit={handleHeroSubmit} className="ref-card-form">
                <div className="ref-input-group">
                  <User size={18} className="ref-input-icon" />
                  <input
                    type="text"
                    required
                    placeholder="Your Full Name *"
                    className="ref-input"
                    value={heroForm.name}
                    onChange={(e) => setHeroForm({ ...heroForm, name: e.target.value })}
                  />
                </div>

                <div className="ref-input-group">
                  <Phone size={18} className="ref-input-icon" />
                  <input
                    type="tel"
                    required
                    placeholder="+91 Mobile Number *"
                    className="ref-input"
                    value={heroForm.phone}
                    onChange={(e) => setHeroForm({ ...heroForm, phone: e.target.value })}
                  />
                </div>

                <div className="ref-input-group">
                  <MapPin size={18} className="ref-input-icon" />
                  <select
                    className="ref-input ref-select"
                    value={heroForm.plotLocation}
                    onChange={(e) => setHeroForm({ ...heroForm, plotLocation: e.target.value })}
                  >
                    <option value="Hyderabad">Location: Hyderabad &amp; Nearby</option>
                    <option value="Gachibowli">Gachibowli / Financial Dist</option>
                    <option value="Jubilee Hills">Jubilee Hills / Banjara Hills</option>
                    <option value="Kondapur">Kondapur / Madhapur</option>
                    <option value="Tellapur">Tellapur / Kollur</option>
                    <option value="Kukatpally">Kukatpally / Miyapur</option>
                  </select>
                  <ChevronDown size={18} className="ref-select-chevron" />
                </div>

                <button type="submit" className="ref-submit-btn">
                  Book Free Consultation
                </button>
              </form>
            ) : (
              <div className="ref-card-success">
                <CheckCircle2 size={48} className="text-orange mx-auto mb-2" />
                <h4>Callback Requested!</h4>
                <p className="text-xs text-muted mt-1">
                  Thank you {heroForm.name}. Our senior engineer will call you shortly on {heroForm.phone}.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Floating Stats Banner Card Overlapping Hero Bottom */}
      <div className="ref-stats-banner-wrapper">
        <div className="container">
          <div className="ref-stats-card">
            <div className="ref-stats-grid">
              <div className="ref-stat-box">
                <span className="ref-stat-number">15+</span>
                <span className="ref-stat-label">Years of<br />Experience</span>
              </div>
              <div className="ref-stat-box">
                <span className="ref-stat-number">50+</span>
                <span className="ref-stat-label">Projects<br />Delivered</span>
              </div>
              <div className="ref-stat-box">
                <span className="ref-stat-number">100%</span>
                <span className="ref-stat-label">Transparent<br />Pricing</span>
              </div>
              <div className="ref-stat-right-col">
                <div className="ref-badge-line">
                  <ShieldCheck size={22} className="text-orange shrink-0" />
                  <div className="flex flex-col text-left">
                    <strong className="block text-sm font-bold text-slate-800 leading-snug">We Provide</strong>
                    <span className="block text-xs text-slate-500 font-medium leading-snug">Warranty</span>
                  </div>
                </div>
                <div className="ref-badge-line">
                  <Award size={22} className="text-orange shrink-0" />
                  <div className="flex flex-col text-left">
                    <strong className="block text-sm font-bold text-slate-800 leading-snug">Premium Quality</strong>
                    <span className="block text-xs text-slate-500 font-medium leading-snug">Materials</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Trusted Clients & Service Types Ribbon */}
      <section className="ref-ribbon-section">
        <div className="container text-center">
          <h5 className="ref-ribbon-heading">TRUSTED BY 100+ HAPPY CLIENTS</h5>
          <div className="ref-ribbon-grid">
            <div className="ref-ribbon-item">
              <div className="ref-ribbon-icon-wrapper">
                <HomeIcon size={22} className="ref-ribbon-icon" />
              </div>
              <div className="ref-ribbon-text flex flex-col text-left">
                <strong className="font-bold text-sm text-slate-800 leading-tight">Residential Homes</strong>
                <span className="text-xs text-slate-500 font-medium">Construction</span>
              </div>
            </div>

            <div className="ref-ribbon-item">
              <div className="ref-ribbon-icon-wrapper">
                <Building2 size={22} className="ref-ribbon-icon" />
              </div>
              <div className="ref-ribbon-text flex flex-col text-left">
                <strong className="font-bold text-sm text-slate-800 leading-tight">Luxury Villas</strong>
                <span className="text-xs text-slate-500 font-medium">Ultra High-End</span>
              </div>
            </div>

            <div className="ref-ribbon-item">
              <div className="ref-ribbon-icon-wrapper">
                <Blocks size={22} className="ref-ribbon-icon" />
              </div>
              <div className="ref-ribbon-text flex flex-col text-left">
                <strong className="font-bold text-sm text-slate-800 leading-tight">Commercial Buildings</strong>
                <span className="text-xs text-slate-500 font-medium">Plazas &amp; Offices</span>
              </div>
            </div>

            <div className="ref-ribbon-item">
              <div className="ref-ribbon-icon-wrapper">
                <Award size={22} className="ref-ribbon-icon" />
              </div>
              <div className="ref-ribbon-text flex flex-col text-left">
                <strong className="font-bold text-sm text-slate-800 leading-tight">Schools &amp; Institutions</strong>
                <span className="text-xs text-slate-500 font-medium">Campus Infra</span>
              </div>
            </div>

            <div className="ref-ribbon-item">
              <div className="ref-ribbon-icon-wrapper">
                <HardHat size={22} className="ref-ribbon-icon" />
              </div>
              <div className="ref-ribbon-text flex flex-col text-left">
                <strong className="font-bold text-sm text-slate-800 leading-tight">Renovation &amp; Remodeling</strong>
                <span className="text-xs text-slate-500 font-medium">Upgrades</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Bricks Wall Overview Section - Premium Full Width Section */}
      <section className="about-section-wrapper">
        {/* Subtle Decorative Background Accents */}
        <div className="about-bg-accent-left"></div>
        <div className="about-bg-accent-right"></div>

        {/* Architectural Building Outline Silhouette - Bottom Right */}
        <div className="about-building-silhouette" aria-hidden="true">
          <svg viewBox="0 0 600 300" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g stroke="#0f172a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              {/* Building 1 (Left low-rise grid) */}
              <rect x="20" y="160" width="80" height="140" />
              <line x1="40" y1="160" x2="40" y2="300" />
              <line x1="60" y1="160" x2="60" y2="300" />
              <line x1="80" y1="160" x2="80" y2="300" />
              <line x1="20" y1="190" x2="100" y2="190" />
              <line x1="20" y1="220" x2="100" y2="220" />
              <line x1="20" y1="250" x2="100" y2="250" />
              <line x1="20" y1="280" x2="100" y2="280" />

              {/* Building 2 (Modern angled glass tower) */}
              <path d="M110 300 L110 100 L150 60 L190 60 L190 300" />
              <line x1="150" y1="60" x2="150" y2="300" />
              <line x1="110" y1="120" x2="190" y2="120" />
              <line x1="110" y1="160" x2="190" y2="160" />
              <line x1="110" y1="200" x2="190" y2="200" />
              <line x1="110" y1="240" x2="190" y2="240" />
              <line x1="110" y1="280" x2="190" y2="280" />
              {/* Spire */}
              <line x1="170" y1="60" x2="170" y2="20" />

              {/* Building 3 (Central High-Rise) */}
              <rect x="205" y="40" width="110" height="260" />
              <line x1="205" y1="80" x2="315" y2="80" />
              <line x1="205" y1="120" x2="315" y2="120" />
              <line x1="205" y1="160" x2="315" y2="160" />
              <line x1="205" y1="200" x2="315" y2="200" />
              <line x1="205" y1="240" x2="315" y2="240" />
              <line x1="205" y1="280" x2="315" y2="280" />
              <line x1="240" y1="40" x2="240" y2="300" />
              <line x1="280" y1="40" x2="280" y2="300" />
              {/* Roof Crown */}
              <path d="M225 40 L260 15 L295 40" />

              {/* Construction Crane */}
              <line x1="330" y1="300" x2="330" y2="70" />
              <line x1="330" y1="70" x2="410" y2="70" />
              <line x1="330" y1="70" x2="290" y2="90" />
              <line x1="330" y1="75" x2="390" y2="70" />
              <line x1="390" y1="70" x2="390" y2="110" />
              <circle cx="390" cy="115" r="3" />

              {/* Building 4 (Stepped Luxury Tower) */}
              <path d="M340 300 L340 140 L370 140 L370 100 L400 100 L400 60 L450 60 L450 100 L480 100 L480 300" />
              <line x1="410" y1="60" x2="410" y2="300" />
              <line x1="440" y1="60" x2="440" y2="300" />
              <line x1="340" y1="180" x2="480" y2="180" />
              <line x1="340" y1="220" x2="480" y2="220" />
              <line x1="340" y1="260" x2="480" y2="260" />

              {/* Building 5 (Far Right Curved Tower) */}
              <path d="M495 300 L495 120 C520 100 550 100 575 120 L575 300" />
              <line x1="535" y1="108" x2="535" y2="300" />
              <line x1="495" y1="160" x2="575" y2="160" />
              <line x1="495" y1="210" x2="575" y2="210" />
              <line x1="495" y1="260" x2="575" y2="260" />
            </g>
          </svg>
        </div>

        <div className="container relative z-10">
          <div className="about-grid">
            {/* Left Column Image & Floating Badge */}
            <div className="about-image-column">
              <div className="about-img-frame">
                <img
                  src="/hero.png"
                  alt="Bricks Wall Construction Hyderabad"
                  className="about-main-img"
                />

                {/* Floating Orange Experience Badge */}
                <div className="about-exp-badge">
                  <div className="exp-icon-circle">
                    <Building2 size={24} className="text-white" />
                  </div>
                  <div className="exp-text-group">
                    <span className="exp-num">15+</span>
                    <span className="exp-desc">
                      Years of Building<br />Excellence in Hyderabad
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column Content */}
            <div className="about-content-column">
              {/* Top Badge Tag */}
              <div className="about-badge-tag">
                <Blocks size={16} />
                <span>ABOUT BRICKS WALL</span>
              </div>

              {/* Main Heading */}
              <h2 className="about-main-heading">
                <span className="heading-navy">Building Strong Foundations.</span>
                <span className="heading-orange">Creating Better Spaces.</span>
              </h2>

              {/* Decorative Line Accent */}
              <div className="about-title-underline"></div>

              {/* Body Paragraphs */}
              <div className="about-paragraphs">
                <p>
                  At Bricks Wall, construction is more than building structures—it's about creating spaces where families grow, businesses thrive, and communities prosper.
                </p>
                <p>
                  For over 15 years, we have been delivering reliable residential and commercial construction solutions throughout Hyderabad. From independent homes and luxury villas to schools, commercial complexes, and renovation projects, every project reflects our commitment to quality, safety, and customer satisfaction.
                </p>
                <p>
                  We understand that building a property is one of the most important investments you'll make. That's why we focus on transparent communication, premium materials, experienced engineers, and timely project delivery from start to finish.
                </p>
              </div>

              {/* 4 Feature Cards Grid */}
              <div className="about-features-2x2">
                <div className="about-feat-card">
                  <div className="feat-icon-box">
                    <Award size={22} />
                  </div>
                  <div className="feat-text-box">
                    <div className="feat-title">50+</div>
                    <div className="feat-sub">Delivered Projects</div>
                  </div>
                </div>

                <div className="about-feat-card">
                  <div className="feat-icon-box">
                    <HardHat size={22} />
                  </div>
                  <div className="feat-text-box">
                    <div className="feat-title">Qualified</div>
                    <div className="feat-sub">Engineers</div>
                  </div>
                </div>

                <div className="about-feat-card">
                  <div className="feat-icon-box">
                    <Boxes size={22} />
                  </div>
                  <div className="feat-text-box">
                    <div className="feat-title">Premium Quality</div>
                    <div className="feat-sub">Materials</div>
                  </div>
                </div>

                <div className="about-feat-card">
                  <div className="feat-icon-box">
                    <ShieldCheck size={22} />
                  </div>
                  <div className="feat-text-box">
                    <div className="feat-title">We Provide</div>
                    <div className="feat-sub">Warranty</div>
                  </div>
                </div>
              </div>

              {/* CTA Button */}
              <div className="about-cta-wrapper">
                <button onClick={() => setCurrentPage('about')} className="about-cta-btn">
                  <span>Learn More About Us</span>
                  <ArrowRight size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us - Reference Matched Design */}
      <section className="ref-why-section">
        {/* Background Subtle Watermark Graphics */}
        <div className="ref-why-bg-watermark ref-why-bg-left"></div>
        <div className="ref-why-bg-watermark ref-why-bg-right"></div>

        <div className="container relative z-10">
          {/* Header */}
          <div className="ref-why-header text-center">
            <div className="ref-why-pill">
              <Award size={15} className="text-orange" />
              <span>WHY CHOOSE BRICKS WALL</span>
            </div>
            <h2 className="ref-why-title">Why Homeowners &amp; Businesses Trust Us</h2>
            <p className="ref-why-desc">
              We bring unmatched engineering expertise, material transparency, and predictable delivery to your construction project.
            </p>
            <div className="ref-why-accent-divider">
              <span className="ref-divider-line"></span>
              <span className="ref-divider-dot"></span>
              <span className="ref-divider-dot"></span>
              <span className="ref-divider-line"></span>
            </div>
          </div>

          {/* 6 Grid Cards */}
          <div className="ref-why-grid">
            <div className="ref-why-card">
              <div className="ref-why-icon-box">
                <Award size={22} className="text-orange" />
              </div>
              <div className="ref-why-card-content">
                <h3>15+ Years of Experience</h3>
                <div className="ref-why-card-line"></div>
                <p>A proven track record in residential and commercial construction across Hyderabad.</p>
              </div>
            </div>

            <div className="ref-why-card">
              <div className="ref-why-icon-box">
                <Building2 size={22} className="text-orange" />
              </div>
              <div className="ref-why-card-content">
                <h3>50+ Successfully Completed Projects</h3>
                <div className="ref-why-card-line"></div>
                <p>Homes, schools, commercial buildings, and complexes built with precision.</p>
              </div>
            </div>

            <div className="ref-why-card">
              <div className="ref-why-icon-box">
                <ShieldCheck size={22} className="text-orange" />
              </div>
              <div className="ref-why-card-content">
                <h3>Quality Construction</h3>
                <div className="ref-why-card-line"></div>
                <p>We use trusted construction methods and premium-quality materials.</p>
              </div>
            </div>

            <div className="ref-why-card">
              <div className="ref-why-icon-box">
                <FileCheck size={22} className="text-orange" />
              </div>
              <div className="ref-why-card-content">
                <h3>Transparent Pricing</h3>
                <div className="ref-why-card-line"></div>
                <p>Clear quotations with no unnecessary surprises or hidden costs.</p>
              </div>
            </div>

            <div className="ref-why-card">
              <div className="ref-why-icon-box">
                <Users size={22} className="text-orange" />
              </div>
              <div className="ref-why-card-content">
                <h3>Experienced Team</h3>
                <div className="ref-why-card-line"></div>
                <p>Qualified engineers, skilled supervisors, and experienced construction professionals.</p>
              </div>
            </div>

            <div className="ref-why-card">
              <div className="ref-why-icon-box">
                <Clock size={22} className="text-orange" />
              </div>
              <div className="ref-why-card-content">
                <h3>Timely Delivery</h3>
                <div className="ref-why-card-line"></div>
                <p>Projects are managed efficiently to meet agreed timelines guaranteed.</p>
              </div>
            </div>
          </div>

          {/* Bottom Trust Banner Card */}
          <div className="ref-trust-banner">
            <div className="ref-trust-left-block">
              <Award size={28} className="text-white" />
            </div>
            <div className="ref-trust-title-col">
              <span className="ref-trust-subtitle">Building More Than Structures,</span>
              <h4 className="ref-trust-headline">Building Trust.</h4>
            </div>
            <div className="ref-trust-stats-row">
              <div className="ref-trust-stat-item">
                <div className="ref-trust-stat-icon">
                  <HomeIcon size={24} className="text-orange" />
                </div>
                <div>
                  <span className="ref-trust-stat-num">15+</span>
                  <span className="ref-trust-stat-lbl">Years of Experience</span>
                </div>
              </div>

              <div className="ref-trust-vdivider"></div>

              <div className="ref-trust-stat-item">
                <div className="ref-trust-stat-icon">
                  <Building2 size={24} className="text-orange" />
                </div>
                <div>
                  <span className="ref-trust-stat-num">50+</span>
                  <span className="ref-trust-stat-lbl">Projects Delivered</span>
                </div>
              </div>

              <div className="ref-trust-vdivider"></div>

              <div className="ref-trust-stat-item">
                <div className="ref-trust-stat-icon">
                  <ShieldCheck size={24} className="text-orange" />
                </div>
                <div>
                  <span className="ref-trust-stat-num">100%</span>
                  <span className="ref-trust-stat-lbl">Client Satisfaction</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Full Capability - All Services, One Commitment (Reference Matched Diagram) */}
      <section className="ref-fc-section">
        {/* Decorative Dot Patterns */}
        <div className="dot-pattern dot-pattern-top-left"></div>
        <div className="dot-pattern dot-pattern-bottom-right"></div>

        {/* Architectural Crane & Building Line Art Watermarks */}
        <div className="ref-fc-bg-crane" aria-hidden="true">
          <svg viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g stroke="#cbd5e1" strokeWidth="1" strokeDasharray="3,3" opacity="0.6">
              <line x1="200" y1="300" x2="200" y2="40" />
              <line x1="200" y1="40" x2="360" y2="40" />
              <line x1="200" y1="40" x2="140" y2="70" />
              <line x1="320" y1="40" x2="320" y2="120" />
              <rect x="180" y="100" width="100" height="200" fill="none" />
              <rect x="220" y="60" width="120" height="240" fill="none" />
            </g>
          </svg>
        </div>

        <div className="container relative z-10 text-center">
          {/* Top Pill Tag */}
          <div className="ref-fc-pill-wrapper">
            <div className="ref-fc-pill">
              <span className="ref-fc-pill-dot"></span>
              <span>FULL CAPABILITY</span>
            </div>
          </div>

          {/* Main Title */}
          <h2 className="ref-fc-title text-center">
            All Services, <span className="text-orange">One Commitment.</span>
          </h2>

          {/* Accent Line Divider */}
          <div className="ref-principles-divider my-3">
            <span className="ref-pdivider-line"></span>
            <span className="ref-pdivider-dot"></span>
            <span className="ref-pdivider-dot"></span>
            <span className="ref-pdivider-line"></span>
          </div>

          {/* Subtitle */}
          <p className="ref-fc-subtitle">
            From dream to delivery — we provide complete construction solutions<br className="hidden md:block" />
            with quality, transparency &amp; trust at every step.
          </p>

          {/* Main 3-Column Central Diagram */}
          <div className="ref-fc-diagram">
            {/* Left Column Cards (01, 02, 03) */}
            <div className="ref-fc-col ref-fc-col-left">
              {/* Card 01 */}
              <div className="ref-fc-card" onClick={() => navigateToService('residential')}>
                <div className="ref-fc-badge badge-orange">01</div>
                <div className="ref-fc-icon-circle icon-orange">
                  <HomeIcon size={22} />
                </div>
                <div className="ref-fc-card-text">
                  <h3>Residential Construction</h3>
                  <p>Build custom homes around your family's lifestyle and budget.</p>
                </div>
                <div className="connector-line line-left-top"></div>
              </div>

              {/* Card 02 */}
              <div className="ref-fc-card" onClick={() => navigateToService('villa')}>
                <div className="ref-fc-badge badge-navy">02</div>
                <div className="ref-fc-icon-circle icon-navy">
                  <Building2 size={22} />
                </div>
                <div className="ref-fc-card-text">
                  <h3>Villa Construction</h3>
                  <p>Premium luxury villas with modern architecture &amp; superior finishes.</p>
                </div>
                <div className="connector-line line-left-mid"></div>
              </div>

              {/* Card 03 */}
              <div className="ref-fc-card" onClick={() => navigateToService('commercial')}>
                <div className="ref-fc-badge badge-orange">03</div>
                <div className="ref-fc-icon-circle icon-orange">
                  <Store size={22} />
                </div>
                <div className="ref-fc-card-text">
                  <h3>Commercial Construction</h3>
                  <p>High-performance offices, retail spaces, &amp; commercial complexes.</p>
                </div>
                <div className="connector-line line-left-bot"></div>
              </div>
            </div>

            {/* Central Hub Circle */}
            <div className="ref-fc-hub-wrapper">
              <div className="ref-fc-hub-ring">
                {/* 6 Peripheral Node Dots on Ring */}
                <span className="hub-node node-lt"></span>
                <span className="hub-node node-lm"></span>
                <span className="hub-node node-lb"></span>
                <span className="hub-node node-rt"></span>
                <span className="hub-node node-rm"></span>
                <span className="hub-node node-rb"></span>
              </div>

              <div className="ref-fc-hub-circle">
                <div className="ref-fc-hub-icon">
                  <svg width="44" height="44" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M14 36V12L24 6V36" stroke="#d9531e" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M6 36V20L14 15" stroke="#d9531e" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M24 18L34 23V36" stroke="#d9531e" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M4 36H36" stroke="#d9531e" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                    <rect x="17" y="13" width="3" height="3" fill="#d9531e" />
                    <rect x="17" y="19" width="3" height="3" fill="#d9531e" />
                    <rect x="17" y="25" width="3" height="3" fill="#d9531e" />
                  </svg>
                </div>
                <h3 className="ref-fc-hub-heading">End-to-End</h3>
                <h4 className="ref-fc-hub-subheading">Construction Solutions</h4>
                <p className="ref-fc-hub-text">
                  Every service you need.<br />One partner you can trust.
                </p>
              </div>
            </div>

            {/* Right Column Cards (04, 05, 06) */}
            <div className="ref-fc-col ref-fc-col-right">
              {/* Card 04 */}
              <div className="ref-fc-card card-right" onClick={() => navigateToService('school')}>
                <div className="connector-line line-right-top"></div>
                <div className="ref-fc-icon-circle icon-navy">
                  <GraduationCap size={22} />
                </div>
                <div className="ref-fc-card-text">
                  <h3>School Construction</h3>
                  <p>Safe, durable, and functional educational infrastructure.</p>
                </div>
                <div className="ref-fc-badge badge-navy badge-right-pos">04</div>
              </div>

              {/* Card 05 */}
              <div className="ref-fc-card card-right" onClick={() => navigateToService('renovation')}>
                <div className="connector-line line-right-mid"></div>
                <div className="ref-fc-icon-circle icon-orange">
                  <Wrench size={22} />
                </div>
                <div className="ref-fc-card-text">
                  <h3>Renovation &amp; Remodeling</h3>
                  <p>Modernize existing structures with updated layouts &amp; fresh aesthetics.</p>
                </div>
                <div className="ref-fc-badge badge-orange badge-right-pos">05</div>
              </div>

              {/* Card 06 */}
              <div className="ref-fc-card card-right" onClick={() => navigateToService('interior')}>
                <div className="connector-line line-right-bot"></div>
                <div className="ref-fc-icon-circle icon-navy">
                  <Armchair size={22} />
                </div>
                <div className="ref-fc-card-text">
                  <h3>Interior Design</h3>
                  <p>Turnkey interior execution matching your architectural style.</p>
                </div>
                <div className="ref-fc-badge badge-navy badge-right-pos">06</div>
              </div>
            </div>
          </div>

          {/* Bottom Action Callout Bar */}
          <div className="ref-fc-bottom-bar-wrapper">
            <div className="ref-fc-bottom-bar">
              <div className="ref-fc-phone-circle">
                <Phone size={20} className="text-orange" />
              </div>
              <div className="ref-fc-callout-text">
                <strong className="callout-title">Have a project in mind?</strong>
                <span className="callout-sub">Let's build something amazing together.</span>
              </div>
              <div className="ref-fc-vline hidden sm:block"></div>
              <button onClick={onOpenEstimate} className="ref-fc-cta-btn">
                <span>Get Free Consultation</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Our Construction Process */}
      <section className="section-padding">
        <div className="container">
          <div className="section-title-wrapper">
            <span className="section-subtitle">Our Construction Process</span>
            <h2 className="section-heading">6 Steps to Your Dream Property</h2>
            <p className="section-desc">
              A transparent, hassle-free 6-step journey from initial consultation to final handover.
            </p>
          </div>

          <div className="process-grid">
            {processSteps.map((stepItem, idx) => (
              <div key={idx} className="process-card">
                <span className="step-number">{stepItem.step}</span>
                <h3>{stepItem.title}</h3>
                <p className="text-muted text-sm">{stepItem.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Principles - Reference Matched Dark Luxury Component */}
      <section className="ref-principles-section">
        {/* Dark Architectural Blueprint Line-Art Background Overlay */}
        <div className="ref-principles-blueprint-bg">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="bp-grid-small" width="30" height="30" patternUnits="userSpaceOnUse">
                <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(217, 83, 30, 0.08)" strokeWidth="0.8" />
                <path d="M 15 0 L 15 30 M 0 15 L 30 15" fill="none" stroke="rgba(255, 255, 255, 0.03)" strokeWidth="0.5" strokeDasharray="2,2" />
              </pattern>
              <pattern id="bp-grid-large" width="150" height="150" patternUnits="userSpaceOnUse">
                <rect width="150" height="150" fill="url(#bp-grid-small)" />
                <path d="M 150 0 L 0 0 0 150" fill="none" stroke="rgba(217, 83, 30, 0.18)" strokeWidth="1.2" />
                <circle cx="0" cy="0" r="3" fill="none" stroke="rgba(217, 83, 30, 0.4)" />
                <circle cx="150" cy="0" r="3" fill="none" stroke="rgba(217, 83, 30, 0.4)" />
                <circle cx="0" cy="150" r="3" fill="none" stroke="rgba(217, 83, 30, 0.4)" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#bp-grid-large)" />
            {/* Architectural Compass & Beam Lines */}
            <g stroke="rgba(217, 83, 30, 0.12)" strokeWidth="1" fill="none">
              <circle cx="10%" cy="20%" r="80" strokeDasharray="4,4" />
              <line x1="10%" y1="0" x2="10%" y2="100%" strokeDasharray="6,6" />
              <circle cx="90%" cy="80%" r="120" strokeDasharray="4,4" />
              <line x1="0" y1="80%" x2="100%" y2="80%" strokeDasharray="6,6" />
            </g>
          </svg>
        </div>

        {/* Ambient Glow Orbs */}
        <div className="ref-principles-watermark ref-pwatermark-left"></div>
        <div className="ref-principles-watermark ref-pwatermark-right"></div>

        <div className="container relative z-10">
          {/* Header */}
          <div className="ref-principles-header text-center">
            <div className="ref-principles-pill">
              <Scale size={15} className="text-orange" />
              <span>OUR PRINCIPLES</span>
            </div>

            <h2 className="ref-principles-title">
              Built on <span className="text-orange">Values.</span> Delivered with Integrity.
            </h2>

            <p className="ref-principles-desc">
              Our principles guide every decision we make and every project we deliver.<br className="hidden md:block" />
              They're the reason our clients trust us.
            </p>

            <div className="ref-principles-divider">
              <span className="ref-pdivider-line"></span>
              <span className="ref-pdivider-dot"></span>
              <span className="ref-pdivider-dot"></span>
              <span className="ref-pdivider-line"></span>
            </div>
          </div>

          {/* 4 Pillars Grid Cards */}
          <div className="ref-principles-grid">
            {/* Pillar 01 */}
            <div className="ref-principle-card">
              <div className="ref-principle-icon-circle">
                <ShieldCheck size={26} className="text-orange" />
              </div>
              <div className="ref-principle-num">01</div>
              <h3 className="ref-principle-card-title">Quality Construction</h3>
              <div className="ref-principle-card-line"></div>
              <p className="ref-principle-card-desc">
                Using standard certified materials and structural rigor.
              </p>
            </div>

            {/* Pillar 02 */}
            <div className="ref-principle-card">
              <div className="ref-principle-icon-circle">
                <MessageSquare size={26} className="text-orange" />
              </div>
              <div className="ref-principle-num">02</div>
              <h3 className="ref-principle-card-title">Honest Communication</h3>
              <div className="ref-principle-card-line"></div>
              <p className="ref-principle-card-desc">
                No hidden costs or scope ambiguity at any stage.
              </p>
            </div>

            {/* Pillar 03 */}
            <div className="ref-principle-card">
              <div className="ref-principle-icon-circle">
                <HardHat size={26} className="text-orange" />
              </div>
              <div className="ref-principle-num">03</div>
              <h3 className="ref-principle-card-title">Professional Execution</h3>
              <div className="ref-principle-card-line"></div>
              <p className="ref-principle-card-desc">
                Engineers supervising every slab, column, and finish.
              </p>
            </div>

            {/* Pillar 04 */}
            <div className="ref-principle-card">
              <div className="ref-principle-icon-circle">
                <Users size={26} className="text-orange" />
              </div>
              <div className="ref-principle-num">04</div>
              <h3 className="ref-principle-card-title">Customer Satisfaction</h3>
              <div className="ref-principle-card-line"></div>
              <p className="ref-principle-card-desc">
                On-time delivery backed by post-handover warranty support.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Construction Packages */}
      <section className="section-padding bg-subtle">
        <div className="container">
          <div className="section-title-wrapper">
            <span className="section-subtitle">Transparent Pricing</span>
            <h2 className="section-heading">Check Our Construction Packages</h2>
            <p className="section-desc">
              Fixed turn-key rates per sq.ft with no hidden costs. Compare what each
              package covers and pick the one that suits your plot and budget.
            </p>
          </div>

          {packageTiers.length > 0 && (
            <div className="grid grid-3 gap-6">
              {packageTiers.map((tier) => (
                <div
                  key={tier.id}
                  onClick={goToPackages}
                  className={`package-card home-package-card ${tier.id === 'premium' ? 'popular-card' : ''}`}
                >
                  {tier.id === 'premium' && <div className="popular-ribbon">MOST POPULAR</div>}
                  {tier.badge && <span className="package-tag">{tier.badge}</span>}
                  <h2>{tier.name}</h2>
                  <div className="package-price">
                    <span className="price-val">{tier.pricePerSqFt}</span>
                  </div>
                  {tier.desc && <p className="package-desc">{tier.desc}</p>}
                  <span className="home-package-link">
                    View Package Details <ArrowRight size={16} />
                  </span>
                </div>
              ))}
            </div>
          )}

          <div className="home-packages-cta">
            <button onClick={goToPackages} className="btn btn-primary btn-lg">
              Check All Packages &amp; Pricing <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </section>

      {/* Featured Projects */}
      {settings?.show_projects === 'true' && (
        <section className="section-padding">
          <div className="container">
            <div className="section-title-wrapper">
              <span className="section-subtitle">Featured Projects</span>
              <h2 className="section-heading">Completed Projects Across Hyderabad</h2>
              <p className="section-desc">
                Take a look at some of our recently delivered residential villas, homes, and commercial spaces.
              </p>
            </div>

            <div className="grid grid-3 gap-6">
              {featuredProjects.map((project, idx) => (
                <div key={idx} className="project-card cursor-pointer" onClick={() => navigateToProject(project.category || 'all', project)}>
                  <div className="project-img-box">
                    <img src={project.image} alt={project.title} />
                    <span className="project-type-badge">{project.type || project.categoryLabel}</span>
                  </div>
                  <div className="project-body">
                    <h3>{project.title}</h3>
                    <div className="project-meta">
                      <span><MapPin size={14} className="text-orange" /> {project.location}</span>
                      <span><Maximize2 size={14} className="text-orange" /> {project.size}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center mt-8">
              <button onClick={() => setCurrentPage('projects')} className="btn btn-outline btn-lg">
                Explore Full Project Portfolio
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Customer Testimonials */}
      <section className="section-padding bg-subtle">
        <div className="container">
          <div className="section-title-wrapper">
            <span className="section-subtitle">Customer Reviews</span>
            <h2 className="section-heading">What Our Clients Say About Us</h2>
            <p className="section-desc">
              Real feedback from homeowners and developers who trusted Bricks Wall for their dream property.
            </p>
          </div>

          <div className="grid grid-3 gap-6">
            {testimonials.map((item, idx) => (
              <div key={idx} className="testimonial-card">
                <div className="stars mb-3">
                  {'★'.repeat(item.rating)}
                </div>
                <p className="testimonial-quote">"{item.quote}"</p>
                <div className="testimonial-user">
                  <img src={item.avatar} alt={item.name} className="user-avatar" />
                  <div>
                    <strong>{item.name}</strong>
                    <p className="text-xs text-muted">{item.role} &bull; {item.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="section-padding">
        <div className="container">
          <div className="section-title-wrapper">
            <span className="section-subtitle">Got Questions?</span>
            <h2 className="section-heading">Frequently Asked Questions</h2>
            <p className="section-desc">
              Everything you need to know about our construction services, pricing, and timelines in Hyderabad.
            </p>
          </div>

          <div className="faq-wrapper max-w-3xl mx-auto">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className={`faq-item ${activeFaq === idx ? 'open' : ''}`}
                onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
              >
                <div className="faq-question">
                  <h3>{faq.q}</h3>
                  {activeFaq === idx ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>
                {activeFaq === idx && (
                  <div className="faq-answer">
                    <p>{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="cta-banner-section">
        <div className="container">
          <div className="cta-box">
            <h2>Ready to Build Your Dream Property?</h2>
            <p>Contact Bricks Wall today for a free consultation and discover how our experienced team can bring your vision to life.</p>
            <div className="cta-buttons">
              <button onClick={onOpenEstimate} className="btn btn-primary btn-lg">
                Get Free Consultation
              </button>
              <a href="tel:+919949249091" className="btn btn-outline-white btn-lg">
                <Phone size={18} /> Call +91 9949249091
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
