import React from 'react';
import './ModalNotificacion.css';

const ModalNotificacion = ({ mostrar, mensaje, onAceptar }) => {
  if (!mostrar) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-icon">🚀</div>
        <div className="modal-body">
          <p>{mensaje}</p>
        </div>
        <div className="modal-footer">
          <button className="btn-modal-aceptar" onClick={onAceptar}>
            ACEPTAR
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalNotificacion;