import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";

// Layout y Componentes
import MainLayout from "./components/MainLayout";

// Páginas Públicas
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ContactPage from "./pages/ContactPage";
import PackagesPage from "./pages/PackagesPage";
import TourDetailPage from "./pages/TourDetailPage"; 

// Dashboards (Protegidos)
import AdminDashboard from "./pages/AdminDashboard";
import GuideDashboard from "./pages/GuideDashboard";
import TouristDashboard from "./pages/TouristDashboard";

/**
 * COMPONENTE: RequireAuth
 * Protege rutas según el rol. Maneja estados de carga de Firebase y Firestore.
 */
function RequireAuth({ children, roles }) {
  const { user, profile, loading } = useAuth();

  // 1. Estado de carga global
  if (loading) {
    return (
      <div className="v4-app-loading">
        <div className="v4-spinner" />
        <p>Verificando identidad...</p>
      </div>
    );
  }

  // 2. Si no hay usuario, al login
  if (!user) return <Navigate to="/login" replace />;

  // 3. Esperar a que el perfil (rol) cargue desde Firestore
  if (roles && !profile) {
    return (
      <div className="v4-app-loading">
        <div className="v4-spinner" />
      </div>
    );
  }

  // 4. Validación de permisos por rol
  if (roles && !roles.includes(profile?.role)) {
    console.warn(`Acceso restringido: Rol '${profile?.role}' no autorizado.`);
    return <Navigate to="/" replace />;
  }

  return children;
}

/**
 * COMPONENTE: DashboardRedirect
 * Redirección inteligente tras el login según el perfil del usuario.
 */
function DashboardRedirect({ profile }) {
  if (!profile) return <div className="v4-app-loading"><div className="v4-spinner" /></div>;
  
  const routes = {
    admin: "/admin",
    guide: "/guide",
    tourist: "/tourist"
  };

  return <Navigate to={routes[profile.role] || "/"} replace />;
}

/**
 * COMPONENTE: AppRoutes
 * Definición del árbol de navegación de TourMate.
 */
function AppRoutes() {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="v4-app-loading">
        <div className="v4-spinner" />
      </div>
    );
  }

  return (
    <Routes>
      {/* --- SECCIÓN PÚBLICA (Con Header/Footer) --- */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/packages" element={<PackagesPage />} />
        <Route path="/tour/:id" element={<TourDetailPage />} />
        
        {/* Redirección si el usuario ya está autenticado */}
        <Route 
          path="/login" 
          element={user ? <DashboardRedirect profile={profile} /> : <LoginPage />} 
        />
        <Route 
          path="/register" 
          element={user ? <DashboardRedirect profile={profile} /> : <RegisterPage />} 
        />
      </Route>

      {/* --- SECCIÓN ADMINISTRATIVA --- */}
      <Route
        path="/admin"
        element={
          <RequireAuth roles={["admin"]}>
            <AdminDashboard user={user} profile={profile} />
          </RequireAuth>
        }
      />
      
      {/* --- SECCIÓN GUÍAS --- */}
      <Route
        path="/guide"
        element={
          <RequireAuth roles={["guide"]}>
            <GuideDashboard user={user} profile={profile} />
          </RequireAuth>
        }
      />
      
      {/* --- SECCIÓN TURISTAS (Tu Panel Actual) --- */}
      <Route
        path="/tourist"
        element={
          <RequireAuth roles={["tourist"]}>
            <TouristDashboard user={user} profile={profile} />
          </RequireAuth>
        }
      />

      {/* --- FALLBACK: Error 404 / Redirección --- */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

/**
 * PUNTO DE ENTRADA PRINCIPAL
 * Incluye las Future Flags de React Router v7.
 */
export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <div className="v4-app-main-wrapper">
          <AppRoutes />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

// Estilos base integrados para el Spinner
const style = document.createElement('style');
style.innerHTML = `
  .v4-app-loading { height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; background: #f8fafc; }
  .v4-spinner { width: 45px; height: 45px; border: 4px solid #e2e8f0; border-top: 4px solid #ff5a3c; border-radius: 50%; animation: v4-spin 0.8s linear infinite; margin-bottom: 15px; }
  @keyframes v4-spin { to { transform: rotate(360deg); } }
  .v4-app-main-wrapper { min-height: 100vh; display: flex; flex-direction: column; }
`;
document.head.appendChild(style);