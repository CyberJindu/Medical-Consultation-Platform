import React, { useState, useEffect } from 'react';
import { MessageCircle, Star, UserCheck, Shield, Clock, Languages, Video } from 'lucide-react';
import { specialistAPI } from '../services/api.js';

const SpecialistRecommendation = ({ conversationContext, isOpen, onClose, onConsultSpecialist }) => {
  const [specialists, setSpecialists] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && conversationContext) {
      fetchSpecialists();
    }
  }, [isOpen, conversationContext]);

  const fetchSpecialists = async () => {
    if (!conversationContext?.trim()) {
      setError('No conversation context available');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const response = await specialistAPI.getRecommendations({ 
        conversationContext: conversationContext 
      });
      
      const data = response.data.data;
      setSpecialists(data.specialists || []);
      setAnalysis({
        verificationImpact: data.verificationImpact,
        topSpecialistVerified: data.topSpecialistVerified,
        verifiedCount: data.verifiedCount
      });
      
    } catch (error) {
      console.error('Failed to fetch specialists:', error);
      setError('Unable to load specialist recommendations');
      // Fallback mock data
      setSpecialists([{
        _id: 'demo1',
        name: 'Dr. Jane Smith',
        specialty: 'General Physician',
        bio: 'Board certified physician with 10+ years experience',
        rating: 4.8,
        experience: 10,
        verificationStatus: 'verified',
        verificationLevel: 'expert',
        matchScore: 92,
        verificationBoost: 50,
        totalScore: 142,
        languages: ['English', 'Spanish'],
        responseTime: '< 30 mins',
        consultationTypes: ['video', 'chat']
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const getVerificationBadge = (specialist) => {
    if (specialist.verificationStatus === 'verified') {
      const level = specialist.verificationLevel || 'basic';
      const colors = {
        expert: '#10B981',
        advanced: '#3B82F6',
        basic: '#6366F1'
      };
      return {
        text: `${level.charAt(0).toUpperCase() + level.slice(1)} Verified`,
        color: colors[level] || '#6366F1',
        icon: <Shield size={12} />
      };
    }
    return null;
  };

  const handleConsult = (specialist) => {
    if (onConsultSpecialist) {
      onConsultSpecialist(specialist);
    } else {
      // Default behavior
      alert(`Would consult with ${specialist.name}`);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={`specialist-panel ${isOpen ? 'open' : ''}`}>
      {/* Header */}
      <div className="panel-header">
        <div className="panel-header-content">
          <h2>Recommended Specialists</h2>
          <button onClick={onClose} className="close-button">✕</button>
        </div>
        
        {analysis && (
          <div className="panel-subtitle">
            <p>
              {analysis.verifiedCount > 0 && (
                <span className="verification-highlight">
                  {analysis.verifiedCount} verified • {analysis.topSpecialistVerified ? 'Top specialist verified ✓' : ''}
                </span>
              )}
              Ranked by relevance and verification status
            </p>
          </div>
        )}
      </div>

      {/* Specialists List */}
      <div className="panel-content">
        {isLoading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Finding the best specialists for your needs...</p>
          </div>
        ) : error ? (
          <div className="error-state">
            <p className="error-message">{error}</p>
            <button onClick={fetchSpecialists} className="retry-button">
              Try Again
            </button>
          </div>
        ) : specialists.length === 0 ? (
          <div className="empty-state">
            <UserCheck size={64} className="empty-icon" />
            <h3>Chat with MediBot First</h3>
            <p className="empty-subtext">
              Describe your symptoms or health concerns to get personalized specialist recommendations.
            </p>
          </div>
        ) : (
          <>
            {/* Verification Notice */}
            {analysis?.verificationImpact && (
              <div className="verification-notice">
                <Shield size={16} />
                <span>Verified specialists are prioritized for safety and quality assurance.</span>
              </div>
            )}

            {/* Specialists List */}
            <div className="specialists-list">
              {specialists.map((specialist, index) => {
                const verificationBadge = getVerificationBadge(specialist);
                
                return (
                  <div key={specialist._id || index} className="specialist-card">
                    {/* Rank Badge */}
                    <div className="specialist-rank">
                      <span className="rank-number">{index + 1}</span>
                    </div>
                    
                    <div className="specialist-content">
                      <div className="specialist-header">
                        <div className="specialist-info">
                          <div className="specialist-name-row">
                            <h3>{specialist.name}</h3>
                            {verificationBadge && (
                              <span 
                                className="verification-badge"
                                style={{ backgroundColor: verificationBadge.color }}
                              >
                                {verificationBadge.icon}
                                {verificationBadge.text}
                              </span>
                            )}
                          </div>
                          <p className="specialist-specialty">
                            {specialist.specialty}
                            {specialist.subSpecialty && ` • ${specialist.subSpecialty}`}
                          </p>
                        </div>
                        
                        {/* Match Score */}
                        {specialist.matchScore && (
                          <div className="match-score">
                            <div className="score-value">{specialist.matchScore}%</div>
                            <div className="score-label">Match</div>
                          </div>
                        )}
                      </div>
                      
                      <p className="specialist-bio">{specialist.bio}</p>
                      
                      {/* Specialist Details */}
                      <div className="specialist-details">
                        <div className="specialist-meta">
                          <div className="rating">
                            <Star size={14} className="star-icon" />
                            <span>{specialist.rating || '4.5'}</span>
                          </div>
                          {specialist.experience && (
                            <span className="experience">{specialist.experience} years experience</span>
                          )}
                        </div>
                        
                        {/* Additional Info */}
                        <div className="specialist-extra-info">
                          {specialist.languages && specialist.languages.length > 0 && (
                            <div className="info-item">
                              <Languages size={12} />
                              <span>{specialist.languages.slice(0, 2).join(', ')}</span>
                            </div>
                          )}
                          
                          {specialist.responseTime && (
                            <div className="info-item">
                              <Clock size={12} />
                              <span>Response: {specialist.responseTime}</span>
                            </div>
                          )}
                          
                          {specialist.consultationTypes && specialist.consultationTypes.includes('video') && (
                            <div className="info-item">
                              <Video size={12} />
                              <span>Video consult</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="specialist-actions">
                        <button
                          onClick={() => handleConsult(specialist)}
                          className="consult-button"
                        >
                          <MessageCircle size={18} />
                          <span>Consult Now</span>
                        </button>
                        
                        {specialist.phone && (
                          <button
                            onClick={() => window.open(`https://wa.me/${specialist.phone}`, '_blank')}
                            className="whatsapp-button"
                          >
                            WhatsApp
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Footer Note */}
            <div className="recommendation-footer">
              <p className="footer-note">
                <Shield size={14} />
                <span>All recommended specialists undergo verification for qualifications and experience.</span>
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SpecialistRecommendation;
