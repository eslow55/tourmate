import React from 'react';
import RegisterCard from '../components/RegisterCard';
import './RegisterPage.css'; // Reutilizaremos estilos del layout

const RegisterPage = () => {
  return (
    <div className="login-page-layout">
      {/* HEADER IDÉNTICO AL LOGIN */}
      <header className="main-header">
        <div className="logo-section">
          <div className="logo-icon">📍</div>
          <span className="logo-text">TourMate</span>
        </div>
        <nav className="header-nav">
          <a href="#">Inicio</a>
          <a href="#">Paquetes</a>
          <a href="#">Contactanos</a>
          <a href="/login">Iniciar Sesión</a>
        </nav>
      </header>

      {/* SECCIÓN HERO CON FONDO DE MEDELLÍN */}
      <main className="hero-section">
        <RegisterCard />
      </main>

      {/* FOOTER OSCURO PROFESIONAL */}
      <footer className="main-footer">
        <div className="footer-grid">
          <div className="footer-section">
            <div className="footer-brand">✦ <strong>Footer</strong></div>
            <p className="footer-description">
              TourMate centraliza la oferta de actividades a turistas y visitantes, 
              para planes jóvenes y familiares.
            </p>
          </div>
          
          <div className="footer-links">
            <div className="footer-column">
              <h4>Experiencias</h4>
              <ul>
                <li>Inicio</li>
                <li>Barrio</li>
              </ul>
            </div>
            <div className="footer-column">
              <h4>Regístrate</h4>
              <div className="social-links-footer">
                <span className="social-dot">f</span>
                <span className="social-dot">t</span>
                <span className="social-dot">y</span>
                <span className="social-dot">X</span>
                <span className="social-dot">ig</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>© 2026 TourMate Medellín</p>
        </div>
      </footer>
    </div>
  );
};

export default RegisterPage;