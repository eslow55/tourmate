// ============================================================
// GuideDashboard.jsx — Panel del Guía Turístico
// Funcional: agenda en tiempo real, CRUD tours, turistas por tour
// ============================================================
import { useState, useEffect } from "react";
import {
  db,
} from "../firebase/firebaseConfig";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import "../styles/GuideDashboard.css";

const TABS = ["agenda", "mis-tours", "turistas"];
const TAB_LABELS = { "agenda": "Agenda", "mis-tours": "Mis Tours", "turistas": "Turistas" };
const TAB_ICONS  = { "agenda": "📅", "mis-tours": "🗺", "turistas": "👥" };

const CATEGORIES = ["Aventura", "Cultural", "Gastronomía", "Naturaleza", "Historia", "Nocturno", "Familiar"];

const EMPTY_TOUR = {
  title: "", description: "", location: "",
  price: "", duration: "", maxCapacity: "",
  category: "", imageUrl: "",
};

export default function GuideDashboard({ user, profile }) {
  const { logout } = useAuth();

  const [activeTab,    setActiveTab]    = useState("agenda");
  const [tours,        setTours]        = useState([]);
  const [bookings,     setBookings]     = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [toast,        setToast]        = useState(null);

  // Form
  const [showForm,     setShowForm]     = useState(false);
  const [editingTour,  setEditingTour]  = useState(null);
  const [tourForm,     setTourForm]     = useState(EMPTY_TOUR);
  const [formLoading,  setFormLoading]  = useState(false);
  const [formErrors,   setFormErrors]   = useState({});

  // Turistas
  const [selectedTour, setSelectedTour] = useState(null);

  // ── REALTIME LISTENERS ────────────────────────────────────
  useEffect(() => {
    if (!user?.uid) return;

    const qTours = query(collection(db, "tours"), where("guideId", "==", user.uid));
    const unsubTours = onSnapshot(qTours, snap => {
      setTours(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }, () => setLoading(false));

    const qBookings = query(collection(db, "bookings"), where("guideId", "==", user.uid));
    const unsubBookings = onSnapshot(qBookings, snap => {
      setBookings(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    return () => { unsubTours(); unsubBookings(); };
  }, [user]);

  // ── TOAST ─────────────────────────────────────────────────
  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  // ── FORM ──────────────────────────────────────────────────
  const openCreate = () => {
    setEditingTour(null);
    setTourForm(EMPTY_TOUR);
    setFormErrors({});
    setShowForm(true);
  };
  const openEdit = tour => {
    setEditingTour(tour);
    setTourForm({ ...tour });
    setFormErrors({});
    setShowForm(true);
  };

  const validateForm = () => {
    const errs = {};
    if (!tourForm.title.trim())    errs.title    = "Requerido";
    if (!tourForm.location.trim()) errs.location = "Requerido";
    if (!tourForm.price)           errs.price    = "Requerido";
    if (!tourForm.duration.trim()) errs.duration = "Requerido";
    return errs;
  };

  const handleSaveTour = async () => {
    const errs = validateForm();
    if (Object.keys(errs).length) { setFormErrors(errs); return; }
    setFormLoading(true);
    try {
      const data = {
        ...tourForm,
        price:       Number(tourForm.price),
        maxCapacity: Number(tourForm.maxCapacity) || 0,
        guideId:     user.uid,
        guideName:   profile?.name || "Guía",
        active:      true,
        updatedAt:   serverTimestamp(),
      };
      if (editingTour) {
        await updateDoc(doc(db, "tours", editingTour.id), data);
        showToast("Tour actualizado ✓");
      } else {
        data.createdAt = serverTimestamp();
        data.currentEnrollments = 0;
        await addDoc(collection(db, "tours"), data);
        showToast("Tour publicado ✓");
      }
      setShowForm(false);
    } catch (e) {
      console.error(e);
      showToast("Error al guardar. Verifica permisos.", "error");
    }
    setFormLoading(false);
  };

  const handleDeleteTour = async tourId => {
    if (!window.confirm("¿Eliminar este tour permanentemente?")) return;
    try {
      await deleteDoc(doc(db, "tours", tourId));
      if (selectedTour?.id === tourId) setSelectedTour(null);
      showToast("Tour eliminado");
    } catch {
      showToast("Error al eliminar", "error");
    }
  };

  // ── BOOKINGS ──────────────────────────────────────────────
  const handleUpdateBooking = async (bookingId, status) => {
    try {
      await updateDoc(doc(db, "bookings", bookingId), { status, updatedAt: serverTimestamp() });
      showToast(status === "confirmed" ? "Reserva confirmada ✓" : "Reserva cancelada");
    } catch {
      showToast("Error actualizando reserva", "error");
    }
  };

  const handleCompleteBooking = async (bookingId) => {
    try {
      await updateDoc(doc(db, "bookings", bookingId), {
        status: "completed",
        updatedAt: serverTimestamp(),
      });
      showToast("Tour marcado como completado ✓");
    } catch {
      showToast("Error actualizando reserva", "error");
    }
  };

  // ── DERIVED ───────────────────────────────────────────────
  const upcomingBookings = bookings
    .filter(b => b.status === "confirmed" || b.status === "pending")
    .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));

  const tourBookings = selectedTour
    ? bookings.filter(b => b.tourId === selectedTour.id)
    : [];

  const stats = {
    totalTours: tours.length,
    totalBookings: bookings.length,
    confirmed: bookings.filter(b => b.status === "confirmed").length,
    pending:   bookings.filter(b => b.status === "pending").length,
    revenue:   bookings
      .filter(b => b.status === "confirmed" || b.status === "completed")
      .reduce((sum, b) => sum + (Number(b.totalPrice) || 0), 0),
  };

  const field = (key, label, placeholder, type = "text", options = null) => (
    <div className={`gd-field ${formErrors[key] ? "has-error" : ""}`}>
      <label>{label}{formErrors[key] && <span className="gd-field-err">{formErrors[key]}</span>}</label>
      {options ? (
        <select
          value={tourForm[key]}
          onChange={e => setTourForm({ ...tourForm, [key]: e.target.value })}
        >
          <option value="">Seleccionar...</option>
          {options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      ) : (
        <input
          type={type}
          placeholder={placeholder}
          value={tourForm[key]}
          onChange={e => setTourForm({ ...tourForm, [key]: e.target.value })}
        />
      )}
    </div>
  );

  // ── STATUS HELPER ─────────────────────────────────────────
  const statusLabel = (s) => ({
    pending:   "⏳ Pendiente",
    confirmed: "✅ Confirmado",
    cancelled: "❌ Cancelado",
    completed: "🏁 Completado",
  }[s] || "⏳ Pendiente");

  const statusCss = (s) => ({
    pending:   "gd-status-pending",
    confirmed: "gd-status-confirmed",
    cancelled: "gd-status-cancelled",
    completed: "gd-status-completed",
  }[s] || "gd-status-pending");

  // ── RENDER ────────────────────────────────────────────────
  return (
    <div className="gd-root">
      {/* ── SIDEBAR ── */}
      <aside className="gd-sidebar">
        <div className="gd-brand">
          <div className="gd-brand-icon">🌿</div>
          <span className="gd-brand-name">Tourmate</span>
        </div>

        <div className="gd-profile-card">
          <div className="gd-avatar">{profile?.name?.[0]?.toUpperCase() || "G"}</div>
          <div>
            <p className="gd-profile-name">{profile?.name || "Guía"}</p>
            <p className="gd-profile-role">Guía certificado</p>
          </div>
        </div>

        <div className="gd-quick-stats">
          <div className="gd-qstat"><span>{stats.totalTours}</span><p>Tours</p></div>
          <div className="gd-qstat"><span>{stats.pending}</span><p>Pendientes</p></div>
          <div className="gd-qstat"><span>{stats.confirmed}</span><p>Confirmadas</p></div>
        </div>

        <div className="gd-revenue-card">
          <p className="gd-revenue-label">Ingresos confirmados</p>
          <p className="gd-revenue-value">${stats.revenue.toLocaleString("es-CO")}</p>
          <p className="gd-revenue-sub">COP</p>
        </div>

        <nav className="gd-nav">
          {TABS.map(tab => {
            const pendingCount = tab === "agenda"
              ? bookings.filter(b => b.status === "pending").length
              : 0;
            return (
              <button
                key={tab}
                className={`gd-nav-btn ${activeTab === tab ? "active" : ""}`}
                onClick={() => setActiveTab(tab)}
              >
                <span className="gd-nav-icon">{TAB_ICONS[tab]}</span>
                <span>{TAB_LABELS[tab]}</span>
                {pendingCount > 0 && <span className="gd-nav-badge">{pendingCount}</span>}
              </button>
            );
          })}
        </nav>

        <button className="gd-logout" onClick={logout}>↩ Cerrar sesión</button>
      </aside>

      {/* ── MAIN ── */}
      <main className="gd-main">
        {loading ? (
          <div className="gd-loading"><div className="gd-spinner" /><p>Cargando panel...</p></div>
        ) : (
          <>
            {/* ════ AGENDA ════ */}
            {activeTab === "agenda" && (
              <div className="gd-section">
                <div className="gd-section-header">
                  <div>
                    <h1>Mi Agenda</h1>
                    <p>Reservas activas y pendientes de confirmación</p>
                  </div>
                </div>

                {upcomingBookings.length === 0 ? (
                  <div className="gd-empty-state">
                    <span>📅</span>
                    <h3>Sin reservas activas</h3>
                    <p>Cuando los turistas reserven tus tours, aparecerán aquí.</p>
                  </div>
                ) : (
                  <div className="gd-agenda-list">
                    {upcomingBookings.map(b => (
                      <div key={b.id} className="gd-agenda-card">
                        <div className="gd-agenda-left">
                          <div className="gd-agenda-date-box">
                            <span className="gd-date-day">
                              {b.createdAt?.toDate?.()?.getDate?.() || "—"}
                            </span>
                            <span className="gd-date-month">
                              {b.createdAt?.toDate?.()?.toLocaleDateString("es-CO", { month: "short" })?.toUpperCase() || ""}
                            </span>
                          </div>
                        </div>

                        <div className="gd-agenda-info">
                          <h3>{b.tourTitle}</h3>
                          <div className="gd-agenda-meta">
                            <span>👤 {b.touristName}</span>
                            <span>👥 {b.people} persona{b.people !== 1 ? "s" : ""}</span>
                            <span>💰 ${Number(b.totalPrice).toLocaleString()} COP</span>
                          </div>
                        </div>

                        <div className="gd-agenda-actions">
                          <span className={`gd-status ${statusCss(b.status)}`}>
                            {statusLabel(b.status)}
                          </span>
                          {b.status === "pending" && (
                            <div className="gd-action-btns">
                              <button className="gd-btn-confirm" onClick={() => handleUpdateBooking(b.id, "confirmed")}>Aceptar</button>
                              <button className="gd-btn-reject"  onClick={() => handleUpdateBooking(b.id, "cancelled")}>Rechazar</button>
                            </div>
                          )}
                          {b.status === "confirmed" && (
                            <button className="gd-btn-complete" onClick={() => handleCompleteBooking(b.id)}>
                              Marcar completado
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ════ MIS TOURS ════ */}
            {activeTab === "mis-tours" && (
              <div className="gd-section">
                <div className="gd-section-header">
                  <div>
                    <h1>Mis Tours</h1>
                    <p>{tours.length} experiencia{tours.length !== 1 ? "s" : ""} publicada{tours.length !== 1 ? "s" : ""}</p>
                  </div>
                  <button className="gd-btn-new" onClick={openCreate}>+ Nueva experiencia</button>
                </div>

                {tours.length === 0 ? (
                  <div className="gd-empty-state">
                    <span>🗺</span>
                    <h3>Aún no tienes tours</h3>
                    <p>Crea tu primera experiencia y empieza a recibir turistas.</p>
                    <button className="gd-btn-new" onClick={openCreate}>+ Crear tour</button>
                  </div>
                ) : (
                  <div className="gd-tours-grid">
                    {tours.map(tour => {
                      const tourBks = bookings.filter(b => b.tourId === tour.id);
                      return (
                        <div key={tour.id} className="gd-tour-card">
                          <div className="gd-tour-img">
                            {tour.imageUrl
                              ? <img src={tour.imageUrl} alt={tour.title} />
                              : <div className="gd-tour-img-placeholder">🏔</div>
                            }
                            <span className={`gd-tour-status ${tour.active ? "active" : "inactive"}`}>
                              {tour.active ? "Activo" : "Inactivo"}
                            </span>
                          </div>
                          <div className="gd-tour-body">
                            {tour.category && (
                              <span className="gd-tour-cat">{tour.category}</span>
                            )}
                            <h3>{tour.title}</h3>
                            <p className="gd-tour-location">📍 {tour.location}</p>
                            <div className="gd-tour-meta">
                              <span>⏱ {tour.duration}</span>
                              <span>💰 ${Number(tour.price).toLocaleString()}</span>
                              <span>👥 {tourBks.length} reservas</span>
                            </div>
                            <div className="gd-tour-actions">
                              <button className="gd-btn-secondary" onClick={() => openEdit(tour)}>✏ Editar</button>
                              <button
                                className="gd-btn-secondary"
                                onClick={() => { setActiveTab("turistas"); setSelectedTour(tour); }}
                              >
                                👥 Turistas
                              </button>
                              <button className="gd-btn-danger" onClick={() => handleDeleteTour(tour.id)}>🗑</button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ════ TURISTAS ════ */}
            {activeTab === "turistas" && (
              <div className="gd-section">
                <div className="gd-section-header">
                  <div>
                    <h1>Turistas Inscritos</h1>
                    <p>Selecciona un tour para ver sus participantes</p>
                  </div>
                </div>

                <div className="gd-tourists-layout">
                  {/* Sidebar de tours */}
                  <div className="gd-tour-list-sidebar">
                    {tours.length === 0 && (
                      <p className="gd-sidebar-empty">No tienes tours aún</p>
                    )}
                    {tours.map(t => (
                      <button
                        key={t.id}
                        className={`gd-tour-list-btn ${selectedTour?.id === t.id ? "active" : ""}`}
                        onClick={() => setSelectedTour(t)}
                      >
                        <strong>{t.title}</strong>
                        <span>{bookings.filter(b => b.tourId === t.id).length} reservas</span>
                      </button>
                    ))}
                  </div>

                  {/* Lista de turistas */}
                  <div className="gd-tourists-main">
                    {!selectedTour ? (
                      <div className="gd-empty-state">
                        <span>👆</span>
                        <p>Selecciona un tour para ver sus turistas</p>
                      </div>
                    ) : tourBookings.length === 0 ? (
                      <div className="gd-empty-state">
                        <span>🧳</span>
                        <h3>Sin reservas</h3>
                        <p>Este tour aún no tiene participantes.</p>
                      </div>
                    ) : (
                      <>
                        <h2 className="gd-tourists-title">{selectedTour.title}</h2>
                        <div className="gd-tourists-list">
                          {tourBookings.map(b => (
                            <div key={b.id} className="gd-tourist-row">
                              <div className="gd-tourist-avatar">
                                {b.touristName?.[0]?.toUpperCase() || "T"}
                              </div>
                              <div className="gd-tourist-info">
                                <strong>{b.touristName}</strong>
                                <p>
                                  {b.people} persona{b.people !== 1 ? "s" : ""} ·
                                  ${Number(b.totalPrice).toLocaleString()} COP
                                </p>
                              </div>
                              <span className={`gd-status ${statusCss(b.status)}`}>
                                {statusLabel(b.status)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* ── MODAL FORM ── */}
      {showForm && (
        <div className="gd-modal-overlay" onClick={() => setShowForm(false)}>
          <div className="gd-modal" onClick={e => e.stopPropagation()}>
            <div className="gd-modal-header">
              <h2>{editingTour ? "Editar experiencia" : "Nueva experiencia"}</h2>
              <p>Completa la info para que los turistas encuentren tu tour.</p>
              <button className="gd-modal-close" onClick={() => setShowForm(false)}>✕</button>
            </div>

            <div className="gd-form-body">
              {/* Título */}
              <div className={`gd-field full ${formErrors.title ? "has-error" : ""}`}>
                <label>Título del tour{formErrors.title && <span className="gd-field-err">{formErrors.title}</span>}</label>
                <input
                  placeholder="Ej: Graffiti Tour Comuna 13"
                  value={tourForm.title}
                  onChange={e => setTourForm({ ...tourForm, title: e.target.value })}
                />
              </div>

              <div className="gd-form-row">
                {field("location", "Ubicación *", "Ej: San Javier, Medellín")}
                {field("duration", "Duración *", "Ej: 4 horas")}
              </div>

              <div className="gd-form-row">
                {field("price", "Precio (COP) *", "80000", "number")}
                {field("maxCapacity", "Cupos máx.", "15", "number")}
              </div>

              <div className="gd-form-row">
                {field("category", "Categoría", "", "text", CATEGORIES)}
                <div className="gd-field">
                  <label>URL de imagen</label>
                  <input
                    placeholder="https://images.unsplash.com/..."
                    value={tourForm.imageUrl}
                    onChange={e => setTourForm({ ...tourForm, imageUrl: e.target.value })}
                  />
                </div>
              </div>

              <div className="gd-field full">
                <label>Descripción de la ruta</label>
                <textarea
                  rows="4"
                  placeholder="¿Qué incluye? ¿Qué puntos visitarán? ¿Qué deben llevar?"
                  value={tourForm.description}
                  onChange={e => setTourForm({ ...tourForm, description: e.target.value })}
                />
              </div>

              {/* Preview de imagen */}
              {tourForm.imageUrl && (
                <div className="gd-img-preview">
                  <img src={tourForm.imageUrl} alt="preview" onError={e => e.target.style.display = 'none'} />
                </div>
              )}
            </div>

            <div className="gd-modal-actions">
              <button className="gd-btn-cancel" onClick={() => setShowForm(false)}>Cancelar</button>
              <button className="gd-btn-save" onClick={handleSaveTour} disabled={formLoading}>
                {formLoading
                  ? <span className="gd-btn-spinner" />
                  : (editingTour ? "Actualizar tour" : "Publicar tour")
                }
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <div className={`gd-toast gd-toast-${toast.type}`}>{toast.msg}</div>}
    </div>
  );
}