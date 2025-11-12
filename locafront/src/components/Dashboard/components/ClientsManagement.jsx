// components/ClientsManagement.jsx
import React, { useState } from 'react';
import api from '../../../utils/api';

const ClientsManagement = ({ user, clients, setClients, setMessage, loadClients, blacklist }) => {
  const [showForm, setShowForm] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [formData, setFormData] = useState({
    lastName: '',
    firstName: '',
    birthDate: '',
    phone: '',
    address: '',
    passport: '',
    cin: '',
    licenseNumber: '',
    licenseIssueDate: ''
  });
  const [loading, setLoading] = useState(false);

  // New states for blacklist functionality
  const [showBlacklistForm, setShowBlacklistForm] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [blacklistReason, setBlacklistReason] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Check if client is in blacklist using the existing blacklist array
  const checkBlacklist = (clientData) => {
    if (!blacklist || blacklist.length === 0) {
      return false;
    }

    const { cin, passport, licenseNumber } = clientData;
    
    // Check if any identifier matches the blacklist
    const isBlacklisted = blacklist.some(blacklisted => {
      return (
        (cin && blacklisted.cin === cin) ||
        (passport && blacklisted.passport === passport) ||
        (licenseNumber && blacklisted.licenseNumber === licenseNumber)
      );
    });

    return isBlacklisted;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // CHECK BLACKLIST BEFORE ADDING NEW CLIENT
      if (!editingClient) {
        const isBlacklisted = checkBlacklist(formData);
        
        if (isBlacklisted) {
          setMessage('❌ Ce client est dans la liste noire et ne peut pas être ajouté');
          setLoading(false);
          return;
        }
      }

      if (editingClient) {
        // Update client
        const res = await api.put(`/clients/${editingClient._id}`, formData);
        setMessage('✅ Client modifié avec succès');
      } else {
        // Create new client
        const res = await api.post('/clients', formData);
        setMessage('✅ Client ajouté avec succès');
      }

      setShowForm(false);
      setEditingClient(null);
      setFormData({
        lastName: '',
        firstName: '',
        birthDate: '',
        phone: '',
        address: '',
        passport: '',
        cin: '',
        licenseNumber: '',
        licenseIssueDate: ''
      });
      loadClients();
    } catch (err) {
      console.error('❌ Erreur:', err);
      
      // Handle specific error cases
      if (err.response?.status === 409) {
        setMessage('❌ Ce client existe déjà dans le système');
      } else if (err.response?.data?.message) {
        setMessage(`❌ ${err.response.data.message}`);
      } else {
        setMessage('❌ Erreur lors de la sauvegarde du client');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (client) => {
    setEditingClient(client);
    setFormData({
      lastName: client.lastName || '',
      firstName: client.firstName || '',
      birthDate: client.birthDate ? client.birthDate.split('T')[0] : '',
      phone: client.phone || '',
      address: client.address || '',
      passport: client.passport || '',
      cin: client.cin || '',
      licenseNumber: client.licenseNumber || '',
      licenseIssueDate: client.licenseIssueDate ? client.licenseIssueDate.split('T')[0] : ''
    });
    setShowForm(true);
  };

  const handleDelete = async (clientId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce client ?')) {
      try {
        await api.delete(`/clients/${clientId}`);
        setMessage('✅ Client supprimé avec succès');
        loadClients();
      } catch (err) {
        console.error('❌ Erreur:', err);
        setMessage('❌ Erreur lors de la suppression du client');
      }
    }
  };

  // Open blacklist form with client information
  const handleOpenBlacklistForm = (client) => {
    setSelectedClient(client);
    setBlacklistReason('');
    setShowBlacklistForm(true);
  };

  // Submit blacklist with custom reason - UPDATED TO REMOVE CLIENT AUTOMATICALLY
  const handleBlacklistSubmit = async (e) => {
    e.preventDefault();

    if (!blacklistReason.trim()) {
      setMessage('❌ Veuillez saisir une raison pour la liste noire');
      return;
    }

    // Check if client has at least one identifier
    if (!selectedClient.cin && !selectedClient.passport && !selectedClient.licenseNumber) {
      setMessage('❌ Le client doit avoir au moins un CIN, Passeport ou Numéro de permis');
      return;
    }

    try {
      // Add to blacklist
      await api.post('/blacklist', {
        cin: selectedClient.cin || undefined,
        passport: selectedClient.passport || undefined,
        licenseNumber: selectedClient.licenseNumber || undefined,
        reason: blacklistReason
      });

      // AUTOMATICALLY REMOVE CLIENT FROM CLIENTS LIST
      await api.delete(`/clients/${selectedClient._id}`);
      
      setMessage('✅ Client ajouté à la liste noire et supprimé de la liste des clients avec succès');
      setShowBlacklistForm(false);
      setSelectedClient(null);
      setBlacklistReason('');
      
      // Refresh the clients list to reflect the removal
      loadClients();
    } catch (err) {
      console.error('❌ Erreur:', err);
      if (err.response?.data?.message) {
        setMessage(`❌ ${err.response.data.message}`);
      } else if (err.response?.data?.error) {
        setMessage(`❌ ${err.response.data.error}`);
      } else {
        setMessage('❌ Erreur lors de l\'ajout à la liste noire ou de la suppression du client');
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR');
  };

  const ClientCard = ({ client }) => (
    <div className="client-card">
      <div className="client-header">
        <h3>{client.lastName} {client.firstName}</h3>
        <div className="client-actions">
          <button
            onClick={() => handleEdit(client)}
            className="btn-edit"
            title="Modifier"
          >
            ✏️
          </button>
          <button
            onClick={() => handleOpenBlacklistForm(client)}
            className="btn-blacklist"
            title="Ajouter à la liste noire"
          >
            ⚠️
          </button>
          <button
            onClick={() => handleDelete(client._id)}
            className="btn-delete"
            title="Supprimer"
          >
            🗑️
          </button>
        </div>
      </div>

      <div className="client-info">
        <div className="info-row">
          <span className="info-label">Nom:</span>
          <span className="info-value">{client.lastName}</span>
        </div>
        <div className="info-row">
          <span className="info-label">Prénom:</span>
          <span className="info-value">{client.firstName}</span>
        </div>
        <div className="info-row">
          <span className="info-label">Date de naissance:</span>
          <span className="info-value">{formatDate(client.birthDate)}</span>
        </div>
        <div className="info-row">
          <span className="info-label">Téléphone:</span>
          <span className="info-value">{client.phone}</span>
        </div>
        <div className="info-row">
          <span className="info-label">CIN:</span>
          <span className="info-value">{client.cin || 'N/A'}</span>
        </div>
        <div className="info-row">
          <span className="info-label">Passeport:</span>
          <span className="info-value">{client.passport || 'N/A'}</span>
        </div>
        <div className="info-row">
          <span className="info-label">Permis:</span>
          <span className="info-value">{client.licenseNumber || 'N/A'}</span>
        </div>
        <div className="info-row">
          <span className="info-label">Date d'émission permis:</span>
          <span className="info-value">{formatDate(client.licenseIssueDate)}</span>
        </div>
        {client.address && (
          <div className="info-row">
            <span className="info-label">Adresse:</span>
            <span className="info-value">{client.address}</span>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="clients-management">
      <div className="section-header">
        <h1>Gestion des Clients</h1>
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary"
        >
          + Ajouter un Client
        </button>
      </div>

      {/* Client Form */}
      {showForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editingClient ? 'Modifier le Client' : 'Nouveau Client'}</h2>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingClient(null);
                  setFormData({
                    lastName: '',
                    firstName: '',
                    birthDate: '',
                    phone: '',
                    address: '',
                    passport: '',
                    cin: '',
                    licenseNumber: '',
                    licenseIssueDate: ''
                  });
                }}
                className="btn-close"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="client-form">
              <div className="security-notice">
                <p>🔒 <strong>Sécurité:</strong> Le système vérifiera automatiquement si ce client se trouve dans la liste noire avant l'ajout.</p>
                <p className="security-stats">
                  {blacklist && blacklist.length > 0 
                    ? `📊 ${blacklist.length} client(s) dans la liste noire - Vérification active`
                    : '✅ Aucun client dans la liste noire'
                  }
                </p>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label>Nom *</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Prénom *</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Date de naissance *</label>
                  <input
                    type="date"
                    name="birthDate"
                    value={formData.birthDate}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Téléphone *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>CIN *</label>
                  <input
                    type="text"
                    name="cin"
                    value={formData.cin}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Passeport</label>
                  <input
                    type="text"
                    name="passport"
                    value={formData.passport}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label>Numéro de permis</label>
                  <input
                    type="text"
                    name="licenseNumber"
                    value={formData.licenseNumber}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label>Date d'émission permis</label>
                  <input
                    type="date"
                    name="licenseIssueDate"
                    value={formData.licenseIssueDate}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group full-width">
                  <label>Adresse</label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    rows="3"
                  />
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingClient(null);
                  }}
                  className="btn-secondary"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary"
                >
                  {loading ? 'Vérification...' : (editingClient ? 'Modifier' : 'Ajouter')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Blacklist Form */}
      {showBlacklistForm && selectedClient && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Ajouter à la Liste Noire</h2>
              <button
                onClick={() => {
                  setShowBlacklistForm(false);
                  setSelectedClient(null);
                  setBlacklistReason('');
                }}
                className="btn-close"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleBlacklistSubmit} className="client-form">
              <div className="form-group">
                <label>Client</label>
                <div className="client-info-preview">
                  <strong>{selectedClient.lastName} {selectedClient.firstName}</strong>
                  <div>Téléphone: {selectedClient.phone}</div>
                  <div>CIN: {selectedClient.cin || 'N/A'}</div>
                  <div>Passeport: {selectedClient.passport || 'N/A'}</div>
                  <div>Permis: {selectedClient.licenseNumber || 'N/A'}</div>
                </div>
              </div>

              <div className="form-group full-width">
                <label>Raison de l'ajout à la liste noire *</label>
                <textarea
                  value={blacklistReason}
                  onChange={(e) => setBlacklistReason(e.target.value)}
                  placeholder="Saisissez la raison pour laquelle ce client est ajouté à la liste noire..."
                  rows="4"
                  required
                />
              </div>

              <div className="warning-message">
                <p>⚠️ <strong>Attention:</strong> Ce client sera automatiquement supprimé de la liste des clients après avoir été ajouté à la liste noire.</p>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  onClick={() => {
                    setShowBlacklistForm(false);
                    setSelectedClient(null);
                    setBlacklistReason('');
                  }}
                  className="btn-secondary"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="btn-warning"
                >
                  ⚠️ Confirmer l'ajout à la liste noire
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Clients List */}
      <div className="clients-grid">
        {clients.length === 0 ? (
          <div className="empty-state">
            <p>Aucun client trouvé</p>
            <button
              onClick={() => setShowForm(true)}
              className="btn-primary"
            >
              Ajouter votre premier client
            </button>
          </div>
        ) : (
          clients.map(client => (
            <ClientCard key={client._id} client={client} />
          ))
        )}
      </div>
    </div>
  );
};

export default ClientsManagement;
