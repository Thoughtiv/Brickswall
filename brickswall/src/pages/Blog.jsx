import React, { useState, useEffect } from 'react';
import { BookOpen, Clock, Tag, ArrowRight, X, Search, CheckCircle2, User, Calendar } from 'lucide-react';
import { getBlogs, resolveAssetUrl } from '../utils/api';

const defaultArticles = [
  {
    id: 1,
    title: 'Building a Home in Hyderabad in 2026: What Should You Know Before You Start?',
    category: 'Cost & Planning',
    readTime: '5 min read',
    date: 'July 28, 2026',
    excerpt: 'Building an independent home is still a dream for many families in Hyderabad. Understand land prices, construction rates per sq.ft, labor availability, and GHMC approvals.',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
    author: 'Bricks Wall Editorial',
    content: `Building an independent home is still a dream for many families in Hyderabad. But today, constructing a house is very different from what it was a few years ago. Land prices have changed, construction costs have increased, labour availability can vary, and homeowners have more expectations when it comes to design, comfort, technology and quality.

At the same time, Hyderabad continues to see strong real estate activity. Recent market reports indicate continued demand across residential segments, with premium housing becoming increasingly important in the city.

So, if you are planning to construct your own home in Hyderabad, what should you consider?

### 1. Start with a realistic budget
One of the biggest mistakes homeowners make is deciding on a construction budget based only on the basic construction rate per square foot. Construction involves much more than the structure.

You need to consider:
- Architectural and structural design
- Approvals and permissions (GHMC / HMDA)
- Civil construction & RCC framing
- Electrical and plumbing fittings
- Flooring & joinery scope
- Doors, windows & wood joinery
- Kitchen, Bathrooms & Sanitaryware
- Painting & Exterior elevation
- Lighting & External developments
- Labour and material costs

A realistic budget at the beginning can save you from unpleasant financial surprises down the line.

### 2. Understand Soil Testing & Foundation Design
Hyderabad soil conditions vary greatly across regions—from hard granite rock in Jubilee Hills to black cotton soil in Kondapur and Gachibowli. Conducting a Soil Bearing Capacity (SBC) test before excavation guarantees that footings and column depths are engineered accurately to prevent structural cracks.

### 3. Choose Turnkey Packages to Lock in Fixed Rates
Partnering with an established engineering firm like Bricks Wall locks in a fixed rate per sq.ft, protecting you against rising material costs while providing transparent progress tracking.`
  },
  {
    id: 2,
    title: 'House Construction Cost in Hyderabad (2026 Guide)',
    category: 'Cost Guides',
    readTime: '6 min read',
    date: 'Aug 2026',
    excerpt: 'Detailed breakdown of current construction rates per sq.ft in Hyderabad, including material costs, labor rates, and approval fees.',
    image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80',
    author: 'Bricks Wall Engineering Team',
    content: `Building a home in Hyderabad involves understanding the built-up area cost per square foot. Currently in 2026:

### Standard Package Rates
- Basic Construction: ₹1,650 to ₹1,850 per sq.ft
- Premium Quality Construction: ₹2,050 to ₹2,350 per sq.ft
- Luxury Custom Villa: ₹2,600 to ₹3,200+ per sq.ft

### Key Cost Factors in Hyderabad:
- Soil Type & Foundation Depth: Red soil vs Black cotton soil requiring pile foundation.
- Steel & Cement Price Fluctuations: Grade 53 cement and TMT steel rates.
- GHMC Plan Approvals: Municipal permissions and water/electricity connection fees.`
  },
  {
    id: 3,
    title: 'Tips for Choosing the Right Construction Company in Hyderabad',
    category: 'Construction Tips',
    readTime: '7 min read',
    date: 'Jul 2026',
    excerpt: 'How to evaluate builders, verify past handover track records, check material specifications, and avoid hidden cost escalations.',
    image: 'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b7?auto=format&fit=crop&w=800&q=80',
    author: 'Garvit Reddy, Lead Estimator',
    content: `Choosing a construction partner requires looking beyond just the lowest quote per sq.ft.

### 1. Check Structural Warranty
Look for a minimum 10-year written structural guarantee covering foundation, RCC columns, and slabs.

### 2. Visit Ongoing Project Sites
Inspect steel spacing, slab curing practices, shuttering quality, and material storage on active sites.

### 3. Insist on Itemized Bill of Quantities (BOQ)
Ensure brand names for cement, steel, tiles, electrical wiring, and plumbing fittings are explicitly specified in the contract.`
  }
];

