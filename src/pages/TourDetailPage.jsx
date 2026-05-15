import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
// Corregido: Subimos un nivel desde src/pages/ para entrar a src/firebase/
import { db, auth } from "../firebase/firebaseConfig";
import { 
  doc, 
  getDoc, 
  collection, 
  addDoc, 
  serverTimestamp, 
  updateDoc, 
  increment,
  query,
  where,
  onSnapshot
} from "firebase/firestore";

/**
 * TOURMATE PREMIUM - MÓDULO DE DETALLE Y CONVERSIÓN
 * Desarrollado para la gestión de rutas turísticas en Medellín.
 */
const TourDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // --- ESTADOS DE CARGA Y DATOS ---
  const [tour, setTour] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isReserving, setIsReserving] = useState(false);
  const [error, setError] = useState(null);
  const [reviews, setReviews] = useState([]);

  // --- ESTADOS DE INTERACCIÓN ---
  const [numPeople, setNumPeople] = useState(1);
  const [bookingDate, setBookingDate] = useState("");
  const [activeTab, setActiveTab] = useState("descripcion");
  const [openFaq, setOpenFaq] = useState(null);

  // 1. CARGA INICIAL DEL TOUR (REAL-TIME PARA REVIEWS)
  useEffect(() => {
    if (!id) return;

    const fetchTourData = async () => {
      try {
        const docRef = doc(db, "tours", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setTour({ id: docSnap.id, ...docSnap.data() });
        } else {
          setError("La ruta que buscas no existe o fue dada de baja.");
        }
      } catch (err) {
        console.error("Firebase Error:", err);
        setError("Error de conexión con la base de datos de TourMate.");
      } finally {
        setLoading(false);
      }
    };

    fetchTourData();
  }, [id]);

  // 2. LÓGICA DE LA RESERVA (BOTÓN PRINCIPAL)
  const handleBooking = async () => {
    const user = auth.currentUser;

    if (!user) {
      alert("Debes iniciar sesión para reservar tu cupo.");
      return navigate("/login");
    }

    if (!bookingDate) {
      alert("Por favor, selecciona una fecha válida.");
      return;
    }

    setIsReserving(true);

    try {
      // Objeto de reserva estructurado para el guía y el turista
      const reservation = {
        tourId: tour.id,
        guideId: tour.guideId,
        touristId: user.uid,
        tourTitle: tour.title,
        tourImage: tour.imageUrl || "",
        pricePerPerson: Number(tour.price),
        people: Number(numPeople),
        totalPrice: Number(tour.price) * Number(numPeople),
        date: bookingDate,
        status: "pending", // Estado inicial: Por confirmar por el guía
        createdAt: serverTimestamp(),
        touristName: user.displayName || "Explorador Medellín",
        touristEmail: user.email,
        meetingPoint: tour.meetingPoint || "Medellín, Centro"
      };

      // Guardar en la colección de reservas
      const docRef = await addDoc(collection(db, "bookings"), reservation);

      // Actualizar estadísticas del tour (Opcional pero recomendado)
      const tourRef = doc(db, "tours", id);
      await updateDoc(tourRef, {
        totalReservations: increment(1)
      });

      console.log("Reserva Exitosa:", docRef.id);
      alert("¡Reserva enviada! Podrás ver el estado en 'Mis Viajes'.");
      navigate("/mis-viajes");

    } catch (err) {
      console.error("Booking Error:", err);
      alert("No pudimos procesar la reserva. Verifica tu conexión.");
    } finally {
      setIsReserving(false);
    }
  };

  // --- COMPONENTES INTERNOS DE UI ---

  const renderFaq = (index, question, answer) => (
    <div className={`tm-faq-item ${openFaq === index ? 'active' : ''}`} key={index}>
      <button className="faq-question" onClick={() => setOpenFaq(openFaq === index ? null : index)}>
        {question}
        <span>{openFaq === index ? '−' : '+'}</span>
      </button>
      {openFaq === index && <div className="faq-answer"><p>{answer}</p></div>}
    </div>
  );

  if (loading) return (
    <div className="tm-loading-screen">
      <div className="tm-loader-ring"></div>
      <p>Cargando tu próxima aventura en Medellín...</p>
    </div>
  );

  if (error) return (
    <div className="tm-error-container">
      <div className="error-icon">📍</div>
      <h2>Ups! {error}</h2>
      <button onClick={() => navigate("/")}>Regresar al Mapa de Tours</button>
    </div>
  );

  return (
    <div className="tm-detail-wrapper">
      {/* 1. SECCIÓN HERO / GALERÍA */}
      <section className="tm-gallery-hero">
        <div className="hero-main-img" style={{ backgroundImage: `url(${tour.imageUrl})` }}>
          <div className="hero-overlay">
            <div className="hero-tags">
              <span className="tag-cat">{tour.category || 'Cultura'}</span>
              <span className="tag-rating">⭐ 4.9 (12 Reseñas)</span>
            </div>
            <h1>{tour.title}</h1>
            <p className="hero-location">📍 Medellín, Antioquia • Colombia</p>
          </div>
        </div>
      </section>

      {/* 2. LAYOUT PRINCIPAL */}
      <div className="tm-content-layout">
        <main className="tm-main-info">
          {/* Navegación por Tabs */}
          <nav className="tm-tabs-nav">
            {['descripcion', 'itinerario', 'incluye', 'faq'].map(tab => (
              <button 
                key={tab} 
                className={activeTab === tab ? 'active' : ''} 
                onClick={() => setActiveTab(tab)}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </nav>

          <div className="tm-tab-content">
            {activeTab === 'descripcion' && (
              <div className="animate-fade">
                <h3>Acerca de esta experiencia</h3>
                <p className="description-text">{tour.description}</p>
                <div className="key-features">
                  <div className="feature">
                    <span className="feat-icon">🕒</span>
                    <div><strong>Duración</strong><p>{tour.duration || '3-4 horas'}</p></div>
                  </div>
                  <div className="feature">
                    <span className="feat-icon">🗣️</span>
                    <div><strong>Idiomas</strong><p>Español, Inglés</p></div>
                  </div>
                  <div className="feature">
                    <span className="feat-icon">👟</span>
                    <div><strong>Dificultad</strong><p>Media - Caminata</p></div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'itinerario' && (
              <div className="animate-fade">
                <h3>Plan del Recorrido</h3>
                <ul className="itinerary-list">
                  <li><strong>09:00 AM:</strong> Encuentro en {tour.meetingPoint || 'Lugar central'}.</li>
                  <li><strong>10:30 AM:</strong> Recorrido histórico por los puntos clave.</li>
                  <li><strong>12:00 PM:</strong> Degustación de snacks locales incluidos.</li>
                  <li><strong>01:30 PM:</strong> Cierre de la actividad y recomendaciones.</li>
                </ul>
              </div>
            )}

            {activeTab === 'incluye' && (
              <div className="animate-fade">
                <h3>¿Qué está incluido?</h3>
                <div className="included-grid">
                  {tour.included?.map((item, i) => (
                    <div key={i} className="included-item">✅ {item}</div>
                  )) || (
                    <>
                      <div className="included-item">✅ Guía profesional certificado</div>
                      <div className="included-item">✅ Seguro de asistencia médica</div>
                      <div className="included-item">✅ Hidratación y refrigerio</div>
                    </>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'faq' && (
              <div className="animate-fade">
                <h3>Preguntas Frecuentes</h3>
                {renderFaq(0, "¿Qué pasa si llueve?", "En Medellín el clima es variable. Si la lluvia es leve el tour sigue, si es torrencial, reprogramamos.")}
                {renderFaq(1, "¿Puedo llevar mascotas?", "Depende del tour específico, pero generalmente en rutas urbanas son bienvenidos con correa.")}
                {renderFaq(2, "¿Cómo realizo el pago?", "Una vez el guía confirme tu reserva, se habilitará el botón de pago en tu perfil.")}
              </div>
            )}
          </div>
        </main>

        {/* 3. WIDGET DE RESERVA LATERAL */}
        <aside className="tm-sidebar">
          <div className="tm-booking-card">
            <div className="card-header">
              <span className="price-label">Precio desde</span>
              <div className="price-amount">
                <span className="currency">$</span>
                <span className="value">{Number(tour.price).toLocaleString()}</span>
                <span className="per">/ pax</span>
              </div>
            </div>

            <div className="booking-form">
              <div className="form-input">
                <label>Fecha de salida</label>
                <input 
                  type="date" 
                  min={new Date().toISOString().split("T")[0]}
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                />
              </div>

              <div className="form-input">
                <label>Número de viajeros</label>
                <div className="people-stepper">
                  <button onClick={() => setNumPeople(Math.max(1, numPeople - 1))}>-</button>
                  <input type="number" readOnly value={numPeople} />
                  <button onClick={() => setNumPeople(Math.min(tour.maxPeople || 10, numPeople + 1))}>+</button>
                </div>
              </div>

              <div className="booking-summary">
                <div className="summary-row">
                  <span>${Number(tour.price).toLocaleString()} x {numPeople} pers.</span>
                  <span>${(tour.price * numPeople).toLocaleString()}</span>
                </div>
                <div className="summary-row total">
                  <span>Total</span>
                  <span>${(tour.price * numPeople).toLocaleString()} COP</span>
                </div>
              </div>

              <button 
                className={`btn-primary-reserva ${isReserving ? 'btn-loading' : ''}`}
                onClick={handleBooking}
                disabled={isReserving}
              >
                {isReserving ? "Procesando..." : "Confirmar Reserva"}
              </button>
              
              <p className="card-footer-text">
                ⚡ Reserva instantánea. No se requiere tarjeta de crédito ahora.
              </p>
            </div>
          </div>

          <div className="guide-small-card">
            <img src="https://ui-avatars.com/api/?name=Guia+Local&background=ff5a3c&color=fff" alt="Guia" />
            <div>
              <p className="guide-name">Anfitrión: {tour.guideName || "Guía Local"}</p>
              <Link to="/contacto-soporte" className="contact-link">Contactar Guía</Link>
            </div>
          </div>
        </aside>
      </div>

      <style>{`
        /* --- ESTILOS TOURMATE PREMIUM --- */
        .tm-detail-wrapper { min-height: 100vh; background: #fcfcfc; padding-bottom: 100px; font-family: 'Inter', sans-serif; }
        
        .tm-gallery-hero { height: 65vh; position: relative; overflow: hidden; }
        .hero-main-img { height: 100%; background-size: cover; background-position: center; transition: 0.5s; }
        .hero-overlay { position: absolute; inset: 0; background: linear-gradient(to top, rgba(0,0,0,0.8), transparent); display: flex; flex-direction: column; justify-content: flex-end; padding: 60px 10%; color: white; }
        .hero-overlay h1 { font-size: 3.5rem; font-weight: 900; margin: 10px 0; letter-spacing: -1px; }
        .tag-cat { background: #ff5a3c; padding: 5px 15px; border-radius: 50px; font-size: 0.8rem; font-weight: 800; text-transform: uppercase; }

        .tm-content-layout { max-width: 1200px; margin: -60px auto 0; display: grid; grid-template-columns: 1fr 400px; gap: 40px; padding: 0 20px; position: relative; z-index: 10; }

        /* Tabs Navigation */
        .tm-main-info { background: white; border-radius: 24px; padding: 40px; box-shadow: 0 10px 40px rgba(0,0,0,0.05); }
        .tm-tabs-nav { display: flex; gap: 30px; border-bottom: 1px solid #f1f5f9; margin-bottom: 30px; }
        .tm-tabs-nav button { background: none; border: none; padding: 15px 0; font-weight: 700; color: #94a3b8; cursor: pointer; position: relative; }
        .tm-tabs-nav button.active { color: #ff5a3c; }
        .tm-tabs-nav button.active::after { content: ''; position: absolute; bottom: 0; left: 0; width: 100%; height: 3px; background: #ff5a3c; border-radius: 10px; }

        /* Tab Content */
        .description-text { line-height: 1.8; color: #475569; font-size: 1.1rem; }
        .key-features { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-top: 40px; }
        .feature { display: flex; gap: 15px; align-items: center; background: #f8fafc; padding: 15px; border-radius: 16px; }
        .feat-icon { font-size: 1.5rem; }

        /* Sidebar & Widget */
        .tm-sidebar { position: sticky; top: 40px; height: fit-content; }
        .tm-booking-card { background: white; border-radius: 28px; padding: 35px; box-shadow: 0 20px 50px rgba(0,0,0,0.1); border: 1px solid #f1f5f9; }
        .price-amount { margin: 15px 0 25px; display: flex; align-items: baseline; gap: 5px; }
        .price-amount .value { font-size: 2.2rem; font-weight: 900; color: #1e293b; }
        .price-amount .currency { font-size: 1.5rem; font-weight: 800; color: #ff5a3c; }

        .form-input { margin-bottom: 20px; }
        .form-input label { display: block; font-size: 0.75rem; font-weight: 800; text-transform: uppercase; color: #64748b; margin-bottom: 8px; }
        .form-input input { width: 100%; padding: 15px; border: 1px solid #e2e8f0; border-radius: 12px; font-weight: 600; outline: none; }
        
        .people-stepper { display: flex; align-items: center; background: #f1f5f9; border-radius: 12px; padding: 5px; }
        .people-stepper button { width: 40px; height: 40px; border: none; background: white; border-radius: 8px; font-weight: 900; cursor: pointer; }
        .people-stepper input { background: transparent; border: none; text-align: center; font-size: 1.1rem; flex: 1; }

        .booking-summary { background: #f8fafc; padding: 20px; border-radius: 16px; margin: 25px 0; }
        .summary-row { display: flex; justify-content: space-between; margin-bottom: 10px; color: #64748b; font-weight: 500; }
        .summary-row.total { margin-top: 15px; padding-top: 15px; border-top: 1px dashed #cbd5e1; color: #1e293b; font-weight: 900; font-size: 1.2rem; }

        .btn-primary-reserva { width: 100%; background: #ff5a3c; color: white; border: none; padding: 18px; border-radius: 16px; font-size: 1.1rem; font-weight: 800; cursor: pointer; transition: 0.3s; box-shadow: 0 10px 20px rgba(255,90,60,0.2); }
        .btn-primary-reserva:hover { transform: translateY(-3px); box-shadow: 0 15px 30px rgba(255,90,60,0.3); }

        .tm-faq-item { border: 1px solid #f1f5f9; border-radius: 12px; margin-bottom: 10px; }
        .faq-question { width: 100%; padding: 20px; display: flex; justify-content: space-between; background: none; border: none; font-weight: 700; cursor: pointer; text-align: left; }
        .faq-answer { padding: 0 20px 20px; color: #64748b; line-height: 1.6; }

        .guide-small-card { display: flex; align-items: center; gap: 15px; margin-top: 25px; padding: 20px; background: white; border-radius: 20px; border: 1px solid #f1f5f9; }
        .guide-small-card img { width: 50px; height: 50px; border-radius: 50%; }
        .guide-name { font-weight: 700; margin: 0; }
        .contact-link { font-size: 0.8rem; color: #ff5a3c; font-weight: 600; text-decoration: none; }

        /* Animations & States */
        .animate-fade { animation: fadeIn 0.4s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .tm-loading-screen { height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #ff5a3c; }
        .tm-loader-ring { width: 50px; height: 50px; border: 5px solid #f1f5f9; border-top-color: #ff5a3c; border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 20px; }
        @keyframes spin { to { transform: rotate(360deg); } }

        @media (max-width: 900px) {
          .tm-content-layout { grid-template-columns: 1fr; margin-top: 20px; }
          .tm-gallery-hero { height: 40vh; }
          .hero-overlay h1 { font-size: 2rem; }
          .tm-tabs-nav { gap: 15px; font-size: 0.85rem; }
        }
      `}</style>
    </div>
  );
};

export default TourDetailPage;