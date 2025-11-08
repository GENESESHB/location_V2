import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [activeSection, setActiveSection] = useState('overview');
  const [vehicles, setVehicles] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [blacklist, setBlacklist] = useState([]);
  const [message, setMessage] = useState('');

  // Vehicle form state
  const [vehicleForm, setVehicleForm] = useState({
    name: '',
    type: '',
    boiteVitesse: '',
    description: '',
    image: null,
    pricePerDay: '',
    assuranceStartDate: '',
    assuranceEndDate: '',
    vidangeDate: '',
    remarques: ''
  });

  // Contract form state
  const [contractForm, setContractForm] = useState({
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    clientCIN: '',
    vehicleId: '',
    startDate: '',
    endDate: '',
    totalPrice: 0
  });

  // Blacklist form state
  const [blacklistForm, setBlacklistForm] = useState({
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    clientCIN: '',
    reason: ''
  });

  const [imagePreview, setImagePreview] = useState(null);

  // Load vehicles on component mount
  useEffect(() => {
    if (user && user.id) {
      loadVehicles();
      loadContracts();
      loadBlacklist();
    }
  }, [user]);

  const loadVehicles = async () => {
    try {
      const res = await axios.get(`http://localhost:3001/vehicles/partner/${user.id}`);
      setVehicles(res.data);
    } catch (err) {
      console.error('Error loading vehicles:', err);
    }
  };

  const loadContracts = async () => {
    try {
      const res = await axios.get(`http://localhost:3001/contracts/partner/${user.id}`);
      setContracts(res.data);
    } catch (err) {
      console.error('Error loading contracts:', err);
    }
  };

  const loadBlacklist = async () => {
    try {
      const res = await axios.get(`http://localhost:3001/blacklist/partner/${user.id}`);
      setBlacklist(res.data);
    } catch (err) {
      console.error('Error loading blacklist:', err);
    }
  };

  const handleVehicleChange = (e) => {
    setVehicleForm({ ...vehicleForm, [e.target.name]: e.target.value });
  };

  const handleVehicleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setVehicleForm({ ...vehicleForm, image: file });
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleContractChange = (e) => {
    const { name, value } = e.target;
    setContractForm({ ...contractForm, [name]: value });

    // Calculate total price when dates change
    if ((name === 'startDate' || name === 'endDate') && contractForm.vehicleId) {
      calculateTotalPrice(contractForm.vehicleId, 
        name === 'startDate' ? value : contractForm.startDate,
        name === 'endDate' ? value : contractForm.endDate
      );
    }
  };

  const handleBlacklistChange = (e) => {
    setBlacklistForm({ ...blacklistForm, [e.target.name]: e.target.value });
  };

  const calculateTotalPrice = (vehicleId, startDate, endDate) => {
    if (!startDate || !endDate) return;

    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    const vehicle = vehicles.find(v => v.id === vehicleId);
    if (vehicle && diffDays > 0) {
      const total = diffDays * vehicle.pricePerDay;
      setContractForm(prev => ({ ...prev, totalPrice: total }));
    }
  };

  const addVehicle = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      Object.keys(vehicleForm).forEach(key => {
        formData.append(key, vehicleForm[key]);
      });
      formData.append('partnerId', user.id);

      const res = await axios.post('http://localhost:3001/vehicles', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setVehicles([...vehicles, res.data.vehicle]);
      setVehicleForm({
        name: '',
        type: '',
        boiteVitesse: '',
        description: '',
        image: null,
        pricePerDay: '',
        assuranceStartDate: '',
        assuranceEndDate: '',
        vidangeDate: '',
        remarques: ''
      });
      setImagePreview(null);
      setMessage('✅ Véhicule ajouté avec succès!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('❌ Erreur lors de l\'ajout du véhicule');
    }
  };

  const createContract = async (e) => {
    e.preventDefault();
    try {
      // Check if client is in blacklist
      const blacklistCheck = await axios.get(`http://localhost:3001/blacklist/check`, {
        params: {
          email: contractForm.clientEmail,
          cin: contractForm.clientCIN
        }
      });

      if (blacklistCheck.data.isBlacklisted) {
        setMessage('❌ Ce client est dans la liste noire!');
        return;
      }

      const contractData = {
        ...contractForm,
        partnerId: user.id,
        partnerName: user.entreprise
      };

      const res = await axios.post('http://localhost:3001/contracts', contractData);
      setContracts([...contracts, res.data.contract]);
      setContractForm({
        clientName: '',
        clientEmail: '',
        clientPhone: '',
        clientCIN: '',
        vehicleId: '',
        startDate: '',
        endDate: '',
        totalPrice: 0
      });
      setMessage('✅ Contrat créé avec succès!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('❌ Erreur lors de la création du contrat');
    }
  };

  const addToBlacklist = async (e) => {
    e.preventDefault();
    try {
      const blacklistData = {
        ...blacklistForm,
        partnerId: user.id,
        addedBy: user.name
      };

      const res = await axios.post('http://localhost:3001/blacklist', blacklistData);
      setBlacklist([...blacklist, res.data.blacklistedClient]);
      setBlacklistForm({
        clientName: '',
        clientEmail: '',
        clientPhone: '',
        clientCIN: '',
        reason: ''
      });
      setMessage('✅ Client ajouté à la liste noire!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('❌ Erreur lors de l\'ajout à la liste noire');
    }
  };

  const downloadContract = (contract) => {
    const contractWindow = window.open('', '_blank');
    contractWindow.document.write(`
      <html>
        <head>
          <title>Contrat de Location - ${contract.clientName}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; }
            .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; }
            .section { margin: 20px 0; }
            .signature { margin-top: 100px; }
            .footer { margin-top: 50px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>CONTRAT DE LOCATION DE VÉHICULE</h1>
            <h2>${user.entreprise}</h2>
          </div>
          
          <div class="section">
            <h3>Informations du Client</h3>
            <p><strong>Nom:</strong> ${contract.clientName}</p>
            <p><strong>Email:</strong> ${contract.clientEmail}</p>
            <p><strong>Téléphone:</strong> ${contract.clientPhone}</p>
            <p><strong>CIN:</strong> ${contract.clientCIN}</p>
          </div>

          <div class="section">
            <h3>Détails de la Location</h3>
            <p><strong>Période:</strong> ${new Date(contract.startDate).toLocaleDateString()} au ${new Date(contract.endDate).toLocaleDateString()}</p>
            <p><strong>Durée:</strong> ${Math.ceil((new Date(contract.endDate) - new Date(contract.startDate)) / (1000 * 60 * 60 * 24))} jours</p>
            <p><strong>Prix total:</strong> ${contract.totalPrice} DH</p>
          </div>

          <div class="signature">
            <p>Fait à ________, le ${new Date().toLocaleDateString()}</p>
            <br><br>
            <p>Signature Client: ________________</p>
            <p>Signature Partenaire: ________________</p>
          </div>

          <div class="footer">
            <p>Contrat généré par WegoRent - ${user.entreprise}</p>
          </div>
        </body>
      </html>
    `);
    contractWindow.document.close();
    contractWindow.print();
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9fa' }}>
      {/* Header */}
      <header style={{
        background: 'white',
        padding: '20px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          {user.logoEntreprise && (
            <img
              src={user.logoEntreprise}
              alt="Logo entreprise"
              style={{
                width: '50px',
                height: '50px',
                borderRadius: '5px',
                objectFit: 'cover'
              }}
            />
          )}
          <div>
            <h1 style={{ margin: 0, fontSize: '24px', color: '#333' }}>
              {user.entreprise}
            </h1>
            <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
              Tableau de Bord Partenaire
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <span style={{ color: '#666' }}>Bonjour, {user.name}</span>
          <button
            onClick={logout}
            style={{
              padding: '8px 16px',
              background: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Déconnexion
          </button>
        </div>
      </header>

      {/* Navigation */}
      <nav style={{
        background: 'white',
        padding: '15px 20px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        marginBottom: '20px'
      }}>
        <div style={{
          display: 'flex',
          gap: '10px',
          flexWrap: 'wrap'
        }}>
          {[
            { id: 'overview', label: '📊 Vue d\'ensemble', color: '#6f42c1' },
            { id: 'vehicles', label: '🎯 Gestion Véhicules', color: '#007bff' },
            { id: 'contracts', label: '📅 Contrats', color: '#28a745' },
            { id: 'blacklist', label: '🚫 Liste Noire', color: '#dc3545' }
          ].map(section => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              style={{
                padding: '10px 20px',
                background: activeSection === section.id ? section.color : 'transparent',
                color: activeSection === section.id ? 'white' : section.color,
                border: `2px solid ${section.color}`,
                borderRadius: '25px',
                cursor: 'pointer',
                fontWeight: '600',
                transition: 'all 0.3s'
              }}
            >
              {section.label}
            </button>
          ))}
        </div>
      </nav>

      {/* Main Content */}
      <main style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>

        {message && (
          <div style={{
            padding: '15px',
            marginBottom: '20px',
            borderRadius: '8px',
            background: message.includes('✅') ? '#d4edda' : '#f8d7da',
            color: message.includes('✅') ? '#155724' : '#721c24',
            fontWeight: '600',
            border: `1px solid ${message.includes('✅') ? '#c3e6cb' : '#f5c6cb'}`
          }}>
            {message}
          </div>
        )}

        {/* Overview Section */}
        {activeSection === 'overview' && (
          <div>
            {/* Welcome Card */}
            <div style={{
              background: 'white',
              padding: '30px',
              borderRadius: '10px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
              marginBottom: '30px'
            }}>
              <h2 style={{ color: '#333', marginBottom: '20px' }}>
                Bienvenue sur votre espace partenaire
              </h2>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                <div style={{ padding: '20px', background: '#f8f9fa', borderRadius: '5px' }}>
                  <h4 style={{ margin: '0 0 10px 0', color: '#333' }}>Informations du compte</h4>
                  <p><strong>Email:</strong> {user.email}</p>
                  <p><strong>Téléphone:</strong> {user.number}</p>
                  <p><strong>Localisation:</strong> {user.city} {user.country && `, ${user.country}`}</p>
                </div>

                <div style={{ padding: '20px', background: '#f8f9fa', borderRadius: '5px' }}>
                  <h4 style={{ margin: '0 0 10px 0', color: '#333' }}>Statut</h4>
                  <p>
                    <strong>Statut:</strong>
                    <span style={{
                      color: user.status === 'approved' ? 'green' : 'orange',
                      fontWeight: 'bold',
                      marginLeft: '10px'
                    }}>
                      {user.status === 'approved' ? '✅ Approuvé' : '⏳ En attente'}
                    </span>
                  </p>
                  <p><strong>Rôle:</strong> {user.role}</p>
                </div>
              </div>
            </div>

            {/* Statistics Cards */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '20px',
              marginBottom: '30px'
            }}>
              <div style={{
                background: 'white',
                padding: '25px',
                borderRadius: '10px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                textAlign: 'center'
              }}>
                <h3 style={{ color: '#007bff', fontSize: '2em', margin: '0' }}>{vehicles.length}</h3>
                <p style={{ color: '#666', margin: '10px 0 0 0' }}>Véhicules</p>
              </div>

              <div style={{
                background: 'white',
                padding: '25px',
                borderRadius: '10px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                textAlign: 'center'
              }}>
                <h3 style={{ color: '#28a745', fontSize: '2em', margin: '0' }}>{contracts.length}</h3>
                <p style={{ color: '#666', margin: '10px 0 0 0' }}>Contrats</p>
              </div>

              <div style={{
                background: 'white',
                padding: '25px',
                borderRadius: '10px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                textAlign: 'center'
              }}>
                <h3 style={{ color: '#dc3545', fontSize: '2em', margin: '0' }}>{blacklist.length}</h3>
                <p style={{ color: '#666', margin: '10px 0 0 0' }}>Liste Noire</p>
              </div>
            </div>

            {/* Recent Activity */}
            <div style={{
              background: 'white',
              padding: '30px',
              borderRadius: '10px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
            }}>
              <h3 style={{ color: '#333', marginBottom: '20px' }}>📋 Activité Récente</h3>
              <div style={{ color: '#666' }}>
                <p>✅ Votre compte a été approuvé avec succès</p>
                <p>📊 Prêt à gérer vos véhicules</p>
                <p>👤 Connecté en tant que: {user.name}</p>
                {vehicles.length > 0 && <p>🚗 {vehicles.length} véhicule(s) enregistré(s)</p>}
                {contracts.length > 0 && <p>📄 {contracts.length} contrat(s) créé(s)</p>}
              </div>
            </div>
          </div>
        )}

        {/* Vehicles Management Section */}
        {activeSection === 'vehicles' && (
          <div>
            <div style={{
              background: 'white',
              padding: '30px',
              borderRadius: '10px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
              marginBottom: '30px'
            }}>
              <h2 style={{ color: '#333', marginBottom: '20px' }}>Ajouter un Véhicule</h2>
              
              <form onSubmit={addVehicle}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Nom du véhicule *</label>
                    <input
                      type="text"
                      name="name"
                      value={vehicleForm.name}
                      onChange={handleVehicleChange}
                      required
                      style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Type *</label>
                    <select
                      name="type"
                      value={vehicleForm.type}
                      onChange={handleVehicleChange}
                      required
                      style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}
                    >
                      <option value="">Sélectionnez le type</option>
                      <option value="Voiture">Voiture</option>
                      <option value="Moto">Moto</option>
                      <option value="Scooter">Scooter</option>
                      <option value="Camion">Camion</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Boîte de vitesse *</label>
                    <select
                      name="boiteVitesse"
                      value={vehicleForm.boiteVitesse}
                      onChange={handleVehicleChange}
                      required
                      style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}
                    >
                      <option value="">Sélectionnez</option>
                      <option value="Manuelle">Manuelle</option>
                      <option value="Automatique">Automatique</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Prix par jour (DH) *</label>
                    <input
                      type="number"
                      name="pricePerDay"
                      value={vehicleForm.pricePerDay}
                      onChange={handleVehicleChange}
                      required
                      style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}
                    />
                  </div>

                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Description</label>
                    <textarea
                      name="description"
                      value={vehicleForm.description}
                      onChange={handleVehicleChange}
                      rows="3"
                      style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Image du véhicule</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleVehicleFileChange}
                      style={{ width: '100%', padding: '10px' }}
                    />
                    {imagePreview && (
                      <img
                        src={imagePreview}
                        alt="Preview"
                        style={{ marginTop: '10px', maxWidth: '200px', borderRadius: '5px' }}
                      />
                    )}
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Date début assurance</label>
                    <input
                      type="date"
                      name="assuranceStartDate"
                      value={vehicleForm.assuranceStartDate}
                      onChange={handleVehicleChange}
                      style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Date fin assurance</label>
                    <input
                      type="date"
                      name="assuranceEndDate"
                      value={vehicleForm.assuranceEndDate}
                      onChange={handleVehicleChange}
                      style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Date vidange</label>
                    <input
                      type="date"
                      name="vidangeDate"
                      value={vehicleForm.vidangeDate}
                      onChange={handleVehicleChange}
                      style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}
                    />
                  </div>

                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Remarques</label>
                    <textarea
                      name="remarques"
                      value={vehicleForm.remarques}
                      onChange={handleVehicleChange}
                      rows="3"
                      style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  style={{
                    marginTop: '20px',
                    padding: '12px 30px',
                    background: '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    fontWeight: '600'
                  }}
                >
                  Ajouter le Véhicule
                </button>
              </form>
            </div>

            {/* Vehicles List */}
            <div style={{
              background: 'white',
              padding: '30px',
              borderRadius: '10px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
            }}>
              <h2 style={{ color: '#333', marginBottom: '20px' }}>Mes Véhicules ({vehicles.length})</h2>
              
              {vehicles.length === 0 ? (
                <p style={{ color: '#666', textAlign: 'center', padding: '40px' }}>
                  Aucun véhicule ajouté pour le moment
                </p>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                  {vehicles.map(vehicle => (
                    <div key={vehicle.id} style={{
                      border: '1px solid #ddd',
                      borderRadius: '10px',
                      padding: '20px',
                      background: '#f8f9fa'
                    }}>
                      {vehicle.image && (
                        <img
                          src={vehicle.image}
                          alt={vehicle.name}
                          style={{
                            width: '100%',
                            height: '200px',
                            objectFit: 'cover',
                            borderRadius: '5px',
                            marginBottom: '15px'
                          }}
                        />
                      )}
                      <h4 style={{ margin: '0 0 10px 0', color: '#333' }}>{vehicle.name}</h4>
                      <p style={{ margin: '5px 0', color: '#666' }}><strong>Type:</strong> {vehicle.type}</p>
                      <p style={{ margin: '5px 0', color: '#666' }}><strong>Boîte:</strong> {vehicle.boiteVitesse}</p>
                      <p style={{ margin: '5px 0', color: '#666' }}><strong>Prix/jour:</strong> {vehicle.pricePerDay} DH</p>
                      {vehicle.assuranceEndDate && (
                        <p style={{ margin: '5px 0', color: '#666', fontSize: '12px' }}>
                          <strong>Assurance:</strong> Jusqu'au {new Date(vehicle.assuranceEndDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Contracts Section */}
        {activeSection === 'contracts' && (
          <div>
            <div style={{
              background: 'white',
              padding: '30px',
              borderRadius: '10px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
              marginBottom: '30px'
            }}>
              <h2 style={{ color: '#333', marginBottom: '20px' }}>Créer un Contrat</h2>
              
              <form onSubmit={createContract}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Nom du client *</label>
                    <input
                      type="text"
                      name="clientName"
                      value={contractForm.clientName}
                      onChange={handleContractChange}
                      required
                      style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Email du client *</label>
                    <input
                      type="email"
                      name="clientEmail"
                      value={contractForm.clientEmail}
                      onChange={handleContractChange}
                      required
                      style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Téléphone *</label>
                    <input
                      type="text"
                      name="clientPhone"
                      value={contractForm.clientPhone}
                      onChange={handleContractChange}
                      required
                      style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>CIN *</label>
                    <input
                      type="text"
                      name="clientCIN"
                      value={contractForm.clientCIN}
                      onChange={handleContractChange}
                      required
                      style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Véhicule *</label>
                    <select
                      name="vehicleId"
                      value={contractForm.vehicleId}
                      onChange={handleContractChange}
                      required
                      style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}
                    >
                      <option value="">Sélectionnez un véhicule</option>
                      {vehicles.map(vehicle => (
                        <option key={vehicle.id} value={vehicle.id}>
                          {vehicle.name} - {vehicle.pricePerDay} DH/jour
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Date début *</label>
                    <input
                      type="date"
                      name="startDate"
                      value={contractForm.startDate}
                      onChange={handleContractChange}
                      required
                      style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Date fin *</label>
                    <input
                      type="date"
                      name="endDate"
                      value={contractForm.endDate}
                      onChange={handleContractChange}
                      required
                      style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Prix total</label>
                    <input
                      type="text"
                      value={`${contractForm.totalPrice} DH`}
                      readOnly
                      style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px', background: '#f8f9fa' }}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  style={{
                    marginTop: '20px',
                    padding: '12px 30px',
                    background: '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    fontWeight: '600'
                  }}
                >
                  Créer le Contrat
                </button>
              </form>
            </div>

            {/* Contracts List */}
            <div style={{
              background: 'white',
              padding: '30px',
              borderRadius: '10px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
            }}>
              <h2 style={{ color: '#333', marginBottom: '20px' }}>Mes Contrats ({contracts.length})</h2>
              
              {contracts.length === 0 ? (
                <p style={{ color: '#666', textAlign: 'center', padding: '40px' }}>
                  Aucun contrat créé pour le moment
                </p>
              ) : (
                <div style={{ display: 'grid', gap: '15px' }}>
                  {contracts.map(contract => (
                    <div key={contract.id} style={{
                      border: '1px solid #ddd',
                      borderRadius: '10px',
                      padding: '20px',
                      background: '#f8f9fa'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '10px' }}>
                        <div>
                          <h4 style={{ margin: '0 0 5px 0', color: '#333' }}>{contract.clientName}</h4>
                          <p style={{ margin: '2px 0', color: '#666' }}>{contract.clientEmail} - {contract.clientPhone}</p>
                          <p style={{ margin: '2px 0', color: '#666' }}>CIN: {contract.clientCIN}</p>
                        </div>
                        <button
                          onClick={() => downloadContract(contract)}
                          style={{
                            padding: '8px 15px',
                            background: '#17a2b8',
                            color: 'white',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer',
                            fontWeight: '600'
                          }}
                        >
                          📄 Télécharger
                        </button>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', marginTop: '10px' }}>
                        <div>
                          <strong>Période:</strong><br />
                          {new Date(contract.startDate).toLocaleDateString()} - {new Date(contract.endDate).toLocaleDateString()}
                        </div>
                        <div>
                          <strong>Durée:</strong><br />
                          {Math.ceil((new Date(contract.endDate) - new Date(contract.startDate)) / (1000 * 60 * 60 * 24))} jours
                        </div>
                        <div>
                          <strong>Prix total:</strong><br />
                          {contract.totalPrice} DH
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Blacklist Section */}
        {activeSection === 'blacklist' && (
          <div>
            <div style={{
              background: 'white',
              padding: '30px',
              borderRadius: '10px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
              marginBottom: '30px'
            }}>
              <h2 style={{ color: '#333', marginBottom: '20px' }}>Ajouter à la Liste Noire</h2>
              
              <form onSubmit={addToBlacklist}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Nom du client *</label>
                    <input
                      type="text"
                      name="clientName"
                      value={blacklistForm.clientName}
                      onChange={handleBlacklistChange}
                      required
                      style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Email</label>
                    <input
                      type="email"
                      name="clientEmail"
                      value={blacklistForm.clientEmail}
                      onChange={handleBlacklistChange}
                      style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Téléphone</label>
                    <input
                      type="text"
                      name="clientPhone"
                      value={blacklistForm.clientPhone}
                      onChange={handleBlacklistChange}
                      style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>CIN *</label>
                    <input
                      type="text"
                      name="clientCIN"
                      value={blacklistForm.clientCIN}
                      onChange={handleBlacklistChange}
                      required
                      style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}
                    />
                  </div>

                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Raison *</label>
                    <textarea
                      name="reason"
                      value={blacklistForm.reason}
                      onChange={handleBlacklistChange}
                      required
                      rows="3"
                      style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  style={{
                    marginTop: '20px',
                    padding: '12px 30px',
                    background: '#dc3545',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    fontWeight: '600'
                  }}
                >
                  Ajouter à la Liste Noire
                </button>
              </form>
            </div>

            {/* Blacklist */}
            <div style={{
              background: 'white',
              padding: '30px',
              borderRadius: '10px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
            }}>
              <h2 style={{ color: '#333', marginBottom: '20px' }}>Liste Noire ({blacklist.length})</h2>
              
              {blacklist.length === 0 ? (
                <p style={{ color: '#666', textAlign: 'center', padding: '40px' }}>
                  Aucun client dans la liste noire
                </p>
              ) : (
                <div style={{ display: 'grid', gap: '15px' }}>
                  {blacklist.map(client => (
                    <div key={client.id} style={{
                      border: '1px solid #dc3545',
                      borderRadius: '10px',
                      padding: '20px',
                      background: '#f8d7da'
                    }}>
                      <h4 style={{ margin: '0 0 10px 0', color: '#721c24' }}>🚫 {client.clientName}</h4>
                      <p style={{ margin: '5px 0', color: '#721c24' }}><strong>CIN:</strong> {client.clientCIN}</p>
                      {client.clientEmail && <p style={{ margin: '5px 0', color: '#721c24' }}><strong>Email:</strong> {client.clientEmail}</p>}
                      {client.clientPhone && <p style={{ margin: '5px 0', color: '#721c24' }}><strong>Téléphone:</strong> {client.clientPhone}</p>}
                      <p style={{ margin: '5px 0', color: '#721c24' }}><strong>Raison:</strong> {client.reason}</p>
                      <p style={{ margin: '5px 0', color: '#721c24', fontSize: '12px' }}>
                        <strong>Ajouté le:</strong> {new Date(client.createdAt).toLocaleDateString()} par {client.addedBy}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
