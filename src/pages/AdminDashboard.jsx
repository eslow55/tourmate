// ============================================================
// AdminDashboard.jsx — Tourmate Admin Panel
// Funcional: usuarios, aprobar guías, aprobar turistas,
// tours, estadísticas, tiempo real con Firestore
// ============================================================
import { useState, useEffect } from "react";
import {
  auth,
  getAllUsers,
  approveGuide,
  rejectGuide,
  getAllTours,
  adminDeleteTour,
  updateTour,
  getStats,
  approveTourist,
  suspendTourist,
} from "../firebase/firebaseConfig";
import { signOut } from "firebase/auth";
import "../styles/AdminDashboard.css";

const TABS = ["stats", "guias", "turistas", "tours"];
const TAB_LABELS = {
  stats:    "Estadísticas",
  guias:    "Guías",
  turistas: "Turistas",
  tours:    "Tours",
};
const TAB_ICONS = {
  stats:    "📊",
  guias:    "🧭",
  turistas: "🧳",
  tours:    "🗺",
};

export default function AdminDashboard({ user, profile }) {
  const [activeTab,  setActiveTab]  = useState("stats");
  const [users,      setUsers]      = useState([]);
  const [tours,      setTours]      = useState([]);
  const [stats,      setStats]      = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [toast,      setToast]      = useState(null);
  const [search,     setSearch]     = useState("");
  const [confirm,    setConfirm]    = useState(null); // { msg, onConfirm }

  useEffect(() => { loadData(); }, []);

  // ── DATA ────────────────────────────────────────────────────
  const loadData = async () => {
    setLoading(true);
    try {
      const [usersData, toursData, statsData] = await Promise.all([
        getAllUsers(),
        getAllTours(),
        getStats(),
      ]);
      setUsers(usersData);
      setTours(toursData);
      setStats(statsData);
    } catch {
      showToast("Error cargando datos", "error");
    }
    setLoading(false);
  };

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const askConfirm = (msg, onConfirm) => setConfirm({ msg, onConfirm });
  const closeConfirm = () => setConfirm(null);

  // ── GUÍAS ───────────────────────────────────────────────────
  const handleApprove = async (uid) => {
    try {
      await approveGuide(uid);
      setUsers(u => u.map(x => x.id === uid ? { ...x, status: "active" } : x));
      showToast("Guía aprobado ✓");
    } catch { showToast("Error aprobando guía", "error"); }
  };

  const handleReject = async (uid) => {
    askConfirm("¿Rechazar / suspender este guía?", async () => {
      try {
        await rejectGuide(uid);
        setUsers(u => u.map(x => x.id === uid ? { ...x, status: "rejected" } : x));
        showToast("Guía rechazado");
      } catch { showToast("Error rechazando guía", "error"); }
      closeConfirm();
    });
  };

  // ── TURISTAS ────────────────────────────────────────────────
  const handleApproveTourist = async (uid) => {
    try {
      await approveTourist(uid);
      setUsers(u => u.map(x => x.id === uid ? { ...x, status: "active" } : x));
      showToast("Turista aprobado ✓");
    } catch { showToast("Error aprobando turista", "error"); }
  };

  const handleSuspendTourist = async (uid) => {
    askConfirm("¿Suspender este turista?", async () => {
      try {
        await suspendTourist(uid);
        setUsers(u => u.map(x => x.id === uid ? { ...x, status: "suspended" } : x));
        showToast("Turista suspendido");
      } catch { showToast("Error suspendiendo turista", "error"); }
      closeConfirm();
    });
  };

  // ── TOURS ───────────────────────────────────────────────────
  const handleDeleteTour = (tourId) => {
    askConfirm("¿Eliminar este tour permanentemente?", async () => {
      try {
        await adminDeleteTour(tourId);
        setTours(t => t.filter(x => x.id !== tourId));
        showToast("Tour eliminado");
      } catch { showToast("Error eliminando tour", "error"); }
      closeConfirm();
    });
  };

  const handleToggleTour = async (tour) => {
    try {
      await updateTour(tour.id, { active: !tour.active });
      setTours(t => t.map(x => x.id === tour.id ? { ...x, active: !x.active } : x));
      showToast(tour.active ? "Tour desactivado" : "Tour activado ✓");
    } catch { showToast("Error actualizando tour", "error"); }
  };

  // ── DERIVED DATA ─────────────────────────────────────────────
  const guides   = users.filter(u => u.role === "guide");
  const tourists = users.filter(u => u.role === "tourist");
  const pendingGuides   = guides.filter(g => g.status === "pending");
  const pendingTourists = tourists.filter(t => !t.status || t.status === "pending");

  const filteredGuides = guides.filter(g =>
    g.name?.toLowerCase().includes(search.toLowerCase()) ||
    g.email?.toLowerCase().includes(search.toLowerCase())
  );
  const filteredTourists = tourists.filter(t =>
    t.name?.toLowerCase().includes(search.toLowerCase()) ||
    t.email?.toLowerCase().includes(search.toLowerCase())
  );
  const filteredTours = tours.filter(t =>
    t.title?.toLowerCase().includes(search.toLowerCase()) ||
    t.location?.toLowerCase().includes(search.toLowerCase())
  );

  const totalPending = pendingGuides.length + pendingTourists.length;

  // ── RENDER ───────────────────────────────────────────────────
  return (
    <div className="ad-root">
      {/* ── SIDEBAR ── */}
      <aside className="ad-sidebar">
        <div className="ad-brand">
          <div className="ad-brand-icon">🌿</div>
          <span className="ad-brand-name">Tourmate</span>
        </div>

        <div className="ad-profile-card">
          <div className="ad-avatar">{profile?.name?.[0]?.toUpperCase() || "A"}</div>
          <div>
            <p className="ad-profile-name">{profile?.name || "Admin"}</p>
            <p className="ad-profile-role">Administrador</p>
          </div>
        </div>

        {totalPending > 0 && (
          <div className="ad-alert">
            <span className="ad-alert-dot" />
            <p>
              {totalPending} solicitud{totalPending > 1 ? "es" : ""} pendiente{totalPending > 1 ? "s" : ""}
            </p>
          </div>
        )}

        <nav className="ad-nav">
          {TABS.map(tab => {
            const badge =
              tab === "guias"    ? pendingGuides.length :
              tab === "turistas" ? pendingTourists.length : 0;
            return (
              <button
                key={tab}
                className={`ad-nav-btn ${activeTab === tab ? "active" : ""}`}
                onClick={() => { setActiveTab(tab); setSearch(""); }}
              >
                <span className="ad-nav-icon">{TAB_ICONS[tab]}</span>
                <span>{TAB_LABELS[tab]}</span>
                {badge > 0 && <span className="ad-badge">{badge}</span>}
              </button>
            );
          })}
        </nav>

        <button className="ad-logout" onClick={() => signOut(auth)}>
          <span>↩</span> Cerrar sesión
        </button>
      </aside>

      {/* ── MAIN ── */}
      <main className="ad-main">
        {loading ? (
          <div className="ad-loading">
            <div className="ad-spinner" />
            <p>Cargando panel...</p>
          </div>
        ) : (
          <>
            {/* ════ ESTADÍSTICAS ════ */}
            {activeTab === "stats" && stats && (
              <div className="ad-section">
                <div className="ad-section-header">
                  <h1>Panel de Control</h1>
                  <p>Visión general de la plataforma Tourmate</p>
                </div>

                <div className="ad-stats-grid">
                  {[
                    { label: "Usuarios totales",    value: stats.totalUsers,                              icon: "👤", color: "blue"   },
                    { label: "Tours activos",        value: stats.totalTours,                              icon: "🗺", color: "green"  },
                    { label: "Reservas totales",     value: stats.totalBookings,                           icon: "📋", color: "orange" },
                    { label: "Reseñas",              value: stats.totalReviews,                            icon: "⭐", color: "yellow" },
                    { label: "Pendientes de aprov.", value: totalPending,                                  icon: "⏳", color: "red"    },
                    { label: "Ingresos confirmados", value: `$${(stats.totalRevenue || 0).toLocaleString()} COP`, icon: "💰", color: "teal"  },
                  ].map(s => (
                    <div key={s.label} className={`ad-stat-card ad-stat-${s.color}`}>
                      <div className="ad-stat-icon">{s.icon}</div>
                      <div className="ad-stat-value">{s.value}</div>
                      <div className="ad-stat-label">{s.label}</div>
                    </div>
                  ))}
                </div>

                <div className="ad-breakdown">
                  <div className="ad-breakdown-card">
                    <h3>Distribución de usuarios</h3>
                    {[
                      { label: "Turistas activos",  count: tourists.filter(t => t.status === "active").length,  total: stats.totalUsers, color: "var(--green-mid)"  },
                      { label: "Turistas pendientes",count: pendingTourists.length,                               total: stats.totalUsers, color: "#f4a261"           },
                      { label: "Guías activos",      count: guides.filter(g => g.status === "active").length,    total: stats.totalUsers, color: "var(--earth-warm)" },
                      { label: "Guías pendientes",   count: pendingGuides.length,                                 total: stats.totalUsers, color: "#e74c3c"           },
                    ].map(row => (
                      <div key={row.label} className="ad-breakdown-row">
                        <span>{row.label}</span>
                        <div className="ad-bar-wrap">
                          <div
                            className="ad-bar"
                            style={{
                              width: `${Math.round((row.count / (row.total || 1)) * 100)}%`,
                              background: row.color,
                            }}
                          />
                        </div>
                        <strong>{row.count}</strong>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ════ GUÍAS ════ */}
            {activeTab === "guias" && (
              <div className="ad-section">
                <div className="ad-section-header">
                  <h1>Guías Turísticos</h1>
                  <p>Aprueba o rechaza solicitudes de guías certificados</p>
                </div>

                <input
                  className="ad-search"
                  placeholder="🔍 Buscar guía por nombre o email..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />

                {pendingGuides.length > 0 && (
                  <div className="ad-pending-banner">
                    ⚠️ Tienes <strong>{pendingGuides.length}</strong> guía{pendingGuides.length > 1 ? "s" : ""} esperando aprobación
                  </div>
                )}

                <div className="ad-users-table">
                  <div className="ad-table-header ad-th-guides">
                    <span>Guía</span>
                    <span>Email</span>
                    <span>Estado</span>
                    <span>Acciones</span>
                  </div>

                  {filteredGuides.length === 0 && (
                    <p className="ad-empty">No se encontraron guías</p>
                  )}

                  {filteredGuides.map(g => (
                    <div key={g.id} className="ad-table-row ad-th-guides">
                      <div className="ad-user-info">
                        <div className="ad-user-avatar">
                          {g.name?.[0]?.toUpperCase()}
                        </div>
                        <div>
                          <strong>{g.name}</strong>
                          <p className="ad-user-date">
                            {g.createdAt?.toDate?.()?.toLocaleDateString("es-CO") || "—"}
                          </p>
                        </div>
                      </div>

                      <span className="ad-email">{g.email}</span>

                      <span className={`ad-status ad-status-${g.status || "pending"}`}>
                        {g.status === "active"   && "✅ Activo"}
                        {g.status === "rejected" && "❌ Rechazado"}
                        {(g.status === "pending" || !g.status) && "⏳ Pendiente"}
                      </span>

                      <div className="ad-row-actions">
                        {(g.status === "pending" || !g.status) && (
                          <>
                            <button className="ad-btn-approve" onClick={() => handleApprove(g.id)}>Aprobar</button>
                            <button className="ad-btn-reject"  onClick={() => handleReject(g.id)}>Rechazar</button>
                          </>
                        )}
                        {g.status === "active" && (
                          <button className="ad-btn-reject" onClick={() => handleReject(g.id)}>Suspender</button>
                        )}
                        {g.status === "rejected" && (
                          <button className="ad-btn-approve" onClick={() => handleApprove(g.id)}>Reactivar</button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ════ TURISTAS ════ */}
            {activeTab === "turistas" && (
              <div className="ad-section">
                <div className="ad-section-header">
                  <h1>Turistas Registrados</h1>
                  <p>Aprueba nuevas cuentas de turistas o gestiona las existentes</p>
                </div>

                <input
                  className="ad-search"
                  placeholder="🔍 Buscar turista por nombre o email..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />

                {pendingTourists.length > 0 && (
                  <div className="ad-pending-banner">
                    ⚠️ Tienes <strong>{pendingTourists.length}</strong> turista{pendingTourists.length > 1 ? "s" : ""} esperando aprobación
                  </div>
                )}

                <div className="ad-users-table">
                  <div className="ad-table-header ad-th-tourists">
                    <span>Turista</span>
                    <span>Email</span>
                    <span>Registro</span>
                    <span>Estado</span>
                    <span>Acciones</span>
                  </div>

                  {filteredTourists.length === 0 && (
                    <p className="ad-empty">No se encontraron turistas</p>
                  )}

                  {filteredTourists.map(t => (
                    <div key={t.id} className="ad-table-row ad-th-tourists">
                      <div className="ad-user-info">
                        <div className="ad-user-avatar ad-tourist-avatar">
                          {t.name?.[0]?.toUpperCase()}
                        </div>
                        <strong>{t.name}</strong>
                      </div>

                      <span className="ad-email">{t.email}</span>

                      <span className="ad-date">
                        {t.createdAt?.toDate?.()?.toLocaleDateString("es-CO") || "—"}
                      </span>

                      <span className={`ad-status ${
                        t.status === "active"    ? "ad-status-active"   :
                        t.status === "suspended" ? "ad-status-rejected" :
                        "ad-status-pending"
                      }`}>
                        {t.status === "active"    && "✅ Activo"}
                        {t.status === "suspended" && "🚫 Suspendido"}
                        {(!t.status || t.status === "pending") && "⏳ Pendiente"}
                      </span>

                      <div className="ad-row-actions">
                        {(!t.status || t.status === "pending") && (
                          <button className="ad-btn-approve" onClick={() => handleApproveTourist(t.id)}>
                            Aprobar
                          </button>
                        )}
                        {t.status === "active" && (
                          <button className="ad-btn-reject" onClick={() => handleSuspendTourist(t.id)}>
                            Suspender
                          </button>
                        )}
                        {t.status === "suspended" && (
                          <button className="ad-btn-approve" onClick={() => handleApproveTourist(t.id)}>
                            Reactivar
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ════ TOURS ════ */}
            {activeTab === "tours" && (
              <div className="ad-section">
                <div className="ad-section-header">
                  <h1>Gestión de Tours</h1>
                  <p>Todos los tours publicados en la plataforma</p>
                </div>

                <input
                  className="ad-search"
                  placeholder="🔍 Buscar por título o ubicación..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />

                <div className="ad-tours-list">
                  {filteredTours.length === 0 && (
                    <p className="ad-empty">No se encontraron tours</p>
                  )}
                  {filteredTours.map(tour => (
                    <div key={tour.id} className="ad-tour-row">
                      <div className="ad-tour-img-sm">
                        {tour.imageUrl
                          ? <img src={tour.imageUrl} alt={tour.title} />
                          : <span>🏔</span>
                        }
                      </div>

                      <div className="ad-tour-info">
                        <h3>{tour.title}</h3>
                        <p>📍 {tour.location} · 👤 {tour.guideName} · 💰 ${Number(tour.price).toLocaleString()} COP</p>
                        <p>👥 {tour.currentEnrollments || 0}/{tour.maxCapacity} inscritos · ⏱ {tour.duration}</p>
                      </div>

                      <div className="ad-tour-actions">
                        <span className={`ad-status ${tour.active ? "ad-status-active" : "ad-status-rejected"}`}>
                          {tour.active ? "✅ Activo" : "❌ Inactivo"}
                        </span>
                        <button className="ad-btn-toggle" onClick={() => handleToggleTour(tour)}>
                          {tour.active ? "Desactivar" : "Activar"}
                        </button>
                        <button className="ad-btn-del" onClick={() => handleDeleteTour(tour.id)}>
                          🗑 Eliminar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* ── CONFIRM DIALOG ── */}
      {confirm && (
        <div className="ad-confirm-overlay" onClick={closeConfirm}>
          <div className="ad-confirm-box" onClick={e => e.stopPropagation()}>
            <p>{confirm.msg}</p>
            <div className="ad-confirm-actions">
              <button className="ad-confirm-cancel" onClick={closeConfirm}>Cancelar</button>
              <button className="ad-confirm-ok"     onClick={confirm.onConfirm}>Confirmar</button>
            </div>
          </div>
        </div>
      )}

      {/* ── TOAST ── */}
      {toast && (
        <div className={`ad-toast ad-toast-${toast.type}`}>{toast.msg}</div>
      )}
    </div>
  );
}