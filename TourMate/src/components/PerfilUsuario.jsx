import React from 'react';
import './PerfilUsuario.css';

const PerfilUsuario = ({ 
  user, 
  userName, 
  setUserName, 
  isEditingName, 
  setIsEditingName, 
  handleSaveName, 
  newPassword, 
  setNewPassword, 
  handleUpdatePassword,
  stats 
}) => {
  return (
    <div className="view-animate profile-grid">
      <section className="glass-card profile-summary">
        <div className="avatar-xl">{userName.charAt(0).toUpperCase()}</div>
        <h2>{userName}</h2>
        <span className="badge-novato">Novato</span>
        <div className="stats-row-mini">
          <div className="stat-unit"><strong>{stats.rutas}</strong>Rutas</div>
          <div className="stat-unit"><strong>{stats.puntos}</strong>Puntos</div>
        </div>
      </section>

      <section className="glass-card profile-details">
        <div className="form-row">
          <label>Nombre del Explorador</label>
          <div className="input-group-action">
            <input 
              type="text" 
              value={userName} 
              disabled={!isEditingName} 
              onChange={(e) => setUserName(e.target.value)} 
              className={isEditingName ? "is-editing" : ""} 
            />
            <button 
              onClick={isEditingName ? handleSaveName : () => setIsEditingName(true)} 
              className="btn-action"
            >
              {isEditingName ? "Guardar" : "Editar"}
            </button>
          </div>
        </div>

        <div className="form-row">
          <label>Correo Electrónico</label>
          <input type="email" value={user?.email || ""} disabled className="input-locked" />
        </div>

        <div className="security-section">
          <div className="form-row">
            <label>Cambiar Contraseña</label>
            <input 
              type="password" 
              placeholder="Nueva clave..." 
              value={newPassword} 
              onChange={(e) => setNewPassword(e.target.value)} 
            />
            <button className="btn-save-full" onClick={handleUpdatePassword}>
              Actualizar Contraseña
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PerfilUsuario;