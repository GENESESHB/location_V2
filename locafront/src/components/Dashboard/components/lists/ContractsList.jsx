// components/lists/ContractsList.jsx
import React from 'react';
import ContractCard from './ContractCard';

const ContractsList = ({ contracts, vehicles, onEdit, onDelete, onDownload, onUpdateStatus }) => {
  if (!contracts || contracts.length === 0) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '40px',
        color: '#666',
        backgroundColor: '#f9f9f9',
        borderRadius: '8px',
        marginTop: '20px'
      }}>
        <h3>Aucun contrat trouvé</h3>
        <p>Créez votre premier contrat pour commencer</p>
      </div>
    );
  }

  // Helper function to get contract status based on dates and status field with new structure
  const getContractStatus = (contract) => {
    // If contract has explicit status, use it
    if (contract.status) {
      return contract.status;
    }

    // Use the new nested structure for dates
    const now = new Date();
    const startDateTime = contract.rentalInfo ? new Date(contract.rentalInfo.startDateTime) : new Date(contract.startDateTime);
    const endDateTime = contract.rentalInfo ? new Date(contract.rentalInfo.endDateTime) : new Date(contract.endDateTime);

    if (now < startDateTime) {
      return 'pending';
    } else if (now >= startDateTime && now <= endDateTime) {
      return 'active';
    } else if (now > endDateTime) {
      return 'completed';
    }

    return 'pending'; // default
  };

  // Helper function to get client name from new structure
  const getClientName = (contract) => {
    if (contract.clientInfo) {
      return `${contract.clientInfo.firstName} ${contract.clientInfo.lastName}`;
    }
    // Fallback to old structure
    return `${contract.clientFirstName || ''} ${contract.clientLastName || ''}`.trim() || 'Client non spécifié';
  };

  // Helper function to get vehicle name from new structure
  const getVehicleName = (contract) => {
    if (contract.vehicleInfo) {
      return contract.vehicleInfo.name;
    }
    // Fallback to old structure
    return contract.vehicleName || 'Véhicule non spécifié';
  };

  // Helper function to get total price from new structure
  const getTotalPrice = (contract) => {
    if (contract.rentalInfo) {
      return contract.rentalInfo.prixTotal;
    }
    // Fallback to old structure
    return contract.prixTotal || 0;
  };

  // Helper function to get rental dates from new structure
  const getRentalDates = (contract) => {
    if (contract.rentalInfo) {
      return {
        start: contract.rentalInfo.startDateTime,
        end: contract.rentalInfo.endDateTime
      };
    }
    // Fallback to old structure
    return {
      start: contract.startDateTime,
      end: contract.endDateTime
    };
  };

  // Helper function to get rental days from new structure
  const getRentalDays = (contract) => {
    if (contract.rentalInfo) {
      return contract.rentalInfo.rentalDays;
    }
    // Fallback to old structure
    return contract.durationDays || 1;
  };

  // Group contracts by status using the helper function
  const pendingContracts = contracts.filter(c => getContractStatus(c) === 'pending');
  const activeContracts = contracts.filter(c => getContractStatus(c) === 'active');
  const completedContracts = contracts.filter(c => getContractStatus(c) === 'completed');
  const cancelledContracts = contracts.filter(c => getContractStatus(c) === 'cancelled');

  // Calculate statistics for the header
  const totalContracts = contracts.length;
  const totalRevenue = contracts.reduce((sum, contract) => sum + getTotalPrice(contract), 0);
  const upcomingReturns = activeContracts.filter(contract => {
    const endDate = contract.rentalInfo ? new Date(contract.rentalInfo.endDateTime) : new Date(contract.endDateTime);
    const now = new Date();
    const diffTime = endDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 3; // Returns in next 3 days
  });

  return (
    <div>
      {/* Enhanced Header with Statistics */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        marginBottom: '30px',
        overflow: 'hidden'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          padding: '20px',
          textAlign: 'center'
        }}>
          <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '600' }}>
            📋 Gestion des Contrats
          </h2>
          <p style={{ margin: '5px 0 0 0', opacity: 0.9 }}>
            Vue d'ensemble de votre activité de location
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '20px',
          padding: '20px'
        }}>
          {/* Total Contracts */}
          <div style={{
            textAlign: 'center',
            padding: '15px',
            backgroundColor: '#f8f9fa',
            borderRadius: '10px',
            border: '2px solid #e9ecef'
          }}>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#667eea', marginBottom: '5px' }}>
              {totalContracts}
            </div>
            <div style={{ color: '#6c757d', fontWeight: '500' }}>Total Contrats</div>
          </div>

          {/* Total Revenue */}
          <div style={{
            textAlign: 'center',
            padding: '15px',
            backgroundColor: '#f8f9fa',
            borderRadius: '10px',
            border: '2px solid #e9ecef'
          }}>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#36c275', marginBottom: '5px' }}>
              {totalRevenue.toLocaleString()} DH
            </div>
            <div style={{ color: '#6c757d', fontWeight: '500' }}>Chiffre d'Affaires</div>
          </div>

          {/* Upcoming Returns */}
          <div style={{
            textAlign: 'center',
            padding: '15px',
            backgroundColor: '#f8f9fa',
            borderRadius: '10px',
            border: '2px solid #e9ecef'
          }}>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#f59e0b', marginBottom: '5px' }}>
              {upcomingReturns.length}
            </div>
            <div style={{ color: '#6c757d', fontWeight: '500' }}>Retours sous 3 jours</div>
          </div>

          {/* Status Overview */}
          <div style={{
            textAlign: 'center',
            padding: '15px',
            backgroundColor: '#f8f9fa',
            borderRadius: '10px',
            border: '2px solid #e9ecef'
          }}>
            <div style={{ fontSize: '14px', color: '#6c757d', marginBottom: '8px', fontWeight: '500' }}>
              Répartition par Statut
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ width: '12px', height: '12px', backgroundColor: '#f59e0b', borderRadius: '50%', margin: '0 auto 4px' }}></div>
                <div style={{ fontSize: '12px', fontWeight: '600' }}>{pendingContracts.length}</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ width: '12px', height: '12px', backgroundColor: '#10b981', borderRadius: '50%', margin: '0 auto 4px' }}></div>
                <div style={{ fontSize: '12px', fontWeight: '600' }}>{activeContracts.length}</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ width: '12px', height: '12px', backgroundColor: '#6b7280', borderRadius: '50%', margin: '0 auto 4px' }}></div>
                <div style={{ fontSize: '12px', fontWeight: '600' }}>{completedContracts.length}</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ width: '12px', height: '12px', backgroundColor: '#dc2626', borderRadius: '50%', margin: '0 auto 4px' }}></div>
                <div style={{ fontSize: '12px', fontWeight: '600' }}>{cancelledContracts.length}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Active Contracts */}
      {activeContracts.length > 0 && (
        <div style={{ marginBottom: '30px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '20px',
            padding: '15px',
            backgroundColor: '#10b981',
            color: 'white',
            borderRadius: '10px',
            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
          }}>
            <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ 
                backgroundColor: 'rgba(255,255,255,0.2)', 
                borderRadius: '50%', 
                width: '30px', 
                height: '30px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                fontSize: '16px'
              }}>
                ✅
              </span>
              Contrats Actifs ({activeContracts.length})
            </h3>
            <div style={{ 
              backgroundColor: 'rgba(255,255,255,0.2)', 
              padding: '5px 12px', 
              borderRadius: '20px', 
              fontSize: '14px',
              fontWeight: '500'
            }}>
              En cours de location
            </div>
          </div>
          <div className="contracts-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
            gap: '20px'
          }}>
            {activeContracts.map(contract => (
              <ContractCard
                key={contract._id}
                contract={contract}
                vehicles={vehicles}
                onEdit={onEdit}
                onDelete={onDelete}
                onDownload={onDownload}
                onUpdateStatus={onUpdateStatus}
              />
            ))}
          </div>
        </div>
      )}

      {/* Pending Contracts */}
      {pendingContracts.length > 0 && (
        <div style={{ marginBottom: '30px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '20px',
            padding: '15px',
            backgroundColor: '#f59e0b',
            color: 'white',
            borderRadius: '10px',
            boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)'
          }}>
            <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ 
                backgroundColor: 'rgba(255,255,255,0.2)', 
                borderRadius: '50%', 
                width: '30px', 
                height: '30px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                fontSize: '16px'
              }}>
                ⏳
              </span>
              Contrats en Attente ({pendingContracts.length})
            </h3>
            <div style={{ 
              backgroundColor: 'rgba(255,255,255,0.2)', 
              padding: '5px 12px', 
              borderRadius: '20px', 
              fontSize: '14px',
              fontWeight: '500'
            }}>
              Démarrage futur
            </div>
          </div>
          <div className="contracts-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
            gap: '20px'
          }}>
            {pendingContracts.map(contract => (
              <ContractCard
                key={contract._id}
                contract={contract}
                vehicles={vehicles}
                onEdit={onEdit}
                onDelete={onDelete}
                onDownload={onDownload}
                onUpdateStatus={onUpdateStatus}
              />
            ))}
          </div>
        </div>
      )}

      {/* Completed Contracts */}
      {completedContracts.length > 0 && (
        <div style={{ marginBottom: '30px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '20px',
            padding: '15px',
            backgroundColor: '#6b7280',
            color: 'white',
            borderRadius: '10px',
            boxShadow: '0 4px 12px rgba(107, 114, 128, 0.3)'
          }}>
            <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ 
                backgroundColor: 'rgba(255,255,255,0.2)', 
                borderRadius: '50%', 
                width: '30px', 
                height: '30px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                fontSize: '16px'
              }}>
                📋
              </span>
              Contrats Terminés ({completedContracts.length})
            </h3>
            <div style={{ 
              backgroundColor: 'rgba(255,255,255,0.2)', 
              padding: '5px 12px', 
              borderRadius: '20px', 
              fontSize: '14px',
              fontWeight: '500'
            }}>
              Location terminée
            </div>
          </div>
          <div className="contracts-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
            gap: '20px'
          }}>
            {completedContracts.map(contract => (
              <ContractCard
                key={contract._id}
                contract={contract}
                vehicles={vehicles}
                onEdit={onEdit}
                onDelete={onDelete}
                onDownload={onDownload}
                onUpdateStatus={onUpdateStatus}
              />
            ))}
          </div>
        </div>
      )}

      {/* Cancelled Contracts */}
      {cancelledContracts.length > 0 && (
        <div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '20px',
            padding: '15px',
            backgroundColor: '#dc2626',
            color: 'white',
            borderRadius: '10px',
            boxShadow: '0 4px 12px rgba(220, 38, 38, 0.3)'
          }}>
            <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ 
                backgroundColor: 'rgba(255,255,255,0.2)', 
                borderRadius: '50%', 
                width: '30px', 
                height: '30px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                fontSize: '16px'
              }}>
                ❌
              </span>
              Contrats Annulés ({cancelledContracts.length})
            </h3>
            <div style={{ 
              backgroundColor: 'rgba(255,255,255,0.2)', 
              padding: '5px 12px', 
              borderRadius: '20px', 
              fontSize: '14px',
              fontWeight: '500'
            }}>
              Annulés
            </div>
          </div>
          <div className="contracts-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
            gap: '20px'
          }}>
            {cancelledContracts.map(contract => (
              <ContractCard
                key={contract._id}
                contract={contract}
                vehicles={vehicles}
                onEdit={onEdit}
                onDelete={onDelete}
                onDownload={onDownload}
                onUpdateStatus={onUpdateStatus}
              />
            ))}
          </div>
        </div>
      )}

      {/* Empty state when no contracts in any category */}
      {pendingContracts.length === 0 && activeContracts.length === 0 && 
       completedContracts.length === 0 && cancelledContracts.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          color: '#6c757d',
          backgroundColor: '#f8f9fa',
          borderRadius: '12px',
          border: '2px dashed #dee2e6'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>📄</div>
          <h3 style={{ color: '#495057', marginBottom: '10px' }}>Aucun contrat dans cette catégorie</h3>
          <p>Les contrats apparaîtront ici selon leur statut</p>
        </div>
      )}
    </div>
  );
};

export default ContractsList;
