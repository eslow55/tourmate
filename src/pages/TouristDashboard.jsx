// ============================================================
// TouristDashboard.jsx — Panel del Turista
// Funcional: overview, explorar tours, reservas, favoritos,
// perfil editable, notificaciones, filtros, modal de reserva
// ============================================================
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase/firebaseConfig";
import {
  collection, query, where, onSnapshot, orderBy,
  doc, updateDoc, serverTimestamp, limit, getDocs,
  addDoc, deleteDoc,
} from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import {
  MapPin, Clock, User, CheckCircle, Loader2,
  ShoppingBag, XCircle, Settings, LogOut, Bell,
  Filter, Search, ChevronRight, Menu, X,
  Star, Compass, Zap, Award, Heart, TrendingUp,
  Plus, Minus, CreditCard, AlertCircle,
} from "lucide-react";
import "../styles/TouristDashboard.css";

// ── STATUS CONFIG ────────────────────────────────────────────
const STATUS_MAP = {
  pending:   { label: "Pendiente",  css: "v4-status-pending",   icon: Clock      },
  confirmed: { label: "Confirmado", css: "v4-status-confirmed",  icon: CheckCircle },
  cancelled: { label: "Cancelado",  css: "v4-status-cancelled",  icon: XCircle    },
  completed: { label: "Completado", css: "v4-status-completed",  icon: Award      },
};

// ── SUB-COMPONENTS ───────────────────────────────────────────

const StatCard = ({ icon: Icon, label, value, colorClass }) => (
  <div className={`v4-stat-card ${colorClass}`}>
    <div className="v4-stat-header">
      <div className="v4-stat-icon-box"><Icon size={22} /></div>
    </div>
    <div className="v4-stat-body">
      <h3 className="v4-stat-value">{value}</h3>
      <p className="v4-stat-label">{label}</p>
    </div>
  </div>
);

