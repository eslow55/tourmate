import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Importamos tu contexto
import "../styles/Header.css";

const Header = () => {
  const navigate = useNavigate();
  // Extraemos los datos del contexto global
  const { user, profile, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  // Función para determinar a qué panel enviarlo según su rol en Firestore
  const getDashboardPath = () => {
    if (!profile) return "/";
    if (profile.role === "admin") return "/admin";
    if (profile.role === "guide") return "/guide";
    return "/tourist";
  };

  return (
    <header className="header-main">
      <div className="header-container">
        <Link to="/" className="header-logo">
          Tour<span>mate</span>
        </Link>
        
        <nav className="header-nav">
          <Link to="/" className="header-link">Explorar</Link>
          <Link to="/packages" className="header-link">Tours</Link>
          
          <div className="header-auth">
            {user ? (
              <>
                {/* Usamos la función para que vaya al panel correcto */}
                <Link to={getDashboardPath()} className="btn-dashboard">
                  Mi Panel
                </Link>
                <button className="btn-logout" onClick={handleLogout}>
                  Salir
                </button>
              </>
            ) : (
              <Link to="/login" className="btn-login">Iniciar Sesión</Link>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;