import React from 'react';
import './LoginCard.css';

const LoginCard = () => {
  return (
    <div className="auth-card">
      <h1>Iniciar Sesión en TourMate</h1>
      
      <form className="form-container" onSubmit={(e) => e.preventDefault()}>
        <div className="input-group">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
          <input type="email" placeholder="Correo Electrónico" required />
        </div>

        <div className="input-group">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
          <input type="password" placeholder="Contraseña" required />
        </div>

        <div className="auth-extras">
          <label className="checkbox-label">
            <input type="checkbox" /> Recuérdame
          </label>
          <a href="#">Olvidé mi contraseña</a>
        </div>

        <button type="submit" className="btn-entrar">ENTRAR</button>
      </form>

      <div className="social-divider">
        <span>o iniciar sesión con:</span>
      </div>

      <div className="social-icons">
        <img src="https://cdn-icons-png.flaticon.com/512/2991/2991148.png" alt="Google" />
        <img src="https://cdn-icons-png.flaticon.com/512/733/733547.png" alt="Facebook" />
        <img src="https://cdn-icons-png.flaticon.com/512/0/747.png" alt="Apple" />
      </div>

      <div className="card-footer">
        ¿No tienes una cuenta? <a href="/register">Regístrate gratis</a>
      </div>
    </div>
  );
};

export default LoginCard;