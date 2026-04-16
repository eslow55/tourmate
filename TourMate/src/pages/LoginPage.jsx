import React from 'react';
import LoginCard from '../components/LoginCard';
import './LoginPage.css';

const LoginPage = () => {
  return (
    <div className="page-layout">
      {/* Esta es la zona que ahora se expandirá para cubrir el resto de la página */}
      <main className="login-main-content">
        <LoginCard />
      </main>
    </div>
  );
};

export default LoginPage;