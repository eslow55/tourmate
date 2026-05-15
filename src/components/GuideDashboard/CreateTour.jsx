import React, { useState, useEffect, useCallback } from 'react';
import { db, auth } from '../../firebase/firebaseConfig';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import '../../styles/GuideDashboard.css';

/**
 * Componente: CreateTour
 * Descripción: Interfaz de alta gama para la creación de experiencias en Medellín.
 * Incluye: Compresión de imagen Base64, Validaciones Pro y Preview en vivo.
 */
const CreateTour = () => {
  // --- ESTADOS DE CARGA Y UI ---
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [base64Image, setBase64Image] = useState("");

  // --- ESTADO DEL FORMULARIO ---
  const [tour, setTour] = useState({
    name: '',
    description: '',
    price: '',
    duration: '',
    category: 'Cultura',
    location: 'Medellín, Antioquia',
    maxPersons: 10,
    includes: '',
    requirements: ''
  });

  // --- LÓGICA DE PROCESAMIENTO DE IMAGEN (COMPRESIÓN) ---
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validación de formato
    if (!file.type.match('image.*')) {
      alert("Por favor, selecciona un archivo de imagen válido.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;

      img.onload = () => {
        // Creamos un canvas para redimensionar la imagen y que el Base64 sea ligero
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800; // Resolución óptima para web
        const scaleSize = MAX_WIDTH / img.width;
        canvas.width = MAX_WIDTH;
        canvas.height = img.height * scaleSize;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        // Exportamos a Base64 con calidad reducida (0.7) para no saturar Firestore
        const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
        setBase64Image(dataUrl);
        setImagePreview(dataUrl);
      };
    };
    reader.readAsDataURL(file);
  };

  // --- MANEJO DE CAMBIOS EN INPUTS ---
  const handleChange = (e) => {
    const { name, value } = e.target;
    setTour(prev => ({ ...prev, [name]: value }));
  };

  // --- ENVÍO A FIRESTORE ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!base64Image) {
      alert("La imagen es obligatoria para atraer turistas.");
      return;
    }

    setLoading(true);

    try {
      // Estructura de datos final alineada con HomePage.jsx
      const tourData = {
        name: tour.name,
        description: tour.description,
        price: Number(tour.price),
        duration: tour.duration,
        category: tour.category,
        location: tour.location,
        maxPersons: Number(tour.maxPersons),
        image: base64Image, // Imagen en Base64 optimizado
        guideId: auth.currentUser?.uid || "anonymous",
        guideName: auth.currentUser?.displayName || "Guía Local",
        isApproved: false, // Requiere revisión de Admin
        active: false,    // Campo extra por si usas "active" en el Home
        rating: 5.0,
        createdAt: serverTimestamp(),
      };

      await addDoc(collection(db, "tours"), tourData);

      setSuccess(true);
      setTimeout(() => setSuccess(false), 5000);
      
      // Limpieza de formulario
      setTour({
        name: '', description: '', price: '', duration: '',
        category: 'Cultura', location: 'Medellín, Antioquia',
        maxPersons: 10, includes: '', requirements: ''
      });
      setImagePreview(null);
      setBase64Image("");

      alert("¡Éxito! Tu tour ha sido enviado al equipo de TourMate para su aprobación.");
    } catch (error) {
      console.error("Error al guardar tour:", error);
      alert("Error de conexión. Intenta con una imagen más pequeña.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="guide-view-container animate-fade-in full-screen-mode">
      <div className="view-inner-card">
        
        {/* ENCABEZADO PRO */}
        <div className="section-header-admin">
          <div className="header-info">
            <h1>Publicar Nueva Experiencia</h1>
            <p>Diseña una ruta inolvidable en la ciudad. Los campos marcados son obligatorios.</p>
          </div>
          {success && <div className="success-badge">✓ Enviado correctamente</div>}
        </div>

        <form className="guide-form-grid" onSubmit={handleSubmit}>
          
          {/* SECCIÓN IZQUIERDA: MEDIA Y PREVIEW */}
          <div className="form-column">
            <div className="form-group">
              <label>Imagen de Portada (Base64 Optimized)</label>
              <div className={`image-dropzone-large ${imagePreview ? 'has-image' : ''}`}>
                <input 
                  type="file" 
                  accept="image/jpeg, image/png" 
                  onChange={handleImageChange} 
                  id="tour-image" 
                  hidden 
                />
                <label htmlFor="tour-image" className="dropzone-label">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="img-preview-full" />
                  ) : (
                    <div className="upload-content">
                      <i className="upload-icon">📸</i>
                      <p>Arrastra o haz clic para subir foto</p>
                      <span>Máximo 1MB - Formato JPG/PNG</span>
                    </div>
                  )}
                </label>
              </div>
            </div>

            <div className="info-box-tip">
              <h4>💡 Consejo de Anfitrión</h4>
              <p>Las experiencias con descripciones detalladas y fotos de alta calidad en la Comuna 13 o Guatapé reciben un 40% más de reservas.</p>
            </div>
          </div>

          {/* SECCIÓN DERECHA: CAMPOS DE DATOS */}
          <div className="form-column">
            <div className="form-group">
              <label>Título de la Experiencia</label>
              <input 
                type="text" 
                name="name" 
                value={tour.name} 
                onChange={handleChange} 
                placeholder="Ej: Tour de Café y Fincas en Envigado"
                required 
              />
            </div>

            <div className="form-row-three">
              <div className="form-group">
                <label>Precio (COP)</label>
                <input 
                  type="number" 
                  name="price" 
                  value={tour.price} 
                  onChange={handleChange} 
                  placeholder="Precio por persona"
                  required 
                />
              </div>
              <div className="form-group">
                <label>Duración</label>
                <input 
                  type="text" 
                  name="duration" 
                  value={tour.duration} 
                  onChange={handleChange} 
                  placeholder="Ej: 4 horas"
                  required 
                />
              </div>
              <div className="form-group">
                <label>Cupos</label>
                <input 
                  type="number" 
                  name="maxPersons" 
                  value={tour.maxPersons} 
                  onChange={handleChange} 
                />
              </div>
            </div>

            <div className="form-group">
              <label>Categoría Principal</label>
              <select name="category" value={tour.category} onChange={handleChange}>
                <option value="Cultura">🏛️ Cultura y Patrimonio</option>
                <option value="Gastronomía">🍕 Gastronomía Local</option>
                <option value="Naturaleza">🌿 Naturaleza y Paisajes</option>
                <option value="Aventura">🪂 Aventura Extrema</option>
                <option value="Nocturno">🌙 Vida Nocturna</option>
              </select>
            </div>

            <div className="form-group">
              <label>Descripción del Itinerario</label>
              <textarea 
                name="description" 
                rows="6" 
                value={tour.description} 
                onChange={handleChange} 
                placeholder="¿Qué hace que esta ruta sea única? Describe los puntos clave..."
                required 
              />
            </div>

            <button type="submit" className="btn-primary-lg" disabled={loading}>
              {loading ? (
                <div className="loader-flex">
                  <span className="spinner"></span> Procesando...
                </div>
              ) : "Publicar Experiencia en Medellín"}
            </button>
            
            <p className="form-disclaimer">
              Al publicar, aceptas que TourMate revisará el contenido para asegurar que cumpla con los estándares de seguridad de la ciudad.
            </p>
          </div>
        </form>
      </div>

      <style jsx>{`
        .full-screen-mode {
          width: 100%;
          min-height: 100vh;
          padding: 20px;
          box-sizing: border-box;
        }
        .view-inner-card {
          width: 100%;
          max-width: 1400px;
          margin: 0 auto;
          background: #fff;
          border-radius: 24px;
          padding: 40px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.08);
        }
        .guide-form-grid {
          display: grid;
          grid-template-columns: 1fr 1.2fr;
          gap: 50px;
          margin-top: 30px;
        }
        .image-dropzone-large {
          width: 100%;
          height: 480px;
          border: 2px dashed #cbd5e1;
          border-radius: 20px;
          overflow: hidden;
          background: #f8fafc;
          transition: 0.3s;
        }
        .image-dropzone-large:hover { border-color: #ff5a3c; background: #fffafa; }
        .dropzone-label {
          width: 100%; height: 100%; display: flex; 
          align-items: center; justify-content: center; cursor: pointer;
        }
        .img-preview-full { width: 100%; height: 100%; object-fit: cover; }
        .form-row-three {
          display: grid; grid-template-columns: 1fr 1fr 0.6fr; gap: 15px;
        }
        .btn-primary-lg {
          background: #ff5a3c; color: white; border: none; width: 100%;
          padding: 18px; border-radius: 12px; font-weight: 700; font-size: 1.1rem;
          cursor: pointer; transition: 0.3s; margin-top: 20px;
        }
        .btn-primary-lg:hover { background: #e54e32; transform: translateY(-2px); }
        .info-box-tip {
          margin-top: 25px; padding: 20px; background: #fff7ed;
          border-left: 4px solid #fb923c; border-radius: 8px;
        }
        .form-disclaimer {
          margin-top: 15px; font-size: 0.8rem; color: #94a3b8; text-align: center;
        }
        @media (max-width: 1100px) {
          .guide-form-grid { grid-template-columns: 1fr; }
          .image-dropzone-large { height: 300px; }
        }
      `}</style>
    </div>
  );
};

export default CreateTour;