// components/lists/ContractCard.jsx
import React, { useState, useEffect } from 'react';

const ContractCard = ({ contract, vehicles, onEdit, onDelete, onDownload, onUpdateStatus }) => {
  const [daysRemaining, setDaysRemaining] = useState(null);
  const [contractStatus, setContractStatus] = useState(contract.status || 'active');
  const [showActions, setShowActions] = useState(false);

  // Calculate days remaining and update status
  useEffect(() => {
    const calculateStatus = () => {
      const now = new Date();
      const startDate = new Date(contract.startDate);
      const endDate = new Date(contract.endDate);

      // Calculate days remaining
      const diffTime = endDate - now;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      setDaysRemaining(diffDays);

      // Update status based on dates
      if (now < startDate) {
        setContractStatus('pending');
      } else if (now > endDate) {
        setContractStatus('completed');
      } else {
        setContractStatus('active');
      }
    };

    calculateStatus();
    const interval = setInterval(calculateStatus, 3600000); // Update every hour
    return () => clearInterval(interval);
  }, [contract.startDate, contract.endDate]);

  const getStatusColor = () => {
    switch (contractStatus) {
      case 'pending': return '#f59e0b';
      case 'active': return '#10b981';
      case 'completed': return '#6b7280';
      case 'cancelled': return '#dc2626';
      default: return '#6b7280';
    }
  };

  const getStatusText = () => {
    switch (contractStatus) {
      case 'pending': return '⏳ En attente';
      case 'active': return '✅ Actif';
      case 'completed': return '📋 Terminé';
      case 'cancelled': return '❌ Annulé';
      default: return 'Inconnu';
    }
  };

  const getVehicleInfo = () => {
    return vehicles.find(v => v._id === contract.vehicleId) || {};
  };

  const handleDelete = () => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer le contrat de ${contract.clientName} ?`)) {
      onDelete(contract._id);
    }
  };

  const handleStatusChange = (newStatus) => {
    onUpdateStatus(contract._id, newStatus);
    setContractStatus(newStatus);
  };

  const vehicle = getVehicleInfo();

  return (
    <div className="contract-card" style={{
      border: '1px solid #e0e0e0',
      borderRadius: '12px',
      padding: '20px',
      marginBottom: '16px',
      backgroundColor: 'white',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      transition: 'all 0.2s ease',
      cursor: 'pointer',
      position: 'relative'
    }}
    onMouseEnter={() => setShowActions(true)}
    onMouseLeave={() => setShowActions(false)}
    >
      {/* Action Buttons */}
      {showActions && (
        <div style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          display: 'flex',
          gap: '8px',
          zIndex: 10
        }}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(contract);
            }}
            style={{
              padding: '6px 12px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            ✏️ Modifier
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDownload(contract);
            }}
            style={{
              padding: '6px 12px',
              backgroundColor: '#8b5cf6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            📄 Télécharger
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDelete();
            }}
            style={{
              padding: '6px 12px',
              backgroundColor: '#dc2626',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            🗑️ Supprimer
          </button>
        </div>
      )}

      {/* Status Badge */}
      <div style={{
        position: 'absolute',
        top: '12px',
        left: '12px',
        padding: '4px 12px',
        borderRadius: '20px',
        backgroundColor: getStatusColor(),
        color: 'white',
        fontSize: '12px',
        fontWeight: 'bold'
      }}>
        {getStatusText()}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Client Information */}
        <div>
          <h3 style={{ margin: '0 0 12px 0', color: '#333', fontSize: '18px' }}>
            👤 {contract.clientName}
          </h3>
          <div style={{ fontSize: '14px', color: '#666', lineHeight: '1.5' }}>
            <div><strong>Email:</strong> {contract.clientEmail}</div>
            <div><strong>Téléphone:</strong> {contract.clientPhone}</div>
            <div><strong>CIN:</strong> {contract.clientCIN}</div>
          </div>
        </div>

        {/* Vehicle Information */}
        <div>
          <h4 style={{ margin: '0 0 8px 0', color: '#333', fontSize: '16px' }}>
            🚗 Véhicule
          </h4>
          {vehicle ? (
            <div style={{ fontSize: '14px', color: '#666', lineHeight: '1.5' }}>
              <div><strong>{vehicle.name}</strong></div>
              <div>{vehicle.type} • {vehicle.boiteVitesse}</div>
              <div>{vehicle.pricePerDay}€/jour</div>
            </div>
          ) : (
            <div style={{ color: '#dc2626', fontSize: '14px' }}>Véhicule non trouvé</div>
          )}
        </div>

        {/* Rental Period */}
        <div>
          <h4 style={{ margin: '0 0 8px 0', color: '#333', fontSize: '16px' }}>
            📅 Période
          </h4>
          <div style={{ fontSize: '14px', color: '#666', lineHeight: '1.5' }}>
            <div><strong>Début:</strong> {new Date(contract.startDate).toLocaleDateString()}</div>
            <div><strong>Fin:</strong> {new Date(contract.endDate).toLocaleDateString()}</div>
            <div><strong>Durée:</strong> {Math.ceil((new Date(contract.endDate) - new Date(contract.startDate)) / (1000 * 60 * 60 * 24))} jours</div>
          </div>
        </div>

        {/* Price & Countdown */}
        <div>
          <h4 style={{ margin: '0 0 8px 0', color: '#333', fontSize: '16px' }}>
            💰 Prix & Statut
          </h4>
          <div style={{ fontSize: '14px', color: '#666', lineHeight: '1.5' }}>
            <div><strong>Total:</strong> {contract.totalPrice}€</div>
            {contractStatus === 'active' && daysRemaining !== null && (
              <div style={{ 
                color: daysRemaining <= 3 ? '#dc2626' : daysRemaining <= 7 ? '#ea580c' : '#16a34a',
                fontWeight: 'bold'
              }}>
                <strong>Jours restants:</strong> {daysRemaining}
              </div>
            )}
            {contractStatus === 'pending' && (
              <div style={{ color: '#f59e0b', fontWeight: 'bold' }}>
                Début dans {Math.ceil((new Date(contract.startDate) - new Date()) / (1000 * 60 * 60 * 24))} jours
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Status Actions */}
      <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #e0e0e0' }}>
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
          {contractStatus === 'pending' && (
            <button
              onClick={() => handleStatusChange('active')}
              style={{
                padding: '6px 12px',
                backgroundColor: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              ✅ Activer
            </button>
          )}
          {contractStatus === 'active' && (
            <button
              onClick={() => handleStatusChange('completed')}
              style={{
                padding: '6px 12px',
                backgroundColor: '#6b7280',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              📋 Terminer
            </button>
          )}
          {(contractStatus === 'pending' || contractStatus === 'active') && (
            <button
              onClick={() => handleStatusChange('cancelled')}
              style={{
                padding: '6px 12px',
                backgroundColor: '#dc2626',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              ❌ Annuler
            </button>
          )}
        </div>
      </div>

      <style>{`
        .contract-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(0,0,0,0.15);
        }
      `}</style>
    </div>
  );
};

export default ContractCard;
