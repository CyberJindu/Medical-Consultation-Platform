import React, { useState, useEffect } from 'react';
import { MessageCircle, Star, UserCheck, Shield, Clock, Languages, Video, AlertTriangle, Activity } from 'lucide-react';
import { specialistAPI } from '../services/api.js';

const SpecialistRecommendation = ({ 
  conversationContext, 
  healthAnalysis, // ⚡ NEW: Receive health analysis data
  isOpen, 
  onClose, 
  onConsultSpecialist,
  isProactive = false // ⚡ NEW: Flag for auto-opened recommendations
}) => {
  const [specialists, setSpecialists] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState(null);
  const [autoFetching, setAutoFetching] = useState(false);

  useEffect(() => {
    // ⚡ NEW: Auto-fetch if health analysis suggests specialist needed
    if (healthAnalysis?.specialistAdvised && !isOpen && !autoFetching) {
      console.log('⚡ Proactive specialist recommendation triggered');
      setAutoFetching(true);
      fetchSpecialistsProactively();
    }
    
    // Manual fetch when panel opens
    if (isOpen && conversationContext && !isProactive) {
      fetchSpecialists();
    }
  }, [isOpen, conversationContext, healthAnalysis]);

  const fetchSpecialistsProactively = async () => {
    if (!conversationContext?.trim()) {
      console.log('No conversation context for proactive fetch');
      return;
    }

    setIsLoading(true);
    
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
      
      // Auto-open panel if we got specialists
      if (data.specialists?.length > 0) {
        // Trigger parent to open panel
        if (onConsultSpecialist) {
          onConsultSpecialist(data.specialists[0], true); // true = proactive
        }
      }
    } catch (error) {
      console.error('Proactive fetch failed:', error);
    } finally {
      setIsLoading(false);
      setAutoFetching(false);
    }
  };

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
    }
  };

  if (!isOpen && !isProactive) return null;

  return (
    <div className={`specialist-panel ${isOpen ? 'open' : ''} ${isProactive ? 'proactive' : ''}`}>
      {/* Header */}
      <div className="panel-header">
        <div className="panel-header-content">
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)' }}>
            <h2>Recommended Specialists</h2>
            {isProactive && (
              <div className="proactive-badge">
                <Activity size={16} />
                <span>Proactive Recommendation</span>
              </div>
            )}
          </div>
          <button onClick={onClose} className="close-button">✕</button>
        </div>
        
        {/* ⚡ NEW: Health state indicator */}
        {healthAnalysis && (
          <div className="panel-subtitle">
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)' }}>
              <div className={`health-state-indicator ${healthAnalysis.healthState}`}>
                <AlertTriangle size={14} />
                <span>Health State: {healthAnalysis.healthState.toUpperCase()}</span>
                <span className="severity-score">({healthAnalysis.severityScore}/100)</span>
              </div>
              
              {analysis && (
                <span className="verification-highlight">
                  {analysis.verifiedCount} verified • {analysis.topSpecialistVerified ? 'Top specialist verified ✓' : ''}
                </span>
              )}
            </div>
            <p style={{ marginTop: 'var(--spacing-2)' }}>
              {healthAnalysis.specialistAdvised 
                ? `Based on your symptoms, we recommend consulting a ${healthAnalysis.recommendedSpecialty}`
                : 'Ranked by relevance and verification status'}
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
            {/* ⚡ NEW: Proactive recommendation notice */}
            {isProactive && (
              <div className="proactive-notice">
                <AlertTriangle size={16} />
                <div>
                  <strong>Based on your symptoms:</strong> We proactively recommend consulting with these specialists. 
                  {healthAnalysis?.keySymptoms?.length > 0 && (
                    <div style={{ marginTop: '4px', fontSize: '0.875rem' }}>
                      Detected symptoms: {healthAnalysis.keySymptoms.join(', ')}
                    </div>
                  )}
                </div>
              </div>
            )}

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

      {/* Add CSS for new styles */}
      <style jsx>{`
        .proactive-badge {
          background: linear-gradient(135deg, #f59e0b, #d97706);
          color: white;
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        
        .health-state-indicator {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 0.875rem;
          font-weight: 600;
        }
        
        .health-state-indicator.critical {
          background: #fee2e2;
          color: #dc2626;
          border: 1px solid #fca5a5;
        }
        
        .health-state-indicator.urgent {
          background: #fef3c7;
          color: #d97706;
          border: 1px solid #fbbf24;
        }
        
        .health-state-indicator.routine {
          background: #dbeafe;
          color: #2563eb;
          border: 1px solid #93c5fd;
        }
        
        .severity-score {
          font-size: 0.75rem;
          opacity: 0.8;
        }
        
        .proactive-notice {
          background: linear-gradient(135deg, #fef3c7, #fef9c3);
          border: 1px solid #fbbf24;
          border-radius: 12px;
          padding: 16px;
          margin-bottom: 20px;
          display: flex;
          align-items: flex-start;
          gap: 12px;
        }
        
        .proactive-notice strong {
          color: #92400e;
        }
      `}</style>
    </div>
  );
};

export default SpecialistRecommendation;
