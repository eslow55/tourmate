import React, { useState, useEffect, useMemo } from 'react';
import { db, auth } from '../../firebase/firebaseConfig';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  doc, 
  updateDoc, 
  serverTimestamp,
  deleteDoc
} from 'firebase/firestore';

/**
 * TOURMATE - MÓDULO DE GESTIÓN DE RESERVAS (GUÍA)
 * Este componente maneja el ciclo de vida completo de un servicio.
 */
const Bookings = () => {
  // --- ESTADOS ---
  const [allBookings, setAllBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('En Curso');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null); // Para el Modal
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc' o 'desc'

  // --- EFECTOS (FIREBASE) ---
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    // Consulta en tiempo real filtrada por el guía logueado
    const q = query(
      collection(db, "bookings"),
      where("guideId", "==", user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      console.log("TourMate Debug: Sincronizando datos...", data.length);
      setAllBookings(data);
      setLoading(false);
    }, (error) => {
      console.error("Error en Snapshot:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // --- LÓGICA DE FILTRADO Y BÚSQUEDA ---
  const filteredAndSorted = useMemo(() => {
    let result = allBookings.filter(item => {
      const s = item.status?.toLowerCase();
      // Lógica de Pestañas
      const matchesTab = 
        activeTab === 'Nuevas' ? s === 'pending' :
        activeTab === 'En Curso' ? (s === 'confirmed' || s === 'paid') :
        activeTab === 'Historial' ? (s === 'completed' || s === 'cancelled') : false;

      // Lógica de Buscador (por ID o por Título del Tour)
      const matchesSearch = 
        item.tourTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.id.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesTab && matchesSearch;
    });

    // Ordenar por fecha (asumiendo que tienes createdAt o usando el ID)
    return result.sort((a, b) => {
      if (sortOrder === 'desc') return b.id.localeCompare(a.id);
      return a.id.localeCompare(b.id);
    });
  }, [allBookings, activeTab, searchTerm, sortOrder]);

  // --- ACCIONES ---
  const handleUpdateStatus = async (id, newStatus) => {
    try {
      const docRef = doc(db, "bookings", id);
      await updateDoc(docRef, {
        status: newStatus,
        lastModification: serverTimestamp()
      });
      setSelectedBooking(null);
    } catch (error) {
      alert("Error al actualizar el estado del servicio.");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Estás seguro de eliminar este registro del historial?")) {
      try {
        await deleteDoc(doc(db, "bookings", id));
      } catch (err) {
        alert("No se pudo eliminar.");
      }
    }
  };

  // --- CÁLCULO DE ESTADÍSTICAS ---
  const stats = {
    pending: allBookings.filter(b => b.status === 'pending').length,
    active: allBookings.filter(b => b.status === 'confirmed' || b.status === 'paid').length,
    totalIncome: allBookings
      .filter(b => b.status === 'paid' || b.status === 'completed')
      .reduce((acc, curr) => acc + (Number(curr.totalPrice) || 0), 0)
  };

  if (loading) return (
    <div className="tm-loading-state">
      <div className="tm-spinner"></div>
      <p>Sincronizando tus rutas en Medellín...</p>
    </div>
  );

  return (
    <div className="tm-bookings-page">
      {/* 1. SECCIÓN DE MÉTRICAS */}
      <section className="tm-metrics-grid">
        <div className="tm-metric-item orange">
          <div className="metric-icon">📂</div>
          <div className="metric-text">
            <span className="label">Por Aprobar</span>
            <span className="value">{stats.pending}</span>
          </div>
        </div>
        <div className="tm-metric-item green">
          <div className="metric-icon">🚀</div>
          <div className="metric-text">
            <span className="label">Servicios Activos</span>
            <span className="value">{stats.active}</span>
          </div>
        </div>
        <div className="tm-metric-item blue">
          <div className="metric-icon">📈</div>
          <div className="metric-text">
            <span className="label">Ingresos Generados</span>
            <span className="value">${stats.totalIncome.toLocaleString()}</span>
          </div>
        </div>
      </section>

      {/* 2. BARRA DE CONTROL (TABS Y BUSCADOR) */}
      <div className="tm-control-bar">
        <div className="tm-tabs-navigation">
          {['Nuevas', 'En Curso', 'Historial'].map(tab => (
            <button 
              key={tab} 
              className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
              {tab === 'Nuevas' && stats.pending > 0 && <span className="tab-badge">{stats.pending}</span>}
            </button>
          ))}
        </div>

        <div className="tm-search-wrapper">
          <input 
            type="text" 
            placeholder="Buscar por Tour o ID..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* 3. CONTENIDO DINÁMICO */}
      <main className="tm-bookings-list">
        {filteredAndSorted.length === 0 ? (
          <div className="tm-empty-state">
            <div className="empty-icon">📭</div>
            <h3>No se encontraron reservas</h3>
            <p>Asegúrate de estar en la pestaña correcta o intenta otra búsqueda.</p>
          </div>
        ) : (
          <div className="tm-grid">
            {filteredAndSorted.map(item => (
              <div key={item.id} className={`tm-booking-card st-${item.status}`}>
                <header className="card-top">
                  <span className={`status-pill ${item.status}`}>{item.status}</span>
                  <span className="id-label">#{item.id.slice(-6).toUpperCase()}</span>
                </header>

                <div className="card-body">
                  <h3 className="tour-title">{item.tourTitle || "Experiencia TourMate"}</h3>
                  <div className="info-group">
                    <div className="info-item">
                      <span className="i-icon">👥</span>
                      <span>{item.people || item.numPersons || 0} personas</span>
                    </div>
                    <div className="info-item">
                      <span className="i-icon">👤</span>
                      <span>ID Turista: {item.touristId?.slice(0, 10)}...</span>
                    </div>
                  </div>
                </div>

                <footer className="card-footer">
                  <div className="price-display">
                    <span className="p-label">Total</span>
                    <span className="p-value">${(Number(item.totalPrice) || 0).toLocaleString()} COP</span>
                  </div>
                  
                  <div className="action-buttons">
                    <button className="btn-details" onClick={() => setSelectedBooking(item)}>
                      Ver Detalles
                    </button>
                  </div>
                </footer>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* 4. MODAL DE DETALLES (FLOTANTE) */}
      {selectedBooking && (
        <div className="tm-modal-overlay">
          <div className="tm-modal-content">
            <button className="close-modal" onClick={() => setSelectedBooking(null)}>×</button>
            <h2>Detalle de la Reserva</h2>
            <hr />
            <div className="modal-data">
              <p><strong>Tour:</strong> {selectedBooking.tourTitle}</p>
              <p><strong>ID de Reserva:</strong> {selectedBooking.id}</p>
              <p><strong>Estado Actual:</strong> <span className={`status-pill ${selectedBooking.status}`}>{selectedBooking.status}</span></p>
              <p><strong>Personas:</strong> {selectedBooking.people}</p>
              <p><strong>Fecha:</strong> {selectedBooking.date || "Pendiente por confirmar"}</p>
              <p><strong>Total a cobrar:</strong> ${Number(selectedBooking.totalPrice).toLocaleString()} COP</p>
            </div>

            <div className="modal-actions">
              {selectedBooking.status === 'pending' && (
                <>
                  <button className="btn-approve-big" onClick={() => handleUpdateStatus(selectedBooking.id, 'confirmed')}>
                    Aceptar y Confirmar Servicio
                  </button>
                  <button className="btn-cancel-big" onClick={() => handleUpdateStatus(selectedBooking.id, 'cancelled')}>
                    Rechazar
                  </button>
                </>
              )}
              {selectedBooking.status === 'confirmed' && (
                <p className="status-notice">A la espera de que el turista realice el pago.</p>
              )}
              {selectedBooking.status === 'paid' && (
                <button className="btn-complete-big" onClick={() => handleUpdateStatus(selectedBooking.id, 'completed')}>
                  Finalizar Servicio con Éxito
                </button>
              )}
              {activeTab === 'Historial' && (
                <button className="btn-delete-big" onClick={() => handleDelete(selectedBooking.id)}>
                  Eliminar del Registro
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 5. ESTILOS INTEGRADOS (CSS-IN-JS) */}
      <style>{`
        .tm-bookings-page { padding: 30px; background: #f8fafc; min-height: 100vh; font-family: 'Inter', system-ui, -apple-system, sans-serif; }
        
        /* Estadísticas */
        .tm-metrics-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 20px; margin-bottom: 40px; }
        .tm-metric-item { background: white; padding: 25px; border-radius: 20px; display: flex; align-items: center; gap: 20px; box-shadow: 0 4px 6px rgba(0,0,0,0.02); transition: 0.3s; border-bottom: 4px solid transparent; }
        .tm-metric-item:hover { transform: translateY(-5px); box-shadow: 0 10px 20px rgba(0,0,0,0.05); }
        .tm-metric-item.orange { border-color: #ff5a3c; }
        .tm-metric-item.green { border-color: #10b981; }
        .tm-metric-item.blue { border-color: #3b82f6; }
        .metric-icon { font-size: 2rem; background: #f1f5f9; width: 60px; height: 60px; display: flex; align-items: center; justify-content: center; border-radius: 16px; }
        .metric-text .label { display: block; font-size: 0.75rem; color: #94a3b8; text-transform: uppercase; font-weight: 800; letter-spacing: 0.5px; }
        .metric-text .value { font-size: 1.8rem; font-weight: 800; color: #1e293b; }

        /* Controles */
        .tm-control-bar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; flex-wrap: wrap; gap: 20px; }
        .tm-tabs-navigation { display: flex; background: #e2e8f0; padding: 6px; border-radius: 14px; gap: 5px; }
        .tab-btn { border: none; padding: 10px 24px; border-radius: 10px; cursor: pointer; font-weight: 700; color: #64748b; background: transparent; transition: 0.2s; position: relative; }
        .tab-btn.active { background: white; color: #ff5a3c; box-shadow: 0 4px 10px rgba(0,0,0,0.08); }
        .tab-badge { position: absolute; top: -5px; right: -5px; background: #ff5a3c; color: white; font-size: 0.65rem; padding: 2px 7px; border-radius: 10px; border: 2px solid #f8fafc; }
        .tm-search-wrapper input { padding: 12px 20px; border-radius: 12px; border: 1px solid #e2e8f0; width: 300px; font-weight: 500; outline: none; }
        .tm-search-wrapper input:focus { border-color: #ff5a3c; box-shadow: 0 0 0 3px rgba(255,90,60,0.1); }

        /* Grid de Tarjetas */
        .tm-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 25px; }
        .tm-booking-card { background: white; border-radius: 24px; padding: 25px; border: 1px solid #f1f5f9; box-shadow: 0 2px 4px rgba(0,0,0,0.02); transition: 0.3s; display: flex; flex-direction: column; }
        .tm-booking-card:hover { transform: translateY(-8px); box-shadow: 0 20px 25px -5px rgba(0,0,0,0.05); }
        
        .card-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
        .status-pill { font-size: 0.65rem; font-weight: 800; text-transform: uppercase; padding: 6px 14px; border-radius: 20px; letter-spacing: 0.5px; }
        .status-pill.pending { background: #fff7ed; color: #c2410c; }
        .status-pill.confirmed { background: #eff6ff; color: #1d4ed8; }
        .status-pill.paid { background: #f0fdf4; color: #15803d; }
        .status-pill.completed { background: #f1f5f9; color: #475569; }
        
        .tour-title { font-size: 1.3rem; font-weight: 800; color: #1e293b; margin-bottom: 15px; min-height: 50px; }
        .info-group { display: flex; flex-direction: column; gap: 10px; margin-bottom: 25px; }
        .info-item { display: flex; align-items: center; gap: 10px; color: #64748b; font-size: 0.9rem; font-weight: 500; }

        .card-footer { margin-top: auto; padding-top: 20px; border-top: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center; }
        .p-label { display: block; font-size: 0.7rem; color: #94a3b8; font-weight: 700; text-transform: uppercase; }
        .p-value { font-size: 1.1rem; font-weight: 800; color: #10b981; }
        
        .btn-details { background: #f1f5f9; border: none; padding: 10px 18px; border-radius: 10px; font-weight: 700; color: #475569; cursor: pointer; transition: 0.2s; }
        .btn-details:hover { background: #e2e8f0; color: #1e293b; }

        /* Modal */
        .tm-modal-overlay { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 20px; }
        .tm-modal-content { background: white; width: 100%; max-width: 500px; border-radius: 28px; padding: 40px; position: relative; animation: modalPop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
        .close-modal { position: absolute; top: 20px; right: 20px; border: none; background: #f1f5f9; width: 35px; height: 35px; border-radius: 50%; font-size: 1.5rem; cursor: pointer; }
        .modal-data p { margin: 15px 0; color: #475569; font-size: 1.05rem; }
        
        .modal-actions { margin-top: 30px; display: flex; flex-direction: column; gap: 12px; }
        .btn-approve-big { background: #3b82f6; color: white; border: none; padding: 16px; border-radius: 14px; font-weight: 800; cursor: pointer; }
        .btn-complete-big { background: #10b981; color: white; border: none; padding: 16px; border-radius: 14px; font-weight: 800; cursor: pointer; }
        .btn-cancel-big { background: #fef2f2; color: #ef4444; border: none; padding: 16px; border-radius: 14px; font-weight: 800; cursor: pointer; }
        .status-notice { text-align: center; color: #3b82f6; font-weight: 700; background: #eff6ff; padding: 15px; border-radius: 12px; }

        .tm-loading-state { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 60vh; color: #94a3b8; }
        .tm-spinner { width: 40px; height: 40px; border: 4px solid #e2e8f0; border-top-color: #ff5a3c; border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 15px; }

        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes modalPop { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
};

export default Bookings;