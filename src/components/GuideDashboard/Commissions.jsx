import React, { useState, useMemo } from 'react';
import '../../styles/GuideDashboard.css';

/**
 * Componente: Commissions
 * Propósito: Dashboard financiero para guías. Transparencia en cobros y ganancias netas.
 */
const Commissions = ({ completedTours = [] }) => {
  const PLATFORM_FEE = 0.15; // 15% de comisión estándar de TourMate
  const [filterMonth, setFilterMonth] = useState('all');

  // --- LÓGICA FINANCIERA AVANZADA ---
  const financialData = useMemo(() => {
    // 1. Filtrado por tiempo (simulado con la fecha del tour)
    const filtered = filterMonth === 'all' 
      ? completedTours 
      : completedTours.filter(t => t.date.includes(filterMonth));

    // 2. Cálculo acumulado de métricas
    const totalBruto = filtered.reduce((acc, tour) => acc + (tour.totalPaid || 0), 0);
    const comisionPlataforma = totalBruto * PLATFORM_FEE;
    const gananciaNeta = totalBruto - comisionPlataforma;
    
    // 3. Cálculo de promedio por tour
    const promedioVenta = filtered.length > 0 ? totalBruto / filtered.length : 0;

    return { 
      totalBruto, 
      comisionPlataforma, 
      gananciaNeta, 
      promedioVenta,
      count: filtered.length,
      list: filtered
    };
  }, [completedTours, filterMonth, PLATFORM_FEE]);

  // --- COMPONENTES DE UI ---
  const InfoTooltip = ({ text }) => (
    <div className="tooltip-container">
      <span className="info-icon">ⓘ</span>
      <span className="tooltip-text">{text}</span>
    </div>
  );

  return (
    <div className="guide-section stats-container animate-fade-in">
      {/* HEADER FINANCIERO */}
      <div className="section-header-admin">
        <div className="header-text">
          <h2>Centro de Liquidación</h2>
          <p>Consulta el desglose de tus ingresos y las comisiones de servicio aplicadas.</p>
        </div>
        <div className="header-actions">
          <select 
            className="admin-select"
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
          >
            <option value="all">Todo el historial</option>
            <option value="2026-05">Mayo 2026</option>
            <option value="2026-04">Abril 2026</option>
          </select>
          <button className="btn-save" onClick={() => window.print()}>
            📥 Descargar Reporte
          </button>
        </div>
      </div>

      {/* TARJETAS DE MÉTRICAS IMPACTANTES */}
      <div className="guide-header-stats">
        <div className="stat-card">
          <div className="card-top">
            <span>Ventas Brutas</span>
            <InfoTooltip text="Total pagado por los clientes antes de comisiones." />
          </div>
          <strong>${financialData.totalBruto.toLocaleString()}</strong>
          <small className="trend-up">↑ {financialData.count} Tours realizados</small>
        </div>

        <div className="stat-card comision">
          <div className="card-top">
            <span>Comisión TourMate</span>
            <span className="fee-badge">15% Fee</span>
          </div>
          <strong className="negative">-${financialData.comisionPlataforma.toLocaleString()}</strong>
          <small>Incluye seguro y marketing</small>
        </div>

        <div className="stat-card neta">
          <div className="card-top">
            <span>Mi Ganancia Neta</span>
            <div className="pulse-dot"></div>
          </div>
          <strong className="positive">${financialData.gananciaNeta.toLocaleString()}</strong>
          <small>Disponible para retiro</small>
        </div>
      </div>

      {/* DESGLOSE DE TABLA PROFESIONAL */}
      <div className="admin-table-container" style={{ marginTop: '2.5rem' }}>
        <div className="table-header-flex">
          <h3>Historial de Liquidaciones</h3>
          <p className="table-subtitle">Valores expresados en Pesos Colombianos (COP)</p>
        </div>

        <table className="admin-table">
          <thead>
            <tr>
              <th>ID Servicio</th>
              <th>Experiencia / Tour</th>
              <th>Fecha Servicio</th>
              <th>Venta Bruta</th>
              <th>Descuento (15%)</th>
              <th>Liquidación Neta</th>
            </tr>
          </thead>
          <tbody>
            {financialData.list.length === 0 ? (
              <tr>
                <td colSpan="6" className="empty-row">No hay tours liquidados en este periodo.</td>
              </tr>
            ) : (
              financialData.list.map(t => (
                <tr key={t.id}>
                  <td><code className="id-tag">#{t.id?.slice(-6).toUpperCase()}</code></td>
                  <td><strong>{t.tourName}</strong></td>
                  <td>{t.date}</td>
                  <td>${t.totalPaid?.toLocaleString()}</td>
                  <td className="negative">-${(t.totalPaid * PLATFORM_FEE).toLocaleString()}</td>
                  <td className="profit-cell">
                    +${(t.totalPaid * (1 - PLATFORM_FEE)).toLocaleString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
          {financialData.list.length > 0 && (
            <tfoot>
              <tr className="footer-summary">
                <td colSpan="3">TOTALES DEL PERIODO</td>
                <td>${financialData.totalBruto.toLocaleString()}</td>
                <td className="negative">-${financialData.comisionPlataforma.toLocaleString()}</td>
                <td className="total-highlight">${financialData.gananciaNeta.toLocaleString()}</td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {/* PANEL DE TRANSPARENCIA */}
      <div className="transparency-panel">
        <div className="panel-icon">🛡️</div>
        <div className="panel-text">
          <h4>¿A dónde va tu comisión?</h4>
          <p>
            El 15% de comisión permite que TourMate Medellín mantenga el soporte técnico 24/7, 
            el seguro de accidentes para tus viajeros y la publicidad en redes sociales que 
            trae más clientes a tus rutas.
          </p>
        </div>
      </div>

      <style jsx>{`
        .stats-container {
          padding: 10px;
        }
        .card-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
          color: #64748b;
          font-weight: 600;
          font-size: 0.85rem;
        }
        .fee-badge {
          background: #f1f5f9;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 0.7rem;
        }
        .stat-card strong {
          font-size: 1.8rem;
          display: block;
          margin-bottom: 5px;
        }
        .negative { color: #ef4444 !important; }
        .positive { color: #10b981 !important; }
        .profit-cell { 
          font-weight: 800; 
          color: #10b981; 
          background: #f0fdf4;
        }
        .id-tag {
          background: #f8fafc;
          padding: 4px;
          border-radius: 4px;
          font-family: monospace;
          color: #64748b;
        }
        .footer-summary {
          background: #1e293b;
          color: white;
          font-weight: 700;
        }
        .total-highlight {
          background: #10b981;
          color: white;
        }
        .transparency-panel {
          margin-top: 3rem;
          display: flex;
          gap: 20px;
          background: #f8fafc;
          padding: 2rem;
          border-radius: 15px;
          border: 1px dashed #cbd5e1;
        }
        .panel-icon { font-size: 2.5rem; }
        .panel-text h4 { margin: 0 0 10px 0; color: #1e293b; }
        .panel-text p { margin: 0; color: #64748b; font-size: 0.9rem; line-height: 1.5; }
        
        .tooltip-container { position: relative; cursor: help; }
        .tooltip-text {
          visibility: hidden;
          width: 200px;
          background-color: #334155;
          color: #fff;
          text-align: center;
          border-radius: 6px;
          padding: 10px;
          position: absolute;
          z-index: 1;
          bottom: 125%;
          left: 50%;
          margin-left: -100px;
          opacity: 0;
          transition: opacity 0.3s;
          font-size: 0.75rem;
        }
        .tooltip-container:hover .tooltip-text {
          visibility: visible;
          opacity: 1;
        }

        @media print {
          .header-actions, .sidebar-nav, .transparency-panel { display: none !important; }
          .view-inner-card { box-shadow: none !important; border: 1px solid #eee; }
        }
      `}</style>
    </div>
  );
};

export default Commissions;