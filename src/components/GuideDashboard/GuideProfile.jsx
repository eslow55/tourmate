import React, { useState } from 'react';
import { auth, db } from '../../firebase/firebaseConfig';
import { doc, updateDoc } from 'firebase/firestore';

const GuideProfile = ({ userData }) => {
  const [profile, setProfile] = useState({
    name: userData.name || '',
    bio: userData.bio || '',
    phone: userData.phone || '',
    languages: userData.languages || ''
  });

  const handleUpdate = async (e) => {
    e.preventDefault();
    const userRef = doc(db, "users", auth.currentUser.uid);
    await updateDoc(userRef, profile);
    alert("Perfil actualizado correctamente");
  };

  return (
    <div className="guide-section profile-edit">
      <h2>Mi Perfil de Guía</h2>
      <form onSubmit={handleUpdate} className="guide-form">
        <div className="form-group">
          <label>Nombre Público</label>
          <input type="text" value={profile.name} onChange={(e) => setProfile({...profile, name: e.target.value})} />
        </div>
        <div className="form-group">
          <label>Biografía / Experiencia</label>
          <textarea value={profile.bio} onChange={(e) => setProfile({...profile, bio: e.target.value})} placeholder="Cuéntale a los viajeros por qué eres el mejor guía..." />
        </div>
        <div className="form-group">
          <label>Teléfono de Contacto</label>
          <input type="text" value={profile.phone} onChange={(e) => setProfile({...profile, phone: e.target.value})} />
        </div>
        <button type="submit" className="btn-submit-tour">Guardar Cambios</button>
      </form>
    </div>
  );
};

export default GuideProfile;