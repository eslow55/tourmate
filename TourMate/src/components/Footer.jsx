import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="tourmate-footer-container">
      <div className="tourmate-footer-content">
        
        <div className="footer-sparkle">
          <svg width="60" height="60" viewBox="0 0 24 24" fill="#6c849c">
            <path d="M12 2L13.09 9.91L21 11L13.09 12.09L12 20L10.91 12.09L3 11L10.91 9.91L12 2Z" />
          </svg>
        </div>

        <div className="footer-columns-wrapper">
          
          <div className="footer-col">
            <h3>Footer</h3>
            <p>TourMate centraliza la oferta de actividades a turistas y visitantes, para planes jovenes y familiares.</p>
          </div>

          <div className="footer-col">
            <h3>Experiencias</h3>
            <a href="/">Inicio</a>
            <a href="/paquetes">Barrio</a>
          </div>

          <div className="footer-col">
            <h3>Perfiles</h3>
            <a href="/paquetes">Paquetes</a>
          </div>

          <div className="footer-col">
            <h3>Regístrate</h3>
            <div className="footer-social-icons">
              {/* Facebook */}
              <a href="#" className="social-circle">f</a>
              {/* Twitter */}
              <a href="#" className="social-circle">t</a>
              {/* YouTube */}
              <a href="#" className="social-circle">▶</a>
              {/* X */}
              <a href="#" className="social-circle">X</a>
              {/* Instagram */}
              <a href="#" className="social-circle">ig</a>
            </div>
          </div>

        </div>
      </div>

      <div className="footer-bottom-bar">
        <div className="footer-bottom-content">
          <span>© 2026 TourMate Medellín</span>
          <a href="/registro">Regístrate</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;