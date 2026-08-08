import React from 'react';
import { 
  ShieldCheck, 
  Award, 
  Users, 
  Building2, 
  Target, 
  Eye, 
  CheckCircle2, 
  Lightbulb, 
  HeartHandshake, 
  Sparkles,
  Phone
} from 'lucide-react';

const AboutUs = ({ onOpenEstimate }) => {
  const coreValues = [
    {
      title: 'Integrity',
      desc: 'We adhere to honest pricing, legal plot approvals, and transparent contracts with zero hidden clauses.',
      icon: <ShieldCheck className="w-6 h-6 text-orange" />
    },
    {
      title: 'Quality',
      desc: 'Certified 53 grade cement, TMT steel, and 30-point structural quality checks at every slab pouring.',
      icon: <Award className="w-6 h-6 text-orange" />
    },
    {
      title: 'Transparency',
      desc: 'Daily digital site updates, photo progress reports, and material verification for complete peace of mind.',
      icon: <Eye className="w-6 h-6 text-orange" />
    },
    {
      title: 'Innovation',
      desc: 'Modern architectural layouts, earthquake-resistant design, and energy-efficient building techniques.',
      icon: <Lightbulb className="w-6 h-6 text-orange" />
    },
    {
      title: 'Customer Commitment',
      desc: 'Your satisfaction drives us. We deliver on agreed timelines and back our work with 10-year warranties.',
      icon: <HeartHandshake className="w-6 h-6 text-orange" />
    },
    {
      title: 'Professional Excellence',
      desc: 'Qualified structural engineers, experienced project supervisors, and skilled craftsmen leading every site.',
      icon: <Sparkles className="w-6 h-6 text-orange" />
    }
  ];

  return (
    <div className="about-page">
      {/* Subpage Hero */}
      <section className="subpage-hero">
        <div className="container">
          <span className="section-subtitle badge-orange text-white">Our Journey</span>
          <h1 className="subpage-title">Building Hyderabad's Future with Quality Construction</h1>
          <p className="subpage-desc">
            For over 15 years, Bricks Wall has been transforming plots into landmark homes, commercial complexes, and educational institutions across Hyderabad.
          </p>
        </div>
      </section>

      {/* Main Story & Background */}
      <section className="section-padding">
        <div className="container">
          <div className="about-story-grid">
            <div className="story-content">
              <span className="section-subtitle">Company Introduction</span>
              <h2>Over 15 Years of Engineering &amp; Real Estate Development</h2>
              <p className="text-muted mb-4">
                Bricks Wall is a Hyderabad-based construction company with over 15 years of experience in real estate development and turn-key construction services.
              </p>
              <p className="text-muted mb-4">
                Throughout our journey, we have successfully completed more than 50 projects, including independent homes, luxury villas, commercial buildings, schools, and commercial complexes across key hubs like Jubilee Hills, Gachibowli, Madhapur, Kukatpally, Kondapur, and Tellapur.
              </p>
              <p className="text-muted mb-6">
                Our success is built on trust, quality workmanship, and long-term customer relationships. Every project receives the exact same level of technical commitment, whether it's a family home or a multi-story commercial development.
              </p>

              <div className="story-stats-grid">
                <div className="s-box">
                  <span className="num">15+</span>
                  <span className="lbl">Years Experience</span>
                </div>
                <div className="s-box">
                  <span className="num">50+</span>
                  <span className="lbl">Projects Handed Over</span>
                </div>
                <div className="s-box">
                  <span className="num">100%</span>
                  <span className="lbl">On-Time Completion</span>
                </div>
              </div>
            </div>

            <div className="story-img-box">
              <img 
                src="https://images.unsplash.com/photo-1541888946425-d0fbb186a5b7?auto=format&fit=crop&w=800&q=80" 
                alt="Bricks Wall Construction Engineers Hyderabad" 
                className="rounded-lg shadow-lg"
              />
              <div className="quote-card">
                <p>"Building a property is one of life's most meaningful investments. We make that process seamless, transparent, and joyful."</p>
                <span className="author">&mdash; Founder &amp; Chief Engineer, Bricks Wall</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="section-padding bg-subtle">
        <div className="container">
          <div className="grid grid-2 gap-8">
            <div className="vision-box">
              <div className="v-icon"><Eye size={32} className="text-orange" /></div>
              <h3>Our Vision</h3>
              <p>
                To become Hyderabad's most trusted construction company by consistently delivering structural quality, 100% pricing transparency, and complete customer satisfaction.
              </p>
            </div>

            <div className="vision-box">
              <div className="v-icon"><Target size={32} className="text-orange" /></div>
              <h3>Our Mission</h3>
              <p>
                To build safe, functional, and lasting spaces through professional civil engineering, premium certified materials, transparent contracts, and ethical business practices.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="section-padding">
        <div className="container">
          <div className="section-title-wrapper">
            <span className="section-subtitle">What Defines Us</span>
            <h2 className="section-heading">Our Core Values</h2>
            <p className="section-desc">
              Every foundation we pour and every brick we lay is guided by these principles.
            </p>
          </div>

          <div className="grid grid-3 gap-6">
            {coreValues.map((val, idx) => (
              <div key={idx} className="value-card">
                <div className="v-icon-circle">{val.icon}</div>
                <h3>{val.title}</h3>
                <p className="text-muted text-sm">{val.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Customers Trust Us */}
      <section className="section-padding bg-navy text-white">
        <div className="container">
          <div className="section-title-wrapper text-center max-w-2xl mx-auto">
            <span className="badge-orange text-orange mb-2 inline-block">The Bricks Wall Difference</span>
            <h2 className="text-white text-3xl font-bold">Why Customers Trust Us in Hyderabad</h2>
          </div>

          <div className="grid grid-2 gap-8 mt-8">
            <div className="trust-item">
              <CheckCircle2 size={24} className="text-orange flex-shrink-0" />
              <div>
                <h4>Zero Hidden Escalations</h4>
                <p className="text-slate-300 text-sm">Clear fixed-rate contract agreements with comprehensive material specifications before work begins.</p>
              </div>
            </div>

            <div className="trust-item">
              <CheckCircle2 size={24} className="text-orange flex-shrink-0" />
              <div>
                <h4>Dedicated Senior Site Engineer</h4>
                <p className="text-slate-300 text-sm">Every project gets an experienced civil engineer overseeing daily operations, quality tests, and safety protocols.</p>
              </div>
            </div>

            <div className="trust-item">
              <CheckCircle2 size={24} className="text-orange flex-shrink-0" />
              <div>
                <h4>Certified Brand Materials Only</h4>
                <p className="text-slate-300 text-sm">We only use top brands like Ultratech cement, Tata Tiscon steel, and Asian Paints with brand certificates provided to clients.</p>
              </div>
            </div>

            <div className="trust-item">
              <CheckCircle2 size={24} className="text-orange flex-shrink-0" />
              <div>
                <h4>10-Year Structural Guarantee</h4>
                <p className="text-slate-300 text-sm">Complete structural warranty backed by structural engineer sign-off and post-handover support.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-banner-section">
        <div className="container">
          <div className="cta-box">
            <h2>Ready to Work with Hyderabad's Premier Builders?</h2>
            <p>Connect with our team to start planning your home or commercial development today.</p>
            <div className="cta-buttons mt-6">
              <button onClick={onOpenEstimate} className="btn btn-primary btn-lg">
                Get Free Consultation
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutUs;
