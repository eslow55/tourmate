import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { auth } from "../firebase/firebaseConfig"; 
import { signInWithEmailAndPassword } from "firebase/auth";
import ModalNotificacion from "./ModalNotificacion"; 
import "./LoginCard.css";

const LoginCard = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Estados para el Modal Animado
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Intento de login real con Firebase
      await signInWithEmailAndPassword(auth, email.trim(), password);
      
      setModalMessage("🔓 ¡Sesión iniciada! Bienvenido de nuevo a TourMate.");
      setShowModal(true);

    } catch (error) {
      let mensajeError = "❌ Ocurrió un error al entrar.";
      if (error.code === "auth/invalid-credential") {
        mensajeError = "❌ Correo o contraseña incorrectos.";
      } else if (error.code === "auth/user-not-found") {
        mensajeError = "❌ Este usuario no está registrado.";
      }
      
      setModalMessage(mensajeError);
      setShowModal(true);
    } finally {
      setLoading(false);
    }
  };

  const alCerrarModal = () => {
    setShowModal(false);
    if (modalMessage.includes("¡Sesión iniciada!")) {
      navigate("/dashboard");
    }
  };

  return (
    <>
      <div className="auth-card">
        <h1>Iniciar Sesión en TourMate</h1>
        
        <form className="form-container" onSubmit={handleLogin}>
          <div className="input-group">
            <span className="icon">✉️</span>
            <input 
              type="email" 
              placeholder="Correo Electrónico" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>

          <div className="input-group">
            <span className="icon">🔒</span>
            <input 
              type="password" 
              placeholder="Contraseña" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>

          <div className="auth-extras">
            <label className="checkbox-label">
              <input type="checkbox" /> Recuérdame
            </label>
            <a href="#" className="forgot-link">Olvidé mi contraseña</a>
          </div>

          <button type="submit" className="btn-entrar" disabled={loading}>
            {loading ? "VERIFICANDO..." : "ENTRAR"}
          </button>
        </form>

        <div className="social-divider">
          <span>o iniciar sesión con:</span>
        </div>

        <div className="social-icons">
          <button type="button" className="social-btn">
            <img src="https://cdn-icons-png.flaticon.com/512/2991/2991148.png" alt="Google" />
          </button>
          <button type="button" className="social-btn">
            <img src="https://cdn-icons-png.flaticon.com/512/733/733547.png" alt="Facebook" />
          </button>
          <button type="button" className="social-btn">
            <img src="https://cdn-icons-png.flaticon.com/512/0/747.png" alt="Apple" />
          </button>
        </div>

        <div className="card-footer">
          ¿No tienes una cuenta? <Link to="/register" className="reg-link">Regístrate gratis</Link>
        </div>
      </div>

      {/* Modal que pediste para reemplazar los alerts */}
      <ModalNotificacion 
        mostrar={showModal} 
        mensaje={modalMessage} 
        onAceptar={alCerrarModal} 
      />
    </>
  );
};

export default LoginCard;