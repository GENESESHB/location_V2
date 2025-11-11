// components/forms/ContractForm.jsx
import React, { useEffect } from 'react';

const ContractForm = ({
  contractForm,
  vehicles,
  errors,
  loading,
  isEditing,
  handleContractChange,
  createContract,
  updateContract,
  setShowForm,
  setContractForm,
  setErrors
}) => {
  // Calculate total price when dates, vehicle, or custom price changes
  useEffect(() => {
    if (contractForm.vehicleId && contractForm.startDateTime && contractForm.endDateTime) {
      calculateTotalPrix();
    }
  }, [contractForm.vehicleId, contractForm.startDateTime, contractForm.endDateTime, contractForm.prixParJour]);

  const calculateTotalPrix = () => {
    if (!contractForm.startDateTime || !contractForm.endDateTime) return;

    const start = new Date(contractForm.startDateTime);
    const end = new Date(contractForm.endDateTime);
    
    // Calculate difference in days
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    // If same day, minimum 1 day
    const rentalDays = diffDays === 0 ? 1 : diffDays;

    const vehicle = vehicles.find(v => v._id === contractForm.vehicleId);
    if (vehicle && rentalDays > 0) {
      // Use custom price if set, otherwise use vehicle's price per day
      const prixParJour = contractForm.prixParJour || vehicle.pricePerDay;
      const total = rentalDays * prixParJour;
      setContractForm(prev => ({ ...prev, prixTotal: total }));
    } else {
      setContractForm(prev => ({ ...prev, prixTotal: 0 }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isEditing) {
      updateContract(e);
    } else {
      createContract(e);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setContractForm({
      // Client information
      clientLastName: '',
      clientFirstName: '',
      clientBirthDate: '',
      clientPhone: '',
      clientAddress: '',
      clientPassport: '',
      clientCIN: '',
      clientLicenseNumber: '',
      clientLicenseIssueDate: '',
      
      // Second driver information
      secondDriverLastName: '',
      secondDriverFirstName: '',
      secondDriverLicenseNumber: '',
      secondDriverLicenseIssueDate: '',
      
      // Rental information
      vehicleId: '',
      startDateTime: '',
      endDateTime: '',
      startLocation: '',
      endLocation: '',
      prixParJour: '', // Custom price per day (optional)
      prixTotal: 0
    });
    setErrors({});
  };

  const getSelectedVehicle = () => {
    return vehicles.find(v => v._id === contractForm.vehicleId);
  };

  // Handle vehicle selection change
  const handleVehicleChange = (e) => {
    const vehicleId = e.target.value;
    const vehicle = vehicles.find(v => v._id === vehicleId);
    
    // Update the form with vehicle data
    setContractForm(prev => ({
      ...prev,
      vehicleId: vehicleId,
      prixParJour: vehicle ? vehicle.pricePerDay : '' // Set default price from vehicle
    }));
  };

  // Calculate rental days for display
  const calculateRentalDays = () => {
    if (!contractForm.startDateTime || !contractForm.endDateTime) return 0;
    
    const start = new Date(contractForm.startDateTime);
    const end = new Date(contractForm.endDateTime);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays === 0 ? 1 : diffDays;
  };

  // Get current price per day (custom or from vehicle)
  const getCurrentPricePerDay = () => {
    const vehicle = getSelectedVehicle();
    return contractForm.prixParJour || (vehicle ? vehicle.pricePerDay : 0);
  };

  return (
    <form onSubmit={handleSubmit} className="contract-form">
      <div style={{
        backgroundColor: isEditing ? '#fff3cd' : '#e8f5e8',
        padding: '12px 16px',
        borderRadius: '8px',
        marginBottom: '20px',
        border: `2px solid ${isEditing ? '#ffc107' : '#36c275'}`
      }}>
        <h3 style={{ margin: 0, color: isEditing ? '#856404' : '#2e7d32' }}>
          {isEditing ? '✏️ Modifier le Contrat' : '📝 Créer un Nouveau Contrat'}
        </h3>
        <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: isEditing ? '#856404' : '#2e7d32' }}>
          {isEditing ? 'Modifiez les informations du contrat ci-dessous' : 'Remplissez les informations pour créer un nouveau contrat'}
        </p>
      </div>

      <div className='containerform' style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '20px',
        padding: '20px',
        backgroundColor: '#f9f9f9',
        borderRadius: '8px',
        marginBottom: '20px'
      }}>
        {/* Client Information */}
        <div style={{ gridColumn: '1 / -1' }}>
          <h4 style={{ margin: '0 0 16px 0', color: '#333', borderBottom: '2px solid #36c275', paddingBottom: '8px' }}>
            👤 Informations du Locataire Principal
          </h4>
        </div>

        <div>
          <label>Nom du Locataire:</label>
          <input
            type="text"
            name="clientLastName"
            value={contractForm.clientLastName}
            onChange={handleContractChange}
            required
          />
          {errors.clientLastName && <span style={{ color: 'red', fontSize: '12px' }}>{errors.clientLastName}</span>}
        </div>

        <div>
          <label>Prénom du Locataire:</label>
          <input
            type="text"
            name="clientFirstName"
            value={contractForm.clientFirstName}
            onChange={handleContractChange}
            required
          />
          {errors.clientFirstName && <span style={{ color: 'red', fontSize: '12px' }}>{errors.clientFirstName}</span>}
        </div>

        <div>
          <label>Date de Naissance:</label>
          <input
            type="date"
            name="clientBirthDate"
            value={contractForm.clientBirthDate}
            onChange={handleContractChange}
            required
          />
          {errors.clientBirthDate && <span style={{ color: 'red', fontSize: '12px' }}>{errors.clientBirthDate}</span>}
        </div>

        <div>
          <label>Téléphone:</label>
          <input
            type="tel"
            name="clientPhone"
            value={contractForm.clientPhone}
            onChange={handleContractChange}
            required
          />
          {errors.clientPhone && <span style={{ color: 'red', fontSize: '12px' }}>{errors.clientPhone}</span>}
        </div>

        <div style={{ gridColumn: '1 / -1' }}>
          <label>Adresse au Maroc:</label>
          <input
            type="text"
            name="clientAddress"
            value={contractForm.clientAddress}
            onChange={handleContractChange}
            required
          />
          {errors.clientAddress && <span style={{ color: 'red', fontSize: '12px' }}>{errors.clientAddress}</span>}
        </div>

        <div>
          <label>Passeport:</label>
          <input
            type="text"
            name="clientPassport"
            value={contractForm.clientPassport}
            onChange={handleContractChange}
          />
          {errors.clientPassport && <span style={{ color: 'red', fontSize: '12px' }}>{errors.clientPassport}</span>}
        </div>

        <div>
          <label>CIN:</label>
          <input
            type="text"
            name="clientCIN"
            value={contractForm.clientCIN}
            onChange={handleContractChange}
          />
          {errors.clientCIN && <span style={{ color: 'red', fontSize: '12px' }}>{errors.clientCIN}</span>}
        </div>

        <div>
          <label>Permis de Conduire N°:</label>
          <input
            type="text"
            name="clientLicenseNumber"
            value={contractForm.clientLicenseNumber}
            onChange={handleContractChange}
            required
          />
          {errors.clientLicenseNumber && <span style={{ color: 'red', fontSize: '12px' }}>{errors.clientLicenseNumber}</span>}
        </div>

        <div>
          <label>Délivré le:</label>
          <input
            type="date"
            name="clientLicenseIssueDate"
            value={contractForm.clientLicenseIssueDate}
            onChange={handleContractChange}
            required
          />
          {errors.clientLicenseIssueDate && <span style={{ color: 'red', fontSize: '12px' }}>{errors.clientLicenseIssueDate}</span>}
        </div>

        {/* Second Driver Information */}
        <div style={{ gridColumn: '1 / -1', marginTop: '20px' }}>
          <h4 style={{ margin: '0 0 16px 0', color: '#333', borderBottom: '2px solid #36c275', paddingBottom: '8px' }}>
            👥 Informations du Deuxième Conducteur
          </h4>
        </div>

        <div>
          <label>Nom du 2ème Conducteur:</label>
          <input
            type="text"
            name="secondDriverLastName"
            value={contractForm.secondDriverLastName}
            onChange={handleContractChange}
          />
        </div>

        <div>
          <label>Prénom du 2ème Conducteur:</label>
          <input
            type="text"
            name="secondDriverFirstName"
            value={contractForm.secondDriverFirstName}
            onChange={handleContractChange}
          />
        </div>

        <div>
          <label>Permis de Conduire N°:</label>
          <input
            type="text"
            name="secondDriverLicenseNumber"
            value={contractForm.secondDriverLicenseNumber}
            onChange={handleContractChange}
          />
        </div>

        <div>
          <label>Délivré le:</label>
          <input
            type="date"
            name="secondDriverLicenseIssueDate"
            value={contractForm.secondDriverLicenseIssueDate}
            onChange={handleContractChange}
          />
        </div>

        {/* Vehicle Selection */}
        <div style={{ gridColumn: '1 / -1', marginTop: '20px' }}>
          <h4 style={{ margin: '0 0 16px 0', color: '#333', borderBottom: '2px solid #36c275', paddingBottom: '8px' }}>
            🚗 Sélection du Véhicule
          </h4>
        </div>

        <div style={{ gridColumn: '1 / -1' }}>
          <label>Véhicule:</label>
          <select
            name="vehicleId"
            value={contractForm.vehicleId}
            onChange={handleVehicleChange}
            required
          >
            <option value="">Sélectionnez un véhicule</option>
            {vehicles
              .filter(vehicle => vehicle.available)
              .map(vehicle => (
                <option key={vehicle._id} value={vehicle._id}>
                  {vehicle.name} - {vehicle.type} - {vehicle.pricePerDay}€/jour
                </option>
              ))
            }
          </select>
          {errors.vehicleId && <span style={{ color: 'red', fontSize: '12px' }}>{errors.vehicleId}</span>}
        </div>

        {/* Selected Vehicle Info */}
        {contractForm.vehicleId && (
          <div style={{
            gridColumn: '1 / -1',
            padding: '16px',
            backgroundColor: '#e8f5e8',
            borderRadius: '8px',
            border: '2px solid #36c275'
          }}>
            <h5 style={{ margin: '0 0 8px 0', color: '#2e7d32' }}>Informations du Véhicule Sélectionné:</h5>
            {getSelectedVehicle() && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', fontSize: '14px' }}>
                <div><strong>Nom:</strong> {getSelectedVehicle().name}</div>
                <div><strong>Type:</strong> {getSelectedVehicle().type}</div>
                <div><strong>Boîte:</strong> {getSelectedVehicle().boiteVitesse}</div>
                <div><strong>Prix/jour:</strong> {getSelectedVehicle().pricePerDay}€</div>
                <div><strong>Disponible:</strong> {getSelectedVehicle().available ? 'Oui' : 'Non'}</div>
              </div>
            )}
          </div>
        )}

        {/* Price Configuration */}
        <div style={{ gridColumn: '1 / -1', marginTop: '20px' }}>
          <h4 style={{ margin: '0 0 16px 0', color: '#333', borderBottom: '2px solid #36c275', paddingBottom: '8px' }}>
            💰 Configuration du Prix
          </h4>
        </div>

        <div>
          <label>Prix par Jour (€):</label>
          <input
            type="number"
            name="prixParJour"
            value={contractForm.prixParJour || (getSelectedVehicle() ? getSelectedVehicle().pricePerDay : '')}
            onChange={handleContractChange}
            placeholder={getSelectedVehicle() ? `Prix par défaut: ${getSelectedVehicle().pricePerDay}€` : 'Sélectionnez un véhicule'}
            min="0"
            step="0.01"
          />
          <small style={{ color: '#666', fontSize: '12px' }}>
            {getSelectedVehicle() && `Prix par défaut: ${getSelectedVehicle().pricePerDay}€`}
          </small>
        </div>

        {/* Rental Period and Locations */}
        <div style={{ gridColumn: '1 / -1', marginTop: '20px' }}>
          <h4 style={{ margin: '0 0 16px 0', color: '#333', borderBottom: '2px solid #36c275', paddingBottom: '8px' }}>
            📅 Période et Lieux de Location
          </h4>
        </div>

        <div>
          <label>Date et Heure de Départ:</label>
          <input
            type="datetime-local"
            name="startDateTime"
            value={contractForm.startDateTime}
            onChange={handleContractChange}
            required
            min={new Date().toISOString().slice(0, 16)}
          />
          {errors.startDateTime && <span style={{ color: 'red', fontSize: '12px' }}>{errors.startDateTime}</span>}
        </div>

        <div>
          <label>Date et Heure de Retour:</label>
          <input
            type="datetime-local"
            name="endDateTime"
            value={contractForm.endDateTime}
            onChange={handleContractChange}
            required
            min={contractForm.startDateTime || new Date().toISOString().slice(0, 16)}
          />
          {errors.endDateTime && <span style={{ color: 'red', fontSize: '12px' }}>{errors.endDateTime}</span>}
        </div>

        <div>
          <label>Lieu de Départ:</label>
          <input
            type="text"
            name="startLocation"
            value={contractForm.startLocation}
            onChange={handleContractChange}
            required
          />
          {errors.startLocation && <span style={{ color: 'red', fontSize: '12px' }}>{errors.startLocation}</span>}
        </div>

        <div>
          <label>Lieu de Retour:</label>
          <input
            type="text"
            name="endLocation"
            value={contractForm.endLocation}
            onChange={handleContractChange}
            required
          />
          {errors.endLocation && <span style={{ color: 'red', fontSize: '12px' }}>{errors.endLocation}</span>}
        </div>

        {/* Price Calculation */}
        <div style={{ gridColumn: '1 / -1', marginTop: '20px' }}>
          <div style={{
            padding: '16px',
            backgroundColor: '#fff3cd',
            borderRadius: '8px',
            border: '2px solid #ffc107',
            textAlign: 'center'
          }}>
            <h4 style={{ margin: '0 0 8px 0', color: '#856404' }}>💰 Calcul du Prix Total</h4>
            {contractForm.startDateTime && contractForm.endDateTime && contractForm.vehicleId ? (
              <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#2e7d32' }}>
                <div>Durée: {calculateRentalDays()} jour(s)</div>
                <div>Prix par jour: {getCurrentPricePerDay()}€</div>
                <div style={{ marginTop: '8px', fontSize: '20px' }}>
                  Prix Total: <span style={{ fontSize: '24px', color: '#2e7d32' }}>{contractForm.prixTotal}€</span>
                </div>
              </div>
            ) : (
              <p style={{ margin: 0, color: '#666' }}>Sélectionnez un véhicule et les dates pour calculer le prix</p>
            )}
          </div>
        </div>
      </div>

      <div className="button-group" style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '10px',
        marginTop: '20px'
      }}>
        <button
          type="submit"
          className="submit-btn"
          disabled={loading}
          style={{
            padding: '12px 30px',
            backgroundColor: loading ? '#ccc' : (isEditing ? '#3b82f6' : '#36c275'),
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '16px',
            fontWeight: 'bold'
          }}
        >
          {loading ? 'En cours...' : (isEditing ? '💾 Mettre à jour' : '📝 Créer le Contrat')}
        </button>
        <button
          type="button"
          className="cancel-button"
          onClick={handleCancel}
          disabled={loading}
          style={{
            padding: '12px 15px',
            backgroundColor: '#6b7280',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          ✕ Annuler
        </button>
      </div>
    </form>
  );
};

export default ContractForm;
