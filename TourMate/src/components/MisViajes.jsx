import React from 'react';
import './MisViajes.css';

const MisViajes = ({ actividades }) => {
  return (
    <div className="mis-viajes-view view-animate">
      <header className="viajes-header">
        <h2>Tus Aventuras <span className="emoji-title">🌍</span></h2>
        <p>Gestiona y revisa tus recorridos realizados en Medellín.</p>
      </header>

      <div className="viajes-list">
        {actividades && actividades.length > 0 ? (
          actividades.map((viaje, index) => (
            <div key={index} className="viaje-item-card">
              {/* Marcador visual de línea de tiempo */}
              <div className="viaje-marker-box">
                <div className="dot"></div>
                <div className="line"></div>
              </div>

              {/* Contenido principal de la tarjeta */}
              <div className="viaje-content">
                <div className="viaje-text-group">
                  <div className="viaje-date-label">
                    📅 {viaje.fecha}
                  </div>
                  <h3>{viaje.texto}</h3>
                </div>

                <div className="viaje-points-badge">
                  {viaje.puntos}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="no-viajes-state">
            <div className="no-viajes-icon">🚲</div>
            <h3>¿Aún no has explorado?</h3>
            <p>Tu historial de aventuras está vacío. ¡Selecciona una ruta en el Dashboard y empieza a sumar puntos!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MisViajes;