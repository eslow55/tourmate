import React, { useState, useEffect } from 'react';
import { db } from '../../firebase/firebaseConfig';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import '../../styles/TouristDashboard.css';

const ExploreTours = () => {
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('Todos');
  const navigate = useNavigate();

  // Categorías alineadas con tu base de datos (Ej: "Cultural")
  const categories = ['Todos', 'Cultural', 'Aventura', 'Gastronomía', 'Nocturno'];

  useEffect(() => {
    const fetchTours = async () => {
      setLoading(true);
      try {
        // Ajuste: Usamos "active" como está en tu Firestore
        let q = query(collection(db, "tours"), where("active", "==", true));
        
        if (filter !== 'Todos') {
          q = query(collection(db, "tours"), 
                where("active", "==", true), 
                where("category", "==", filter));
        }

        const querySnapshot = await getDocs(q);
        const toursData = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return { 
            id: doc.id, 
            ...data,
            // Mapeo dinámico para que el componente reciba los nombres correctos
            name: data.title,      // Firestore usa "title"
            image: data.imageUrl,  // Firestore usa "imageUrl"
            price: data.price      // Firestore usa "price"
          };
        });
        
        setTours(toursData);
      } catch (error) {
        console.error("Error al traer los tours:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTours();
  }, [filter]);

  if (loading) return <div className="loading-grid">Buscando las mejores experiencias en Medellín...</div>;

  return (
    <div className="explore-section animate-fade-in">
      <div className="explore-header">
        <h2>Explora Medellín</h2>
        <div className="filter-bar">
          {categories.map(cat => (
            <button 
              key={cat} 
              className={`filter-btn ${filter === cat ? 'active' : ''}`}
              onClick={() => setFilter(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {tours.length === 0 ? (
        <div className="empty-results">
          <p>No hay tours activos en la categoría <strong>{filter}</strong>.</p>
        </div>
      ) : (
        <div className="tour-grid">
          {tours.map(tour => (
            <div 
              key={tour.id} 
              className="tour-card-mini" 
              onClick={() => navigate(`/tour/${tour.id}`)}
            >
              <div className="image-wrapper">
                {/* Fallback si imageUrl está vacío en Firestore */}
                <img src={tour.image || '/medellin-default.jpg'} alt={tour.name} />
                <span className="price-badge">${Number(tour.price).toLocaleString()} COP</span>
              </div>
              
              <div className="tour-card-body">
                <span className="category-tag">{tour.category}</span>
                <h3>{tour.name}</h3>
                <p className="tour-description-short">
                  {tour.description || "Sin descripción disponible."}
                </p>
                <div className="card-footer">
                  <span className="duration">⏱ {tour.duration || 'N/A'}</span>
                  <button className="btn-view">Ver detalles</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ExploreTours;