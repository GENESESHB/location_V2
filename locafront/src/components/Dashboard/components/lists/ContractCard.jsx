// components/lists/ContractCard.jsx
import React, { useState, useEffect } from 'react';

const ContractCard = ({ contract, vehicles, onEdit, onDelete, onDownload, onUpdateStatus }) => {
  const [daysRemaining, setDaysRemaining] = useState(null);
  const [contractStatus, setContractStatus] = useState(contract.status || 'pending');
  const [showActions, setShowActions] = useState(false);

  // Helper functions to handle both old and new data structures
  const getClientInfo = () => {
    if (contract.clientInfo) {
      return {
        name: `${contract.clientInfo.firstName} ${contract.clientInfo.lastName}`,
        phone: contract.clientInfo.phone,
        cin: contract.clientInfo.cin,
        passport: contract.clientInfo.passport
      };
    }
    return {
      name: contract.clientName || 'Client non spécifié',
      phone: contract.clientPhone || 'Non spécifié',
      cin: contract.clientCIN || 'Non spécifié',
      passport: contract.clientPassport || 'Non spécifié'
    };
  };

  const getVehicleInfo = () => {
    // Use the vehicleInfo snapshot from contract (preferred)
    if (contract.vehicleInfo) {
      return contract.vehicleInfo;
    }
    // Fallback to vehicles list
    return vehicles.find(v => v._id === contract.vehicleId) || {};
  };

  const getRentalInfo = () => {
    if (contract.rentalInfo) {
      return {
        startDate: contract.rentalInfo.startDateTime,
        endDate: contract.rentalInfo.endDateTime,
        prixTotal: contract.rentalInfo.prixTotal,
        prixParJour: contract.rentalInfo.prixParJour,
        rentalDays: contract.rentalInfo.rentalDays,
        startLocation: contract.rentalInfo.startLocation,
        endLocation: contract.rentalInfo.endLocation
      };
    }
    return {
      startDate: contract.startDateTime || contract.startDate,
      endDate: contract.endDateTime || contract.endDate,
      prixTotal: contract.prixTotal || contract.totalPrice || 0,
      prixParJour: contract.prixParJour || 0,
      rentalDays: contract.rentalDays || contract.durationDays || 1,
      startLocation: contract.startLocation || 'Non spécifié',
      endLocation: contract.endLocation || 'Non spécifié'
    };
  };

  // Calculate days remaining and update status
  useEffect(() => {
    const calculateStatus = () => {
      const now = new Date();
      const rentalInfo = getRentalInfo();
      const startDate = new Date(rentalInfo.startDate);
      const endDate = new Date(rentalInfo.endDate);

      // Calculate days remaining
      const diffTime = endDate - now;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      setDaysRemaining(diffDays);

      // Update status based on dates (only if contract.status is not manually set)
      if (!contract.status) {
        if (now < startDate) {
          setContractStatus('pending');
        } else if (now > endDate) {
          setContractStatus('completed');
        } else {
          setContractStatus('active');
        }
      }
    };

    calculateStatus();
    const interval = setInterval(calculateStatus, 3600000); // Update every hour
    return () => clearInterval(interval);
  }, [contract]);

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
      default: return contract.status || 'Inconnu';
    }
  };

  const handleDelete = () => {
    const clientInfo = getClientInfo();
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer le contrat de ${clientInfo.name} ?`)) {
      onDelete(contract._id);
    }
  };

  const handleStatusChange = (newStatus) => {
    onUpdateStatus(contract._id, newStatus);
    setContractStatus(newStatus);
  };

  const clientInfo = getClientInfo();
  const vehicleInfo = getVehicleInfo();
  const rentalInfo = getRentalInfo();

  // Calculate duration for display
  const startDate = new Date(rentalInfo.startDate);
  const endDate = new Date(rentalInfo.endDate);
  const durationDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));

  return (
    <div className="contract-card" style={{
      border: '1px solid #e0e0e0',
      borderRadius: '16px',
      padding: '20px',
      marginBottom: '16px',
      backgroundColor: 'white',
      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
      transition: 'all 0.3s ease',
      cursor: 'pointer',
      position: 'relative',
      overflow: 'hidden'
    }}
    onMouseEnter={() => setShowActions(true)}
    onMouseLeave={() => setShowActions(false)}
    >
      {/* Background Gradient based on status */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '4px',
        background: `linear-gradient(90deg, ${getStatusColor()}, ${getStatusColor()}80)`
      }}></div>

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
              padding: '8px 16px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => e.target.style.transform = 'translateY(-1px)'}
            onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
          >
            ✏️ Modifier
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDownload(contract);
            }}
            style={{
              padding: '8px 16px',
              backgroundColor: '#8b5cf6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 8px rgba(139, 92, 246, 0.3)',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => e.target.style.transform = 'translateY(-1px)'}
            onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
          >
            📄 PDF
          </button>
          {contractStatus !== 'active' && contractStatus !== 'completed' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDelete();
              }}
              style={{
                padding: '8px 16px',
                backgroundColor: '#dc2626',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 2px 8px rgba(220, 38, 38, 0.3)',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => e.target.style.transform = 'translateY(-1px)'}
              onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
            >
              🗑️ Supprimer
            </button>
          )}
        </div>
      )}

      {/* Status Badge */}
      <div style={{
        position: 'absolute',
        top: '12px',
        left: '12px',
        padding: '6px 16px',
        borderRadius: '20px',
        backgroundColor: getStatusColor(),
        color: 'white',
        fontSize: '12px',
        fontWeight: 'bold',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        zIndex: 5
      }}>
        {getStatusText()}
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: vehicleInfo.image ? '120px 1fr 1fr' : '1fr 1fr', 
        gap: '20px',
        marginTop: '10px'
      }}>
        
        {/* Vehicle Image */}
        {vehicleInfo.image && (
          <div style={{
            gridRow: 'span 2',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <img 
              src={vehicleInfo.image} 
              alt={vehicleInfo.name}
              style={{
                width: '100%',
                height: '100px',
                objectFit: 'cover',
                borderRadius: '12px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                border: '2px solid #e9ecef'
              }}
            />
          </div>
        )}

        {/* Client Information */}
        <div>
          <h3 style={{ 
            margin: '0 0 12px 0', 
            color: '#1f2937', 
            fontSize: '18px',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span style={{
              backgroundColor: '#3b82f6',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '14px'
            }}>👤</span>
            {clientInfo.name}
          </h3>
          <div style={{ 
            fontSize: '14px', 
            color: '#6b7280', 
            lineHeight: '1.6',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px'
          }}>
            <div><strong>📞 Téléphone:</strong> {clientInfo.phone}</div>
            <div><strong>🆔 CIN:</strong> {clientInfo.cin}</div>
            {clientInfo.passport && <div><strong>🛂 Passeport:</strong> {clientInfo.passport}</div>}
          </div>
        </div>

        {/* Vehicle Information */}
        <div>
          <h4 style={{ 
            margin: '0 0 12px 0', 
            color: '#1f2937', 
            fontSize: '16px',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span style={{
              backgroundColor: '#10b981',
              borderRadius: '50%',
              width: '28px',
              height: '28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '12px'
            }}>🚗</span>
            Véhicule
          </h4>
          {vehicleInfo.name ? (
            <div style={{ 
              fontSize: '14px', 
              color: '#6b7280', 
              lineHeight: '1.6',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px'
            }}>
              <div><strong>{vehicleInfo.name}</strong></div>
              <div>{vehicleInfo.type} • {vehicleInfo.boiteVitesse}</div>
              <div>⛽ {vehicleInfo.carburant || 'Non spécifié'}</div>
              <div>💰 {rentalInfo.prixParJour} DH/jour</div>
            </div>
          ) : (
            <div style={{ 
              color: '#dc2626', 
              fontSize: '14px',
              fontStyle: 'italic'
            }}>
              Véhicule non trouvé
            </div>
          )}
        </div>

        {/* Rental Period */}
        <div>
          <h4 style={{ 
            margin: '0 0 12px 0', 
            color: '#1f2937', 
            fontSize: '16px',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span style={{
              backgroundColor: '#f59e0b',
              borderRadius: '50%',
              width: '28px',
              height: '28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '12px'
            }}>📅</span>
            Période de location
          </h4>
          <div style={{ 
            fontSize: '14px', 
            color: '#6b7280', 
            lineHeight: '1.6',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px'
          }}>
            <div><strong>🛫 Début:</strong> {startDate.toLocaleDateString('fr-FR')}</div>
            <div><strong>🛬 Fin:</strong> {endDate.toLocaleDateString('fr-FR')}</div>
            <div><strong>⏱️ Durée:</strong> {rentalInfo.rentalDays || durationDays} jours</div>
            <div><strong>📍 Lieu:</strong> {rentalInfo.startLocation} → {rentalInfo.endLocation}</div>
          </div>
        </div>

        {/* Price & Status */}
        <div>
          <h4 style={{ 
            margin: '0 0 12px 0', 
            color: '#1f2937', 
            fontSize: '16px',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span style={{
              backgroundColor: '#8b5cf6',
              borderRadius: '50%',
              width: '28px',
              height: '28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '12px'
            }}>💰</span>
            Prix & Délai
          </h4>
          <div style={{ 
            fontSize: '14px', 
            color: '#6b7280', 
            lineHeight: '1.6',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px'
          }}>
            <div style={{
              backgroundColor: '#f0f9ff',
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid #e0f2fe'
            }}>
              <strong>💵 Total:</strong> {rentalInfo.prixTotal} DH
            </div>
            
            {contractStatus === 'active' && daysRemaining !== null && (
              <div style={{
                color: daysRemaining <= 3 ? '#dc2626' : daysRemaining <= 7 ? '#ea580c' : '#16a34a',
                fontWeight: 'bold',
                backgroundColor: daysRemaining <= 3 ? '#fef2f2' : daysRemaining <= 7 ? '#fffbeb' : '#f0fdf4',
                padding: '6px 10px',
                borderRadius: '6px',
                border: `1px solid ${daysRemaining <= 3 ? '#fecaca' : daysRemaining <= 7 ? '#fed7aa' : '#bbf7d0'}`
              }}>
                ⏰ <strong>Jours restants:</strong> {daysRemaining}
              </div>
            )}
            
            {contractStatus === 'pending' && (
              <div style={{ 
                color: '#f59e0b', 
                fontWeight: 'bold',
                backgroundColor: '#fffbeb',
                padding: '6px 10px',
                borderRadius: '6px',
                border: '1px solid #fed7aa'
              }}>
                ⏳ <strong>Début dans:</strong> {Math.max(0, Math.ceil((startDate - new Date()) / (1000 * 60 * 60 * 24)))} jours
              </div>
            )}

            {contractStatus === 'completed' && (
              <div style={{ 
                color: '#6b7280', 
                fontWeight: 'bold',
                backgroundColor: '#f9fafb',
                padding: '6px 10px',
                borderRadius: '6px',
                border: '1px solid #e5e7eb'
              }}>
                ✅ Location terminée
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Status Actions */}
      <div style={{ 
        marginTop: '20px', 
        paddingTop: '16px', 
        borderTop: '2px dashed #e5e7eb',
        display: 'flex',
        justifyContent: 'center',
        gap: '12px'
      }}>
        {contractStatus === 'pending' && (
          <button
            onClick={() => handleStatusChange('active')}
            style={{
              padding: '8px 20px',
              backgroundColor: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => e.target.style.transform = 'translateY(-1px)'}
            onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
          >
            ✅ Activer le contrat
          </button>
        )}
        {contractStatus === 'active' && (
          <button
            onClick={() => handleStatusChange('completed')}
            style={{
              padding: '8px 20px',
              backgroundColor: '#6b7280',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 8px rgba(107, 114, 128, 0.3)',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => e.target.style.transform = 'translateY(-1px)'}
            onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
          >
            📋 Marquer comme terminé
          </button>
        )}
        {(contractStatus === 'pending' || contractStatus === 'active') && (
          <button
            onClick={() => handleStatusChange('cancelled')}
            style={{
              padding: '8px 20px',
              backgroundColor: '#dc2626',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 8px rgba(220, 38, 38, 0.3)',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => e.target.style.transform = 'translateY(-1px)'}
            onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
          >
            ❌ Annuler le contrat
          </button>
        )}
        {contractStatus === 'cancelled' && (
          <div style={{
            color: '#dc2626',
            fontWeight: '600',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            ❌ Contrat annulé
          </div>
        )}
      </div>

      <style>{`
        .contract-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 25px rgba(0,0,0,0.15);
        }
      `}</style>
    </div>
  );
};

export default ContractCard;
