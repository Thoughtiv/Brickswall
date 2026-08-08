import React, { useState } from 'react';
import { BookOpen, Clock, Tag, ArrowRight, X, Search, CheckCircle2 } from 'lucide-react';

const Blog = ({ onOpenEstimate }) => {
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState('all');

  const articles = [
    {
      id: 1,
      title: 'House Construction Cost in Hyderabad (2026 Guide)',
      category: 'Cost Guides',
      readTime: '6 min read',
      date: 'Aug 2026',
      summary: 'Detailed breakdown of current construction rates per sq.ft in Hyderabad, including material costs, labor rates, and approval fees.',
      image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
      content: `
        Building a home in Hyderabad involves understanding the built-up area cost per square foot. Currently in 2026:
        - Basic Construction: ₹1,650 to ₹1,850 per sq.ft
        - Premium Quality Construction: ₹2,050 to ₹2,350 per sq.ft
        - Luxury Custom Villa: ₹2,600 to ₹3,200+ per sq.ft

        Key Cost Factors in Hyderabad:
        1. Soil Type & Foundation Depth: Red soil vs Black cotton soil requiring pile foundation.
        2. Steel & Cement Price Fluctuations: Grade 53 cement and TMT steel rates.
        3. GHMC Plan Approvals: Municipal permissions and water/electricity connection fees.
      `
    },
    {
      id: 2,
      title: 'Planning Your Dream Home: Step-by-Step Layout Guide',
      category: 'Home Design Ideas',
      readTime: '5 min read',
      date: 'Jul 2026',
      summary: 'Essential architectural tips for room sizing, Vastu orientation, natural lighting, and ventilation in modern Hyderabad homes.',
      image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80',
      content: `
        A well-planned floor layout ensures max ventilation, Vastu compliance, and zero wasted corridor space.
        - East & North Orientations for Main Entrance.
        - Living Room Placement: Maximizing natural sunlight during morning hours.
        - Kitchen Positioning: South-East (Agneya) corner for traditional harmony.
      `
    },
    {
      id: 3,
      title: 'Tips for Choosing the Right Construction Company in Hyderabad',
      category: 'Construction Tips',
      readTime: '7 min read',
      date: 'Jul 2026',
      summary: 'How to evaluate builders, verify past handover track records, check material specifications, and avoid hidden cost escalations.',
      image: 'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b7?auto=format&fit=crop&w=800&q=80',
      content: `
        Choosing a construction partner requires looking beyond just the lowest quote per sq.ft.
        1. Check Structural Warranty: Look for minimum 10-year structural guarantee.
        2. Visit Ongoing Sites: Inspect steel spacing and slab curing practices on active projects.
        3. Insist on Itemized Bill of Quantities (BOQ): Ensure brand names for cement, steel, and tiles are explicitly specified.
      `
    },
    {
      id: 4,
      title: 'Modern Home Design Ideas for Contemporary Hyderabad Villas',
      category: 'Home Design Ideas',
      readTime: '4 min read',
      date: 'Jun 2026',
      summary: 'Discover popular architectural elevation styles, double-height living ceilings, interior courtyard gardens, and smart home features.',
      image: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=800&q=80',
      content: `
        Modern luxury homes in Hyderabad focus on indoor-outdoor connectivity, large glass facades, and energy-efficient double glazing to stay cool during summer.
      `
    },
    {
      id: 5,
      title: 'Construction Budget Planning: Avoiding Cost Overruns',
      category: 'Cost Guides',
      readTime: '6 min read',
      date: 'Jun 2026',
      summary: 'Practical strategies to lock in your construction budget, handle contingency reserves, and control finishing expenses.',
      image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80',
      content: `
        Always set aside a 5% to 8% contingency fund for customization changes made during tile or sanitary ware selection.
      `
    },
    {
      id: 6,
      title: 'Residential vs Commercial Construction: Key Engineering Differences',
      category: 'Construction Tips',
      readTime: '5 min read',
      date: 'May 2026',
      summary: 'Structural loading requirements, fire safety norms, commercial HVAC, and zoning laws in Hyderabad.',
      image: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=800&q=80',
      content: `
        Commercial construction demands higher structural live-load capacities, sprinkler systems, and specialized floor slab thickness compared to standard residential homes.
      `
    },
    {
      id: 7,
      title: 'Building Materials Explained: Cement & Steel Grade Guide',
      category: 'Construction Tips',
      readTime: '8 min read',
      date: 'May 2026',
      summary: 'Why 53 Grade OPC cement and Fe550 TMT steel bars are crucial for long-lasting structural integrity in Hyderabad climate.',
      image: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=800&q=80',
      content: `
        Understanding cement grades: OPC 53 provides rapid early strength gaining for columns and beams, while PPC is ideal for plastering and brick masonry.
      `
    },
    {
      id: 8,
      title: 'Common Construction Mistakes to Avoid When Building Your House',
      category: 'Construction Tips',
      readTime: '5 min read',
      date: 'Apr 2026',
      summary: 'Top 7 pitfalls homeowners commit during land soil testing, waterproofing, electrical conduit layout, and curing period.',
      image: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=800&q=80',
      content: `
        Mistake #1: Skipping soil testing. Different areas in Hyderabad (like Gachibowli vs Uppal) have vastly different rock and clay compositions.
      `
    },
    {
      id: 9,
      title: 'Renovation Planning Guide: Transforming Older Hyderabad Homes',
      category: 'Home Design Ideas',
      readTime: '6 min read',
      date: 'Apr 2026',
      summary: 'How to modernize load-bearing structures, replace legacy plumbing, and install contemporary elevations.',
      image: 'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=800&q=80',
      content: `
        Renovating requires a structural engineer’s safety clearance before knocking down interior walls to create open kitchen concepts.
      `
    },
    {
      id: 10,
      title: 'Property Investment in Hyderabad: Growth Corridors & Plot Insights',
      category: 'Cost Guides',
      readTime: '7 min read',
      date: 'Mar 2026',
      summary: 'Analysis of high-growth residential corridors including Tellapur, Mokila, Shankarpally, and Financial District.',
      image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80',
      content: `
        Western Hyderabad corridors along the ORR continue to lead in villa and independent home developments with high appreciation rates.
      `
    }
  ];

  const categories = ['all', 'Construction Tips', 'Home Design Ideas', 'Cost Guides'];

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
              <div key={art.id} className="blog-card group">
                <div className="blog-img-box">
                  <img src={art.image} alt={art.title} />
                  <span className="badge badge-orange category-badge">{art.category}</span>
                </div>
                <div className="blog-body">
                  <div className="flex justify-between items-center text-xs text-muted mb-2">
                    <span><Clock size={12} className="inline text-orange mr-1" /> {art.readTime}</span>
                    <span>{art.date}</span>
                  </div>
                  <h3>{art.title}</h3>
                  <p className="text-muted text-xs mb-4">{art.summary}</p>

                  <button 
                    onClick={() => setSelectedArticle(art)}
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
          <div className="modal-card animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedArticle(null)}>
              <X size={20} />
            </button>
            <div className="p-2">
              <span className="badge badge-orange mb-2">{selectedArticle.category}</span>
              <h2>{selectedArticle.title}</h2>
              <div className="flex gap-4 text-xs text-muted my-2">
                <span>Published: {selectedArticle.date}</span>
                <span>Reading Time: {selectedArticle.readTime}</span>
              </div>

              <img 
                src={selectedArticle.image} 
                alt={selectedArticle.title}
                className="w-full h-48 object-cover rounded-lg my-3"
              />

              <div className="prose text-sm text-slate-700 whitespace-pre-line leading-relaxed mb-6">
                {selectedArticle.content}
              </div>

              <div className="bg-subtle p-4 rounded-lg flex items-center justify-between">
                <div>
                  <p className="font-bold text-xs">Planning your project in Hyderabad?</p>
                  <p className="text-xs text-muted">Get a detailed cost estimate based on this guide.</p>
                </div>
                <button 
                  onClick={() => { setSelectedArticle(null); onOpenEstimate(); }}
                  className="btn btn-primary btn-sm"
                >
                  Get Free Estimate
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
