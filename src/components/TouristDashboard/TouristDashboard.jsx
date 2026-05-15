import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { auth, db } from '../../firebase/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';

const TouristDashboard = () => {
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      const user = auth.currentUser;
      if (user) {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) setUserData(docSnap.data());
      }
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
    if (window.confirm("¿Deseas cerrar tu sesión en TourMate?")) {
      await signOut(auth);
      navigate('/login');
    }
  };

  return (
    <div className="tm-dashboard-layout">
      {/* SIDEBAR RE-DISEÑADO */}
      <aside className="tm-sidebar">
        <div className="tm-brand">
          <div className="tm-logo-sq">TM</div>
          <span className="tm-brand-name">TourMate<span>.</span></span>
        </div>

        <nav className="tm-nav-menu">
          <div className="tm-nav-section">
            <p className="tm-section-label">Exploración</p>
            <NavLink to="/tourist/explore" className={({ isActive }) => isActive ? 'tm-nav-link active' : 'tm-nav-link'}>
              <span className="tm-icon">🌎</span> <span className="tm-label">Descubrir Medellín</span>
            </NavLink>
          </div>

          <div className="tm-nav-section">
            <p className="tm-section-label">Mi Actividad</p>
            <NavLink to="/tourist/my-bookings" className={({ isActive }) => isActive ? 'tm-nav-link active' : 'tm-nav-link'}>
              <span className="tm-icon">📅</span> <span className="tm-label">Mis Reservas</span>
            </NavLink>
          </div>

          <div className="tm-nav-section">
            <p className="tm-section-label">Usuario</p>
            <NavLink to="/tourist/profile" className={({ isActive }) => isActive ? 'tm-nav-link active' : 'tm-nav-link'}>
              <span className="tm-icon">👤</span> <span className="tm-label">Perfil</span>
            </NavLink>
          </div>
        </nav>

        <div className="tm-sidebar-footer">
          <button onClick={handleLogout} className="tm-btn-logout">
             Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* CONTENIDO DINÁMICO */}
      <main className="tm-main-viewport">
        <header className="tm-top-header">
          <div className="tm-welcome-box">
            <p>Hola, <strong>{userData?.name || 'Viajero'}</strong></p>
            <div className="tm-user-avatar">
              {userData?.name?.charAt(0) || 'U'}
            </div>
          </div>
        </header>

        <div className="tm-page-content">
          <Outlet />
        </div>
      </main>

      <style>{`
        .tm-dashboard-layout { display: flex; min-height: 100vh; background: #f1f5f9; font-family: 'Inter', system-ui, sans-serif; }
        .tm-sidebar { width: 280px; background: white; border-right: 1px solid #e2e8f0; display: flex; flex-direction: column; position: sticky; top: 0; height: 100vh; transition: 0.3s; }
        .tm-brand { padding: 40px 30px; display: flex; align-items: center; gap: 15px; }
        .tm-logo-sq { background: linear-gradient(135deg, #ff5a3c, #ff7b5f); color: white; width: 45px; height: 45px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 1.2rem; box-shadow: 0 4px 12px rgba(255, 90, 60, 0.3); }
        .tm-brand-name { font-size: 1.6rem; font-weight: 800; color: #0f172a; letter-spacing: -1px; }
        .tm-brand-name span { color: #ff5a3c; }
        .tm-nav-menu { flex: 1; padding: 0 20px; }
        .tm-section-label { font-size: 0.75rem; text-transform: uppercase; color: #94a3b8; font-weight: 700; margin: 25px 0 10px 15px; letter-spacing: 1px; }
        .tm-nav-link { display: flex; align-items: center; gap: 12px; padding: 14px 18px; text-decoration: none; color: #64748b; font-weight: 600; border-radius: 14px; margin-bottom: 6px; transition: all 0.2s ease; }
        .tm-nav-link:hover { background: #f8fafc; color: #ff5a3c; transform: translateX(5px); }
        .tm-nav-link.active { background: #fff1f0; color: #ff5a3c; }
        .tm-sidebar-footer { padding: 25px; border-top: 1px solid #f1f5f9; }
        .tm-btn-logout { width: 100%; padding: 14px; background: #fef2f2; color: #ef4444; border: none; border-radius: 12px; font-weight: 700; cursor: pointer; transition: 0.2s; }
        .tm-btn-logout:hover { background: #fee2e2; }
        .tm-main-viewport { flex: 1; display: flex; flex-direction: column; overflow-y: auto; }
        .tm-top-header { height: 90px; background: white; padding: 0 40px; display: flex; align-items: center; justify-content: flex-end; border-bottom: 1px solid #e2e8f0; }
        .tm-welcome-box { display: flex; align-items: center; gap: 15px; }
        .tm-user-avatar { width: 45px; height: 45px; background: #1e293b; color: white; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-weight: bold; }
        .tm-page-content { padding: 40px; }
      `}</style>
    </div>
  );
};

export default TouristDashboard;