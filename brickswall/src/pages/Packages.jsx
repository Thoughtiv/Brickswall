import React, { useState, useEffect } from 'react';
import { Check, X, ShieldCheck, Calculator, ArrowRight, HelpCircle } from 'lucide-react';
import { getPricing, getPackageMatrix } from '../utils/api';

const defaultMatrix = [
  { id: '1', feature: 'Price per Built-up Sq.Ft', basic: '₹1,850 / sq.ft', premium: '₹2,150 / sq.ft', luxury: '₹2,750 / sq.ft' },
  { id: '2', feature: 'Structural Guarantee', basic: '10 Years Written', premium: '10 Years Written', luxury: '10 Years Written' },
  { id: '3', feature: 'Architectural & Design Support', basic: '2D Floor Plans & Elevation', premium: '3D Elevation & Structural Drawings', luxury: '3D VR Walkthrough & Full Architectural Blueprint' },
  { id: '4', feature: 'Soil & Structural Engineering', basic: 'SBC Soil Test & Standard Footings', premium: 'SBC Soil Test & Reinforced Columns', luxury: 'Bespoke Soil Engineering & Custom RCC Framing' },
  { id: '5', feature: 'Cement & Steel Standards', basic: '53 Grade Cement & Fe500 TMT Steel', premium: 'Ultratech Super & Tata/JSW Fe550', luxury: 'High-Grade Structural Cement & Fe550D TMT' },
  { id: '6', feature: 'Flooring & Tiling Scope', basic: 'Vitrified Tiles (Up to ₹60/sq.ft)', premium: 'Premium Vitrified (Up to ₹100/sq.ft)', luxury: 'Italian Marble / Granite (₹250+/sq.ft)' },
  { id: '7', feature: 'Doors & Windows Joinery', basic: 'Flush Doors with Hardwood Frame', premium: 'Teak Wood Main Door & Frame', luxury: 'Teak Wood Main Door with Smart Digital Lock' },
  { id: '8', feature: 'Plumbing & Sanitary Scope', basic: 'Branded Fittings (Cera/Parryware)', premium: 'Premium Fittings (Kohler/Jaquar)', luxury: 'Luxury Concealed Fittings (Grohe/Hansgrohe)' },
  { id: '9', feature: 'Site Supervision & Audits', basic: 'Periodic Civil Engineer Visits', premium: 'Dedicated Project Site Supervisor', luxury: 'Senior Resident Civil Engineer' },
  { id: '10', feature: 'Waterproofing & Solar Readiness', basic: 'Terrace Waterproofing', premium: 'Multi-Layer Terrace Waterproofing', luxury: 'Terrace Waterproofing & Rooftop Solar Setup' }
];

