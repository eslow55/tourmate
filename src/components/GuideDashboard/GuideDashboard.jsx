import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { auth, db } from '../../firebase/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import '../../styles/GuideDashboard.css';

/**
 * Componente: GuideDashboard
 * Descripción: Estructura base para el panel del guía profesional en Medellín.
 */
const GuideDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [guideData, setGuideData] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [scrolled, setScrolled] = useState(false);

  // --- CARGA DE DATOS DEL GUÍA ---
  useEffect(() => {
    const fetchGuideProfile = async () => {
      const user = auth.currentUser;
      if (user) {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setGuideData(docSnap.data());
        }
      }
    };
    fetchGuideProfile();

    // Efecto de scroll para el header
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    if (window.confirm("¿Deseas cerrar tu sesión de guía?")) {
      await signOut(auth);
      navigate('/login');
    }
  };

  const navLinks = [
    { path: '/guide/my-tours', label: 'Mis Tours', icon: '🗺️' },
    { path: '/guide/create-tour', label: 'Publicar Nuevo', icon: '➕' },
    { path: '/guide/bookings', label: 'Reservas', icon: '📅' },
    { path: '/guide/stats', label: 'Mis Ganancias', icon: '💰' },
    { path: '/guide/profile', label: 'Mi Perfil', icon: '👤' }
  ];

  return (
    <div className={`guide-layout ${!isSidebarOpen ? 'collapsed' : ''}`}>
      {/* --- SIDEBAR --- */}
      <aside className="guide-sidebar">
        <div className="sidebar-brand">
          <div className="brand-icon">T</div>
          <h3 className="guide-brand-text">Tour<span>Mate</span></h3>
        </div>

        <div className="guide-profile-card">
          <div className="guide-avatar">
            {guideData?.name?.charAt(0) || 'G'}
          </div>
          <div className="guide-meta">
            <p className="guide-name">{guideData?.name || 'Cargando...'}</p>
            <span className={`status-badge ${guideData?.status}`}>
              {guideData?.status === 'approved' ? '✓ Verificado' : '⏳ Pendiente'}
            </span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <p className="nav-group-title">MENÚ PRINCIPAL</p>
          {navLinks.map((link) => (
            <Link 
              key={link.path}
              to={link.path} 
              className={`nav-item ${location.pathname === link.path ? 'active' : ''}`}
            >
              <span className="icon">{link.icon}</span>
              <span className="label">{link.label}</span>
              {location.pathname === link.path && <div className="active-dot" />}
            </Link>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <button onClick={handleLogout} className="logout-btn">
            <span className="icon">🚪</span>
            <span className="label">Salir del Panel</span>
          </button>
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="dashboard-content">
        <header className={`content-header ${scrolled ? 'glass-header' : ''}`}>
          <div className="header-left">
            <button className="menu-toggle" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
              {isSidebarOpen ? '◀' : '▶'}
            </button>
            <div className="breadcrumb">
              <span>TourMate</span> / 
              <span className="current-page"> {location.pathname.split('/').pop()}</span>
            </div>
          </div>

          <div className="header-right">
            <div className="notification-wrapper">
              <span className="bell">🔔</span>
              <span className="notify-dot"></span>
            </div>
            <div className="medellin-clock">
              📍 Medellín: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        </header>

        <div className="guide-view-container animate-fade-in">
          <div className="view-inner-card">
            <Outlet />
          </div>
        </div>

        <footer className="dashboard-footer">
          <p>&copy; 2026 TourMate Medellín - Plataforma de Guías Profesionales</p>
          <div className="footer-links">
            <a href="#help">Centro de Ayuda</a>
            <a href="#terms">Términos de Servicio</a>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default GuideDashboard;