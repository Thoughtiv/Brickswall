import React, { useState } from 'react';
import { Phone, Mail, MapPin, MessageSquare, CheckCircle2, Send, Clock, ShieldCheck } from 'lucide-react';
import { submitInquiry } from '../utils/api';

const Contact = ({ onOpenEstimate, settings }) => {
  const phonePrimary = settings?.phone_primary || '+91 9949249091';
  const phoneSecondary = settings?.phone_secondary || '+91 9160202008';
  const whatsapp = settings?.whatsapp || '+91 9160202008';
  const email = settings?.email || 'Hello@brickswall.in';
  const address = settings?.address || 'Hyderabad & Surrounding Areas, Telangana';
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    serviceType: 'Residential Construction',
    plotSize: '',
    location: '',
    message: ''
  });

  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const inquiryData = {
      type: 'contact',
      name: formData.name,
      phone: formData.phone,
      serviceType: formData.serviceType,
      plotSize: formData.plotSize,
      location: formData.location,
      message: formData.message
    };

    try {
      await submitInquiry(inquiryData);
      setSubmitted(true);
    } catch (err) {
      console.error('Failed to submit inquiry:', err.message);
      setSubmitted(true);
    }
  };

  return (
    <div className="contact-page">
      {/* Subpage Hero */}
      <section className="subpage-hero">
        <div className="container">
          <span className="section-subtitle badge-orange text-white">Get In Touch</span>
          <h1 className="subpage-title">Let's Build Something Great Together</h1>
          <p className="subpage-desc">
            Whether you're planning a new home, commercial building, school, or renovation project in Hyderabad, Bricks Wall is here to help.
          </p>
        </div>
      </section>

      {/* Main Contact Section */}
      <section className="section-padding">
        <div className="container">
          <div className="grid grid-2 gap-8">
            {/* Left Info Column */}
            <div className="contact-info-card">
              <div>
                <span className="badge badge-orange text-white mb-4 inline-block">Reach Out Directly</span>
                <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-3 leading-tight">
                  Speak with Our Construction Experts Today
                </h2>
                <p className="text-slate-600 mb-6 text-sm leading-relaxed">
                  Have questions about cost, timelines, material grades, or GHMC plan approvals? We are ready to assist you.
                </p>

                <div className="why-contact-box mb-6 p-5 bg-slate-50 rounded-2xl border border-slate-100">
                  <h4 className="font-bold text-slate-900 mb-3 text-sm flex items-center gap-2">
                    <ShieldCheck size={18} className="text-orange" /> Why Choose Bricks Wall?
                  </h4>
                  <ul className="space-y-2.5">
                    <li className="flex items-center gap-3 text-xs font-semibold text-slate-700">
                      <CheckCircle2 size={16} className="text-orange flex-shrink-0" /> Free Project &amp; GHMC Approval Consultation
                    </li>
                    <li className="flex items-center gap-3 text-xs font-semibold text-slate-700">
                      <CheckCircle2 size={16} className="text-orange flex-shrink-0" /> Detailed Site Visit &amp; Soil Inspection
                    </li>
                    <li className="flex items-center gap-3 text-xs font-semibold text-slate-700">
                      <CheckCircle2 size={16} className="text-orange flex-shrink-0" /> Transparent Line-Item Construction Estimate
                    </li>
                    <li className="flex items-center gap-3 text-xs font-semibold text-slate-700">
                      <CheckCircle2 size={16} className="text-orange flex-shrink-0" /> Expert Engineering Guidance &amp; Vastu Layouts
                    </li>
                    <li className="flex items-center gap-3 text-xs font-semibold text-slate-700">
                      <CheckCircle2 size={16} className="text-orange flex-shrink-0" /> We Provide Warranty &amp; Professional Support
                    </li>
                  </ul>
                </div>
              </div>

              <div className="contact-details-box pt-5 border-t border-slate-100 space-y-3.5">
                <div className="c-item flex items-center gap-4">
                  <div className="c-icon"><MapPin size={20} /></div>
                  <div>
                    <strong className="block text-xs font-bold text-slate-900 mb-0.5">Service Area &amp; Office:</strong>
                    <p className="text-xs text-slate-600">{address}</p>
                  </div>
                </div>

                <div className="c-item flex items-center gap-4">
                  <div className="c-icon"><Phone size={20} /></div>
                  <div>
                    <strong className="block text-xs font-bold text-slate-900 mb-0.5">Phone Numbers:</strong>
                    <p className="text-xs text-slate-600">
                      <a href={`tel:${phonePrimary.replace(/\s+/g, '')}`} className="hover:text-orange font-semibold transition-colors">{phonePrimary}</a>
                    </p>
                    {phoneSecondary && (
                      <p className="text-xs text-slate-600 mt-1">
                        <a href={`tel:${phoneSecondary.replace(/\s+/g, '')}`} className="hover:text-orange font-semibold transition-colors">{phoneSecondary}</a>
                      </p>
                    )}
                  </div>
                </div>

                <div className="c-item flex items-center gap-4">
                  <div className="c-icon"><MessageSquare size={20} /></div>
                  <div>
                    <strong className="block text-xs font-bold text-slate-900 mb-0.5">WhatsApp Direct:</strong>
                    <p className="text-xs text-slate-600">
                      <a href={`https://wa.me/${whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer" className="hover:text-orange font-semibold transition-colors">{whatsapp}</a>
                    </p>
                  </div>
                </div>

                <div className="c-item flex items-center gap-4">
                  <div className="c-icon"><Mail size={20} /></div>
                  <div>
                    <strong className="block text-xs font-bold text-slate-900 mb-0.5">Email Address:</strong>
                    <p className="text-xs text-slate-600">
                      <a href={`mailto:${email}`} className="hover:text-orange font-semibold transition-colors">{email}</a>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Contact Form Column */}
            <div className="contact-form-card">
              {!submitted ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <h3 className="text-xl font-extrabold text-slate-900 mb-1">Send Us a Direct Message</h3>
                    <p className="text-xs text-slate-500">Fill out your plot details below for a prompt engineer call within 2 hours.</p>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rajesh Kumar"
                      className="form-input"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Mobile Number *</label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 9876543210"
                      className="form-input"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-2 gap-3">
                    <div className="form-group">
                      <label className="form-label">Service Required</label>
                      <select
                        className="form-input"
                        value={formData.serviceType}
                        onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
                      >
                        <option>Residential Construction</option>
                        <option>Villa Construction</option>
                        <option>Commercial Building</option>
                        <option>School Infrastructure</option>
                        <option>Renovation &amp; Remodeling</option>
                        <option>Interior Design</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Plot Size (sq.ft)</label>
                      <input
                        type="text"
                        placeholder="e.g. 1,500 sq.ft"
                        className="form-input"
                        value={formData.plotSize}
                        onChange={(e) => setFormData({ ...formData, plotSize: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Plot Location in Hyderabad</label>
                    <input
                      type="text"
                      placeholder="e.g. Jubilee Hills, Gachibowli, Tellapur"
                      className="form-input"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Message / Specific Requirements</label>
                    <textarea
                      rows="3"
                      placeholder="Tell us about your project requirements, budget, or timeline..."
                      className="form-textarea"
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    ></textarea>
                  </div>

                  <button type="submit" className="btn btn-primary btn-lg w-full submit-contact-btn">
                    Submit Inquiry <Send size={18} />
                  </button>
                </form>
              ) : (
                <div className="text-center py-8">
                  <CheckCircle2 size={56} className="text-orange mx-auto mb-3" />
                  <h3>Message Sent Successfully!</h3>
                  <p className="text-muted my-3">
                    Thank you {formData.name}. Our senior site engineer will call you shortly on <strong>{formData.phone}</strong> to discuss your construction project.
                  </p>
                  <button onClick={() => setSubmitted(false)} className="btn btn-outline mt-4">
                    Send Another Message
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="section-padding bg-subtle">
        <div className="container">
          <div className="section-title-wrapper">
            <span className="section-subtitle">Our Location</span>
            <h2 className="section-heading">Serving Hyderabad &amp; Surrounding Areas</h2>
            <p className="section-desc">
              Exclusively focused on projects in Jubilee Hills, Gachibowli, Madhapur, Kondapur, Tellapur, Kukatpally, Banjara Hills, Manikonda, and nearby regions.
            </p>
          </div>

          <div className="map-frame-box">
            <iframe
              title="Bricks Wall Hyderabad Service Map"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d243647.3160417937!2d78.24323136287955!3d17.412299801128383!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bcb99daeaebd2c7%3A0xae93b783997c0f27!2sHyderabad%2C%20Telangana!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
              width="100%"
              height="380"
              style={{ border: 0, borderRadius: 'var(--radius-lg)' }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
