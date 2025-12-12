import React, { useState } from 'react';
import { Menu, X, User, FileText, LogOut, Home } from 'lucide-react';

const Header = ({ onLogout }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleNavigation = (path) => {
    window.location.href = path;
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

        {/* Icons that slide out - Matching public version layout */}
        <div className={`header-icons ${isMenuOpen ? 'menu-open' : ''}`}>
          <button 
            onClick={() => handleNavigation('/dashboard')}
            className="icon-button"
            title="Dashboard"
          >
            <Home size={24} />
          </button>
          
          <button 
            onClick={() => handleNavigation('/profile')}
            className="icon-button"
            title="My Profile"
          >
            <User size={24} />
          </button>
          
          <button 
            onClick={() => handleNavigation('/content')}
            className="icon-button"
            title="Content Studio"
          >
            <FileText size={24} />
          </button>
          
          <button 
            onClick={() => {
              onLogout();
              setIsMenuOpen(false);
            }}
            className="icon-button"
            title="Logout"
            style={{ color: '#EF4444' }}
          >
            <LogOut size={24} />
          </button>
        </div>
      </div>

      {/* Right Side - Brand Name with "Partners" underneath */}
      <div className="flex flex-col items-end">
        <h1 className="brand-name">MediGuide</h1>
        <span className="partners-text">Partners</span>
      </div>
    </header>
  );
};

export default Header;
