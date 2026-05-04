import React from 'react';
import { useNavigate } from 'react-router-dom';
import './PackagesPage.css';

const PackagesPage = () => {
  const navigate = useNavigate();

  const packages = [
  {
    id: 1,
    title: "Tour Comuna 13",
    price: "$45.000",
    image: "https://www.shutterstock.com/image-photo/antioquia-province-colombia-february-14-600w-2629180353.jpg",
    desc: "Historia, arte urbano y las mejores vistas de la ciudad."
  },
  {
    id: 2,
    title: "Pueblito Paisa & Centro",
    price: "$35.000",
    image: "https://www.infobae.com/resizer/v2/XAA7V7QQHRHR5DN7JQ7BEA3R6Q.jpg?auth=edccd71f5d9ced5e4c375e829005a918c3b0c0ad57937dcf6997367a75b80454&smart=true&width=992&height=558&quality=85",
    desc: "Un viaje por la tradición antioqueña en el cerro Nutibara."
  },
  {
    id: 3,
    title: "Parque Arví Express",
    price: "$60.000",
    image: "https://tourcomuna13.com/wp-content/uploads/2021/06/tour-parque-arvi.jpg",
    desc: "Naturaleza y aire puro llegando en Metrocable sobre Medellín."
  }
];

  return (
    <div className="packages-layout">
      {/* Reutilizamos el Header para consistencia visual */}
      <header className="main-header">
        <div className="logo-section" onClick={() => navigate("/login")}>
          <div className="logo-icon">📍</div>
          <span className="logo-text">TourMate</span>
        </div>
        <nav className="header-nav">
          <span onClick={() => navigate("/login")}>Inicio</span>
          <span className="active-link" onClick={() => navigate("/paquetes")}>Paquetes</span>
          <span onClick={() => navigate("/contacto")}>Contactanos</span>
        </nav>
      </header>

      <main className="packages-content">
        <div className="packages-hero">
          <h1>Nuestros Paquetes 🎒</h1>
          <p>Elige tu próxima aventura en la Ciudad de la Eterna Primavera.</p>
        </div>

        <div className="packages-grid">
          {packages.map((pkg) => (
            <div key={pkg.id} className="package-card">
              <div className="card-image" style={{ backgroundImage: `url(${pkg.image})` }}>
                <span className="price-tag">{pkg.price}</span>
              </div>
              <div className="card-info">
                <h3>{pkg.title}</h3>
                <p>{pkg.desc}</p>
                <button className="btn-reserve">Reservar ahora</button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default PackagesPage;