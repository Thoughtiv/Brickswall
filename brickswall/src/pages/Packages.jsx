import React, { useState, useEffect } from 'react';
import { Check, X, ShieldCheck, Calculator, ArrowRight, HelpCircle } from 'lucide-react';
import { getPricing } from '../utils/api';

const Packages = ({ onOpenEstimate }) => {
  const [plotSize, setPlotSize] = useState(1500);
  const [pricingData, setPricingData] = useState(null);

  useEffect(() => {
    let active = true;
    getPricing().then(data => {
      if (active) setPricingData(data);
    });
    return () => { active = false; };
  }, []);

  const basePackages = [
    {
      id: 'basic',
      name: 'Basic Package',
      pricePerSqFt: '₹1,750 / sq.ft',
      priceNum: 1750,
      badge: 'Economical Solution',
      isPopular: false,
      desc: 'An affordable solution designed for quality residential construction with dependable materials and essential finishes.',
      materials: [
        'Cement: Ultratech / ACC 53 Grade',
        'Steel: Simhadri / Vizag TMT Fe500',
        'Bricks: High quality red bricks',
        'Flooring: Vitrified tiles (up to ₹60/sq.ft)',
        'Doors: Flush doors with wood frame',
        'Paint: Asian Paints Tractor Emulsion'
      ],
      warranty: '5 Years Structural Warranty',
      services: [
        'Structural & Architectural Layout',
        'Standard Electrical & Plumbing',
        'Site Supervision',
        'Basic Sanitary Ware (Cera / Parryware)'
      ]
    },
    {
      id: 'premium',
      name: 'Premium Package',
      pricePerSqFt: '₹2,150 / sq.ft',
      priceNum: 2150,
      badge: 'Most Popular',
      isPopular: true,
      desc: 'Ideal for homeowners seeking enhanced finishes, premium materials, custom elevation designs, and additional customization.',
      materials: [
        'Cement: Ultratech Super / Coromandel',
        'Steel: Tata Tiscon / JSW Neosteel Fe550',
        'Bricks: First class kiln red clay bricks',
        'Flooring: Premium Vitrified (up to ₹100/sq.ft)',
        'Doors: Teak wood main door & frames',
        'Paint: Asian Paints Royal Shine Emulsion'
      ],
      warranty: '10 Years Structural Warranty',
      services: [
        '3D Elevation & Floor Plan Design',
        'Concealed Modular Electricals (Havells)',
        'Dedicated Project Manager',
        'Premium Sanitary Ware (Kohler / Jaquar)',
        'Underground Sump & Overhead Tank'
      ]
    },
    {
      id: 'luxury',
      name: 'Luxury Package',
      pricePerSqFt: '₹2,750 / sq.ft',
      priceNum: 2750,
      badge: 'Ultra High-End',
      isPopular: false,
      desc: 'Designed for premium residences featuring superior materials, elegant interiors, modern architecture, and luxury finishes.',
      materials: [
        'Cement: Ultratech Premium / High-grade',
        'Steel: Tata Tiscon Super Ductile Fe550D',
        'Bricks: AAC blocks or high-density wire-cut bricks',
        'Flooring: Italian Marble or Granites (up to ₹250/sq.ft)',
        'Doors: Teak wood main door with digital smart lock',
        'Paint: Royal Aspira Anti-bacterial Finish'
      ],
      warranty: '15 Years Structural Warranty',
      services: [
        'Full 3D Architectural VR Walkthroughs',
        'Automation Ready Smart Wiring',
        'Dedicated Senior Civil Engineer',
        'Luxury Sanitary Ware (Grohe / Hansgrohe)',
        'Landscaping & Rooftop Solar Prep'
      ]
    }
  ];

  const packages = basePackages.map(pkg => {
    if (pricingData && pricingData[pkg.id]) {
      return {
        ...pkg,
        pricePerSqFt: pricingData[pkg.id].pricePerSqFt,
        priceNum: pricingData[pkg.id].priceNum,
        badge: pricingData[pkg.id].badge || pkg.badge,
        desc: pricingData[pkg.id].desc || pkg.desc
      };
    }
    return pkg;
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

                  <div className="pkg-spec-group">
                    <h4>Material Specs:</h4>
                    <ul>
                      {pkg.materials.map((m, i) => (
                        <li key={i}><Check size={14} className="text-orange" /> {m}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="pkg-spec-group spec-separator">
                    <h4>Included Services &amp; Warranty:</h4>
                    <ul>
                      <li><ShieldCheck size={14} className="text-orange" /> <strong>{pkg.warranty}</strong></li>
                      {pkg.services.map((s, i) => (
                        <li key={i}><Check size={14} className="text-orange" /> {s}</li>
                      ))}
                    </ul>
                  </div>
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
                  <th>Basic Package</th>
                  <th>Premium Package</th>
                  <th>Luxury Package</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Price per Built-up Sq.Ft</strong></td>
                  <td>{packages.find(p => p.id === 'basic')?.pricePerSqFt}</td>
                  <td><strong className="text-orange">{packages.find(p => p.id === 'premium')?.pricePerSqFt}</strong></td>
                  <td>{packages.find(p => p.id === 'luxury')?.pricePerSqFt}</td>
                </tr>
                <tr>
                  <td><strong>Structural Warranty</strong></td>
                  <td>5 Years</td>
                  <td><strong className="text-orange">10 Years</strong></td>
                  <td>15 Years</td>
                </tr>
                <tr>
                  <td><strong>Cement Grade</strong></td>
                  <td>53 Grade ACC / Ultratech</td>
                  <td>Ultratech Super / Coromandel</td>
                  <td>Ultratech Premium High-Grade</td>
                </tr>
                <tr>
                  <td><strong>Steel Quality</strong></td>
                  <td>Simhadri / Vizag TMT Fe500</td>
                  <td>Tata Tiscon / JSW Fe550</td>
                  <td>Tata Tiscon Super Ductile Fe550D</td>
                </tr>
                <tr>
                  <td><strong>Flooring Tiles Rate</strong></td>
                  <td>Up to ₹60 / sq.ft</td>
                  <td>Up to ₹100 / sq.ft</td>
                  <td>Italian Marble / Granite (₹250+)</td>
                </tr>
                <tr>
                  <td><strong>Main Door</strong></td>
                  <td>Flush Door with Wood Frame</td>
                  <td>Teak Wood Door &amp; Frame</td>
                  <td>Teak Wood with Smart Digital Lock</td>
                </tr>
                <tr>
                  <td><strong>3D Architectural Elevation</strong></td>
                  <td>Basic 2D Floor Plan</td>
                  <td><Check className="text-orange mx-auto" /> 3D Elevation</td>
                  <td><Check className="text-orange mx-auto" /> Full VR 3D Walkthrough</td>
                </tr>
                <tr>
                  <td><strong>Site Supervision</strong></td>
                  <td>Periodic Engineer Visits</td>
                  <td>Dedicated Site Manager</td>
                  <td>Senior Resident Civil Engineer</td>
                </tr>
                <tr>
                  <td><strong>Sanitary Fittings</strong></td>
                  <td>Cera / Parryware</td>
                  <td>Kohler / Jaquar</td>
                  <td>Grohe / Hansgrohe Premium</td>
                </tr>
                <tr>
                  <td><strong>Customization Level</strong></td>
                  <td>Standard Options</td>
                  <td>High Customization</td>
                  <td>Complete Bespoke Architecture</td>
                </tr>
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
