import React, { useEffect, useState } from "react";
import { auth, db } from "../firebase/firebaseConfig";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

import PlanificarViaje from "../components/PlanificarViaje";
import PerfilUsuario from "../components/PerfilUsuario";
import MisViajes from "../components/MisViajes";
import "./DashboardPage.css";

const DashboardPage = () => {
  const [user, setUser] = useState(null);
  const [userName, setUserName] = useState("Viajero");
  const [activeTab, setActiveTab] = useState("dashboard"); // Estado inicial
  const [stats, setStats] = useState({ rutas: 0, amigos: 0, puntos: 0 });
  const [actividades, setActividades] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const docRef = doc(db, "usuarios", currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setUserName(data.nombreCompleto || "Viajero");
          setStats({
            rutas: data.rutasCompletadas ||  0,
            amigos: data.totalAmigos ||  0,
            puntos: data.puntosTourMate ||  0,
          });
          setActividades(data.historialActividad || []);
        }
        setLoading(false);
      } else {
        navigate("/login");
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  return (
    <div className="layout-container">
      {/* SIDEBAR REORGANIZADO */}
      <aside className="sidebar-nav">
        <div className="sidebar-brand">TourMate ✈️</div>
        <nav className="nav-menu">
          <button 
            className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} 
            onClick={() => setActiveTab('dashboard')}
          >
            <span className="nav-icon">📊</span> Panel Principal
          </button>
          
          <button 
            className={`nav-item ${activeTab === 'viajes' ? 'active' : ''}`} 
            onClick={() => setActiveTab('viajes')}
          >
            <span className="nav-icon">🎒</span> Mis Viajes
          </button>

          <button 
            className={`nav-item ${activeTab === 'perfil' ? 'active' : ''}`} 
            onClick={() => setActiveTab('perfil')}
          >
            <span className="nav-icon">👤</span> Mi Perfil
          </button>
        </nav>

        <div className="sidebar-footer">
          <button className="btn-logout" onClick={() => signOut(auth)}>
            🚪 Cerrar Sesión
          </button>
        </div>
      </aside>

      <main className="main-viewport">
        {/* HEADER MEJORADO VISUALMENTE */}
        <header className="glass-header">
          <div className="header-info">
            <h1>Hola, <span className="text-gradient">{userName}</span> 👋</h1>
            <div className="experience-widget">
              <div className="level-box">
                <span className="level-txt">RANGO: {stats.puntos < 100 ? "NOVATO" : "EXPLORADOR"}</span>
                <div className="xp-bar-container">
                  <div className="xp-bar-fill" style={{ width: `${Math.min(stats.puntos, 100)}%` }}></div>
                </div>
              </div>
              <span className="xp-label">{stats.puntos}/100 XP</span>
            </div>
          </div>

          <div className="header-profile">
            <div className="profile-meta">
              <span className="profile-email">{user?.email}</span>
              <span className="profile-status">● Activo</span>
            </div>
            <div className="profile-avatar-circle">
              {user?.email ? user.email.charAt(0).toUpperCase() : "U"}
            </div>
          </div>
        </header>

        {/* CONTENEDOR DINÁMICO */}
        <section className="content-render">
          {activeTab === "dashboard" && (
            <div className="view-animate">
              {/* HERO DE RUTA ALEATORIA */}
              <div className="hero-banner">
                <div className="hero-txt">
                  <h2>¿Listos para lo inesperado?</h2>
                  <p>Genera una ruta sorpresa basada en tus gustos locales.</p>
                  <button className="btn-hero-action">Nueva Ruta Aleatoria</button>
                </div>
                <div className="hero-img">🗺️</div>
              </div>

              {/* STATS */}
              <div className="stats-grid">
                <div className="card-stat">
                  <div className="icon-wrap">🚩</div>
                  <div className="data-wrap">
                    <span className="data-num">{stats.rutas}</span>
                    <span className="data-lab">Viajes</span>
                  </div>
                </div>
                <div className="card-stat highlight">
                  <div className="icon-wrap">💎</div>
                  <div className="data-wrap">
                    <span className="data-num">{stats.puntos}</span>
                    <span className="data-lab">Puntos   </span>
                  </div>
                </div>
                <div className="card-stat">
                  <div className="icon-wrap">🤝</div>
                  <div className="data-wrap">
                    <span className="data-num">{stats.amigos}</span>
                    <span className="data-lab">Amigos  </span>
                  </div>
                </div>
              </div>
              <PlanificarViaje onSelect={(nombre) => console.log(nombre)} />
            </div>
          )}

          {activeTab === "viajes" && <MisViajes actividades={actividades} />}
          {activeTab === "perfil" && <PerfilUsuario user={user} userName={userName} stats={stats} />}
        </section>
      </main>
    </div>
  );
};

export default DashboardPage;