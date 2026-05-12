import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import ModalNotificacion from "./ModalNotificacion";
import "../styles/LoginCard.css";

export default function RegisterCard() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ displayName: "", email: "", password: "", confirm: "", role: "tourist" });
  const [loading, setLoading] = useState(false);
  const [notif, setNotif] = useState(null);
  const [showPwd, setShowPwd] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleRoleSelect = (val) => {
    setForm({ ...form, role: val });
    setIsDropdownOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.displayName || !form.email || !form.password || !form.confirm) {
      setNotif({ type: "warning", title: "Campos requeridos", message: "Por favor completa todos los campos." });
      return;
    }
    if (form.password !== form.confirm) {
      setNotif({ type: "error", title: "Error", message: "Las contraseñas no coinciden." });
      return;
    }
    setLoading(true);
    try {
      const { profile } = await register(form.email, form.password, form.displayName, form.role);
      setNotif({ type: "success", title: "¡Cuenta creada!", message: "Redirigiendo..." });
      
      setTimeout(() => {
        profile.role === "guide" ? navigate("/guide-dashboard") : navigate("/tourist");
      }, 1200);
    } catch (err) {
      setNotif({ type: "error", title: "Error", message: "No se pudo crear la cuenta." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-wrapper">
      <form className="auth-card" onSubmit={handleSubmit} noValidate>
        <div className="auth-card__header">
          <div className="auth-card__icon">✈</div>
          <h2 className="auth-card__title">Crear cuenta</h2>
          <p className="auth-card__sub">Únete a la comunidad Tourmate</p>
        </div>

        <div className="auth-card__field">
          <label>Nombre completo</label>
          <input name="displayName" type="text" value={form.displayName} onChange={handleChange} placeholder="Tu nombre" />
        </div>

        <div className="auth-card__field">
          <label>Correo electrónico</label>
          <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="tu@email.com" />
        </div>

        <div className="auth-card__row">
          <div className="auth-card__field">
            <label>Contraseña</label>
            <div className="auth-card__pwd-wrap">
              <input name="password" type={showPwd ? "text" : "password"} value={form.password} onChange={handleChange} placeholder="••••••••" />
              <button type="button" className="auth-card__toggle" onClick={() => setShowPwd(!showPwd)}>
                {showPwd ? "Ver" : "Ocultar"}
              </button>
            </div>
          </div>
          <div className="auth-card__field">
            <label>Confirmar</label>
            <input name="confirm" type={showPwd ? "text" : "password"} value={form.confirm} onChange={handleChange} placeholder="••••••••" />
          </div>
        </div>

        <div className="auth-card__field">
          <label>¿Cómo quieres participar?</label>
          <div className={`custom-dropdown ${isDropdownOpen ? "is-open" : ""}`} onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
            <div className="selected-text">
              {form.role === "tourist" ? "🌍 Turista — Explorar" : "🧭 Guía — Ofrecer tours"}
            </div>
            <span className="arrow">▼</span>
            {isDropdownOpen && (
              <div className="dropdown-options">
                <div className="option-item" onClick={() => handleRoleSelect("tourist")}>🌍 Turista — Explorar</div>
                <div className="option-item" onClick={() => handleRoleSelect("guide")}>🧭 Guía — Ofrecer tours</div>
              </div>
            )}
          </div>
        </div>

        <button type="submit" className="auth-card__submit" disabled={loading}>
          {loading ? <div className="auth-card__spinner" /> : "Empezar ahora"}
        </button>

        <p className="auth-card__footer-text">
          ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
        </p>
      </form>

      {notif && <ModalNotificacion {...notif} onClose={() => setNotif(null)} />}
    </div>
  );
}