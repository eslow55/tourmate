import React, { useEffect, useState } from 'react';
import './MisViajes.css';
import { db } from '../firebase/firebaseConfig'; // Importamos la DB [cite: 3]
import { collection, query, where, onSnapshot, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';

const MisViajes = () => {
  const [viajes, setViajes] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    // "Read" en el CRUD: Consultamos solo los viajes del usuario actual
    const q = query(
      collection(db, "viajes"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    // Escucha cambios en tiempo real (si agregas o borras, se actualiza solo)
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const listaViajes = snapshot.docs.map(documento => ({
        id: documento.id,
        ...documento.data()
      }));
      setViajes(listaViajes);
    });

    return () => unsubscribe();
  }, [user]);

  const eliminarViaje = async (id) => {
    // "Delete" en el CRUD
    if (window.confirm("¿Deseas cancelar esta aventura?")) {
      try {
        await deleteDoc(doc(db, "viajes", id));
      } catch (error) {
        console.error("Error al eliminar:", error);
      }
    }
  };

  return (
    <div className="mis-viajes-view view-animate">
      <header className="viajes-header">
        <h2>Tus Aventuras <span className="emoji-title">🌍</span></h2>
        <p>Gestiona tus recorridos en Medellín.</p>
      </header>

      <div className="viajes-list">
        {viajes.length > 0 ? (
          viajes.map((viaje) => (
            <div key={viaje.id} className="viaje-item-card">
              <div className="viaje-marker-box">
                <div className="dot"></div>
                <div className="line"></div>
              </div>

              <div className="viaje-content">
                <div className="viaje-text-group">
                  <div className="viaje-date-label">📅 {viaje.fecha}</div>
                  <h3>{viaje.icon} {viaje.nombre}</h3>
                  <small>{viaje.duracion}</small>
                </div>
                {/* Botón para eliminar el registro */}
                <button 
                  onClick={() => eliminarViaje(viaje.id)} 
                  style={{background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem'}}
                >
                  🗑️
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="no-viajes-state">
            <div className="no-viajes-icon">🚲</div>
            <h3>¿Aún no has explorado?</h3>
            <p>Selecciona una ruta en el Dashboard.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MisViajes;