const Packages = ({ onOpenEstimate }) => {
  const [plotSize, setPlotSize] = useState(1500);
  const [pricingData, setPricingData] = useState(null);
  const [matrixData, setMatrixData] = useState(defaultMatrix);

  useEffect(() => {
    let active = true;
    getPricing().then(data => {
      if (active) setPricingData(data);
    });
    getPackageMatrix().then(data => {
      if (active && Array.isArray(data) && data.length > 0) {
        setMatrixData(data);
      }
    });
    return () => { active = false; };
  }, []);

  const basePackages = [
    {
      id: 'basic',
      name: 'Standard Package',
      pricePerSqFt: '₹1,750 / sq.ft',
      priceNum: 1750,
      badge: 'Economical & Durable',
      isPopular: false,
      desc: 'An affordable solution designed for quality residential construction with dependable materials and essential finishes.'
    },
    {
      id: 'premium',
      name: 'Enhanced Package',
      pricePerSqFt: '₹2,150 / sq.ft',
      priceNum: 2150,
      badge: 'Most Popular Choice',
      isPopular: true,
      desc: 'Ideal for homeowners seeking enhanced finishes, premium materials, custom elevation designs, and additional customization.'
    },
    {
      id: 'luxury',
      name: 'Signature Package',
      pricePerSqFt: '₹2,750 / sq.ft',
      priceNum: 2750,
      badge: 'High-End Bespoke',
      isPopular: false,
      desc: 'Designed for premium residences featuring superior materials, elegant interiors, modern architecture, and luxury finishes.'
    }
  ];

  const packages = basePackages.map(pkg => {
    if (pricingData && pricingData[pkg.id]) {
      const live = pricingData[pkg.id];
      return {
        ...pkg,
        pricePerSqFt: live.pricePerSqFt || pkg.pricePerSqFt,
        priceNum: live.priceNum || pkg.priceNum,
        badge: live.badge !== undefined ? live.badge : pkg.badge,
        desc: live.desc !== undefined ? live.desc : pkg.desc,
        warranty: live.warranty || '',
        services: Array.isArray(live.services) ? live.services : [],
        servicesHeading: live.servicesHeading || 'Included Deliverables & Guarantee'
      };
    }
    return { ...pkg, warranty: '', services: [] };
  });

  return (
    <div className="packages-page">
      {/* Subpage Hero */}
      <section className="subpage-hero">
        <div className="container">
          <span className="section-subtitle badge-orange text-white">Transparent Pricing</span>
          <h1 className="subpage-title">Construction Packages &amp; Pricing</h1>
          <p className="subpage-desc">
            Transparent turn-key construction rates per sq.ft with zero hidden costs. Choose the package that matches your dream home vision in Hyderabad.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="section-padding">
        <div className="container">
          <div className="grid grid-3 gap-6">
            {packages.map((pkg) => {
              const estimatedTotal = (plotSize * pkg.priceNum).toLocaleString('en-IN');

              return (
                <div 
                  key={pkg.id} 
                  className={`package-card ${pkg.isPopular ? 'popular-card' : ''}`}
                >
                  {pkg.isPopular && <div className="popular-ribbon">MOST POPULAR</div>}
                  <span className="package-tag">{pkg.badge}</span>
                  <h2>{pkg.name}</h2>
                  <div className="package-price">
                    <span className="price-val">{pkg.pricePerSqFt}</span>
                  </div>

                  <p className="package-desc">{pkg.desc}</p>

                  <div className="est-box my-4 p-3 bg-subtle rounded-lg text-xs">
                    <span>Est. for {plotSize} sq.ft plot:</span>
                    <strong className="block text-sm text-orange">₹{estimatedTotal} approx</strong>
                  </div>

                  <button onClick={onOpenEstimate} className="btn btn-primary w-full btn-lg">
                    Choose {pkg.name}
                  </button>

                  {(pkg.warranty || pkg.services.length > 0) && (
                    <div className="pkg-spec-group">
                      <h4>{pkg.servicesHeading || 'Included Deliverables & Guarantee'}:</h4>
                      <ul>
                        {pkg.warranty && <li><ShieldCheck size={14} className="text-orange" /> <strong>{pkg.warranty}</strong></li>}
                        {pkg.services.map((s, i) => (
                          <li key={i}><Check size={14} className="text-orange" /> {s}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Package Comparison Table */}
      <section className="section-padding bg-subtle">
        <div className="container">
          <div className="section-title-wrapper">
            <span className="section-subtitle">Side-by-Side</span>
            <h2 className="section-heading">Package Comparison Matrix</h2>
            <p className="section-desc">
              Compare features, materials, and services included in each construction tier.
            </p>
          </div>

          <div className="table-responsive-wrapper">
            <table className="comparison-table">
              <thead>
                <tr>
                  <th>Features &amp; Specifications</th>
                  <th>Standard Package</th>
                  <th>Enhanced Package</th>
                  <th>Signature Package</th>
                </tr>
              </thead>
              <tbody>
                {matrixData.map((row, idx) => (
                  <tr key={row.id || idx}>
                    <td><strong>{row.feature}</strong></td>
                    <td>{row.basic}</td>
                    <td><strong className="text-orange">{row.premium}</strong></td>
                    <td>{row.luxury}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-banner-section">
        <div className="container">
          <div className="cta-box">
            <h2>Need a Customized Quotation Based on Your Plot Size?</h2>
            <p>Contact our estimation team for a detailed line-item quote based on your exact land dimensions in Hyderabad.</p>
            <div className="cta-buttons mt-6">
              <button onClick={onOpenEstimate} className="btn btn-primary btn-lg">
                Calculate Custom Estimate
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Packages;
