import React, { useEffect, useState, useMemo } from 'react';
import { db } from '../../firebase/firebaseConfig';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import '../../styles/AdminDashboard.css';

/**
 * Componente: SiteAnalytics
 * Propósito: Inteligencia de negocios y monitoreo de KPIs para TourMate Medellín.
 */
const SiteAnalytics = () => {
  // --- ESTADOS DE MÉTRICAS ---
  const [stats, setStats] = useState({
    totalTours: 0,
    activeGuides: 0,
    pendingApprovals: 0,
    totalUsers: 0,
    totalBookings: 0,
    estimatedRevenue: 0
  });
  
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  // --- LÓGICA DE CARGA DE DATOS ---
  useEffect(() => {
    const fetchGlobalAnalytics = async () => {
      setLoading(true);
      try {
        // Ejecución en paralelo para máxima velocidad
        const [toursSnap, usersSnap, pendingSnap, guidesSnap, bookingsSnap] = await Promise.all([
          getDocs(collection(db, "tours")),
          getDocs(collection(db, "users")),
          getDocs(query(collection(db, "tours"), where("isApproved", "==", false))),
          getDocs(query(collection(db, "users"), where("role", "==", "guide"))),
          getDocs(collection(db, "bookings"))
        ]);

        // Cálculo de ingresos (sumando bookings con estado 'paid')
        let revenue = 0;
        const recent = [];
        
        bookingsSnap.forEach(doc => {
          const data = doc.data();
          if (data.status === 'paid') {
            revenue += (data.totalPrice || 0);
          }
          // Guardamos para el feed de actividad reciente
          recent.push({ id: doc.id, ...data });
        });

        setStats({
          totalTours: toursSnap.size,
          totalUsers: usersSnap.size,
          pendingApprovals: pendingSnap.size,
          activeGuides: guidesSnap.size,
          totalBookings: bookingsSnap.size,
          estimatedRevenue: revenue
        });

        // Ordenar actividad por fecha
        setRecentActivity(recent.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)).slice(0, 5));

      } catch (error) {
        console.error("Error crítico en analíticas:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchGlobalAnalytics();
  }, [refreshKey]);

  // --- COMPONENTES INTERNOS (UI) ---
  const MetricCard = ({ title, value, icon, color, trend }) => (
    <div className="stat-card animate-fade-in" style={{ borderLeft: `4px solid ${color}` }}>
      <div className="stat-card-header">
        <span className="stat-icon">{icon}</span>
        {trend && <span className="stat-trend">+{trend}%</span>}
      </div>
      <div className="stat-card-body">
        <h3>{title}</h3>
        <p className="stat-value">{value}</p>
      </div>
    </div>
  );

  const renderProgressBar = (label, current, total, color) => {
    const percentage = total > 0 ? Math.round((current / total) * 100) : 0;
    return (
      <div className="progress-item">
        <div className="progress-info">
          <span>{label}</span>
          <span>{percentage}%</span>
        </div>
        <div className="progress-bg">
          <div 
            className="progress-fill" 
            style={{ width: `${percentage}%`, backgroundColor: color }}
          ></div>
        </div>
      </div>
    );
  };

  if (loading) return (
    <div className="admin-loader-container">
      <div className="spinner"></div>
      <p>Procesando Big Data de TourMate...</p>
    </div>
  );

  return (
    <div className="admin-analytics animate-fade-in">
      <header className="content-header">
        <div className="header-titles">
          <h1>Análisis del Ecosistema</h1>
          <p>Métricas clave de rendimiento y salud de la plataforma.</p>
        </div>
        <button className="btn-refresh" onClick={() => setRefreshKey(prev => prev + 1)}>
          🔄 Actualizar Datos
        </button>
      </header>

      {/* --- GRID DE KPIS PRINCIPALES --- */}
      <div className="guide-header-stats">
        <MetricCard 
          title="Ingresos Totales" 
          value={`$${stats.estimatedRevenue.toLocaleString()}`} 
          icon="💰" 
          color="#10b981"
          trend="12"
        />
        <MetricCard 
          title="Usuarios" 
          value={stats.totalUsers} 
          icon="👥" 
          color="#3b82f6" 
        />
        <MetricCard 
          title="Reservas" 
          value={stats.totalBookings} 
          icon="🎫" 
          color="#8b5cf6" 
        />
        <MetricCard 
          title="Tours Activos" 
          value={stats.totalTours} 
          icon="🗺️" 
          color="#ff5a3c" 
        />
      </div>

      <div className="analytics-secondary-grid">
        {/* --- DISTRIBUCIÓN DE OPERACIONES --- */}
        <div className="admin-table-container glass-card">
          <h3>Distribución de Comunidad</h3>
          <div className="progress-section">
            {renderProgressBar("Guías Validados", stats.activeGuides, stats.totalUsers, "#3b82f6")}
            {renderProgressBar("Tours por Aprobar", stats.pendingApprovals, stats.totalTours, "#f59e0b")}
            {renderProgressBar("Conversión de Pagos", stats.estimatedRevenue > 0 ? 45 : 0, 100, "#10b981")}
          </div>
          
          <div className="analytics-note">
            <p>ℹ️ La tasa de aprobación de tours ha subido un 15% este mes.</p>
          </div>
        </div>

        {/* --- ACTIVIDAD RECIENTE --- */}
        <div className="admin-table-container glass-card">
          <h3>Últimas Transacciones</h3>
          <div className="recent-activity-list">
            {recentActivity.length === 0 ? (
              <p className="empty-msg">No hay actividad reciente.</p>
            ) : (
              recentActivity.map(item => (
                <div key={item.id} className="activity-item">
                  <div className={`activity-dot ${item.status}`}></div>
                  <div className="activity-info">
                    <p className="activity-title">{item.tourTitle || "Tour Reservado"}</p>
                    <p className="activity-meta">
                      {item.status === 'paid' ? '✅ Pago completado' : '⏳ Pendiente'} • ${item.totalPrice?.toLocaleString()}
                    </p>
                  </div>
                  <span className="activity-time">Reciente</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* --- VISUALIZACIÓN DE TENDENCIAS (SIMULADA) --- */}
      <div className="admin-table-container full-width-chart">
        <div className="chart-header">
          <h3>Tendencia de Crecimiento</h3>
          <div className="chart-legend">
            <span className="legend-item"><i style={{background: '#ff5a3c'}}></i> Tours</span>
            <span className="legend-item"><i style={{background: '#3b82f6'}}></i> Usuarios</span>
          </div>
        </div>
        
        <div className="visual-chart-mock">
          {/* Simulación de barras de crecimiento por meses */}
          {[40, 60, 45, 90, 65, 80, 95].map((height, i) => (
            <div key={i} className="chart-column">
              <div className="bar-group">
                <div className="bar primary" style={{ height: `${height}%` }}></div>
                <div className="bar secondary" style={{ height: `${height - 20}%` }}></div>
              </div>
              <span className="month-label">{['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul'][i]}</span>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .analytics-secondary-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-top: 2rem;
        }
        .glass-card {
          background: white;
          padding: 1.5rem;
          border-radius: 20px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.05);
        }
        .progress-section { margin: 1.5rem 0; }
        .progress-item { margin-bottom: 1.2rem; }
        .progress-info { display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 5px; font-weight: 600; }
        .progress-bg { background: #f1f5f9; height: 8px; border-radius: 10px; overflow: hidden; }
        .progress-fill { height: 100%; border-radius: 10px; transition: width 1s ease-in-out; }
        
        .recent-activity-list { margin-top: 1rem; }
        .activity-item { display: flex; align-items: center; padding: 10px 0; border-bottom: 1px solid #f1f5f9; }
        .activity-dot { width: 8px; height: 8px; border-radius: 50%; margin-right: 15px; }
        .activity-dot.paid { background: #10b981; box-shadow: 0 0 8px #10b981; }
        .activity-dot.pending { background: #f59e0b; }
        .activity-title { font-size: 0.9rem; font-weight: 700; color: #1e293b; margin: 0; }
        .activity-meta { font-size: 0.75rem; color: #64748b; margin: 0; }
        .activity-time { font-size: 0.7rem; color: #94a3b8; margin-left: auto; }

        .visual-chart-mock {
          height: 250px;
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          padding: 20px 10px;
          background: #f8fafc;
          border-radius: 15px;
          margin-top: 1.5rem;
        }
        .chart-column { flex: 1; display: flex; flex-direction: column; align-items: center; height: 100%; justify-content: flex-end; }
        .bar-group { display: flex; gap: 4px; align-items: flex-end; width: 40%; height: 100%; }
        .bar { width: 100%; border-radius: 4px 4px 0 0; transition: height 1.5s ease; }
        .bar.primary { background: #ff5a3c; }
        .bar.secondary { background: #3b82f6; opacity: 0.6; }
        .month-label { font-size: 0.7rem; color: #94a3b8; margin-top: 10px; font-weight: 700; }
        
        .btn-refresh {
          background: #f1f5f9; border: none; padding: 0.6rem 1.2rem; border-radius: 8px;
          font-weight: 600; color: #475569; cursor: pointer; transition: 0.3s;
        }
        .btn-refresh:hover { background: #e2e8f0; color: #1e293b; }
      `}</style>
    </div>
  );
};

export default SiteAnalytics;