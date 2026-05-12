import { useEffect } from "react";
import "../styles/ModalNotificacion.css";

export default function ModalNotificacion({ type = "info", title, message, onClose, duration = 4000 }) {
  useEffect(() => {
    if (!duration) return;
    const t = setTimeout(onClose, duration);
    return () => clearTimeout(t);
  }, [duration, onClose]);

  const icons = {
    success: "✓",
    error: "✕",
    info: "ℹ",
    warning: "⚠",
  };

  return (
    <div className={`modal-notif modal-notif--${type}`} role="alert">
      <div className="modal-notif__icon">{icons[type]}</div>
      <div className="modal-notif__body">
        {title && <strong className="modal-notif__title">{title}</strong>}
        {message && <p className="modal-notif__msg">{message}</p>}
      </div>
      <button className="modal-notif__close" onClick={onClose} aria-label="Cerrar">✕</button>
    </div>
  );
}