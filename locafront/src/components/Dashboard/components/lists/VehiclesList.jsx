// components/lists/VehiclesList.jsx
import React from 'react';
import VehicleCard from './VehicleCard';

const VehiclesList = ({ vehicles, onEdit, onDelete, onToggleAvailability }) => {
  if (!vehicles || vehicles.length === 0) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '40px',
        color: '#666',
        backgroundColor: '#f9f9f9',
        borderRadius: '8px',
        marginTop: '20px'
      }}>
        <h3>Aucun véhicule trouvé</h3>
        <p>Ajoutez votre premier véhicule pour commencer</p>
      </div>
    );
  }

  const availableVehicles = vehicles.filter(v => v.available);
  const unavailableVehicles = vehicles.filter(v => !v.available);

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
          Mes Véhicules ({vehicles.length})
          {availableVehicles.length > 0 && (
            <span style={{ fontSize: '14px', color: '#16a34a', marginLeft: '8px' }}>
              • {availableVehicles.length} disponible{availableVehicles.length > 1 ? 's' : ''}
            </span>
          )}
          {unavailableVehicles.length > 0 && (
            <span style={{ fontSize: '14px', color: '#dc2626', marginLeft: '8px' }}>
              • {unavailableVehicles.length} indisponible{unavailableVehicles.length > 1 ? 's' : ''}
            </span>
          )}
        </h2>
        
        {/* Légende des statuts */}
        <div style={{ display: 'flex', gap: '12px', fontSize: '14px', color: '#666', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <div style={{ width: '12px', height: '12px', backgroundColor: '#16a34a', borderRadius: '50%' }}></div>
            <span>Disponible</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <div style={{ width: '12px', height: '12px', backgroundColor: '#dc2626', borderRadius: '50%' }}></div>
            <span>Indisponible</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <div style={{ width: '12px', height: '12px', backgroundColor: '#f59e0b', borderRadius: '50%' }}></div>
            <span>Réservé</span>
          </div>
        </div>
      </div>

      {/* Statistiques des véhicules */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '15px',
        marginBottom: '25px'
      }}>
        <div style={{
          padding: '15px',
          backgroundColor: '#f0f9ff',
          borderRadius: '8px',
          border: '1px solid #bae6fd',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#0369a1' }}>
            {vehicles.length}
          </div>
          <div style={{ fontSize: '14px', color: '#0c4a6e' }}>Total Véhicules</div>
        </div>
        
        <div style={{
          padding: '15px',
          backgroundColor: '#f0fdf4',
          borderRadius: '8px',
          border: '1px solid #bbf7d0',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#16a34a' }}>
            {availableVehicles.length}
          </div>
          <div style={{ fontSize: '14px', color: '#166534' }}>Disponibles</div>
        </div>
        
        <div style={{
          padding: '15px',
          backgroundColor: '#fef2f2',
          borderRadius: '8px',
          border: '1px solid #fecaca',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#dc2626' }}>
            {unavailableVehicles.length}
          </div>
          <div style={{ fontSize: '14px', color: '#991b1b' }}>Indisponibles</div>
        </div>
        
        <div style={{
          padding: '15px',
          backgroundColor: '#fffbeb',
          borderRadius: '8px',
          border: '1px solid #fed7aa',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#d97706' }}>
            {vehicles.filter(v => v.dommages && v.dommages.length > 0).length}
          </div>
          <div style={{ fontSize: '14px', color: '#92400e' }}>Avec Dommages</div>
        </div>
      </div>

      {/* Available Vehicles */}
      {availableVehicles.length > 0 && (
        <div style={{ marginBottom: '30px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '16px',
            paddingBottom: '8px',
            borderBottom: '2px solid #16a34a'
          }}>
            <h3 style={{ color: '#16a34a', margin: 0 }}>
              ✅ Véhicules Disponibles ({availableVehicles.length})
            </h3>
            <div style={{
              fontSize: '14px',
              color: '#16a34a',
              backgroundColor: '#f0fdf4',
              padding: '4px 8px',
              borderRadius: '4px',
              fontWeight: 'bold'
            }}>
              Prêts à être loués
            </div>
          </div>
          <div className="vehicles-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
            gap: '20px'
          }}>
            {availableVehicles.map(vehicle => (
              <VehicleCard
                key={vehicle._id}
                vehicle={vehicle}
                onEdit={onEdit}
                onDelete={onDelete}
                onToggleAvailability={onToggleAvailability}
              />
            ))}
          </div>
        </div>
      )}

      {/* Unavailable Vehicles */}
      {unavailableVehicles.length > 0 && (
        <div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '16px',
            paddingBottom: '8px',
            borderBottom: '2px solid #dc2626'
          }}>
            <h3 style={{ color: '#dc2626', margin: 0 }}>
              ⏸️ Véhicules Indisponibles ({unavailableVehicles.length})
            </h3>
            <div style={{
              fontSize: '14px',
              color: '#dc2626',
              backgroundColor: '#fef2f2',
              padding: '4px 8px',
              borderRadius: '4px',
              fontWeight: 'bold'
            }}>
              En maintenance ou loués
            </div>
          </div>
          <div className="vehicles-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
            gap: '20px'
          }}>
            {unavailableVehicles.map(vehicle => (
              <VehicleCard
                key={vehicle._id}
                vehicle={vehicle}
                onEdit={onEdit}
                onDelete={onDelete}
                onToggleAvailability={onToggleAvailability}
              />
            ))}
          </div>
        </div>
      )}

      {/* Information sur les nouvelles fonctionnalités */}
      <div style={{
        marginTop: '30px',
        padding: '20px',
        backgroundColor: '#f8fafc',
        borderRadius: '8px',
        border: '1px solid #e2e8f0'
      }}>
        <h4 style={{ margin: '0 0 10px 0', color: '#475569' }}>📋 Informations des véhicules</h4>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '10px',
          fontSize: '12px',
          color: '#64748b'
        }}>
          <div>• 🚗 Type et carburant</div>
          <div>• ⚙️ Boîte de vitesse</div>
          <div>• 📻 Équipements audio</div>
          <div>• 🗝️ Nombre de clés</div>
          <div>• 🛣️ Kilométrage</div>
          <div>• 📅 Assurance et vidange</div>
          <div>• 💰 Impôts 2026-2029</div>
          <div>• 🚨 Parties endommagées</div>
        </div>
      </div>
    </div>
  );
};

export default VehiclesList;
