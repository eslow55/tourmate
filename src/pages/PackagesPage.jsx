import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { db } from "../firebase/firebaseConfig"; // Asegúrate de que la ruta sea correcta
import { collection, query, where, onSnapshot } from "firebase/firestore";
import "../styles/PackagesPage.css";

const CATS = [
  { key: "todos", label: "Todos" },
  { key: "ciudad", label: "🏙 Ciudad" },
  { key: "naturaleza", label: "🌿 Naturaleza" },
  { key: "aventura", label: "🧗 Aventura" },
];

export default function PackagesPage() {
  const [tours, setTours] = useState([]); // Ahora los tours vienen de Firebase
  const [loading, setLoading] = useState(true);
  const [cat, setCat] = useState("todos");
  const [search, setSearch] = useState("");

  // 1. Conexión en tiempo real con Firestore
  useEffect(() => {
    // Consultamos solo los tours que estén marcados como activos
    const q = query(collection(db, "tours"), where("active", "==", true));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const toursData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setTours(toursData);
      setLoading(false);
    }, (error) => {
      console.error("Error cargando tours:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 2. Lógica de filtrado (ahora sobre el estado 'tours')
  const filtered = tours.filter((p) => {
    const matchCat = cat === "todos" || p.category?.toLowerCase() === cat.toLowerCase();
    const matchSearch = 
      p.title?.toLowerCase().includes(search.toLowerCase()) || 
      p.location?.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="packages-page">
      {/* Hero Dinámico */}
      <div className="pkg-hero">
        <div className="pkg-hero__content">
          <span className="pkg-hero__label">Explora Medellín</span>
          <h1 className="pkg-hero__title">Tours y Experiencias</h1>
          <div className="pkg-hero__search">
            <span className="pkg-hero__search-icon">🔍</span>
            <input
              type="text"
              placeholder="¿Qué quieres descubrir hoy?"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Filtros de Categoría */}
      <div className="pkg-filters">
        <div className="pkg-filters__inner">
          {CATS.map((c) => (
            <button
              key={c.key}
              className={`pkg-filter-btn ${cat === c.key ? "active" : ""}`}
              onClick={() => setCat(c.key)}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid de Tours */}
      <div className="pkg-content">
        {loading ? (
          <div className="pkg-loading">
             <div className="gd-spinner"></div>
             <p>Buscando las mejores rutas...</p>
          </div>
        ) : (
          <div className="pkg-grid">
            {filtered.length === 0 ? (
              <div className="pkg-empty">
                <p>No encontramos rutas que coincidan con tu búsqueda.</p>
                <button className="btn btn--outline" onClick={() => { setCat("todos"); setSearch(""); }}>
                  Ver todos los tours
                </button>
              </div>
            ) : (
              filtered.map((p) => (
                <div key={p.id} className="pkg-card">
                  <div className="pkg-card__img-wrap">
                    <img 
                      src={p.imageUrl || "https://via.placeholder.com/400x250?text=Tour+Mate"} 
                      alt={p.title} 
                      loading="lazy" 
                    />
                    {/* Badge dinámico: si no hay badge en DB, no se muestra nada */}
                    {p.badge && <span className="pkg-card__badge">{p.badge}</span>}
                    <span className="pkg-card__duration">⏱ {p.duration}</span>
                  </div>
                  <div className="pkg-card__body">
                    <p className="pkg-card__location">📍 {p.location}</p>
                    <h3 className="pkg-card__name">{p.title}</h3>
                    <p className="pkg-card__guide">Con guía local: <strong>{p.guideName || "Experto Local"}</strong></p>
                    
                    <div className="pkg-card__footer">
                      <div className="pkg-card__rating">
                        ★ {p.rating || "5.0"} <span>({p.reviews || 0})</span>
                      </div>
                      <div className="pkg-card__price">
                        ${Number(p.price).toLocaleString("es-CO")}
                        <small> COP</small>
                      </div>
                    </div>
                    {/* Redirige al detalle del tour o al registro si no está logueado */}
                    <Link to={`/tour/${p.id}`} className="pkg-card__cta">Ver detalles</Link>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}