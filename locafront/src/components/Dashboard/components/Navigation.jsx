// components/Navigation.jsx
import React from 'react';

const Navigation = ({ activeSection, setActiveSection }) => {
  const sections = [
    { id: 'overview', label: 'Vue d\'ensemble', color: 'var(--purple)' },
    { id: 'vehicles', label: 'Gestion Véhicules', color: 'var(--blue)' },
    { id: 'contracts', label: 'Contrats', color: 'var(--green)' },
    { id: 'blacklist', label: 'Liste Noire', color: 'var(--red)' }
  ];

  return (
    <nav style={{
      background: 'var(--card)',
      padding: 'var(--space-4) var(--space-6)',
      boxShadow: 'var(--shadow)',
      marginBottom: 'var(--space-6)'
    }}>
      <div className="switch">
        {sections.map(section => (
          <button
            key={section.id}
            onClick={() => setActiveSection(section.id)}
            className={activeSection === section.id ? 'active' : ''}
            style={{
              border: '0',
              background: activeSection === section.id ? 'var(--card)' : 'transparent',
              borderRadius: '999px',
              padding: 'var(--space-3) var(--space-4)',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
              fontWeight: '700',
              color: activeSection === section.id ? section.color : 'var(--text)',
              cursor: 'pointer',
              transition: 'all .2s'
            }}
          >
            {section.label}
          </button>
        ))}
      </div>
    </nav>
  );
};

export default Navigation;
