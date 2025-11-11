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

  // Helper function to get contract status based on dates and status field
  const getContractStatus = (contract) => {
    // If contract has explicit status, use it
    if (contract.status) {
      return contract.status;
    }
    
    const now = new Date();
    const startDateTime = new Date(contract.startDateTime);
    const endDateTime = new Date(contract.endDateTime);
    
    if (now < startDateTime) {
      return 'pending';
    } else if (now >= startDateTime && now <= endDateTime) {
      return 'active';
    } else if (now > endDateTime) {
      return 'completed';
    }
    
    return 'pending'; // default
  };

  // Group contracts by status using the helper function
  const pendingContracts = contracts.filter(c => getContractStatus(c) === 'pending');
  const activeContracts = contracts.filter(c => getContractStatus(c) === 'active');
  const completedContracts = contracts.filter(c => getContractStatus(c) === 'completed');
  const cancelledContracts = contracts.filter(c => getContractStatus(c) === 'cancelled');

  return (
    <div>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
        padding: '16px',
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ margin: 0, color: '#333' }}>
          Mes Contrats ({contracts.length})
        </h2>
        <div style={{ display: 'flex', gap: '12px', fontSize: '14px', color: '#666' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <div style={{ width: '12px', height: '12px', backgroundColor: '#f59e0b', borderRadius: '50%' }}></div>
            <span>En attente: {pendingContracts.length}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <div style={{ width: '12px', height: '12px', backgroundColor: '#10b981', borderRadius: '50%' }}></div>
            <span>Actif: {activeContracts.length}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <div style={{ width: '12px', height: '12px', backgroundColor: '#6b7280', borderRadius: '50%' }}></div>
            <span>Terminé: {completedContracts.length}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <div style={{ width: '12px', height: '12px', backgroundColor: '#dc2626', borderRadius: '50%' }}></div>
            <span>Annulé: {cancelledContracts.length}</span>
          </div>
        </div>
      </div>

      {/* Active Contracts */}
      {activeContracts.length > 0 && (
        <div style={{ marginBottom: '30px' }}>
          <h3 style={{ color: '#10b981', marginBottom: '16px', paddingBottom: '8px', borderBottom: '2px solid #10b981' }}>
            ✅ Contrats Actifs ({activeContracts.length})
          </h3>
          <div className="contracts-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
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
          <h3 style={{ color: '#f59e0b', marginBottom: '16px', paddingBottom: '8px', borderBottom: '2px solid #f59e0b' }}>
            ⏳ Contrats en Attente ({pendingContracts.length})
          </h3>
          <div className="contracts-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
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
          <h3 style={{ color: '#6b7280', marginBottom: '16px', paddingBottom: '8px', borderBottom: '2px solid #6b7280' }}>
            📋 Contrats Terminés ({completedContracts.length})
          </h3>
          <div className="contracts-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
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
          <h3 style={{ color: '#dc2626', marginBottom: '16px', paddingBottom: '8px', borderBottom: '2px solid #dc2626' }}>
            ❌ Contrats Annulés ({cancelledContracts.length})
          </h3>
          <div className="contracts-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
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
    </div>
  );
};

export default ContractsList;