const BookingRow = ({ booking, onCancel }) => {
  const [copied, setCopied] = useState(false); // Estado local para cada fila
  const s = STATUS_MAP[booking.status] || STATUS_MAP.pending;
  const Icon = s.icon;

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="v4-booking-container">
      <div className="v4-booking-item">
        <div className="v4-booking-col-info">
          <div className="v4-booking-thumb">
            <img
              src={booking.tourImage || "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=200"}
              alt="tour"
            />
          </div>
          <div className="v4-booking-meta">
            <h4>{booking.tourTitle}</h4>
            <span><User size={12} />{booking.guideName || "Guía Profesional"}</span>
          </div>
        </div>

        <div className="v4-booking-col-details">
          <div className="v4-data-point">
            <label>Fecha reserva</label>
            <p>{booking.createdAt?.toDate?.()?.toLocaleDateString("es-CO") || "—"}</p>
          </div>
          <div className="v4-data-point">
            <label>Personas</label>
            <p>{booking.people} pax</p>
          </div>
        </div>

        <div className="v4-booking-col-status">
          <span className={`v4-status-badge ${s.css}`}>
            <Icon size={13} />{s.label}
          </span>
        </div>

        <div className="v4-booking-col-price">
          <label>Total</label>
          <p>${Number(booking.totalPrice).toLocaleString("es-CO")}</p>
        </div>

        <div className="v4-booking-col-actions">
          {booking.status === "pending" && (
            <button className="v4-action-btn delete" onClick={() => onCancel(booking.id)} title="Cancelar reserva">
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* --- SECCIÓN DE PAGO (SOLO SI ESTÁ CONFIRMADO) --- */}
      {booking.status === "confirmed" && (
        <div className="v4-payment-section fade-in" style={{
          background: 'rgba(59, 130, 246, 0.05)',
          border: '1px dashed #3b82f6',
          borderRadius: '12px',
          padding: '15px',
          marginTop: '10px'
        }}>
          <div className="v4-payment-header" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#60a5fa', marginBottom: '10px' }}>
            <CreditCard size={18} />
            <h4 style={{ margin: 0, fontSize: '0.95rem' }}>Información de Pago</h4>
          </div>
          
          <div className="v4-bank-details" style={{ fontSize: '0.85rem' }}>
            <p style={{ marginBottom: '10px', opacity: 0.8 }}>Tu reserva fue aceptada. Transfiere para asegurar tu cupo:</p>
            
            <div className="v4-bank-row" style={{ display: 'flex', justifyContent: 'space-between', background: '#1e293b', padding: '8px 12px', borderRadius: '6px', marginBottom: '6px' }}>
              <span><strong>Bancolombia:</strong> 123-456789-01</span>
              <button onClick={() => copyToClipboard("12345678901")} style={{ background: 'none', border: 'none', color: copied ? '#10b981' : '#94a3b8', cursor: 'pointer' }}>
                {copied ? <CheckCircle size={14} /> : <Plus size={14} style={{ transform: 'rotate(45deg)' }} />}
              </button>
            </div>

            <div className="v4-bank-row" style={{ display: 'flex', justifyContent: 'space-between', background: '#1e293b', padding: '8px 12px', borderRadius: '6px' }}>
              <span><strong>Nequi:</strong> 312 456 7890</span>
              <button onClick={() => copyToClipboard("3124567890")} style={{ background: 'none', border: 'none', color: copied ? '#10b981' : '#94a3b8', cursor: 'pointer' }}>
                {copied ? <CheckCircle size={14} /> : <Plus size={14} style={{ transform: 'rotate(45deg)' }} />}
              </button>
            </div>
          </div>
          
          <button 
            style={{ width: '100%', marginTop: '12px', background: '#3b82f6', color: 'white', border: 'none', padding: '8px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
            onClick={() => window.alert("Redirigiendo al chat...")} // Aquí puedes integrar tu lógica de mensajes
          >
            Enviar comprobante al guía
          </button>
        </div>
      )}
    </div>
  );
};

const TourCard = ({ tour, isFavorite, onFavorite, onBook }) => (
  <div className="v4-explore-card">
    <div className="v4-card-image-wrapper">
      <img
        src={tour.imageUrl || "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=400"}
        alt={tour.title}
        loading="lazy"
      />
      <div className="v4-card-overlay">
        <div className="v4-tag-price">${Number(tour.price).toLocaleString("es-CO")}</div>
        <button
          className={`v4-wishlist-btn ${isFavorite ? "active" : ""}`}
          onClick={e => { e.stopPropagation(); onFavorite(tour.id); }}
          title={isFavorite ? "Quitar de favoritos" : "Agregar a favoritos"}
        >
          <Heart size={17} fill={isFavorite ? "#ff4d3d" : "none"} />
        </button>
      </div>
    </div>
    <div className="v4-card-content">
      <div className="v4-card-loc"><MapPin size={13} /><span>{tour.location || "Medellín"}</span></div>
      <h3>{tour.title}</h3>
      {tour.duration && (
        <div className="v4-card-duration"><Clock size={13} /><span>{tour.duration}</span></div>
      )}
      <div className="v4-card-footer">
        <div className="v4-card-rating">
          <Star size={13} fill="#FFB400" color="#FFB400" />
          <span>{tour.rating?.toFixed(1) || "0.0"} ({tour.reviewsCount || 0})</span>
        </div>
        <button className="v4-book-btn" onClick={() => onBook(tour)}>
          Reservar
        </button>
      </div>
    </div>
  </div>
);

// ── BOOKING MODAL ─────────────────────────────────────────────
const BookingModal = ({ tour, onClose, onConfirm, loading }) => {
  const [people, setPeople] = useState(1);
  const total = (tour.price || 0) * people;

  return (
    <div className="v4-modal-overlay" onClick={onClose}>
      <div className="v4-modal" onClick={e => e.stopPropagation()}>
        <div className="v4-modal-header">
          <h2>Reservar experiencia</h2>
          <button className="v4-modal-close" onClick={onClose}><X size={20} /></button>
        </div>
        <div className="v4-modal-body">
          {/* Tour info */}
          <div className="v4-modal-tour-info">
            <img
              src={tour.imageUrl || "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=200"}
              alt={tour.title}
            />
            <div>
              <h3>{tour.title}</h3>
              <p><MapPin size={13} /> {tour.location}</p>
              <p><Clock size={13} /> {tour.duration}</p>
              <p><User size={13} /> {tour.guideName}</p>
            </div>
          </div>

          {/* Personas */}
          <div className="v4-modal-field">
            <label>Número de personas</label>
            <div className="v4-counter">
              <button
                onClick={() => setPeople(p => Math.max(1, p - 1))}
                disabled={people <= 1}
              >
                <Minus size={16} />
              </button>
              <span>{people}</span>
              <button
                onClick={() => setPeople(p => Math.min(tour.maxCapacity || 20, p + 1))}
                disabled={tour.maxCapacity && people >= tour.maxCapacity}
              >
                <Plus size={16} />
              </button>
            </div>
            {tour.maxCapacity && (
              <small>Máximo {tour.maxCapacity} personas por reserva</small>
            )}
          </div>

          {/* Resumen */}
          <div className="v4-modal-summary">
            <div className="v4-summary-row">
              <span>${Number(tour.price).toLocaleString("es-CO")} × {people} persona{people !== 1 ? "s" : ""}</span>
              <strong>${total.toLocaleString("es-CO")} COP</strong>
            </div>
            <div className="v4-summary-note">
              <AlertCircle size={14} />
              Tu reserva quedará en estado "Pendiente" hasta que el guía la confirme.
            </div>
          </div>
        </div>

        <div className="v4-modal-actions">
          <button className="v4-modal-cancel" onClick={onClose}>Cancelar</button>
          <button
            className="v4-modal-confirm"
            onClick={() => onConfirm({ people, total })}
            disabled={loading}
          >
            {loading
              ? <><Loader2 size={16} className="v4-spin-sm" /> Procesando...</>
              : <><CreditCard size={16} /> Confirmar reserva</>
            }
          </button>
        </div>
      </div>
    </div>
  );
};

// ── PROFILE TAB ───────────────────────────────────────────────
const ProfileTab = ({ profile, user, onUpdate, showToast }) => {
  const [form, setForm] = useState({
    name:  profile?.name  || "",
    phone: profile?.phone || "",
    city:  profile?.city  || "",
    bio:   profile?.bio   || "",
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateDoc(doc(db, "users", user.uid), { ...form, updatedAt: serverTimestamp() });
      onUpdate(form);
      showToast("Perfil actualizado ✓");
    } catch {
      showToast("Error actualizando perfil", "error");
    }
    setSaving(false);
  };

  return (
    <div className="v4-fade-content">
      <div className="v4-view-header">
        <div>
          <h1>Mi Perfil</h1>
          <p>Actualiza tu información personal</p>
        </div>
      </div>

      <div className="v4-profile-card">
        <div className="v4-profile-avatar-section">
          <div className="v4-profile-avatar-big">
            {profile?.name?.charAt(0)?.toUpperCase() || "T"}
          </div>
          <div>
            <h3>{profile?.name || "Turista"}</h3>
            <p>{user?.email}</p>
          </div>
        </div>

        <div className="v4-profile-form">
          <div className="v4-pf-grid">
            <div className="v4-pf-field">
              <label>Nombre completo</label>
              <input
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="Tu nombre"
              />
            </div>
            <div className="v4-pf-field">
              <label>Teléfono</label>
              <input
                value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })}
                placeholder="+57 300 000 0000"
              />
            </div>
            <div className="v4-pf-field">
              <label>Ciudad</label>
              <input
                value={form.city}
                onChange={e => setForm({ ...form, city: e.target.value })}
                placeholder="Medellín"
              />
            </div>
          </div>
          <div className="v4-pf-field full">
            <label>Bio</label>
            <textarea
              rows={3}
              value={form.bio}
              onChange={e => setForm({ ...form, bio: e.target.value })}
              placeholder="Cuéntanos sobre ti..."
            />
          </div>
          <button className="v4-save-profile-btn" onClick={handleSave} disabled={saving}>
            {saving ? <><Loader2 size={16} className="v4-spin-sm" /> Guardando...</> : "Guardar cambios"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════
// MAIN DASHBOARD
// ══════════════════════════════════════════════════════════════
export default function TouristDashboard() {
  const { user, profile: authProfile, logout } = useAuth();
  const navigate = useNavigate();

  const [profile,       setProfile]       = useState(authProfile);
  const [bookings,      setBookings]       = useState([]);
  const [tours,         setTours]          = useState([]);
  const [favorites,     setFavorites]      = useState([]);
  const [notifications, setNotifications]  = useState([]);

  const [loading,       setLoading]        = useState(true);
  const [activeTab,     setActiveTab]      = useState("overview");
  const [isSidebarOpen, setIsSidebarOpen]  = useState(true);

  const [searchTerm,    setSearchTerm]     = useState("");
  const [filterStatus,  setFilterStatus]   = useState("all");
  const [filterCat,     setFilterCat]      = useState("all");

  const [toast,         setToast]          = useState(null);
  const [bookingModal,  setBookingModal]   = useState(null); // tour object
  const [bookingLoading, setBookingLoading] = useState(false);
  const [showNotifs,    setShowNotifs]     = useState(false);

  // ── SYNC profile desde auth ──────────────────────────────
  useEffect(() => { setProfile(authProfile); }, [authProfile]);

  // ── TOAST ─────────────────────────────────────────────────
  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  // ── BOOKINGS REALTIME ─────────────────────────────────────
  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "bookings"),
      where("touristId", "==", user.uid),
      orderBy("createdAt", "desc")
    );
    const unsub = onSnapshot(q, snap => {
      setBookings(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }, () => setLoading(false));
    return () => unsub();
  }, [user]);

  // ── TOURS ─────────────────────────────────────────────────
  useEffect(() => {
    const fetchTours = async () => {
      try {
        const q = query(collection(db, "tours"), where("active", "==", true), limit(40));
        const snap = await getDocs(q);
        setTours(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (e) { console.error(e); }
    };
    fetchTours();
  }, []);

  // ── FAVORITES REALTIME ────────────────────────────────────
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "favorites"), where("userId", "==", user.uid));
    const unsub = onSnapshot(q, snap => {
      setFavorites(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, [user]);

  // ── NOTIFICATIONS REALTIME ────────────────────────────────
  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "notifications"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc"),
      limit(15)
    );
    const unsub = onSnapshot(q, snap => {
      setNotifications(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, [user]);

  // ── FILTERED DATA ─────────────────────────────────────────
  const filteredBookings = useMemo(() => bookings.filter(b => {
    const matchSearch = b.tourTitle?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = filterStatus === "all" || b.status === filterStatus;
    return matchSearch && matchStatus;
  }), [bookings, searchTerm, filterStatus]);

  const filteredTours = useMemo(() => tours.filter(t => {
    const matchSearch =
      t.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.location?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCat = filterCat === "all" || t.category === filterCat;
    return matchSearch && matchCat;
  }), [tours, searchTerm, filterCat]);

  const categories = useMemo(() => {
    const cats = [...new Set(tours.map(t => t.category).filter(Boolean))];
    return cats;
  }, [tours]);

  // ── FAVORITES ─────────────────────────────────────────────
  const toggleFavorite = async (tourId) => {
    if (!user) return;
    try {
      const existing = favorites.find(f => f.tourId === tourId);
      if (existing) {
        await deleteDoc(doc(db, "favorites", existing.id));
        showToast("Eliminado de favoritos");
      } else {
        await addDoc(collection(db, "favorites"), {
          userId: user.uid, tourId, createdAt: serverTimestamp(),
        });
        showToast("Agregado a favoritos ♥");
      }
    } catch { showToast("Error actualizando favoritos", "error"); }
  };

  // ── CANCEL BOOKING ────────────────────────────────────────
  const handleCancelBooking = useCallback(async (id) => {
    if (!window.confirm("¿Cancelar esta reserva?")) return;
    try {
      await updateDoc(doc(db, "bookings", id), {
        status: "cancelled", updatedAt: serverTimestamp(),
      });
      showToast("Reserva cancelada");
    } catch { showToast("Error cancelando reserva", "error"); }
  }, []);

  // ── BOOK TOUR ─────────────────────────────────────────────
  const handleConfirmBooking = async ({ people, total }) => {
    if (!bookingModal || !user) return;
    setBookingLoading(true);
    try {
      await addDoc(collection(db, "bookings"), {
        touristId:   user.uid,
        touristName: profile?.name || user.email,
        touristEmail: user.email,
        guideId:     bookingModal.guideId,
        guideName:   bookingModal.guideName,
        tourId:      bookingModal.id,
        tourTitle:   bookingModal.title,
        tourImage:   bookingModal.imageUrl || "",
        people,
        totalPrice:  total,
        status:      "pending",
        createdAt:   serverTimestamp(),
      });
      setBookingModal(null);
      setActiveTab("bookings");
      showToast("¡Reserva enviada! El guía la confirmará pronto 🎉");
    } catch (e) {
      console.error(e);
      showToast("Error al reservar. Intenta de nuevo.", "error");
    }
    setBookingLoading(false);
  };

  // ── MARK NOTIF READ ───────────────────────────────────────
  const markAllRead = async () => {
    const unread = notifications.filter(n => !n.read);
    await Promise.all(
      unread.map(n => updateDoc(doc(db, "notifications", n.id), { read: true }))
    );
  };

  // ── LOGOUT ────────────────────────────────────────────────
  const handleLogout = async () => {
    try { await logout(); navigate("/login"); }
    catch (e) { console.error(e); }
  };

  // ── LOADING SCREEN ────────────────────────────────────────
  if (loading) return (
    <div className="v4-loading-screen">
      <div className="v4-loader-box">
        <Loader2 className="v4-spin" size={40} />
        <p>Cargando TourMate...</p>
      </div>
    </div>
  );

  const unreadCount = notifications.filter(n => !n.read).length;

  // ── STATS ─────────────────────────────────────────────────
  const stats = {
    active:    bookings.filter(b => b.status === "confirmed").length,
    pending:   bookings.filter(b => b.status === "pending").length,
    completed: bookings.filter(b => b.status === "completed").length,
    favorites: favorites.length,
  };

  // ── NAV ITEMS ─────────────────────────────────────────────
  const navItems = [
    { id: "overview",  label: "Dashboard",       icon: TrendingUp,  group: "EXPLORAR"       },
    { id: "explore",   label: "Tours Medellín",   icon: Compass,     group: "EXPLORAR"       },
    { id: "bookings",  label: "Mis Reservas",     icon: ShoppingBag, group: "MI ACTIVIDAD", badge: stats.pending },
    { id: "favorites", label: "Favoritos",        icon: Heart,       group: "MI ACTIVIDAD"   },
    { id: "profile",   label: "Mi Perfil",        icon: User,        group: "CONFIGURACIÓN"  },
    { id: "settings",  label: "Ajustes",          icon: Settings,    group: "CONFIGURACIÓN"  },
  ];
  const navGroups = [...new Set(navItems.map(n => n.group))];

  // ── RENDER ────────────────────────────────────────────────
  return (
    <div className={`v4-app-shell ${!isSidebarOpen ? "v4-shell-collapsed" : ""}`}>

      {/* ── SIDEBAR ── */}
      <aside className="v4-app-sidebar">
        <div className="v4-sidebar-header">
          <div className="v4-brand">
            <div className="v4-brand-logo">TM</div>
            {isSidebarOpen && <span>TourMate</span>}
          </div>
          <button className="v4-menu-toggle" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
            {isSidebarOpen ? <X size={19} /> : <Menu size={19} />}
          </button>
        </div>

        <nav className="v4-sidebar-nav">
          {navGroups.map(group => (
            <div key={group} className="v4-nav-group">
              {isSidebarOpen && <label>{group}</label>}
              {navItems.filter(n => n.group === group).map(item => (
                <button
                  key={item.id}
                  className={activeTab === item.id ? "active" : ""}
                  onClick={() => setActiveTab(item.id)}
                  title={!isSidebarOpen ? item.label : undefined}
                >
                  <item.icon size={19} />
                  {isSidebarOpen && <span>{item.label}</span>}
                  {isSidebarOpen && item.badge > 0 && (
                    <span className="v4-nav-badge">{item.badge}</span>
                  )}
                </button>
              ))}
            </div>
          ))}
        </nav>

        <div className="v4-sidebar-footer">
          <div className="v4-user-card">
            <div className="v4-user-avatar">{profile?.name?.charAt(0) || "T"}</div>
            {isSidebarOpen && (
              <div className="v4-user-info">
                <strong>{profile?.name || "Turista"}</strong>
                <small>Cuenta activa</small>
              </div>
            )}
            <button className="v4-logout-trigger" onClick={handleLogout} title="Cerrar sesión">
              <LogOut size={17} />
            </button>
          </div>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <main className="v4-app-main">

        {/* Header */}
        <header className="v4-main-header">
          <div className="v4-header-search">
            <Search size={19} />
            <input
              type="text"
              placeholder={activeTab === "bookings" ? "Buscar reservas..." : "Buscar experiencias..."}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button className="v4-search-clear" onClick={() => setSearchTerm("")}>
                <X size={15} />
              </button>
            )}
          </div>

          <div className="v4-header-actions">
            {/* Notifications */}
            <div className="v4-notif-wrapper">
              <button
                className="v4-icon-btn"
                onClick={() => { setShowNotifs(!showNotifs); if (!showNotifs) markAllRead(); }}
              >
                <Bell size={21} />
                {unreadCount > 0 && <span className="v4-notif-dot">{unreadCount}</span>}
              </button>

              {showNotifs && (
                <div className="v4-notif-panel">
                  <div className="v4-notif-header">
                    <h4>Notificaciones</h4>
                    <button onClick={() => setShowNotifs(false)}><X size={16} /></button>
                  </div>
                  {notifications.length === 0 ? (
                    <div className="v4-notif-empty">Sin notificaciones</div>
                  ) : (
                    notifications.map(n => (
                      <div key={n.id} className={`v4-notif-item ${!n.read ? "unread" : ""}`}>
                        <p>{n.message || n.title}</p>
                        <small>{n.createdAt?.toDate?.()?.toLocaleDateString("es-CO") || ""}</small>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            <button className="v4-btn-map" onClick={() => navigate("/")}>
              Ver Mapa
            </button>
          </div>
        </header>

        {/* Content */}
        <div className="v4-main-content">

          {/* ════ OVERVIEW ════ */}
          {activeTab === "overview" && (
            <div className="v4-fade-content">
              <div className="v4-welcome-hero">
                <div className="v4-hero-info">
                  <h1>¡Hola, {profile?.name || "Explorador"}! 👋</h1>
                  <p>Descubre experiencias únicas en Medellín con guías locales.</p>
                  <div className="v4-hero-stats">
                    <div className="v4-h-stat"><strong>{bookings.length}</strong><span>Viajes</span></div>
                    <div className="v4-h-stat"><strong>{stats.completed}</strong><span>Completados</span></div>
                    <div className="v4-h-stat"><strong>{stats.favorites}</strong><span>Favoritos</span></div>
                  </div>
                </div>
              </div>

              <div className="v4-stats-container">
                <StatCard icon={Zap}        label="Reservas Activas" value={stats.active}    colorClass="v4-c-blue"   />
                <StatCard icon={Clock}      label="Pendientes"       value={stats.pending}   colorClass="v4-c-orange" />
                <StatCard icon={Award}      label="Completados"      value={stats.completed} colorClass="v4-c-purple" />
                <StatCard icon={Heart}      label="Favoritos"        value={stats.favorites} colorClass="v4-c-red"    />
              </div>

              {/* Tours recomendados */}
              <section className="v4-recent-tours">
                <div className="v4-section-header">
                  <div>
                    <h2>Tours Recomendados</h2>
                    <p>Experiencias seleccionadas para ti</p>
                  </div>
                  <button className="v4-btn-link" onClick={() => setActiveTab("explore")}>
                    Ver todos <ChevronRight size={15} />
                  </button>
                </div>
                <div className="v4-tours-horizontal-grid">
                  {tours.slice(0, 4).map(tour => (
                    <TourCard
                      key={tour.id}
                      tour={tour}
                      isFavorite={favorites.some(f => f.tourId === tour.id)}
                      onFavorite={toggleFavorite}
                      onBook={t => setBookingModal(t)}
                    />
                  ))}
                </div>
              </section>

              {/* Últimas reservas */}
              {bookings.length > 0 && (
                <section className="v4-recent-tours" style={{ marginTop: 36 }}>
                  <div className="v4-section-header">
                    <div><h2>Últimas reservas</h2></div>
                    <button className="v4-btn-link" onClick={() => setActiveTab("bookings")}>
                      Ver todas <ChevronRight size={15} />
                    </button>
                  </div>
                  <div className="v4-booking-table">
                    {bookings.slice(0, 3).map(b => (
                      <BookingRow key={b.id} booking={b} onCancel={handleCancelBooking} />
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}

          {/* ════ EXPLORE ════ */}
          {activeTab === "explore" && (
            <div className="v4-fade-content">
              <div className="v4-view-header">
                <div>
                  <h1>Catálogo de Experiencias</h1>
                  <p>{filteredTours.length} tour{filteredTours.length !== 1 ? "s" : ""} disponible{filteredTours.length !== 1 ? "s" : ""}</p>
                </div>
              </div>

              {/* Category filters */}
              {categories.length > 0 && (
                <div className="v4-pill-container">
                  <button
                    className={filterCat === "all" ? "active" : ""}
                    onClick={() => setFilterCat("all")}
                  >
                    Todos
                  </button>
                  {categories.map(cat => (
                    <button
                      key={cat}
                      className={filterCat === cat ? "active" : ""}
                      onClick={() => setFilterCat(cat)}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              )}

              {filteredTours.length === 0 ? (
                <div className="v4-empty-state">
                  <Compass size={70} />
                  <h3>Sin tours disponibles</h3>
                  <p>Intenta con otro filtro o busca algo diferente.</p>
                </div>
              ) : (
                <div className="v4-explore-masonry">
                  {filteredTours.map(tour => (
                    <TourCard
                      key={tour.id}
                      tour={tour}
                      isFavorite={favorites.some(f => f.tourId === tour.id)}
                      onFavorite={toggleFavorite}
                      onBook={t => setBookingModal(t)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ════ BOOKINGS ════ */}
          {activeTab === "bookings" && (
            <div className="v4-fade-content">
              <div className="v4-view-header">
                <div>
                  <h1>Mis Reservas</h1>
                  <p>Gestiona todas tus experiencias</p>
                </div>
              </div>

              {/* Status pills */}
              <div className="v4-pill-container" style={{ marginBottom: 24 }}>
                {["all","pending","confirmed","completed","cancelled"].map(s => (
                  <button
                    key={s}
                    className={filterStatus === s ? "active" : ""}
                    onClick={() => setFilterStatus(s)}
                  >
                    {s === "all" ? "Todos" : STATUS_MAP[s]?.label || s}
                  </button>
                ))}
              </div>

              {filteredBookings.length === 0 ? (
                <div className="v4-empty-state">
                  <ShoppingBag size={70} />
                  <h3>{filterStatus === "all" ? "No tienes reservas" : "Sin reservas en este estado"}</h3>
                  <p>Explora experiencias increíbles y haz tu primera reserva.</p>
                  <button className="v4-btn-primary-lg" onClick={() => setActiveTab("explore")}>
                    Explorar tours
                  </button>
                </div>
              ) : (
                <div className="v4-booking-table">
                  {filteredBookings.map(b => (
                    <BookingRow key={b.id} booking={b} onCancel={handleCancelBooking} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ════ FAVORITES ════ */}
          {activeTab === "favorites" && (
            <div className="v4-fade-content">
              <div className="v4-view-header">
                <div>
                  <h1>Mis Favoritos</h1>
                  <p>{favorites.length} experiencia{favorites.length !== 1 ? "s" : ""} guardada{favorites.length !== 1 ? "s" : ""}</p>
                </div>
              </div>

              {favorites.length === 0 ? (
                <div className="v4-empty-state">
                  <Heart size={70} />
                  <h3>Sin favoritos aún</h3>
                  <p>Guarda tus tours preferidos tocando el corazón ♥</p>
                  <button className="v4-btn-primary-lg" onClick={() => setActiveTab("explore")}>
                    Explorar tours
                  </button>
                </div>
              ) : (
                <div className="v4-explore-masonry">
                  {tours
                    .filter(t => favorites.some(f => f.tourId === t.id))
                    .map(tour => (
                      <TourCard
                        key={tour.id}
                        tour={tour}
                        isFavorite={true}
                        onFavorite={toggleFavorite}
                        onBook={t => setBookingModal(t)}
                      />
                    ))
                  }
                </div>
              )}
            </div>
          )}

          {/* ════ PROFILE ════ */}
          {activeTab === "profile" && (
            <ProfileTab
              profile={profile}
              user={user}
              onUpdate={updates => setProfile(p => ({ ...p, ...updates }))}
              showToast={showToast}
            />
          )}

          {/* ════ SETTINGS ════ */}
          {activeTab === "settings" && (
            <div className="v4-fade-content">
              <div className="v4-view-header">
                <div><h1>Ajustes</h1><p>Configuración de tu cuenta</p></div>
              </div>
              <div className="v4-settings-card">
                <div className="v4-settings-row">
                  <div>
                    <h4>Correo electrónico</h4>
                    <p>{user?.email}</p>
                  </div>
                </div>
                <div className="v4-settings-row danger-row">
                  <div>
                    <h4>Cerrar sesión</h4>
                    <p>Salir de tu cuenta en este dispositivo</p>
                  </div>
                  <button className="v4-settings-btn danger" onClick={handleLogout}>
                    <LogOut size={16} /> Cerrar sesión
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ── BOOKING MODAL ── */}
      {bookingModal && (
        <BookingModal
          tour={bookingModal}
          onClose={() => setBookingModal(null)}
          onConfirm={handleConfirmBooking}
          loading={bookingLoading}
        />
      )}

      {/* ── TOAST ── */}
      {toast && <div className={`v4-toast v4-toast-${toast.type}`}>{toast.msg}</div>}
    </div>
  );
}