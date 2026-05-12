import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { db } from "../firebase/firebaseConfig"; // Ajusta la ruta según tu proyecto
import { collection, query, where, limit, orderBy, onSnapshot } from "firebase/firestore";
import "../styles/HomePage.css";

const STATS = [
  { num: "5,000+", label: "Turistas satisfechos" },
  { num: "50+", label: "Guías Paisas" },
  { num: "12+", label: "Rutas Locales" },
  { num: "4.9★", label: "Rating Ciudad" },
];

const HOW = [
  { step: "01", title: "Elige tu Ruta", desc: "Explora desde el grafiti tour hasta caminatas por la cordillera." },
  { step: "02", title: "Conecta con tu Guía", desc: "Expertos locales que conocen cada rincón de la ciudad." },
  { step: "03", title: "Vive Medellín", desc: "Experiencias seguras, auténticas y llenas de cultura paisa." },
];

export default function HomePage() {
  const [realTours, setRealTours] = useState([]);
  const [loading, setLoading] = useState(true);

  // Conexión con Firestore para traer los tours más nuevos
  useEffect(() => {
    const q = query(
      collection(db, "tours"),
      where("active", "==", true),
      orderBy("createdAt", "desc"), // Ordenar por fecha de creación
      limit(6) // Mostrar solo los 6 principales en el Home
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const toursData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setRealTours(toursData);
      setLoading(false);
    }, (error) => {
      console.error("Error en Home Firestore:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="home">
      {/* HERO */}
      <section className="hero">
        <div className="hero__bg" />
        <div className="hero__content">
          <span className="hero__badge">🚠 Vive la transformación de Medellín</span>
          <h1 className="hero__title">
            Medellín desde<br />
            <em>adentro.</em>
          </h1>
          <p className="hero__desc">
            No somos una agencia más; somos locales apasionados. Te llevamos a descubrir la verdadera esencia de la Ciudad de la Eterna Primavera.
          </p>
          <div className="hero__cta">
            <Link to="/packages" className="btn btn--primary btn--lg">Explorar Tours</Link>
            <Link to="/register" className="btn btn--ghost btn--lg">Soy Guía en Medellín →</Link>
          </div>
          <div className="hero__stats">
            {STATS.map((s) => (
              <div key={s.label} className="hero__stat">
                <strong>{s.num}</strong>
                <span>{s.label}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="hero__visual">
          <img src="https://tourcomuna13.com/wp-content/uploads/2024/06/tour-comuna-13-1.jpg" alt="Metro Cable Medellín" />
          <div className="hero__card hero__card--1">
            <span>🚠</span>
            <div>
              <strong>Tour Comuna 13</strong>
              <p>Desde $80.000 COP</p>
            </div>
          </div>
          <div className="hero__card hero__card--2">
            <span>🔥</span>
            <div>
              <strong>Popular hoy</strong>
              <p>Graffiti & Café</p>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="section how">
        <div className="section__inner">
          <div className="section__label">Nuestra metodología</div>
          <h2 className="section__title">Tu experiencia en tres pasos</h2>
          <div className="how__grid">
            {HOW.map((h) => (
              <div key={h.step} className="how__card">
                <div className="how__step">{h.step}</div>
                <h3>{h.title}</h3>
                <p>{h.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DESTINATIONS DINÁMICOS */}
      <section className="section destinations">
        <div className="section__inner">
          <div className="section__label">Experiencias Imperdibles</div>
          <h2 className="section__title">Lo mejor de Medellín y sus alrededores</h2>
          
          {loading ? (
            <p style={{ textAlign: "center", color: "#64748b" }}>Cargando rutas locales...</p>
          ) : (
            <div className="dest__grid">
              {realTours.map((d) => (
                <Link to={`/tour/${d.id}`} key={d.id} className="dest__card">
                  <img src={d.imageUrl || "https://via.placeholder.com/400x300"} alt={d.title} loading="lazy" />
                  <div className="dest__overlay">
                    <span className="dest__tag">{d.category || "Tour"}</span>
                    <div className="dest__info">
                      <h3>{d.title}</h3>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span className="dest__rating">★ {d.rating || "5.0"}</span>
                        <span style={{ fontSize: "0.85rem", fontWeight: "bold" }}>
                          ${Number(d.price).toLocaleString("es-CO")}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
          
          <div style={{ textAlign: "center", marginTop: "40px" }}>
            <Link to="/packages" className="btn btn--outline">Ver todas las rutas locales →</Link>
          </div>
        </div>
      </section>

      {/* CTA BANNER */}
      <section className="cta-banner">
        <div className="cta-banner__inner">
          <h2>¿Conoces Medellín como nadie?</h2>
          <p>Únete a nuestra red de guías locales y genera ingresos compartiendo tu cultura.</p>
          <Link to="/register" className="btn btn--white btn--lg">Registrarme como guía paisa</Link>
        </div>
      </section>
    </div>
  );
}