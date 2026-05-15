import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";

// Layout y Componentes Globales
import MainLayout from "./components/MainLayout";

// Páginas Públicas (Carpeta /pages)
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ContactPage from "./pages/ContactPage";
import PackagesPage from "./pages/PackagesPage";
import TourDetailPage from "./pages/TourDetailPage"; 

// --- DASHBOARDS Y COMPONENTES INTERNOS ---
// Admin
import AdminDashboard from "./components/AdminDashboard/AdminDashboard";
import ApproveGuides from "./components/AdminDashboard/ApproveGuides";
import ApproveTours from "./components/AdminDashboard/ApproveTours";
import SiteAnalytics from "./components/AdminDashboard/SiteAnalytics";

// Guía
import GuideDashboard from "./components/GuideDashboard/GuideDashboard";
import MyTours from "./components/GuideDashboard/MyTours";
import CreateTour from "./components/GuideDashboard/CreateTour";
import Bookings from "./components/GuideDashboard/Bookings";
import GuideProfile from "./components/GuideDashboard/GuideProfile";

// Turista
import TouristDashboard from "./components/TouristDashboard/TouristDashboard";
import ExploreTours from "./components/TouristDashboard/ExploreTours";
import MyBookings from "./components/TouristDashboard/MyBookings";
import TouristProfile from './components/TouristDashboard/TouristProfile';

/**
 * COMPONENTE: RequireAuth - Protege rutas según el rol del usuario
 */
function RequireAuth({ children, roles }) {
  const { user, profile, loading } = useAuth();

  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;

  if (roles && !profile) return <LoadingScreen />;

  if (roles && !roles.includes(profile?.role)) {
    console.warn(`Acceso restringido: Rol '${profile?.role}' no autorizado.`);
    return <Navigate to="/" replace />;
  }

  return children;
}

/**
 * COMPONENTE: DashboardRedirect - Maneja la redirección post-login
 */
function DashboardRedirect({ profile }) {
  if (!profile) return <LoadingScreen />;
  const routes = { admin: "/admin", guide: "/guide", tourist: "/tourist" };
  return <Navigate to={routes[profile.role] || "/"} replace />;
}

function LoadingScreen() {
  return (
    <div className="v4-app-loading">
      <div className="v4-spinner" />
      <p>Cargando TourMate...</p>
    </div>
  );
}

/**
 * COMPONENTE: AppRoutes - Definición de la jerarquía de navegación
 */
function AppRoutes() {
  const { user, profile, loading } = useAuth();

  if (loading) return <LoadingScreen />;

  return (
    <Routes>
      {/* --- SECCIÓN PÚBLICA --- */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/packages" element={<PackagesPage />} />
        <Route 
          path="/login" 
          element={user ? <DashboardRedirect profile={profile} /> : <LoginPage />} 
        />
        <Route 
          path="/register" 
          element={user ? <DashboardRedirect profile={profile} /> : <RegisterPage />} 
        />
      </Route>

      <Route path="/tour/:id" element={<TourDetailPage />} />

      {/* --- DASHBOARD ADMIN --- */}
      <Route
        path="/admin"
        element={
          <RequireAuth roles={["admin"]}>
            <AdminDashboard />
          </RequireAuth>
        }
      >
        <Route index element={<Navigate to="guides" replace />} />
        <Route path="guides" element={<ApproveGuides />} />
        <Route path="tours" element={<ApproveTours />} />
        <Route path="analytics" element={<SiteAnalytics />} />
      </Route>
      
      {/* --- DASHBOARD GUÍA --- */}
      <Route
        path="/guide"
        element={
          <RequireAuth roles={["guide"]}>
            <GuideDashboard />
          </RequireAuth>
        }
      >
        <Route index element={<Navigate to="my-tours" replace />} />
        <Route path="my-tours" element={<MyTours />} />
        <Route path="create-tour" element={<CreateTour />} />
        <Route path="bookings" element={<Bookings />} />
        <Route path="profile" element={<GuideProfile userData={profile} />} />
        <Route path="stats" element={<div>Próximamente: Mis Ganancias</div>} />
      </Route>
      
      {/* --- DASHBOARD TURISTA --- */}
      <Route
        path="/tourist"
        element={
          <RequireAuth roles={["tourist"]}>
            <TouristDashboard />
          </RequireAuth>
        }
      >
        <Route index element={<Navigate to="explore" replace />} />
        <Route path="explore" element={<ExploreTours />} />
        <Route path="my-bookings" element={<MyBookings />} />
        <Route path="profile" element={<TouristProfile />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

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

// Estilos globales integrados para el Spinner y Wrapper
const style = document.createElement('style');
style.innerHTML = `
  .v4-app-loading { height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; background: #ffffff; font-family: 'Inter', sans-serif; }
  .v4-spinner { width: 45px; height: 45px; border: 4px solid #f1f5f9; border-top: 4px solid #ff5a3c; border-radius: 50%; animation: v4-spin 0.8s linear infinite; margin-bottom: 15px; }
  @keyframes v4-spin { to { transform: rotate(360deg); } }
  .v4-app-main-wrapper { min-height: 100vh; display: flex; flex-direction: column; background: #ffffff; }
`;
document.head.appendChild(style);