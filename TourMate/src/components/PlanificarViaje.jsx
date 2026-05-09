import React from 'react';
import './PlanificarViaje.css';
import { db } from '../firebase/firebaseConfig'; // Importamos la DB [cite: 3]
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';

const PlanificarViaje = () => {
  const { user } = useAuth(); // Obtenemos al usuario logueado

  const recorridos = [
    { id: 1, nombre: "Tour Gastronómico", precio: "$55.000", icon: "🍲", duracion: "3h" },
    { id: 2, nombre: "Ruta del Café", precio: "$70.000", icon: "☕", duracion: "5h" },
    { id: 3, nombre: "Medellín Nocturna", precio: "$40.000", icon: "🌃", duracion: "4h" }
  ];

  const handleSeleccionar = async (ruta) => {
    if (!user) return alert("Debes iniciar sesión para agendar.");

    try {
      // "Create" en el CRUD: Añade un documento a la colección 'viajes'
      await addDoc(collection(db, "viajes"), {
        userId: user.uid,
        nombre: ruta.nombre,
        precio: ruta.precio,
        icon: ruta.icon,
        duracion: ruta.duracion,
        fecha: new Date().toLocaleDateString(),
        createdAt: serverTimestamp() // Para ordenar por fecha de creación
      });
      alert(`¡${ruta.nombre} agendado con éxito!`);
    } catch (error) {
      console.error("Error al guardar viaje:", error);
    }
  };

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
            {/* Botón conectado a la función de guardado */}
            <button className="btn-select" onClick={() => handleSeleccionar(ruta)}>
              Seleccionar
            </button>
          </div>
        ))}
      </div>
    </section>
  );
};

export default PlanificarViaje;