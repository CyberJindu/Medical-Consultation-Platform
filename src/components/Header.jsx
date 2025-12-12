import React, { useState } from 'react';
import { MessageSquarePlus, History, BookOpen, UserCheck, Menu, X } from 'lucide-react';

const Header = ({ 
  onNewChat, 
  onShowHistory, 
  onShowHealthFeed, 
  onShowSpecialists,  
  hasNewRecommendations  
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleMenuAction = (action) => {
    action();
    setIsMenuOpen(false);
  };

  return (
    <header className="header-container">
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
            onClick={() => handleMenuAction(onShowSpecialists)}
            className="icon-button relative"
            title="Consult Health Specialist"
          >
            <UserCheck size={24} />
            {hasNewRecommendations && (
              <span className="notification-dot"></span>
            )}
          </button>
        </div>
      </div>

      {/* Right Side - Brand Name */}
      <div className="flex items-center">
        <h1 className="brand-name">MediGuide</h1>
      </div>
    </header>
  );
};

export default Header;
