// Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/api';
import Overview from './components/Overview';
import VehiclesManagement from './components/VehiclesManagement';
import ContractsManagement from './components/ContractsManagement';
import BlacklistManagement from './components/BlacklistManagement';
import ClientsManagement from './components/ClientsManagement'; // New import
import './Dashboard.css';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [activeSection, setActiveSection] = useState('overview');
  const [vehicles, setVehicles] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [blacklist, setBlacklist] = useState([]);
  const [clients, setClients] = useState([]); // New state
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      console.log('🔑 Token:', localStorage.getItem('token'));
      console.log('👤 User:', user);
      
      loadVehicles();
      loadContracts();
      loadBlacklist();
      loadClients(); // Load clients
    }
  }, [user]);

  const loadVehicles = async () => {
    try {
      setLoading(true);
      const res = await api.get('/vehicles/my-vehicles');
      setVehicles(res.data.vehicles);
    } catch (err) {
      console.error('❌ Erreur loading vehicles:', err);
      setMessage('Erreur lors du chargement des véhicules');
    } finally {
      setLoading(false);
    }
  };

  const loadContracts = async () => {
    try {
      const res = await api.get('/contracts/my-contracts');
      setContracts(res.data.contracts);
    } catch (err) {
      console.error('❌ Erreur loading contracts:', err);
      setMessage('Erreur lors du chargement des contrats');
    }
  };

  const loadBlacklist = async () => {
    try {
      const res = await api.get('/blacklist');
      setBlacklist(res.data.blacklist);
    } catch (err) {
      console.error('❌ Erreur loading blacklist:', err);
      setMessage('Erreur lors du chargement de la liste noire');
    }
  };

  // New function to load clients
  const loadClients = async () => {
    try {
      setLoading(true);
      const res = await api.get('/clients/my-clients');
      console.log('✅ Clients chargés:', res.data);
      setClients(res.data.clients);
    } catch (err) {
      console.error('❌ Erreur loading clients:', err);
      setMessage('Erreur lors du chargement des clients');
    } finally {
      setLoading(false);
    }
  };

  const renderActiveSection = () => {
    const commonProps = {
      user,
      vehicles,
      contracts,
      blacklist,
      clients, // Add clients to props
      setVehicles,
      setContracts,
      setBlacklist,
      setClients, // Add setClients to props
      setMessage,
      loadVehicles,
      loadContracts,
      loadBlacklist,
      loadClients // Add loadClients to props
    };

    switch (activeSection) {
      case 'overview':
        return <Overview {...commonProps} />;
      case 'vehicles':
        return <VehiclesManagement {...commonProps} />;
      case 'contracts':
        return <ContractsManagement {...commonProps} />;
      case 'blacklist':
        return <BlacklistManagement {...commonProps} />;
      case 'clients': // New case
        return <ClientsManagement {...commonProps} />;
      default:
        return <Overview {...commonProps} />;
    }
  };

  // SVG Icons - Add ClientsIcon
  const OverviewIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="7" height="7"></rect>
      <rect x="14" y="3" width="7" height="7"></rect>
      <rect x="14" y="14" width="7" height="7"></rect>
      <rect x="3" y="14" width="7" height="7"></rect>
    </svg>
  );

  const VehiclesIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"></path>
      <circle cx="7" cy="17" r="2"></circle>
      <path d="M9 17h6"></path>
      <circle cx="17" cy="17" r="2"></circle>
    </svg>
  );

  const ContractsIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
      <polyline points="14 2 14 8 20 8"></polyline>
      <line x1="16" y1="13" x2="8" y2="13"></line>
      <line x1="16" y1="17" x2="8" y2="17"></line>
      <polyline points="10 9 9 9 8 9"></polyline>
    </svg>
  );

  const BlacklistIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="15" y1="9" x2="9" y2="15"></line>
      <line x1="9" y1="9" x2="15" y2="15"></line>
    </svg>
  );

  // New Clients Icon
  const ClientsIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
      <circle cx="9" cy="7" r="4"></circle>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
    </svg>
  );

  const LogoutIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
      <polyline points="16 17 21 12 16 7"></polyline>
      <line x1="21" y1="12" x2="9" y2="12"></line>
    </svg>
  );

  const menuItems = [
    { id: 'overview', label: 'Vue d\'ensemble', icon: <OverviewIcon /> },
    { id: 'vehicles', label: 'Véhicules', icon: <VehiclesIcon /> },
    { id: 'contracts', label: 'Contrats', icon: <ContractsIcon /> },
    { id: 'clients', label: 'Clients', icon: <ClientsIcon /> }, // New menu item
    { id: 'blacklist', label: 'Liste Noire', icon: <BlacklistIcon /> }
  ];

  return (
    <div className="dashboard-layout">
      {/* Desktop Sidebar */}
      <aside className="desktop-sidebar">
        <div className="sidebar-header">
          {user.logoEntreprise && (
            <img
              src={user.logoEntreprise}
              alt="Logo entreprise"
              className="company-logo"
            />
          )}
          <div className="company-info">
            <h2>{user.entreprise}</h2>
            <p>Tableau de Bord</p>
          </div>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map(item => (
            <button
              key={item.id}
              className={`nav-item ${activeSection === item.id ? 'active' : ''}`}
              onClick={() => setActiveSection(item.id)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <p>Bonjour, <strong>{user.name}</strong></p>
          </div>
          <button onClick={logout} className="logout-btn">
            <LogoutIcon />
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="dashboard-main">
        {/* Mobile Header */}
        <header className="mobile-header">
          <div className="mobile-company">
            {user.logoEntreprise && (
              <img
                src={user.logoEntreprise}
                alt="Logo entreprise"
                className="mobile-logo"
              />
            )}
            <div>
              <h2>{user.entreprise}</h2>
              <p>Bonjour, {user.name}</p>
            </div>
          </div>
        </header>

        {/* Loading */}
        {loading && (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            padding: '20px'
          }}>
            <div style={{
              width: '32px',
              height: '32px',
              border: '3px solid #f0f0f0',
              borderTop: '3px solid #36c275',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}></div>
          </div>
        )}

        {/* Message */}
        {message && (
          <div className={`message ${message.includes('✅') ? 'message-success' : 'message-error'}`}>
            {message}
          </div>
        )}

        {/* Content */}
        <div className="content-area">
          {renderActiveSection()}
        </div>

        {/* Mobile Navigation */}
        <nav className="mobile-nav">
          {menuItems.map(item => (
            <button
              key={item.id}
              className={`mobile-nav-item ${activeSection === item.id ? 'active' : ''}`}
              onClick={() => setActiveSection(item.id)}
            >
              <span className="mobile-nav-icon">{item.icon}</span>
              <span className="mobile-nav-label">{item.label}</span>
            </button>
          ))}
        </nav>
      </main>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
