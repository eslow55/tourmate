import React, { useState, useEffect } from 'react';
import { db } from '../../firebase/firebaseConfig';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  doc, 
  updateDoc, 
  deleteDoc,
  serverTimestamp 
} from 'firebase/firestore';
import '../../styles/AdminDashboard.css';

/**
 * COMPONENTE: AdminApproveTours
 * Propósito: Gestionar la curaduría de contenidos de TourMate Medellín.
 * Lógica: Cambia isApproved y active a true para reflejar en el Home.
 */
const AdminApproveTours = () => {
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending'); // 'pending' o 'approved'
  const [stats, setStats] = useState({ pending: 0, total: 0 });

  // --- SUSCRIPCIÓN EN TIEMPO REAL A FIRESTORE ---
  useEffect(() => {
    setLoading(true);
    
    // Consulta: traemos según el filtro de la pestaña activa
    const q = query(
      collection(db, "tours"),
      where("isApproved", "==", filter === 'approved')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const toursData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setTours(toursData);
      
      // Actualizar contadores rápidos
      if (filter === 'pending') {
        setStats(prev => ({ ...prev, pending: toursData.length }));
      }
      setLoading(false);
    }, (error) => {
      console.error("Error en Admin Dashboard:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [filter]);

  // --- LÓGICA DE APROBACIÓN (PUBLICACIÓN) ---
  const handleApprove = async (id) => {
    try {
      const tourRef = doc(db, "tours", id);
      
      // Sincronizamos con los campos que busca el HomePage.jsx
      await updateDoc(tourRef, {
        isApproved: true,
        active: true, // Campo que usa tu Home actual
        lastModified: serverTimestamp()
      });

      alert("Tour aprobado. Ya es visible en la sección de rutas de Medellín.");
    } catch (error) {
      alert("Error al actualizar el estado del tour.");
    }
  };

  // --- LÓGICA DE RECHAZO / ELIMINACIÓN ---
  const handleReject = async (id) => {
    const confirm = window.confirm("¿Seguro que deseas eliminar esta propuesta de tour?");
    if (confirm) {
      try {
        await deleteDoc(doc(db, "tours", id));
      } catch (error) {
        alert("No se pudo eliminar el documento.");
      }
    }
  };

  // --- RENDERIZADO DE FILAS DE LA TABLA ---
  const renderTourRows = () => {
    if (tours.length === 0) {
      return (
        <div className="admin-empty-state">
          <p>No hay experiencias en esta categoría.</p>
        </div>
      );
    }

    return tours.map((item) => (
      <tr key={item.id} className="admin-table-row animate-fade-in">
        <td>
          <div className="admin-cell-image">
            <img src={item.image} alt="Tour Preview" />
            <div className="admin-cell-text">
              <strong>{item.name}</strong>
              <span>{item.location || 'Medellín'}</span>
            </div>
          </div>
        </td>
        <td>
          <div className="admin-guide-info">
            <p>{item.guideName}</p>
            <small>ID: {item.guideId?.substring(0, 8)}</small>
          </div>
        </td>
        <td>
          <span className="admin-category-tag">{item.category}</span>
        </td>
        <td>
          <div className="admin-price-info">
            <strong>${Number(item.price).toLocaleString()}</strong>
            <small>COP</small>
          </div>
        </td>
        <td className="admin-actions-cell">
          {filter === 'pending' ? (
            <>
              <button onClick={() => handleApprove(item.id)} className="btn-action-approve">
                ✅ Aprobar
              </button>
              <button onClick={() => handleReject(item.id)} className="btn-action-reject">
                ❌ Rechazar
              </button>
            </>
          ) : (
            <button disabled className="btn-action-published">Publicado</button>
          )}
        </td>
      </tr>
    ));
  };

  return (
    <div className="admin-dashboard-wrapper">
      {/* HEADER DEL DASHBOARD */}
      <header className="admin-main-header">
        <div className="header-title">
          <h1>Gestión de Contenidos</h1>
          <p>Control de calidad para experiencias en la plataforma.</p>
        </div>
        
        <div className="admin-stats-bar">
          <div className="stat-item">
            <span className="stat-value">{stats.pending}</span>
            <span className="stat-label">Pendientes</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Estado del Servidor:</span>
            <span className="stat-status-online">Online</span>
          </div>
        </div>
      </header>

      {/* NAVEGACIÓN DE FILTROS */}
      <nav className="admin-tabs">
        <button 
          className={filter === 'pending' ? 'active' : ''} 
          onClick={() => setFilter('pending')}
        >
          Tours Pendientes
        </button>
        <button 
          className={filter === 'approved' ? 'active' : ''} 
          onClick={() => setFilter('approved')}
        >
          Tours Aprobados
        </button>
      </nav>

      {/* TABLA DE GESTIÓN FULL SCREEN */}
      <div className="admin-table-container">
        {loading ? (
          <div className="admin-loading-screen">
            <div className="spinner-admin"></div>
            <p>Sincronizando con base de datos...</p>
          </div>
        ) : (
          <table className="admin-data-table">
            <thead>
              <tr>
                <th>Experiencia / Tour</th>
                <th>Guía Responsable</th>
                <th>Categoría</th>
                <th>Precio</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {renderTourRows()}
            </tbody>
          </table>
        )}
      </div>

      {/* ESTILOS INYECTADOS */}
      <style jsx>{`
        .admin-dashboard-wrapper {
          padding: 30px;
          background: #f8fafc;
          min-height: 100vh;
          width: 100%;
          box-sizing: border-box;
        }
        .admin-main-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
        }
        .header-title h1 { font-size: 2rem; color: #0f172a; margin: 0; }
        
        .admin-tabs {
          display: flex;
          gap: 10px;
          margin-bottom: 20px;
          border-bottom: 2px solid #e2e8f0;
        }
        .admin-tabs button {
          padding: 12px 25px;
          background: none;
          border: none;
          cursor: pointer;
          font-weight: 600;
          color: #64748b;
          transition: 0.3s;
        }
        .admin-tabs button.active {
          color: #ff5a3c;
          border-bottom: 3px solid #ff5a3c;
        }

        .admin-table-container {
          background: #fff;
          border-radius: 15px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.05);
          overflow: hidden;
          width: 100%;
        }
        .admin-data-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }
        .admin-data-table th {
          background: #f1f5f9;
          padding: 18px;
          font-size: 0.9rem;
          color: #475569;
          text-transform: uppercase;
        }
        .admin-data-table td {
          padding: 15px 18px;
          border-bottom: 1px solid #f1f5f9;
          vertical-align: middle;
        }

        .admin-cell-image { display: flex; align-items: center; gap: 15px; }
        .admin-cell-image img {
          width: 60px; height: 60px; border-radius: 10px; object-fit: cover;
        }
        .admin-cell-text strong { display: block; color: #1e293b; }
        
        .admin-actions-cell { display: flex; gap: 8px; }
        .btn-action-approve {
          background: #dcfce7; color: #166534; border: none;
          padding: 8px 15px; border-radius: 8px; font-weight: 700; cursor: pointer;
        }
        .btn-action-reject {
          background: #fee2e2; color: #991b1b; border: none;
          padding: 8px 15px; border-radius: 8px; font-weight: 700; cursor: pointer;
        }
        .btn-action-published {
          background: #f1f5f9; color: #94a3b8; border: none;
          padding: 8px 15px; border-radius: 8px; font-weight: 700;
        }
        
        .admin-empty-state { padding: 100px; text-align: center; color: #94a3b8; }
        
        @media (max-width: 900px) {
          .admin-data-table th:nth-child(3), .admin-data-table td:nth-child(3) { display: none; }
        }
      `}</style>
    </div>
  );
};

export default AdminApproveTours;