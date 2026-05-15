import React, { useState, useEffect, useMemo } from 'react';
import { db, auth } from '../../firebase/firebaseConfig';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  doc, 
  updateDoc, 
  serverTimestamp 
} from 'firebase/firestore';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('Todos');

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    // CONSULTA: Buscamos por el ID del turista
    const q = query(
      collection(db, "bookings"),
      where("userId", "==", user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      console.log("--- SINCRONIZACIÓN TURISTA ---");
      console.log("Documentos en Firebase:", snapshot.size);
      
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setBookings(data);
      setLoading(false);
    }, (error) => {
      console.error("Error en Firebase:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Lógica de filtrado flexible para evitar errores de mayúsculas/minúsculas
  const filteredBookings = useMemo(() => {
    return bookings.filter(b => {
      const status = b.status?.toLowerCase() || 'pending';
      if (filter === 'Todos') return true;
      if (filter === 'Pendientes') return status === 'pending' || status === 'pendiente';
      if (filter === 'Por Pagar') return status === 'confirmed' || status === 'approved' || status === 'confirmado';
      if (filter === 'Pagados') return status === 'paid' || status === 'pagado';
      return false;
    });
  }, [bookings, filter]);

  const handlePayment = async (id) => {
    if (!window.confirm("¿Confirmas el pago de este tour?")) return;
    try {
      const ref = doc(db, "bookings", id);
      await updateDoc(ref, {
        status: 'paid',
        paymentDate: serverTimestamp()
      });
      alert("¡Pago realizado con éxito!");
    } catch (e) {
      alert("Error al procesar el pago");
    }
  };

  if (loading) return <div className="loading-screen">Cargando tus aventuras...</div>;

  return (
    <div className="bookings-view">
      <header className="view-header">
        <h1>Mis Reservas</h1>
        <p>Gestiona tus tours y confirma pagos pendientes.</p>
      </header>

      <div className="filter-tabs-container">
        {['Todos', 'Pendientes', 'Por Pagar', 'Pagados'].map(tab => (
          <button 
            key={tab}
            className={`tab-item ${filter === tab ? 'active' : ''}`}
            onClick={() => setFilter(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="bookings-grid">
        {filteredBookings.length === 0 ? (
          <div className="empty-state">
            <p>No encontramos reservas en <strong>{filter}</strong></p>
            <span>Si tienes reservas, verifica que el Guía las haya aprobado.</span>
          </div>
        ) : (
          filteredBookings.map(book => (
            <div key={book.id} className={`booking-card status-${book.status}`}>
              <div className="card-badge">
                {book.status === 'pending' && '⏳ Esperando Guía'}
                {book.status === 'confirmed' && '✅ Aprobado'}
                {book.status === 'paid' && '💎 Pagado'}
              </div>
              
              <div className="card-main-info">
                <h3>{book.tourTitle || "Tour en Medellín"}</h3>
                <div className="meta-info">
                  <p>📅 {book.date}</p>
                  <p>👤 {book.numPersons || book.guests} personas</p>
                </div>
              </div>

              <div className="card-footer-price">
                <div className="price-box">
                  <span>Precio Total</span>
                  <strong>${book.totalPrice?.toLocaleString()} COP</strong>
                </div>
                
                {(book.status === 'confirmed' || book.status === 'approved') && (
                  <button className="pay-now-btn" onClick={() => handlePayment(book.id)}>
                    Pagar Ahora
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* ERROR CORREGIDO: Se quitó el atributo 'jsx' */}
      <style>{`
        .bookings-view { padding: 20px; animation: fadeIn 0.5s ease; }
        .view-header h1 { color: #1e293b; font-size: 2rem; font-weight: 800; margin-bottom: 5px; }
        .filter-tabs-container { display: flex; gap: 10px; margin: 30px 0; }
        .tab-item { 
          padding: 10px 20px; border-radius: 30px; border: 1px solid #e2e8f0; 
          background: white; cursor: pointer; font-weight: 600; color: #64748b; transition: 0.3s;
        }
        .tab-item.active { background: #ff5a3c; color: white; border-color: #ff5a3c; box-shadow: 0 4px 10px rgba(255,90,60,0.2); }
        
        .bookings-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; }
        .booking-card { 
          background: white; padding: 25px; border-radius: 20px; border: 1px solid #f1f5f9;
          box-shadow: 0 4px 6px rgba(0,0,0,0.02); position: relative;
        }
        .card-badge { font-size: 0.7rem; font-weight: 800; text-transform: uppercase; margin-bottom: 15px; }
        .status-pending { border-left: 5px solid #f59e0b; }
        .status-confirmed { border-left: 5px solid #3b82f6; }
        .status-paid { border-left: 5px solid #10b981; }
        
        .card-main-info h3 { font-size: 1.2rem; color: #1e293b; margin-bottom: 10px; }
        .meta-info p { color: #94a3b8; font-size: 0.9rem; margin: 3px 0; }
        .card-footer-price { border-top: 1px solid #f1f5f9; margin-top: 20px; padding-top: 15px; display: flex; justify-content: space-between; align-items: center; }
        .price-box span { font-size: 0.7rem; color: #94a3b8; display: block; }
        .price-box strong { font-size: 1.1rem; color: #ff5a3c; }
        
        .pay-now-btn { 
          background: #10b981; color: white; border: none; padding: 10px 18px; 
          border-radius: 12px; font-weight: 700; cursor: pointer; transition: 0.3s;
        }
        .pay-now-btn:hover { background: #059669; transform: scale(1.05); }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
};

export default MyBookings;