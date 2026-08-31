import React, { useState, useEffect } from 'react';
import { MapPin, Maximize2, CheckCircle2, ArrowRight, Layers, Eye } from 'lucide-react';
import { getProjects, resolveAssetUrl } from '../utils/api';

const Projects = ({ onOpenEstimate, initialFilter = 'all', initialProject = null }) => {
  const [filter, setFilter] = useState(initialFilter);
  const [selectedProjectModal, setSelectedProjectModal] = useState(initialProject);
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    setFilter(initialFilter);
    setSelectedProjectModal(initialProject);
  }, [initialFilter, initialProject]);

  useEffect(() => {
    const fetchProjects = async () => {
      const data = await getProjects();
      if (data && data.length > 0) {
        setProjects(data);
      } else {
        setProjects(DEFAULT_PROJECTS);
      }
    };
    fetchProjects();
  }, []);

  const DEFAULT_PROJECTS = [
    {
      id: 1,
      title: 'The Crest Luxury Villa',
      category: 'villa',
      categoryLabel: 'Luxury Villa',
      location: 'Jubilee Hills, Hyderabad',
      size: '5,500 sq.ft',
      duration: '11 Months',
      image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80',
      description: 'A modern 3-story ultra-luxury villa featuring Italian marble flooring, floating staircase, private courtyard pool, and smart home automation.'
    },
    {
      id: 2,
      title: 'Gachibowli Horizon Residency',
      category: 'homes',
      categoryLabel: 'Independent Home',
      location: 'Gachibowli, Hyderabad',
      size: '3,800 sq.ft',
      duration: '9 Months',
      image: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=800&q=80',
      description: 'Contemporary G+2 independent duplex home with spacious balconies, rooftop solar installation, and premium teak wood joinery.'
    },
    {
      id: 3,
      title: 'Aura Commercial Center',
      category: 'commercial',
      categoryLabel: 'Commercial Building',
      location: 'Madhapur, Hyderabad',
      size: '12,000 sq.ft',
      duration: '14 Months',
      image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80',
      description: 'Commercial 5-floor office building with modern glass curtain walls, double basement parking, and high-speed elevators.'
    },
    {
      id: 4,
      title: 'Greenwood Academy Infrastructure',
      category: 'school',
      categoryLabel: 'Educational Institution',
      location: 'Kukatpally, Hyderabad',
      size: '18,500 sq.ft',
      duration: '15 Months',
      image: 'https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&w=800&q=80',
      description: 'Spacious, fire-safe educational campus building featuring 24 classrooms, science laboratories, and indoor sports hall.'
    },
    {
      id: 5,
      title: 'Tellapur Modern Duplex',
      category: 'homes',
      categoryLabel: 'Independent Home',
      location: 'Tellapur, Hyderabad',
      size: '4,200 sq.ft',
      duration: '10 Months',
      image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80',
      description: 'Contemporary architectural design duplex home built with premium Grade 53 cement and heat-insulating clay brick cladding.'
    },
    {
      id: 6,
      title: 'Banjara Hills Villa Renovation',
      category: 'renovation',
      categoryLabel: 'Renovation & Remodeling',
      location: 'Banjara Hills, Hyderabad',
      size: '3,100 sq.ft',
      duration: '4 Months',
      image: 'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=800&q=80',
      description: 'Total structural renovation and elevation upgrade of a 20-year-old property into a modern open-concept contemporary home.'
    },
    {
      id: 7,
      title: 'Kondapur Heights Commercial Complex',
      category: 'commercial',
      categoryLabel: 'Commercial Complex',
      location: 'Kondapur, Hyderabad',
      size: '15,000 sq.ft',
      duration: '16 Months',
      image: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=800&q=80',
      description: 'Retail & office mixed-use commercial structure engineered for heavy footfalls and energy efficiency.'
    },
    {
      id: 8,
      title: 'Manikonda Luxury Residence',
      category: 'villa',
      categoryLabel: 'Luxury Villa',
      location: 'Manikonda, Hyderabad',
      size: '4,800 sq.ft',
      duration: '11 Months',
      image: 'https://images.unsplash.com/photo-1600585152220-90363fe7e115?auto=format&fit=crop&w=800&q=80',
      description: 'Custom triplex villa with private elevator, home theater, landscaped terrace garden, and designer lighting.'
    }
  ];

  const filteredProjects = filter === 'all'
    ? projects
    : projects.filter(p => p.category === filter);

  return (
    <div className="projects-page">
      {/* Subpage Hero */}
      <section className="subpage-hero">
        <div className="container">
          <span className="section-subtitle badge-orange text-white">Portfolio</span>
          <h1 className="subpage-title">Building Projects That Inspire Confidence</h1>
          <p className="subpage-desc">
            Explore 50+ completed independent homes, luxury villas, commercial buildings, schools, and complexes delivered across Hyderabad.
          </p>
        </div>
      </section>

      {/* Filterable Gallery */}
      <section className="section-padding">
        <div className="container">
          <div className="portfolio-filter-tabs">
            {[
              { id: 'all', label: 'All Projects' },
              { id: 'homes', label: 'Independent Homes' },
              { id: 'villa', label: 'Luxury Villas' },
              { id: 'commercial', label: 'Commercial' },
              { id: 'school', label: 'Schools' },
              { id: 'renovation', label: 'Renovation' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className={`filter-btn ${filter === tab.id ? 'active' : ''}`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="grid grid-3 gap-6">
            {filteredProjects.map((project) => (
              <div key={project.id} className="project-card group">
                <div className="project-img-box">
                  <img src={resolveAssetUrl(project.image)} alt={project.title} />
                  <span className="project-type-badge">{project.categoryLabel}</span>
                  <button
                    onClick={() => setSelectedProjectModal(project)}
                    className="quick-view-overlay"
                  >
                    <Eye size={20} /> View Project Specs
                  </button>
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
        </div>
      </section>

      {/* Modal for Project Detail */}
      {selectedProjectModal && (
        <div className="modal-overlay" onClick={() => setSelectedProjectModal(null)}>
          <div className="modal-card project-modal-card animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedProjectModal(null)} aria-label="Close modal">
              &times;
            </button>

            <div className="project-modal-img-box">
              <img
                src={resolveAssetUrl(selectedProjectModal.image)}
                alt={selectedProjectModal.title}
              />
            </div>

            <div className="project-modal-content">
              <span className="project-modal-category">{selectedProjectModal.categoryLabel}</span>
              <h2 className="project-modal-title">{selectedProjectModal.title}</h2>
              <p className="project-modal-location">
                <MapPin size={14} className="text-orange flex-shrink-0" /> {selectedProjectModal.location}
              </p>

              <div className="project-modal-specs">
                <div className="project-modal-spec-item">
                  <span className="spec-label">Built-up Area</span>
                  <span className="spec-val">{selectedProjectModal.size}</span>
                </div>
                <div className="project-modal-spec-item">
                  <span className="spec-label">Duration</span>
                  <span className="spec-val">{selectedProjectModal.duration}</span>
                </div>
                <div className="project-modal-spec-item">
                  <span className="spec-label">Location</span>
                  <span className="spec-val">Hyderabad</span>
                </div>
                <div className="project-modal-spec-item">
                  <span className="spec-label">Structural Warranty</span>
                  <span className="spec-val">10 Years</span>
                </div>
              </div>

              <p className="project-modal-desc">{selectedProjectModal.description}</p>

              <button
                onClick={() => { setSelectedProjectModal(null); onOpenEstimate(); }}
                className="btn btn-primary project-modal-cta-btn"
              >
                Request Quote for Similar Project
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CTA */}
      <section className="cta-banner-section">
        <div className="container">
          <div className="cta-box">
            <h2>Want a Property Like This in Hyderabad?</h2>
            <p>Share your plot size and vision with our engineers to get started today.</p>
            <div className="cta-buttons mt-6">
              <button onClick={onOpenEstimate} className="btn btn-primary btn-lg">
                Get Free Estimate
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Projects;
