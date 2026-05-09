import React from 'react';
import { useNavigate } from 'react-router-dom';
import './ContactPage.css';

const ContactPage = () => {
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("¡Mensaje enviado! Nos pondremos en contacto pronto.");
  };

  return (
    <div className="contact-layout">
      <header className="main-header">
        <div className="logo-section" onClick={() => navigate("/login")}>
          <div className="logo-icon">📍</div>
          <span className="logo-text">TourMate</span>
        </div>
        <nav className="header-nav">
          <span onClick={() => navigate("/login")}>Inicio</span>
          <span onClick={() => navigate("/paquetes")}>Paquetes</span>
          <span className="active-link" onClick={() => navigate("/contacto")}>Contactanos</span>
        </nav>
      </header>

      <main className="contact-container">
        <div className="contact-info">
          <h1>¿Tienes dudas? 📩</h1>
          <p>Estamos aquí para ayudarte a planear tu mejor experiencia en Medellín.</p>
          
          <div className="info-item">
            <span className="icon">📍</span>
            <div>
              <h3>Ubicación</h3>
              <p>---- ----- -------</p>
            </div>
          </div>
          
          <div className="info-item">
            <span className="icon">📞</span>
            <div>
              <h3>WhatsApp</h3>
              <p>+57 300 XXX XXXX</p>
            </div>
          </div>
        </div>

        <form className="contact-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nombre Completo</label>
            <input type="text" placeholder="Tu nombre..." required />
          </div>
          
          <div className="form-group">
            <label>Correo Electrónico</label>
            <input type="email" placeholder="correo@ejemplo.com" required />
          </div>

          <div className="form-group">
            <label>Mensaje</label>
            <textarea placeholder="¿En qué podemos ayudarte?" rows="5" required></textarea>
          </div>

          <button type="submit" className="btn-send">Enviar Mensaje</button>
        </form>
      </main>
    </div>
  );
};

export default ContactPage;