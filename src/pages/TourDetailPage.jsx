import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../firebase/firebaseConfig";
import { 
  doc, 
  getDoc, 
  addDoc, 
  collection, 
  serverTimestamp 
} from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import { 
  MapPin, 
  Clock, 
  Users, 
  Star, 
  ChevronLeft, 
  ShieldCheck, 
  Calendar, 
  Info,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight
} from "lucide-react";
import "../styles/TourDetail.css";

const TourDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  // Estados de datos
  const [tour, setTour] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estados de reserva
  const [people, setPeople] = useState(1);
  const [bookingStatus, setBookingStatus] = useState("idle"); // idle | loading | success | error

  // 1. CARGAR DATOS DEL TOUR
  useEffect(() => {
    const fetchTourData = async () => {
      try {
        setLoading(true);
        const tourRef = doc(db, "tours", id);
        const tourSnap = await getDoc(tourRef);

        if (tourSnap.exists()) {
          setTour({ id: tourSnap.id, ...tourSnap.data() });
        } else {
          setError("El tour que buscas no existe o fue eliminado.");
        }
      } catch (err) {
        console.error("Error al cargar tour:", err);
        setError("Hubo un problema al conectar con el servidor.");
      } finally {
        setLoading(false);
      }
    };

    fetchTourData();
  }, [id]);

  // 2. LÓGICA DE RESERVA (CORREGIDA)
  const handleBooking = async () => {
    if (!user) {
      alert("Debes iniciar sesión para reservar.");
      navigate("/login");
      return;
    }

    try {
      setBookingStatus("loading");

      // OBJETO DE DATOS CORREGIDO PARA EL DASHBOARD
      const bookingData = {
        // Vínculos de ID
        tourId: tour.id,
        touristId: user.uid,
        guideId: tour.guideId || "sin-asignar",

        // Información para mostrar (Claves normalizadas)
        tourTitle: tour.title, // IMPORTANTE: Antes tenías touristDashboardTitle
        tourImage: tour.imageUrl || "",
        location: tour.location || "Antioquia",
        guideName: tour.guideName || "Guía Local",
        
        // Detalles de la transacción
        people: Number(people),
        pricePerPerson: Number(tour.price),
        totalPrice: Number(tour.price) * Number(people),
        
        // Estado inicial
        status: "pending",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      // Guardar en la colección 'bookings'
      await addDoc(collection(db, "bookings"), bookingData);
      
      setBookingStatus("success");
      
      // Redirigir al dashboard después de 2 segundos
      setTimeout(() => {
        navigate("/tourist");
      }, 2500);

    } catch (err) {
      console.error("Error al crear reserva:", err);
      setBookingStatus("error");
    }
  };

  // Renderizado de carga
  if (loading) {
    return (
      <div className="tour-loading-overlay">
        <Loader2 className="v4-spin" size={48} color="#ff5a3c" />
        <p>Cargando experiencia...</p>
      </div>
    );
  }

  // Renderizado de error
  if (error || !tour) {
    return (
      <div className="tour-error-container">
        <AlertCircle size={64} color="#ef4444" />
        <h2>¡Ups! Algo salió mal</h2>
        <p>{error}</p>
        <button onClick={() => navigate("/")}>Volver al inicio</button>
      </div>
    );
  }

  return (
    <div className="tour-detail-wrapper">
      {/* NAVEGACIÓN SUPERIOR */}
      <nav className="detail-top-nav">
        <button className="btn-back" onClick={() => navigate(-1)}>
          <ChevronLeft size={20} /> Volver
        </button>
        <div className="category-tag">{tour.category || "Aventura"}</div>
      </nav>

      <div className="detail-main-layout">
        {/* COLUMNA IZQUIERDA: CONTENIDO */}
        <section className="detail-content-area">
          <div className="main-image-container">
            <img src={tour.imageUrl} alt={tour.title} />
          </div>

          <div className="tour-info-header">
            <div className="location-row">
              <MapPin size={18} /> <span>{tour.location}, Antioquia</span>
            </div>
            <h1>{tour.title}</h1>
            <div className="rating-summary">
              <Star size={18} fill="#ffb400" color="#ffb400" />
              <span>4.9 (128 reseñas)</span>
            </div>
          </div>

          <div className="quick-stats-grid">
            <div className="stat-card">
              <Clock size={24} />
              <div>
                <strong>Duración</strong>
                <p>{tour.duration || "4 horas"}</p>
              </div>
            </div>
            <div className="stat-card">
              <Users size={24} />
              <div>
                <strong>Capacidad</strong>
                <p>Hasta {tour.maxPeople || "10"} personas</p>
              </div>
            </div>
            <div className="stat-card">
              <ShieldCheck size={24} />
              <div>
                <strong>Seguridad</strong>
                <p>Seguro incluido</p>
              </div>
            </div>
          </div>

          <div className="description-box">
            <h3>Sobre esta experiencia</h3>
            <p>{tour.description}</p>
            <p>
              Explora lo mejor de la región con guías certificados que conocen cada 
              rincón histórico y cultural. Esta experiencia está diseñada para 
              quienes buscan conectar con la esencia de Medellín y sus alrededores.
            </p>
          </div>

          <div className="includes-section">
            <h3>¿Qué incluye?</h3>
            <ul className="includes-list">
              <li><CheckCircle2 size={18} /> Transporte privado</li>
              <li><CheckCircle2 size={18} /> Hidratación y snacks</li>
              <li><CheckCircle2 size={18} /> Guía bilingüe certificado</li>
              <li><CheckCircle2 size={18} /> Entradas a museos/parques</li>
            </ul>
          </div>
        </section>

        {/* COLUMNA DERECHA: SIDEBAR DE RESERVA */}
        <aside className="detail-booking-sidebar">
          <div className="sticky-booking-card">
            {bookingStatus === "success" ? (
              <div className="booking-success-msg animate-fade">
                <div className="success-icon-bg">
                  <CheckCircle2 size={40} color="#10b981" />
                </div>
                <h3>¡Reserva Exitosa!</h3>
                <p>Estamos preparando tu ticket. Serás redirigido a tu panel.</p>
                <button className="btn-view-panel" onClick={() => navigate("/tourist")}>
                  Ir al Panel <ArrowRight size={16} />
                </button>
              </div>
            ) : (
              <>
                <div className="price-header">
                  <p>Desde</p>
                  <h2>${Number(tour.price).toLocaleString()} <span>/ persona</span></h2>
                </div>

                <div className="booking-form">
                  <div className="input-group">
                    <label><Calendar size={18} /> Fecha disponible</label>
                    <div className="fake-input">Próximos días (Consultar con guía)</div>
                  </div>

                  <div className="input-group">
                    <label><Users size={18} /> Número de personas</label>
                    <div className="people-selector">
                      <button 
                        onClick={() => setPeople(Math.max(1, people - 1))}
                        disabled={people <= 1}
                      >-</button>
                      <span>{people}</span>
                      <button 
                        onClick={() => setPeople(people + 1)}
                        disabled={people >= (tour.maxPeople || 10)}
                      >+</button>
                    </div>
                  </div>

                  <div className="total-summary">
                    <div className="total-row">
                      <span>Subtotal ({people} x ${Number(tour.price).toLocaleString()})</span>
                      <span>${(Number(tour.price) * people).toLocaleString()}</span>
                    </div>
                    <div className="total-row">
                      <strong>Total a pagar</strong>
                      <strong>${(Number(tour.price) * people).toLocaleString()} COP</strong>
                    </div>
                  </div>

                  <button 
                    className="btn-confirm-booking"
                    onClick={handleBooking}
                    disabled={bookingStatus === "loading"}
                  >
                    {bookingStatus === "loading" ? (
                      <Loader2 className="v4-spin" size={20} />
                    ) : (
                      "Reservar ahora"
                    )}
                  </button>

                  <div className="booking-disclaimer">
                    <Info size={14} />
                    <p>No se realizará ningún cargo hasta que el guía confirme la disponibilidad.</p>
                  </div>
                </div>
              </>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
};

export default TourDetailPage;