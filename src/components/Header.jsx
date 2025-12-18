import React, { useState, useEffect } from 'react';
import { MessageSquarePlus, History, BookOpen, UserCheck, Menu, X, AlertTriangle, Activity } from 'lucide-react';

const Header = ({ 
  onNewChat, 
  onShowHistory, 
  onShowHealthFeed, 
  onShowSpecialists,  
  hasNewRecommendations,
  healthAnalysis, // ⚡ NEW: Receive health analysis
  unreadEmergencyCount = 0 // ⚡ NEW: Emergency notifications
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showHealthAlert, setShowHealthAlert] = useState(false);

  useEffect(() => {
    // ⚡ NEW: Show health alert if critical/urgent state detected
    if (healthAnalysis?.healthState === 'critical') {
      setShowHealthAlert(true);
      // Auto-show specialists panel after 3 seconds
      setTimeout(() => {
        if (onShowSpecialists) {
          onShowSpecialists();
        }
      }, 3000);
    } else if (healthAnalysis?.healthState === 'urgent') {
      setShowHealthAlert(true);
    }
  }, [healthAnalysis]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleMenuAction = (action) => {
    action();
    setIsMenuOpen(false);
  };

  const handleSpecialistClick = () => {
    handleMenuAction(onShowSpecialists);
    setShowHealthAlert(false); // Dismiss alert when user clicks
  };

  return (
    <header className="header-container">
      {/* ⚡ NEW: Health Alert Banner */}
      {showHealthAlert && healthAnalysis && (
        <div className={`health-alert-banner ${healthAnalysis.healthState}`}>
          <div className="alert-content">
            <AlertTriangle size={20} />
            <div>
              <strong>
                {healthAnalysis.healthState === 'critical' 
                  ? '🚨 CRITICAL HEALTH STATE DETECTED' 
                  : '⚠️ URGENT ATTENTION NEEDED'}
              </strong>
              <p>
                {healthAnalysis.healthState === 'critical'
                  ? 'Please consult a specialist immediately'
                  : 'Consider consulting a healthcare professional'}
              </p>
            </div>
          </div>
          <button 
            onClick={() => setShowHealthAlert(false)}
            className="alert-dismiss"
          >
            ✕
          </button>
        </div>
      )}

      {/* Left Side - Hamburger + Icons */}
      <div className="header-left-section">
        {/* Hamburger Menu Button */}
        <button 
          onClick={toggleMenu}
          className="hamburger-button"
          title="Menu"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Icons that slide out */}
        <div className={`header-icons ${isMenuOpen ? 'menu-open' : ''}`}>
          <button 
            onClick={() => handleMenuAction(onNewChat)}
            className="icon-button"
            title="New Chat"
          >
            <MessageSquarePlus size={24} />
          </button>
          
          <button 
            onClick={() => handleMenuAction(onShowHistory)}
            className="icon-button"
            title="Chat History"
          >
            <History size={24} />
          </button>
          
          <button 
            onClick={() => handleMenuAction(onShowHealthFeed)}
            className="icon-button"
            title="Health Feed"
          >
            <BookOpen size={24} />
          </button>
          
          <button 
            onClick={handleSpecialistClick}
            className="icon-button relative"
            title="Consult Health Specialist"
          >
            <UserCheck size={24} />
            {/* ⚡ ENHANCED: Multiple notification types */}
            {(hasNewRecommendations || healthAnalysis?.specialistAdvised) && (
              <span className="notification-dot urgent"></span>
            )}
            {unreadEmergencyCount > 0 && (
              <span className="notification-count emergency">{unreadEmergencyCount}</span>
            )}
          </button>
        </div>
      </div>

      {/* Right Side - Brand Name with Health Indicator */}
      <div className="flex items-center gap-3">
        {healthAnalysis && (
          <div className={`health-indicator ${healthAnalysis.healthState}`} title={`Health State: ${healthAnalysis.healthState}`}>
            <Activity size={16} />
          </div>
        )}
        <h1 className="brand-name">MediGuide</h1>
      </div>

      {/* Add CSS for new styles */}
      <style jsx>{`
        .health-alert-banner {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          padding: 12px 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          z-index: 1000;
          animation: slideDown 0.3s ease;
        }
        
        .health-alert-banner.critical {
          background: linear-gradient(135deg, #dc2626, #ef4444);
          color: white;
        }
        
        .health-alert-banner.urgent {
          background: linear-gradient(135deg, #d97706, #f59e0b);
          color: white;
        }
        
        .alert-content {
          display: flex;
          align-items: center;
          gap: 12px;
          flex: 1;
        }
        
        .alert-dismiss {
          background: none;
          border: none;
          color: inherit;
          font-size: 18px;
          cursor: pointer;
          padding: 4px;
          opacity: 0.8;
        }
        
        .alert-dismiss:hover {
          opacity: 1;
        }
        
        .health-indicator {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid;
        }
        
        .health-indicator.critical {
          background: #fee2e2;
          color: #dc2626;
          border-color: #fca5a5;
          animation: pulse 2s infinite;
        }
        
        .health-indicator.urgent {
          background: #fef3c7;
          color: #d97706;
          border-color: #fbbf24;
        }
        
        .health-indicator.routine {
          background: #dbeafe;
          color: #2563eb;
          border-color: #93c5fd;
        }
        
        .notification-dot.urgent {
          background: #f59e0b;
          animation: pulse 1.5s infinite;
        }
        
        .notification-count.emergency {
          background: #dc2626;
          color: white;
          font-size: 10px;
          font-weight: bold;
          min-width: 18px;
          height: 18px;
        }
        
        @keyframes slideDown {
          from {
            transform: translateY(-100%);
          }
          to {
            transform: translateY(0);
          }
        }
        
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
      `}</style>
    </header>
  );
};

export default Header;
