import React, { useState, useEffect } from 'react';
import {
  X,
  CheckCircle2,
  Calculator,
  ArrowRight,
  Home,
  Building2,
  Store,
  PaintRoller
} from 'lucide-react';
import { getPricing, submitInquiry } from '../utils/api';

const EstimateModal = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(1);
  const [projectType, setProjectType] = useState('renovation');
  const [plotArea, setPlotArea] = useState(2500);
  const [floors, setFloors] = useState(2);
  const [packageType, setPackageType] = useState('premium');

  // Lead info
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    location: 'Hyderabad',
    notes: ''
  });

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [pricingData, setPricingData] = useState(null);

  useEffect(() => {
    if (!isOpen) return;
    let active = true;
    getPricing().then(data => {
      if (active) setPricingData(data);
    });
    return () => { active = false; };
  }, [isOpen]);

  if (!isOpen) return null;

  // Rate estimation per sq ft
  const packageRates = {
    basic: pricingData?.basic?.priceNum || 1750,
    premium: pricingData?.premium?.priceNum || 2150,
    luxury: pricingData?.luxury?.priceNum || 2750
  };

  const totalBuiltUp = plotArea * floors;
  const estimatedCost = totalBuiltUp * packageRates[packageType];
  const minCost = (estimatedCost * 0.95).toLocaleString('en-IN');
  const maxCost = (estimatedCost * 1.05).toLocaleString('en-IN');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const inquiryData = {
      type: 'estimate',
      name: formData.name,
      phone: formData.phone,
      serviceType: projectType,
      plotSize: `${plotArea} sq.ft`,
      floors: floors,
      packageType: packageType,
      estimatedCost: `₹${minCost} - ₹${maxCost}`,
      location: formData.location,
      message: formData.notes
    };

    try {
      await submitInquiry(inquiryData);
      setIsSubmitted(true);
    } catch (err) {
      console.error('Failed to submit estimate lead:', err.message);
      setIsSubmitted(true);
    }
  };

  const resetAndClose = () => {
    setIsSubmitted(false);
    setStep(1);
    onClose();
  };

  const typesList = [
    {
      id: 'residential',
      title: 'Independent Home',
      desc: 'Duplex / Triplex House',
      icon: <Home size={20} className="text-orange" />
    },
    {
      id: 'villa',
      title: 'Luxury Villa',
      desc: 'Contemporary architecture',
      icon: <Building2 size={20} className="text-orange" />
    },
    {
      id: 'commercial',
      title: 'Commercial Space',
      desc: 'Offices & Stores',
      icon: <Store size={20} className="text-orange" />
    },
    {
      id: 'renovation',
      title: 'Renovation',
      desc: 'Remodeling existing space',
      icon: <PaintRoller size={20} className="text-orange" />
    },
  ];

  return (
    <div className="modal-overlay" onClick={resetAndClose}>
      <div className="modal-card animate-fade-in" onClick={(e) => e.stopPropagation()}>
        {/* Top Header Row with Pill Badge & Close Button */}
        <div className="modal-top-bar">
          <span className="instant-calc-pill">
            <Calculator size={14} /> INSTANT COST CALCULATOR
          </span>
          <button className="modal-close-round" onClick={resetAndClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        {!isSubmitted ? (
          <div>
            <div className="modal-header-text">
              <h2>Free Construction Estimate</h2>
              <p>Get an instant estimate tailored for your land plot in Hyderabad.</p>
            </div>

            {/* Stepper indicator matching reference layout */}
            <div className="stepper-container">
              <div className="stepper-line"></div>
              <div className="stepper-nodes">
                <div className={`step-node ${step >= 1 ? 'active' : ''}`}>
                  <div className="step-num">1</div>
                  <div className="step-name">Details</div>
                </div>
                <div className={`step-node ${step >= 2 ? 'active' : ''}`}>
                  <div className="step-num">2</div>
                  <div className="step-name">Package &amp; Estimate</div>
                </div>
                <div className={`step-node ${step >= 3 ? 'active' : ''}`}>
                  <div className="step-num">3</div>
                  <div className="step-name">Finalize</div>
                </div>
              </div>
            </div>

            <div className="modal-divider"></div>

            {step === 1 && (
              <div className="step-content">
                <label className="section-label-bold">Select Construction Type</label>
                <div className="type-grid">
                  {typesList.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => setProjectType(item.id)}
                      className={`type-card-item ${projectType === item.id ? 'selected' : ''}`}
                    >
                      <div className="type-icon-box">
                        {item.icon}
                      </div>
                      <div className="type-details">
                        <div className="type-title-row">
                          <input
                            type="radio"
                            name="projectType"
                            checked={projectType === item.id}
                            onChange={() => setProjectType(item.id)}
                            className="custom-radio"
                          />
                          <span className="type-title">{item.title}</span>
                        </div>
                        <p className="type-desc">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Plot Area Slider */}
                <div className="form-group mb-5">
                  <div className="flex-between-row mb-2">
                    <label className="section-label-bold">Plot / Built-up Area</label>
                    <span className="slider-val-text">{plotArea.toLocaleString()} sq.ft</span>
                  </div>

                  <div className="slider-box mb-2">
                    <input
                      type="range"
                      min="500"
                      max="50000"
                      step="100"
                      value={plotArea}
                      onChange={(e) => setPlotArea(Number(e.target.value))}
                      className="custom-range-slider"
                      style={{
                        background: `linear-gradient(to right, #d9531e 0%, #d9531e ${((plotArea - 500) / (50000 - 500)) * 100}%, #e2e8f0 ${((plotArea - 500) / (50000 - 500)) * 100}%, #e2e8f0 100%)`
                      }}
                    />
                  </div>

                  <div className="flex-between-row text-xs text-muted">
                    <span>500 sq.ft</span>
                    <span>5,000 sq.ft</span>
                    <span>10,000 sq.ft</span>
                    <span>50,000 sq.ft</span>
                  </div>
                </div>

                {/* Number of Floors Selection */}
                <div className="form-group mb-6">
                  <label className="section-label-bold block mb-2.5">Number of Floors (including Ground)</label>
                  <div className="floors-row">
                    {[1, 2, 3, 4, 5].map((num) => (
                      <button
                        type="button"
                        key={num}
                        onClick={() => setFloors(num)}
                        className={`floor-pill ${floors === num ? 'active' : ''}`}
                      >
                        G + {num - 1} ({num} Floor{num > 1 ? 's' : ''})
                      </button>
                    ))}
                  </div>
                </div>

                <button onClick={() => setStep(2)} className="btn-modal-submit">
                  Continue to Package Selection <ArrowRight size={18} />
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="step-content">
                <label className="section-label-bold block mb-3">Choose Construction Package</label>
                <div className="package-options flex flex-col gap-3 mb-6">
                  {[
                    { id: 'basic', title: 'Basic Package', rate: pricingData?.basic?.pricePerSqFt || '₹1,750 / sq.ft', tag: 'Economical & Reliable Structure' },
                    { id: 'premium', title: 'Premium Package', rate: pricingData?.premium?.pricePerSqFt || '₹2,150 / sq.ft', tag: 'Most Popular - Teak & Premium Finish' },
                    { id: 'luxury', title: 'Luxury Package', rate: pricingData?.luxury?.pricePerSqFt || '₹2,750 / sq.ft', tag: 'High-end Designer Fittings & Marble' },
                  ].map((pkg) => (
                    <div
                      key={pkg.id}
                      onClick={() => setPackageType(pkg.id)}
                      className={`package-option-card ${packageType === pkg.id ? 'selected' : ''}`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-navy text-sm">{pkg.title}</span>
                        <span className="badge badge-orange font-bold">{pkg.rate}</span>
                      </div>
                      <p className="text-xs text-slate-500">{pkg.tag}</p>
                    </div>
                  ))}
                </div>

                {/* Estimate Result Box */}
                <div className="estimate-result-box mb-6">
                  <span className="result-label">Estimated Construction Cost</span>
                  <div className="result-price">₹{minCost} - ₹{maxCost}*</div>
                  <p className="result-sub text-xs text-slate-300">
                    Built-up Area: ~{totalBuiltUp.toLocaleString()} sq.ft ({floors} Floors)
                  </p>
                </div>

                <div className="modal-actions-row">
                  <button type="button" onClick={() => setStep(1)} className="btn-modal-back">
                    Back
                  </button>
                  <button type="button" onClick={() => setStep(3)} className="btn-modal-submit">
                    Book Free Consultation <ArrowRight size={18} />
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <form onSubmit={handleSubmit} className="step-content">
                <div className="form-group mb-3">
                  <label className="form-label">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div className="form-group mb-3">
                  <label className="form-label">Mobile Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 9949249091"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div className="form-group mb-3">
                  <label className="form-label">Plot Location in Hyderabad</label>
                  <input
                    type="text"
                    placeholder="e.g. Jubilee Hills, Gachibowli, Tellapur"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div className="form-group mb-4">
                  <label className="form-label">Additional Notes (Optional)</label>
                  <textarea
                    placeholder="Tell us about plot dimensions or timeline requirements..."
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="form-textarea"
                    rows="3"
                  ></textarea>
                </div>

                <div className="modal-actions-row">
                  <button type="button" onClick={() => setStep(2)} className="btn-modal-back">
                    Back
                  </button>
                  <button type="submit" className="btn-modal-submit">
                    Submit Request
                  </button>
                </div>
              </form>
            )}
          </div>
        ) : (
          <div className="success-state text-center py-6">
            <div className="success-icon mb-4">
              <CheckCircle2 size={64} className="text-orange mx-auto" />
            </div>
            <h3 className="text-xl font-bold text-navy">Thank You, {formData.name || 'Valued Customer'}!</h3>
            <p className="text-muted text-sm my-3">
              Your estimate request has been submitted. Our senior civil engineer will call you on <strong>{formData.phone || '+91 9949249091'}</strong> with detailed architectural guidance.
            </p>
            <div className="bg-subtle p-4 rounded-lg my-4 text-left text-sm space-y-1">
              <p><strong>Project Type:</strong> {projectType.toUpperCase()}</p>
              <p><strong>Plot / Built-up Area:</strong> {plotArea} sq.ft</p>
              <p><strong>Total Built-up:</strong> {totalBuiltUp} sq.ft ({floors} Floors)</p>
              <p><strong>Selected Package:</strong> {packageType.toUpperCase()}</p>
              <p><strong>Estimated Cost Range:</strong> ₹{minCost} - ₹{maxCost}</p>
            </div>
            <button onClick={resetAndClose} className="btn-modal-submit w-full">
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EstimateModal;
