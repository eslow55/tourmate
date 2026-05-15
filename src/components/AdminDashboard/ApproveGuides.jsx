import React, { useState, useEffect, useMemo } from 'react';
import { db } from '../../firebase/firebaseConfig';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  updateDoc, 
  doc, 
  onSnapshot 
} from 'firebase/firestore';

/**
 * Componente: ApproveGuides
 * Propósito: Módulo administrativo para la auditoría y validación de nuevos guías.
 */
const ApproveGuides = () => {
  // --- ESTADOS ---
  const [guides, setGuides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [notification, setNotification] = useState({ show: false, msg: "", type: "" });
  const [selectedGuide, setSelectedGuide] = useState(null);

  // --- ESCUCHA EN TIEMPO REAL ---
  useEffect(() => {
    // Usamos onSnapshot para que si otro admin aprueba a alguien, la lista se actualice sola
    const q = query(
      collection(db, "users"), 
      where("role", "==", "guide"), 
      where("status", "==", "pending")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const pendingList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setGuides(pendingList);
      setLoading(false);
    }, (error) => {
      console.error("Error en Snapshot:", error);
      showToast("Error al conectar con la base de datos", "error");
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // --- UTILIDADES ---
  const showToast = (msg, type) => {
    setNotification({ show: true, msg, type });
    setTimeout(() => setNotification({ show: false, msg: "", type: "" }), 4000);
  };

  // Filtrado optimizado con useMemo
  const filteredGuides = useMemo(() => {
    return guides.filter(g => 
      g.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      g.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [guides, searchTerm]);

  // --- ACCIONES ---
  const processGuide = async (id, name, action) => {
    const isApprove = action === 'approved';
    const confirmMsg = `¿Confirmas que deseas ${isApprove ? 'DAR ACCESO' : 'DENEGAR'} a ${name}?`;

    if (!window.confirm(confirmMsg)) return;

    try {
      const guideRef = doc(db, "users", id);
      await updateDoc(guideRef, { 
        status: action,
        validatedAt: new Date().toISOString(),
        validatedBy: "SuperAdmin_Node_01"
      });

      showToast(`Guía ${isApprove ? 'aprobado' : 'rechazado'} correctamente`, "success");
      if (selectedGuide?.id === id) setSelectedGuide(null);
    } catch (error) {
      console.error("Error en validación:", error);
      showToast("No se pudo procesar la solicitud", "error");
    }
  };

  // --- RENDERIZADO ---
  if (loading) return (
    <div className="admin-loader-container">
      <div className="spinner"></div>
      <p>Consultando registros de seguridad...</p>
    </div>
  );

  return (
    <div className="admin-section animate-fade-in">
      {/* Toast Notification */}
      {notification.show && (
        <div className={`toast-alert ${notification.type}`}>
          {notification.type === 'success' ? '✅' : '❌'} {notification.msg}
        </div>
      )}

      {/* Header del Módulo */}
      <div className="section-header-admin">
        <div className="header-text">
          <h2>Validación de Credenciales</h2>
          <p>Revisa y autoriza a los nuevos guías que desean unirse a TourMate.</p>
        </div>
        <div className="header-actions">
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input 
              type="text" 
              placeholder="Buscar por nombre o correo..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="badge-count">Pendientes: {guides.length}</div>
        </div>
      </div>

      <div className="admin-content-layout">
        {/* Tabla / Lista Principal */}
        <div className="guides-table-container">
          {filteredGuides.length === 0 ? (
            <div className="empty-state-admin">
              <p>No se encontraron guías pendientes con esos criterios.</p>
            </div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Nombre Completo</th>
                  <th>Contacto</th>
                  <th>Registro</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredGuides.map(guide => (
                  <tr key={guide.id} className={selectedGuide?.id === guide.id ? 'row-selected' : ''}>
                    <td onClick={() => setSelectedGuide(guide)} className="clickable-cell">
                      <div className="user-info-cell">
                        <div className="avatar-small">{guide.name?.charAt(0)}</div>
                        <span>{guide.name}</span>
                      </div>
                    </td>
                    <td>
                      <div className="contact-info-cell">
                        <small>{guide.email}</small>
                        <br />
                        <small>{guide.phone || 'N/A'}</small>
                      </div>
                    </td>
                    <td>{new Date(guide.createdAt?.seconds * 1000).toLocaleDateString()}</td>
                    <td>
                      <div className="action-btn-group">
                        <button 
                          className="btn-approve-circle" 
                          onClick={() => processGuide(guide.id, guide.name, 'approved')}
                          title="Aprobar Guía"
                        >
                          ✓
                        </button>
                        <button 
                          className="btn-reject-circle" 
                          onClick={() => processGuide(guide.id, guide.name, 'rejected')}
                          title="Rechazar Guía"
                        >
                          ✕
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Panel Lateral de Detalles (Si se selecciona un guía) */}
        {selectedGuide && (
          <aside className="guide-detail-panel animate-slide-left">
            <button className="close-panel" onClick={() => setSelectedGuide(null)}>✕</button>
            <div className="panel-header">
              <div className="avatar-large">{selectedGuide.name?.charAt(0)}</div>
              <h3>Detalles del Perfil</h3>
            </div>
            
            <div className="panel-body">
              <div className="detail-row">
                <label>Nombre:</label>
                <p>{selectedGuide.name}</p>
              </div>
              <div className="detail-row">
                <label>Correo Electrónico:</label>
                <p>{selectedGuide.email}</p>
              </div>
              <div className="detail-row">
                <label>Biografía / Experiencia:</label>
                <p className="bio-text">{selectedGuide.bio || "No proporcionó descripción adicional."}</p>
              </div>
              <div className="detail-row">
                <label>Documentación:</label>
                <div className="doc-placeholder">
                  📄 Certificación_Turismo.pdf
                </div>
              </div>
            </div>

            <div className="panel-footer">
              <button 
                className="btn-full approve"
                onClick={() => processGuide(selectedGuide.id, selectedGuide.name, 'approved')}
              >
                Confirmar Registro
              </button>
              <button 
                className="btn-full reject"
                onClick={() => processGuide(selectedGuide.id, selectedGuide.name, 'rejected')}
              >
                Denegar Acceso
              </button>
            </div>
          </aside>
        )}
      </div>

      <style jsx>{`
        /* Estilos internos rápidos para complementar el CSS global */
        .admin-content-layout {
          display: flex;
          gap: 20px;
          margin-top: 2rem;
        }
        .guides-table-container {
          flex-grow: 1;
          background: white;
          border-radius: 15px;
          overflow: hidden;
          box-shadow: 0 4px 15px rgba(0,0,0,0.05);
        }
        .admin-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }
        .admin-table th {
          background: #f8fafc;
          padding: 1rem;
          font-size: 0.8rem;
          color: #64748b;
          text-transform: uppercase;
        }
        .admin-table td {
          padding: 1rem;
          border-bottom: 1px solid #f1f5f9;
        }
        .clickable-cell { cursor: pointer; color: #1e293b; font-weight: 600; }
        .clickable-cell:hover { color: #ff5a3c; }
        .avatar-small {
          width: 32px;
          height: 32px;
          background: #ff5a3c;
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.8rem;
          margin-right: 10px;
        }
        .user-info-cell { display: flex; align-items: center; }
        .action-btn-group { display: flex; gap: 8px; }
        .btn-approve-circle, .btn-reject-circle {
          width: 35px;
          height: 35px;
          border-radius: 50%;
          border: none;
          cursor: pointer;
          font-weight: bold;
          transition: 0.2s;
        }
        .btn-approve-circle { background: #dcfce7; color: #166534; }
        .btn-reject-circle { background: #fee2e2; color: #991b1b; }
        .btn-approve-circle:hover { background: #166534; color: white; }
        .btn-reject-circle:hover { background: #991b1b; color: white; }
        
        .toast-alert {
          position: fixed;
          top: 20px;
          right: 20px;
          padding: 1rem 2rem;
          border-radius: 10px;
          color: white;
          z-index: 1000;
          box-shadow: 0 5px 15px rgba(0,0,0,0.2);
          animation: slideIn 0.3s ease;
        }
        .success { background: #10b981; }
        .error { background: #ef4444; }
        
        @keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
      `}</style>
    </div>
  );
};

export default ApproveGuides;