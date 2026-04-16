// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import Header from './components/Header';
import Footer from './components/Footer';

function App() {
  return (
    <Router>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        {/* El Header siempre visible */}
        <Header />

        <main style={{ flexGrow: 1 }}>
          <Routes>
            {/* Ruta principal: Muestra el login al entrar a la página */}
            <Route path="/" element={<LoginPage />} />
            <Route path="/login" element={<LoginPage />} />
            
            {/* Aquí puedes agregar más rutas luego */}
          </Routes>
        </main>

        {/* El Footer siempre visible */}
        <Footer />
      </div>
    </Router>
  );
}

export default App;