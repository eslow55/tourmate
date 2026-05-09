import React, { useState, useRef, useEffect } from "react";
import { auth, db } from "../firebase/firebaseConfig";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useNavigate, Link } from "react-router-dom";
import "./RegisterCard.css";

const RegisterCard = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // Estados para el rol y el menú desplegable personalizado
  const [rol, setRol] = useState("turista"); 
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  // Cerrar el menú si se hace clic afuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleRegister = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("⚠️ Las contraseñas no coinciden.");
      return;
    }
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      const user = userCredential.user;

      await updateProfile(user, { displayName: fullName });

      const isVerified = rol === "guia" ? false : true;

      await setDoc(doc(db, "usuarios", user.uid), {
        nombreCompleto: fullName,
        email: user.email,
        rol: rol,
        isVerified: isVerified, 
        rutasCompletadas: 0,
        totalAmigos: 0,
        puntosTourMate: 0,
        fechaRegistro: new Date()
      });
      
      navigate("/dashboard");
    } catch (error) {
      alert("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    /* Usamos una clase única para NO afectar el Header */
    <div className="tourmate-register-card">
      <h1>Crear cuenta en TourMate</h1>
      <form onSubmit={handleRegister} className="form-container">
        
        {/* MENÚ DESPLEGABLE PERSONALIZADO (Reemplaza al <select>) */}
        <div 
          className="input-group custom-dropdown" 
          ref={dropdownRef}
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        >
          <span className="icon">🎭</span>
          <div className="selected-text">
            {rol === "turista" ? "Quiero explorar (Turista)" : "Quiero enseñar mi ciudad (Guía)"}
          </div>
          <span className={`arrow ${isDropdownOpen ? "open" : ""}`}>▼</span>

          {/* Las opciones que se despliegan con estilo */}
          {isDropdownOpen && (
            <div className="dropdown-options">
              <div 
                className="option-item" 
                onClick={() => setRol("turista")}
              >
                Quiero explorar (Turista)
              </div>
              <div 
                className="option-item" 
                onClick={() => setRol("guia")}
              >
                Quiero enseñar mi ciudad (Guía)
              </div>
            </div>
          )}
        </div>

        <div className="input-group">
          <span className="icon">👤</span>
          <input type="text" placeholder="Nombre Completo" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
        </div>
        <div className="input-group">
          <span className="icon">✉️</span>
          <input type="email" placeholder="Correo Electrónico" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="input-group">
          <span className="icon">🔒</span>
          <input type="password" placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <div className="input-group">
          <span className="icon">✔️</span>
          <input type="password" placeholder="Confirmar Contraseña" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
        </div>
        <button type="submit" className="btn-register" disabled={loading}>
          {loading ? "REGISTRANDO..." : "REGISTRARSE"}
        </button>
      </form>
      <div className="card-footer">
        ¿Ya tienes cuenta? <Link to="/login" className="reg-link">Inicia sesión</Link>
      </div>
    </div>
  );
};

export default RegisterCard;