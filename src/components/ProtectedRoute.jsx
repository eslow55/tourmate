import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, roles }) {
  const { user, profile, loading } = useAuth();

  // 1. Si el contexto está cargando la sesión inicial de Firebase
  if (loading) {
    return (
      <div className="app-loading">
        <div className="app-spinner" />
      </div>
    );
  }

  // 2. Si definitivamente no hay usuario logueado
  if (!user) return <Navigate to="/login" replace />;

  /**
   * 3. EL FIX: Si hay usuario pero el perfil de Firestore aún no llega,
   * mostramos el spinner un momento más en lugar de rebotarlo al home.
   */
  if (roles && !profile) {
    return (
      <div className="app-loading">
        <div className="app-spinner" />
      </div>
    );
  }

  // 4. Si el perfil ya llegó, validamos el rol
  if (roles && !roles.includes(profile?.role)) {
    console.warn("Acceso denegado: Rol insuficiente");
    return <Navigate to="/" replace />;
  }

  return children;
}