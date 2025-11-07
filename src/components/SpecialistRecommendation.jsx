import React from 'react';
import { MessageCircle, Star, UserCheck, Construction } from 'lucide-react';

const SpecialistRecommendation = ({ specialists, isOpen, onClose, onChatWithSpecialist }) => {
  if (!isOpen) return null;

  const handleWhatsAppClick = (phone) => {
    window.open(`https://wa.me/${phone}`, '_blank');
  };

  // Show coming soon message if no specialists platform yet
  const showComingSoon = specialists.length === 0;

  return (
    <div className={`specialist-panel ${isOpen ? 'open' : ''}`}>
        {/* Header */}
        <div className="panel-header">
          <div className="panel-header-content">
            <h2>Healthcare Specialists</h2>
            <button 
              onClick={onClose}
              className="close-button"
            >
              ✕
            </button>
          </div>
          <p className="panel-subtitle">
            {showComingSoon ? 'Partner Platform Coming Soon' : 'Based on your conversation'}
          </p>
        </div>

        {/* Specialists List */}
        <div className="panel-content">
          {showComingSoon ? (
            <div className="coming-soon-state">
              <Construction size={64} className="coming-soon-icon" />
              <h3>🩺 Specialist Partnership Platform</h3>
              <p className="coming-soon-message">
                We're building a dedicated platform for healthcare specialists to join our network and provide you with the best medical care.
              </p>
              
              <div className="feature-list">
                <h4>Coming Features:</h4>
                <ul>
                  <li>✅ Verified specialist profiles</li>
                  <li>✅ Real-time availability scheduling</li>
                  <li>✅ Secure video consultations</li>
                  <li>✅ Direct messaging with doctors</li>
                  <li>✅ Patient reviews and ratings</li>
                </ul>
              </div>

              <div className="cta-section">
                <p className="cta-text">
                  <strong>For now, MediBot will recommend when to consult specialists and provide general guidance.</strong>
                </p>
                <p className="update-notice">
                  The specialist platform will be launched soon! 🚀
                </p>
              </div>
            </div>
          ) : (
            <div className="specialists-list">
              {specialists.map((specialist, index) => (
                <div key={index} className="specialist-card">
                  <div className="specialist-content">
                    <div className="specialist-info">
                      <h3>{specialist.name}</h3>
                      <p className="specialist-specialty">{specialist.specialty}</p>
                      <p className="specialist-bio">{specialist.bio}</p>
                      
                      <div className="specialist-meta">
                        <div className="rating">
                          <Star size={14} className="star-icon" />
                          <span>{specialist.rating}</span>
                        </div>
                        {specialist.experience && (
                          <span className="experience">{specialist.experience} years exp</span>
                        )}
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handleWhatsAppClick(specialist.phone)}
                      className="whatsapp-button"
                      title="Chat on WhatsApp"
                    >
                      <MessageCircle size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    
  );
};

export default SpecialistRecommendation;