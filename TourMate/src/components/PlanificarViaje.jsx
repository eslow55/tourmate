import React from 'react';
import './PlanificarViaje.css';

const PlanificarViaje = () => {
  const recorridos = [
    { id: 1, nombre: "Tour Gastronómico", precio: "$55.000", icon: "🍲", duracion: "3h" },
    { id: 2, nombre: "Ruta del Café", precio: "$70.000", icon: "☕", duracion: "5h" },
    { id: 3, nombre: "Medellín Nocturna", precio: "$40.000", icon: "🌃", duracion: "4h" }
  ];

  return (
    <section className="planning-container">
      <div className="planning-header">
        <h2>Planificar Viaje ✈️</h2>
        <p>Selecciona un recorrido personalizado por Medellín.</p>
      </div>
      
      <div className="planning-grid">
        {recorridos.map((ruta) => (
          <div key={ruta.id} className="planning-card">
            <div className="planning-badge">{ruta.duracion}</div>
            <div className="planning-icon">{ruta.icon}</div>
            <h3>{ruta.nombre}</h3>
            <p className="planning-price">{ruta.precio}</p>
            <button className="btn-select">Seleccionar</button>
          </div>
        ))}
      </div>
    </section>
  );
};

export default PlanificarViaje;