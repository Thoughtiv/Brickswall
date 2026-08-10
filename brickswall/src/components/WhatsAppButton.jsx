import React, { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';

const WhatsAppButton = ({ settings }) => {
  const whatsappNumber = (settings?.whatsapp || '+91 9160202008').replace(/[^0-9]/g, '');
  const [showTooltip, setShowTooltip] = useState(true);
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=Hi%20Bricks%20Wall,%20I%20am%20interested%20in%20building%20a%20property%20in%20Hyderabad.%20Please%20share%20details.`;

  return (
    <div className="whatsapp-floating-container">
      {showTooltip && (
        <div className="whatsapp-tooltip">
          <button className="tooltip-close" onClick={() => setShowTooltip(false)}>
            <X size={12} />
          </button>
          <div className="tooltip-content">
            <p className="tooltip-title">Have questions?</p>
            <p className="tooltip-sub">Chat with our engineering team on WhatsApp!</p>
          </div>
        </div>
      )}

      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="whatsapp-btn"
        aria-label="Chat on WhatsApp"
      >
        <MessageCircle size={28} />
        <span className="online-badge"></span>
      </a>
    </div>
  );
};

export default WhatsAppButton;
