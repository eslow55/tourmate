import React, { useState } from "react";
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
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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

      // Actualizar perfil y crear documento en Firestore
      await updateProfile(user, { displayName: fullName });
      await setDoc(doc(db, "usuarios", user.uid), {
        nombreCompleto: fullName,
        email: user.email,
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
    <div className="auth-card">
      <h1>Crear cuenta en TourMate</h1>
      <form onSubmit={handleRegister} className="form-container">
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