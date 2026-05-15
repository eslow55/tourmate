import React, { useState, useEffect } from "react";
import { db, auth } from "../../firebase/firebaseConfig";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useAuth } from "../../context/AuthContext";
import "../../styles/TouristDashboard.css";

/**
 * COMPONENTE: TouristProfile
 * Propósito: Gestión de datos personales, preferencias de viaje y visualización de progreso.
 */
const TouristProfile = () => {
  const { user, profile: authProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  // --- ESTADO DEL FORMULARIO ---
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    bio: "",
    country: "Colombia",
    preferences: {
      culture: true,
      nature: false,
      gastronomy: true,
      adventure: false
    }
  });

  // --- CARGAR DATOS DESDE FIRESTORE ---
  useEffect(() => {
    const loadUserData = async () => {
      if (!user) return;
      
      try {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setFormData({
            firstName: data.firstName || "",
            lastName: data.lastName || "",
            phone: data.phone || "",
            bio: data.bio || "¡Listo para explorar Medellín!",
            country: data.country || "Colombia",
            preferences: data.preferences || formData.preferences
          });
        }
      } catch (error) {
        console.error("Error al cargar perfil:", error);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [user]);

  // --- MANEJO DE CAMBIOS ---
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePreferenceChange = (key) => {
    setFormData(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [key]: !prev.preferences[key]
      }
    }));
  };

  // --- GUARDAR CAMBIOS ---
  const handleSave = async (e) => {
    e.preventDefault();
    setSaveLoading(true);
    
    try {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        ...formData,
        updatedAt: new Date()
      });
      setIsEditing(false);
      alert("Perfil actualizado correctamente.");
    } catch (error) {
      alert("Error al guardar los cambios.");
    } finally {
      setSaveLoading(false);
    }
  };

  if (loading) return <div className="profile-loading">Preparando tu pasaporte...</div>;

  return (
    <div className="profile-page-wrapper animate-fade-in">
      {/* HEADER DE PERFIL */}
      <header className="profile-hero">
        <div className="profile-hero-content">
          <div className="avatar-large">
            {(formData.firstName?.[0] || user?.email?.[0] || "U").toUpperCase()}
          </div>
          <div className="hero-text">
            <h2>{formData.firstName} {formData.lastName}</h2>
            <p>{user?.email}</p>
            <span className="badge-level">Explorador de Ciudad</span>
          </div>
        </div>
        <button 
          className={`btn-edit-toggle ${isEditing ? 'active' : ''}`}
          onClick={() => setIsEditing(!isEditing)}
        >
          {isEditing ? "Cancelar" : "Editar Perfil"}
        </button>
      </header>

      <div className="profile-grid">
        {/* COLUMNA IZQUIERDA: FORMULARIO / INFO */}
        <section className="profile-main-info">
          <form onSubmit={handleSave} className="profile-form">
            <div className="form-section-title">Datos Personales</div>
            
            <div className="input-row">
              <div className="input-group">
                <label>Nombre</label>
                <input 
                  type="text" 
                  name="firstName" 
                  value={formData.firstName} 
                  onChange={handleChange} 
                  disabled={!isEditing}
                  placeholder="Tu nombre"
                />
              </div>
              <div className="input-group">
                <label>Apellido</label>
                <input 
                  type="text" 
                  name="lastName" 
                  value={formData.lastName} 
                  onChange={handleChange} 
                  disabled={!isEditing}
                  placeholder="Tu apellido"
                />
              </div>
            </div>

            <div className="input-group">
              <label>Número de WhatsApp (Para guías)</label>
              <input 
                type="text" 
                name="phone" 
                value={formData.phone} 
                onChange={handleChange} 
                disabled={!isEditing}
                placeholder="+57 300..."
              />
            </div>

            <div className="input-group">
              <label>Sobre mí</label>
              <textarea 
                name="bio" 
                value={formData.bio} 
                onChange={handleChange} 
                disabled={!isEditing}
                rows="4"
              />
            </div>

            {isEditing && (
              <button type="submit" className="btn-save-profile" disabled={saveLoading}>
                {saveLoading ? "Guardando..." : "Guardar Cambios"}
              </button>
            )}
          </form>

          {/* PREFERENCIAS DE VIAJE */}
          <div className="preferences-section">
            <div className="form-section-title">Intereses de Viaje</div>
            <div className="preferences-grid">
              {Object.keys(formData.preferences).map((key) => (
                <button
                  key={key}
                  type="button"
                  className={`pref-chip ${formData.preferences[key] ? 'active' : ''}`}
                  onClick={() => isEditing && handlePreferenceChange(key)}
                >
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* COLUMNA DERECHA: LOGROS Y ESTADÍSTICAS */}
        <aside className="profile-sidebar">
          <div className="sidebar-card achievements">
            <h3>Tus Logros</h3>
            <div className="achievement-item">
              <div className="ach-icon">📸</div>
              <div className="ach-text">
                <strong>Primera Foto</strong>
                <p>Subiste tu primera imagen de perfil</p>
              </div>
            </div>
            <div className="achievement-item">
              <div className="ach-icon">🚶</div>
              <div className="ach-text">
                <strong>Primer Paso</strong>
                <p>Reservaste tu primer tour en Medellín</p>
              </div>
            </div>
          </div>

          <div className="sidebar-card security-card">
            <h3>Seguridad</h3>
            <p>Tu cuenta está protegida con verificación por correo electrónico.</p>
            <button className="btn-secondary-outline">Cambiar Contraseña</button>
          </div>
        </aside>
      </div>

      <style jsx>{`
        .profile-page-wrapper {
          width: 100%;
          max-width: 1100px;
          margin: 0 auto;
        }

        /* --- HERO --- */
        .profile-hero {
          background: linear-gradient(135deg, #ff5a3c 0%, #ff8a75 100%);
          border-radius: 24px;
          padding: 40px;
          color: white;
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 40px;
        }

        .profile-hero-content { display: flex; align-items: center; gap: 25px; }
        
        .avatar-large {
          width: 100px;
          height: 100px;
          background: rgba(255,255,255,0.2);
          backdrop-filter: blur(10px);
          border: 3px solid white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2.5rem;
          font-weight: 800;
        }

        .hero-text h2 { font-size: 2rem; margin: 0; }
        .hero-text p { opacity: 0.9; margin: 5px 0; }

        .badge-level {
          background: white;
          color: #ff5a3c;
          padding: 4px 12px;
          border-radius: 50px;
          font-size: 0.8rem;
          font-weight: 700;
          text-transform: uppercase;
        }

        /* --- GRID --- */
        .profile-grid {
          display: grid;
          grid-template-columns: 1.5fr 1fr;
          gap: 40px;
        }

        .form-section-title {
          font-size: 1.2rem;
          font-weight: 800;
          color: #1a202c;
          margin-bottom: 25px;
          padding-bottom: 10px;
          border-bottom: 2px solid #edf2f7;
        }

        .input-row { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }

        .input-group { margin-bottom: 20px; }
        .input-group label {
          display: block;
          font-size: 0.9rem;
          font-weight: 600;
          color: #718096;
          margin-bottom: 8px;
        }

        input, textarea {
          width: 100%;
          padding: 12px 15px;
          border: 2px solid #edf2f7;
          border-radius: 12px;
          font-size: 1rem;
          transition: 0.3s;
        }

        input:disabled, textarea:disabled { background: #f8fafc; cursor: not-allowed; border-color: transparent; }
        input:focus { border-color: #ff5a3c; outline: none; }

        .btn-edit-toggle {
          background: white;
          color: #ff5a3c;
          border: none;
          padding: 12px 24px;
          border-radius: 12px;
          font-weight: 700;
          cursor: pointer;
          transition: 0.3s;
        }
        .btn-edit-toggle.active { background: #1a202c; color: white; }

        .btn-save-profile {
          background: #ff5a3c;
          color: white;
          width: 100%;
          padding: 15px;
          border: none;
          border-radius: 12px;
          font-weight: 700;
          cursor: pointer;
          margin-top: 10px;
        }

        /* --- PREFERENCIAS --- */
        .preferences-grid { display: flex; flex-wrap: wrap; gap: 10px; }
        .pref-chip {
          padding: 10px 20px;
          border-radius: 50px;
          border: 2px solid #edf2f7;
          background: white;
          cursor: pointer;
          font-weight: 600;
          color: #718096;
        }
        .pref-chip.active { background: #ff5a3c; border-color: #ff5a3c; color: white; }

        /* --- SIDEBAR --- */
        .sidebar-card {
          background: white;
          padding: 25px;
          border-radius: 20px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.05);
          margin-bottom: 25px;
        }

        .achievement-item {
          display: flex;
          align-items: center;
          gap: 15px;
          margin-bottom: 20px;
        }

        .ach-icon {
          width: 45px;
          height: 45px;
          background: #fdf2f0;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 12px;
          font-size: 1.2rem;
        }

        .ach-text strong { display: block; font-size: 0.9rem; }
        .ach-text p { font-size: 0.8rem; color: #718096; margin: 0; }

        @media (max-width: 850px) {
          .profile-grid { grid-template-columns: 1fr; }
          .profile-hero { flex-direction: column; text-align: center; gap: 20px; }
          .profile-hero-content { flex-direction: column; }
        }
      `}</style>
    </div>
  );
};

export default TouristProfile;