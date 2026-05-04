import React from 'react';
import { useNavigate } from 'react-router-dom'; // Importar para la navegación
import LoginCard from '../components/LoginCard';
import './LoginPage.css';

const LoginPage = () => {
  const navigate = useNavigate(); // Hook para cambiar de ruta

  return (
    <div className="login-page-layout">
      {/* HEADER: Logo y Navegación */}
      <header className="main-header">
        <div className="logo-section" onClick={() => navigate("/login")} style={{ cursor: 'pointer' }}>
          <div className="logo-icon">📍</div>
          <span className="logo-text">TourMate</span>
        </div>
        
        <nav className="header-nav">
          {/* Cambiamos href="#" por funciones de navegación */}
          <span onClick={() => navigate("/login")}>Inicio</span>
          <span onClick={() => navigate("/paquetes")}>Paquetes</span>
          <span onClick={() => navigate("/contacto")}>Contactanos</span>
          <span className="active-link" onClick={() => navigate("/login")}>Iniciar Sesión</span>
        </nav>
      </header>

      {/* SECCIÓN CENTRAL: Fondo de Medellín + Tarjeta de Login */}
      <main className="hero-section">
        <LoginCard />
      </main>

      {/* FOOTER */}
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
                <li onClick={() => navigate("/login")} style={{ cursor: 'pointer' }}>Inicio</li>
                <li>Barrio</li>
              </ul>
            </div>
            <div className="footer-column">
              <h4>Perfiles</h4>
              <ul>
                <li onClick={() => navigate("/paquetes")} style={{ cursor: 'pointer' }}>Paquetes</li>
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
          <p className="footer-reg" onClick={() => navigate("/register")} style={{ cursor: 'pointer' }}>
            Registrate
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LoginPage;