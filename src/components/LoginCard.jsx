import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import ModalNotificacion from "./ModalNotificacion";
import "../styles/LoginCard.css";

export default function LoginCard() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [notif, setNotif] = useState(null);
  const [showPwd, setShowPwd] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      setNotif({ type: "warning", title: "Campos requeridos", message: "Por favor completa todos los campos." });
      return;
    }
    setLoading(true);
    try {
      // 1. Obtenemos el perfil directamente del login (según la mejora del context)
      const { profile } = await login(form.email, form.password);
      
      setNotif({ type: "success", title: "¡Bienvenido!", message: "Iniciando sesión..." });

      // 2. Redirección inteligente basada en el rol de Firestore
      setTimeout(() => {
        if (profile?.role === "guide") {
          navigate("/guide-dashboard"); // Cambia esto por tu ruta real de guía
        } else {
          navigate("/tourist"); // Ruta estándar para turistas
        }
      }, 1000);

    } catch (err) {
      const msg =
        err.code === "auth/user-not-found" ? "No existe una cuenta con ese correo." :
        err.code === "auth/wrong-password" ? "Contraseña incorrecta." :
        err.code === "auth/invalid-credential" ? "Credenciales inválidas." :
        "Error al iniciar sesión. Intenta de nuevo.";
      setNotif({ type: "error", title: "Error", message: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-wrapper"> {/* Envoltura para centrar y aplicar fondo */}
      <form className="auth-card" onSubmit={handleSubmit} noValidate>
        <div className="auth-card__header">
          <div className="auth-card__icon">✈</div>
          <h2 className="auth-card__title">Iniciar sesión</h2>
          <p className="auth-card__sub">Accede a tu cuenta de Tourmate</p>
        </div>

        <div className="auth-card__field">
          <label htmlFor="email">Correo electrónico</label>
          <input
            id="email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="tu@email.com"
            autoComplete="email"
          />
        </div>

        <div className="auth-card__field">
          <label htmlFor="password">Contraseña</label>
          <div className="auth-card__pwd-wrap">
            <input
              id="password"
              name="password"
              type={showPwd ? "text" : "password"}
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              autoComplete="current-password"
            />
            <button type="button" className="auth-card__toggle" onClick={() => setShowPwd(!showPwd)}>
              {showPwd ? "Ocultar" : "Mostrar"}
            </button>
          </div>
        </div>

        <button type="submit" className="auth-card__submit" disabled={loading}>
          {loading ? <span className="auth-card__spinner" /> : "Iniciar sesión"}
        </button>

        <p className="auth-card__footer-text">
          ¿No tienes cuenta? <Link to="/register">Regístrate gratis</Link>
        </p>
      </form>

      {notif && (
        <ModalNotificacion
          type={notif.type}
          title={notif.title}
          message={notif.message}
          onClose={() => setNotif(null)}
        />
      )}
    </div>
  );
}