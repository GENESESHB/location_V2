// components/Header.jsx
import React from 'react';

const Header = ({ user, logout }) => {
  return (
    <header className="site-header">
      <div className="nav">
        <div className="brand">
          {user.logoEntreprise && (
            <img
              src={user.logoEntreprise}
              alt="Logo entreprise"
              className="logo"
            />
          )}
          <div>
            <h1 style={{ margin: 0, fontSize: '24px', color: '#fff' }}>
              {user.entreprise}
            </h1>
            <p style={{ margin: 0, color: 'rgba(255,255,255,0.8)', fontSize: '14px' }}>
              Tableau de Bord Partenaire
            </p>
          </div>
        </div>

        <div className="menu">
          <span style={{ color: 'rgba(255,255,255,0.9)' }}>Bonjour, {user.name}</span>
          <button
            onClick={logout}
            className="signin"
            style={{
              background: '#fff',
              color: '#0f1720',
              border: 'none',
              borderRadius: '10px',
              padding: '8px 16px',
              cursor: 'pointer',
              fontWeight: '700'
            }}
          >
            Déconnexion
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
