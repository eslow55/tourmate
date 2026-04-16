import React from 'react';
import './Header.css';

const Header = () => {
  return (
    <header className="tourmate-header-container">
      <div className="tourmate-header-content">
        
        <div className="header-logo">
          <img src="/logo.png" alt="TourMate" />
        </div>

        <nav className="header-nav">
          <a href="/" className="nav-link active">Inicio</a>
          <a href="/paquetes" className="nav-link">Paquetes</a>
          <a href="/contactanos" className="nav-link">Contactanos</a>
          <a href="/login" className="nav-link">Iniciar Sesión</a>
        </nav>

      </div>
    </header>
  );
};

export default Header;