// Helper to render inline formatting like **bold text**
const formatInlineText = (text) => {
  if (!text) return '';
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="font-bold text-navy">{part.slice(2, -2)}</strong>;
    }
    return part;
  });
};

// Smart Content Renderer for Blog Details
const renderFormattedBlogContent = (content) => {
  if (!content) return null;

  // Split by double newlines or line breaks
  const blocks = content.split(/\n\s*\n/).filter(Boolean);

  return (
    <div className="blog-modal-prose">
      {blocks.map((block, idx) => {
        const trimmed = block.trim();

        // 1. Markdown Heading (### Heading or ## Heading or # Heading)
        if (trimmed.startsWith('#')) {
          const text = trimmed.replace(/^#+\s*/, '');
          return <h3 key={idx}>{text}</h3>;
        }

        // 2. Numbered step heading (e.g. "1. Start with a realistic budget")
        if (/^\d+\.\s+[^\n]+$/.test(trimmed)) {
          return <h3 key={idx}>{trimmed}</h3>;
        }

        // 3. Short header line ending with colon (e.g. "You need to consider:")
        if (trimmed.endsWith(':') && trimmed.length < 80 && !trimmed.includes('\n')) {
          return <h4 key={idx}>{trimmed}</h4>;
        }

        // 4. Multi-line block with list items or mixed content
        const lines = trimmed.split('\n');
        const isPureBulletList = lines.every(line => {
          const l = line.trim();
          return l.startsWith('- ') || l.startsWith('* ') || l.startsWith('• ');
        });

        if (isPureBulletList) {
          return (
            <ul key={idx}>
              {lines.map((line, lIdx) => {
                const itemText = line.trim().replace(/^[-*•]\s*/, '');
                return <li key={lIdx}>{formatInlineText(itemText)}</li>;
              })}
            </ul>
          );
        }

        if (lines.length > 1) {
          const hasBullets = lines.some(l => {
            const t = l.trim();
            return t.startsWith('- ') || t.startsWith('* ') || t.startsWith('• ');
          });

          if (hasBullets) {
            return (
              <div key={idx} className="my-3">
                {lines.map((line, lIdx) => {
                  const tLine = line.trim();
                  if (!tLine) return null;

                  if (tLine.startsWith('###') || tLine.startsWith('##')) {
                    return <h3 key={lIdx}>{tLine.replace(/^#+\s*/, '')}</h3>;
                  }
                  if (/^\d+\.\s+[^\n]+$/.test(tLine)) {
                    return <h3 key={lIdx}>{tLine}</h3>;
                  }
                  if (tLine.endsWith(':')) {
                    return <h4 key={lIdx} className="mt-4 mb-2">{tLine}</h4>;
                  }
                  if (tLine.startsWith('- ') || tLine.startsWith('* ') || tLine.startsWith('• ')) {
                    return (
                      <ul key={lIdx} className="my-1">
                        <li>{formatInlineText(tLine.replace(/^[-*•]\s*/, ''))}</li>
                      </ul>
                    );
                  }
                  return <p key={lIdx} className="mb-2">{formatInlineText(tLine)}</p>;
                })}
              </div>
            );
          }
        }

        // 5. Standard Paragraph
        return (
          <p key={idx}>
            {formatInlineText(trimmed)}
          </p>
        );
      })}
    </div>
  );
};

const Blog = ({ onOpenEstimate }) => {
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [articles, setArticles] = useState(defaultArticles);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    getBlogs().then(data => {
      if (active) {
        if (Array.isArray(data) && data.length > 0) {
          setArticles(data);
        }
        setLoading(false);
      }
    }).catch(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, []);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (selectedArticle) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [selectedArticle]);

  const categories = ['all', ...Array.from(new Set(articles.map(a => a.category).filter(Boolean)))];

  const filteredArticles = categoryFilter === 'all'
    ? articles
    : articles.filter(a => a.category === categoryFilter);

  return (
    <div className="blog-page">
      {/* Subpage Hero */}
      <section className="subpage-hero">
        <div className="container">
          <span className="section-subtitle badge-orange text-white">Knowledge Hub</span>
          <h1 className="subpage-title">Learn Before You Build</h1>
          <p className="subpage-desc">
            Explore expert construction advice, home planning guides, building material insights, renovation tips, and practical information before starting your project.
          </p>
        </div>
      </section>

      {/* Category Tabs */}
      <section className="section-padding">
        <div className="container">
          <div className="portfolio-filter-tabs mb-8">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`filter-btn ${categoryFilter === cat ? 'active' : ''}`}
              >
                {cat === 'all' ? 'All Articles' : cat}
              </button>
            ))}
          </div>

          <div className="grid grid-3 gap-6">
            {filteredArticles.map((art) => (
              <div 
                key={art.id} 
                className="blog-card group"
                onClick={() => setSelectedArticle(art)}
              >
                <div className="blog-img-box">
                  <img src={resolveAssetUrl(art.image)} alt={art.title} />
                  <span className="badge badge-orange category-badge">{art.category}</span>
                </div>
                <div className="blog-body">
                  <div className="flex justify-between items-center text-xs text-muted mb-2">
                    <span><Clock size={12} className="inline text-orange mr-1" /> {art.readTime}</span>
                    <span>{art.date}</span>
                  </div>
                  <h3>{art.title}</h3>
                  <p className="text-muted text-xs mb-4">{art.excerpt || art.summary}</p>
                  {art.author && (
                    <div className="text-xs text-muted mb-3 flex items-center gap-1">
                      <User size={12} className="text-orange" /> {art.author}
                    </div>
                  )}

                  <button 
                    onClick={(e) => { e.stopPropagation(); setSelectedArticle(art); }}
                    className="read-more-btn"
                  >
                    <span>Read Article</span> <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Article Detail Drawer / Modal */}
      {selectedArticle && (
        <div className="modal-overlay" onClick={() => setSelectedArticle(null)}>
          <div className="modal-card blog-modal-card animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <button 
              className="blog-modal-close" 
              onClick={() => setSelectedArticle(null)}
              aria-label="Close modal"
            >
              <X size={20} />
            </button>

            <div className="blog-modal-scroll-container">
              <div className="blog-modal-header">
                <span className="badge badge-orange mb-2">{selectedArticle.category}</span>
                <h2 className="blog-modal-title">{selectedArticle.title}</h2>
                <div className="blog-modal-meta">
                  <span className="blog-modal-meta-item">
                    <Calendar size={14} className="text-orange" /> Published: {selectedArticle.date}
                  </span>
                  <span className="blog-modal-meta-item">
                    <Clock size={14} className="text-orange" /> Reading Time: {selectedArticle.readTime}
                  </span>
                  {selectedArticle.author && (
                    <span className="blog-modal-meta-item">
                      <User size={14} className="text-orange" /> Author: {selectedArticle.author}
                    </span>
                  )}
                </div>
              </div>

              <img 
                src={resolveAssetUrl(selectedArticle.image)} 
                alt={selectedArticle.title}
                className="blog-modal-img"
              />

              {renderFormattedBlogContent(selectedArticle.content)}

              <div className="blog-modal-cta-box">
                <div>
                  <h4>Planning your project in Hyderabad?</h4>
                  <p>Get a detailed cost estimate and engineering consultation based on this guide.</p>
                </div>
                <button 
                  onClick={() => { setSelectedArticle(null); onOpenEstimate(); }}
                  className="btn btn-primary btn-sm"
                >
                  Get Free Estimate <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CTA */}
      <section className="cta-banner-section">
        <div className="container">
          <div className="cta-box">
            <h2>Have Specific Questions About Your Land Plot?</h2>
            <p>Our engineering experts are ready to provide custom advice for your plot in Hyderabad.</p>
            <div className="cta-buttons mt-6">
              <button onClick={onOpenEstimate} className="btn btn-primary btn-lg">
                Speak With An Engineer
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Blog;

