import { useState } from "react";
import ModalNotificacion from "../components/ModalNotificacion";
import "../styles/ContactPage.css";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [notif, setNotif] = useState(null);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      setNotif({ type: "warning", title: "Campos requeridos", message: "Por favor completa nombre, correo y mensaje." });
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200)); // simulate send
    setNotif({ type: "success", title: "¡Mensaje enviado!", message: "Te responderemos en las próximas 24 horas." });
    setForm({ name: "", email: "", subject: "", message: "" });
    setLoading(false);
  };

  return (
    <div className="contact-page">
      {/* Hero */}
      <div className="contact-hero">
        <div className="contact-hero__bg" />
        <div className="contact-hero__content">
          <span className="contact-hero__label">Contáctanos</span>
          <h1 className="contact-hero__title">¿Tienes alguna<br />pregunta?</h1>
          <p>Estamos listos para ayudarte a planear el viaje de tus sueños.</p>
        </div>
      </div>

      {/* Content */}
      <div className="contact-content">
        {/* Info */}
        <div className="contact-info">
          <h2>Información de contacto</h2>
          <div className="contact-info__items">
            {[
              { icon: "📧", label: "Email", val: "hola@tourmate.co" },
              { icon: "📞", label: "Teléfono", val: "+57 300 000 0000" },
              { icon: "📍", label: "Dirección", val: "El Poblado, Medellín, Antioquia" },
              { icon: "🕐", label: "Horario", val: "Lun–Vie 8am–6pm" },
            ].map((i) => (
              <div key={i.label} className="contact-info__item">
                <span className="contact-info__icon">{i.icon}</span>
                <div>
                  <p className="contact-info__label">{i.label}</p>
                  <p className="contact-info__val">{i.val}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="contact-info__map">
            <img
              src="https://maps.googleapis.com/maps/api/staticmap?center=Medellin,Colombia&zoom=13&size=400x200&maptype=roadmap&style=element:geometry|color:0x212121&key=AIzaSyD_DEMO"
              alt="Mapa"
              onError={(e) => { e.target.style.display = "none"; }}
            />
            <div className="contact-info__map-fallback">
              📍 Medellín, Colombia
            </div>
          </div>
        </div>

        {/* Form */}
        <form className="contact-form" onSubmit={handleSubmit} noValidate>
          <h2>Envíanos un mensaje</h2>

          <div className="contact-form__row">
            <div className="contact-form__field">
              <label>Nombre completo</label>
              <input name="name" value={form.name} onChange={handleChange} placeholder="Tu nombre" />
            </div>
            <div className="contact-form__field">
              <label>Correo electrónico</label>
              <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="tu@email.com" />
            </div>
          </div>

          <div className="contact-form__field">
            <label>Asunto</label>
            <input name="subject" value={form.subject} onChange={handleChange} placeholder="¿En qué podemos ayudarte?" />
          </div>

          <div className="contact-form__field">
            <label>Mensaje</label>
            <textarea name="message" value={form.message} onChange={handleChange} rows={5} placeholder="Escribe tu mensaje aquí..." />
          </div>

          <button type="submit" className="contact-form__submit" disabled={loading}>
            {loading ? <span className="auth-card__spinner" /> : "Enviar mensaje"}
          </button>
        </form>
      </div>

      {notif && (
        <ModalNotificacion type={notif.type} title={notif.title} message={notif.message} onClose={() => setNotif(null)} />
      )}
    </div>
  );
}