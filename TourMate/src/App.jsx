import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import PackagesPage from './pages/PackagesPage'; 
import ContactPage from './pages/ContactPage';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider> {/* Envolvemos la app para tener acceso al usuario */}
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/paquetes" element={<PackagesPage />} />
          <Route path="/contacto" element={<ContactPage />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;