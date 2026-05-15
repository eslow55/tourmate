import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { auth } from '../../firebase/firebaseConfig';
import { signOut } from 'firebase/auth';
import "../../styles/AdminDashboard.css";

/**
 * Componente: AdminDashboard
 * Rol: Centro de comando para la validación de guías y tours.
 */
const AdminDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Reloj en tiempo real para el panel de control
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error("Error al cerrar sesión", error);
    }
  };

  const menuItems = [
    { path: '/admin/guides', label: 'Validar Guías', icon: '👥', key: 'guides' },
    { path: '/admin/tours', label: 'Validar Tours', icon: '🗺️', key: 'tours' },
    { path: '/admin/analytics', label: 'Estadísticas', icon: '📊', key: 'analytics' },
    { path: '/admin/settings', label: 'Configuración', icon: '⚙️', key: 'settings' }
  ];

  return (
    <div className={`admin-layout ${!isSidebarOpen ? 'sidebar-closed' : ''}`}>
      {/* --- BARRA LATERAL (SIDEBAR) --- */}
      <aside className="admin-sidebar">
        <div className="sidebar-brand">
          <div className="logo-icon">TM</div>
          <h3 className="brand-text">TourMate<span>Admin</span></h3>
        </div>

        <div className="admin-profile-brief">
          <div className="avatar-admin">A</div>
          <div className="admin-info">
            <p className="admin-name">Super Administrador</p>
            <p className="admin-status"><span>•</span> En línea</p>
          </div>
        </div>

        <nav className="admin-nav">
          <p className="nav-label">Gestión Principal</p>
          {menuItems.map((item) => (
            <Link 
              key={item.key}
              to={item.path} 
              className={`admin-nav-item ${location.pathname.includes(item.key) ? 'active' : ''}`}
            >
              <span className="admin-icon">{item.icon}</span>
              <span className="admin-label">{item.label}</span>
              {location.pathname.includes(item.key) && <div className="active-indicator" />}
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button onClick={handleLogout} className="btn-logout-admin">
            <span className="icon">🚪</span> Cerrar Sesión Segura
          </button>
        </div>
      </aside>

      {/* --- CONTENIDO PRINCIPAL --- */}
      <main className="admin-main">
        <header className="admin-header">
          <div className="header-left">
            <button 
              className="toggle-sidebar" 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              ☰
            </button>
            <div className="header-titles">
              <h1>Panel de Control Total</h1>
              <p>Monitoreo global de operaciones en Medellín</p>
            </div>
          </div>

          <div className="header-right">
            <div className="admin-clock">
              <span className="date">{currentTime.toLocaleDateString()}</span>
              <span className="time">{currentTime.toLocaleTimeString()}</span>
            </div>
            <div className="notification-bell">
              🔔<span className="badge">3</span>
            </div>
          </div>
        </header>

        <section className="admin-view-viewport">
          {/* Aquí se renderizan Guides, Tours o Analytics */}
          <div className="glass-container">
            <Outlet />
          </div>
        </section>

        <footer className="admin-footer-bar">
          <p>&copy; 2026 TourMate Medellín - Nodo Central de Seguridad</p>
          <div className="system-status">
            Servidores: <span className="status-ok">Operativos</span>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default AdminDashboard;