// components/lists/VehicleCard.jsx
import React, { useState, useEffect } from 'react';

const VehicleCard = ({ vehicle, onEdit, onDelete, onToggleAvailability }) => {
  const [daysUntilAssurance, setDaysUntilAssurance] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showActions, setShowActions] = useState(false);
  const [showAllDetails, setShowAllDetails] = useState(false);

  // Calculate days remaining for assurance
  useEffect(() => {
    const calculateDaysRemaining = () => {
      const now = new Date();
      setCurrentTime(now);

      if (vehicle.assuranceEndDate) {
        const assuranceEnd = new Date(vehicle.assuranceEndDate);
        const diffTime = assuranceEnd - now;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        setDaysUntilAssurance(diffDays);
      }
    };

    calculateDaysRemaining();
    const interval = setInterval(calculateDaysRemaining, 3600000);
    return () => clearInterval(interval);
  }, [vehicle.assuranceEndDate]);

  const getStatusColor = (days) => {
    if (days === null || days === undefined) return '#666';
    if (days < 0) return '#dc2626';
    if (days <= 7) return '#ea580c';
    if (days <= 30) return '#d97706';
    return '#16a34a';
  };

  const getStatusText = (days, type) => {
    if (days === null || days === undefined) return `${type} : Non définie`;
    if (days < 0) return `${type} : Expirée (${Math.abs(days)}j)`;
    if (days === 0) return `${type} : Aujourd'hui`;
    if (days === 1) return `${type} : 1 jour restant`;
    return `${type} : ${days} jours restants`;
  };

  const handleDelete = () => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer le véhicule "${vehicle.name}" ?`)) {
      onDelete(vehicle._id);
    }
  };

  const handleToggleAvailability = () => {
    onToggleAvailability(vehicle._id, !vehicle.available);
  };

  // Fonction pour afficher les équipements
  const renderEquipment = () => {
    const equipment = [];
    if (vehicle.radio) equipment.push('📻 Radio');
    if (vehicle.gps) equipment.push('🧭 GPS');
    if (vehicle.mp3) equipment.push('🎵 MP3');
    if (vehicle.cd) equipment.push('💿 CD');
    return equipment.length > 0 ? equipment.join(' • ') : 'Aucun équipement';
  };

  // Fonction pour afficher les impôts
  const renderTaxes = () => {
    const taxes = [];
    if (vehicle.impot2026) taxes.push('2026');
    if (vehicle.impot2027) taxes.push('2027');
    if (vehicle.impot2028) taxes.push('2028');
    if (vehicle.impot2029) taxes.push('2029');
    return taxes.length > 0 ? `Impôts: ${taxes.join(', ')}` : 'Aucun impôt';
  };

  // Fonction pour afficher les dommages
  const renderDamages = () => {
    if (!vehicle.dommages || vehicle.dommages.length === 0) {
      return 'Aucun dommage';
    }
    return `${vehicle.dommages.length} dommage(s)`;
  };

  return (
    <div className="vehicle-card" style={{
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
              onEdit(vehicle);
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
              handleToggleAvailability();
            }}
            style={{
              padding: '6px 12px',
              backgroundColor: vehicle.available ? '#f59e0b' : '#10b981',
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
            {vehicle.available ? '⏸️ Désactiver' : '▶️ Activer'}
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

      <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
        {/* Vehicle Image */}
        {vehicle.image && (
          <img
            src={vehicle.image}
            alt={vehicle.name}
            style={{
              width: '120px',
              height: '90px',
              borderRadius: '8px',
              objectFit: 'cover'
            }}
          />
        )}

        {/* Vehicle Info */}
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <div>
              <h3 style={{ margin: '0 0 4px 0', color: '#333', fontSize: '18px' }}>
                {vehicle.name}
                {!vehicle.available && (
                  <span style={{
                    marginLeft: '8px',
                    padding: '2px 8px',
                    backgroundColor: '#fee2e2',
                    color: '#dc2626',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}>
                    INDISPONIBLE
                  </span>
                )}
              </h3>
              <div style={{ display: 'flex', gap: '8px', fontSize: '14px', color: '#666', flexWrap: 'wrap', marginBottom: '8px' }}>
                <span style={{
                  backgroundColor: '#f0f0f0',
                  padding: '2px 8px',
                  borderRadius: '12px'
                }}>
                  {vehicle.type}
                </span>
                <span style={{
                  backgroundColor: '#f0f0f0',
                  padding: '2px 8px',
                  borderRadius: '12px'
                }}>
                  {vehicle.boiteVitesse}
                </span>
                <span style={{
                  backgroundColor: '#36c275',
                  color: 'white',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  fontWeight: 'bold'
                }}>
                  {vehicle.pricePerDay}€/jour
                </span>
              </div>
            </div>
          </div>

          {/* Informations de base */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px', marginBottom: '12px' }}>
            <div style={{ fontSize: '12px', color: '#666' }}>
              <strong>⛽ Carburant:</strong> {vehicle.carburant || 'Non spécifié'}
            </div>
            <div style={{ fontSize: '12px', color: '#666' }}>
              <strong>🛢️ Réservoir:</strong> {vehicle.niveauReservoir || 'Non spécifié'}
            </div>
            <div style={{ fontSize: '12px', color: '#666' }}>
              <strong>🔑 Clés:</strong> {vehicle.nombreCles || '0'}
            </div>
            <div style={{ fontSize: '12px', color: '#666' }}>
              <strong>🛣️ KM Départ:</strong> {vehicle.kmDepart || 'Non spécifié'}
            </div>
          </div>

          {/* Équipements */}
          <div style={{ marginBottom: '8px' }}>
            <div style={{ fontSize: '12px', color: '#666' }}>
              <strong>🎵 Équipements:</strong> {renderEquipment()}
            </div>
          </div>

          {/* Informations détaillées (affichées quand on clique pour voir plus) */}
          {showAllDetails && (
            <div style={{
              padding: '12px',
              backgroundColor: '#f8f9fa',
              borderRadius: '8px',
              marginBottom: '12px',
              border: '1px solid #e9ecef'
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px', marginBottom: '8px' }}>
                <div style={{ fontSize: '12px', color: '#666' }}>
                  <strong>🛣️ KM Retour:</strong> {vehicle.kmRetour || 'Non spécifié'}
                </div>
                <div style={{ fontSize: '12px', color: '#666' }}>
                  <strong>💰 {renderTaxes()}</strong>
                </div>
                <div style={{ fontSize: '12px', color: '#666' }}>
                  <strong>🔧 Vidange:</strong> {vehicle.vidangeInterval ? `${vehicle.vidangeInterval} KM` : 'Non spécifié'}
                </div>
                <div style={{ fontSize: '12px', color: vehicle.dommages && vehicle.dommages.length > 0 ? '#dc2626' : '#666' }}>
                  <strong>🚨 Dommages:</strong> {renderDamages()}
                </div>
              </div>
              
              {/* Liste des dommages détaillée */}
              {vehicle.dommages && vehicle.dommages.length > 0 && (
                <div style={{ marginTop: '8px', padding: '8px', backgroundColor: '#fff0f0', borderRadius: '4px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#dc2626', marginBottom: '4px' }}>
                    Parties endommagées:
                  </div>
                  <div style={{ fontSize: '10px', color: '#dc2626' }}>
                    {vehicle.dommages.join(', ')}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Bouton pour voir plus/moins de détails */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowAllDetails(!showAllDetails);
            }}
            style={{
              padding: '4px 8px',
              backgroundColor: 'transparent',
              color: '#3b82f6',
              border: '1px solid #3b82f6',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '11px',
              marginBottom: '12px'
            }}
          >
            {showAllDetails ? '↑ Moins de détails' : '↓ Plus de détails'}
          </button>

          {/* Description */}
          {vehicle.description && (
            <p style={{
              margin: '8px 0',
              color: '#666',
              fontSize: '14px',
              lineHeight: '1.4'
            }}>
              {vehicle.description}
            </p>
          )}

          {/* Assurance Status */}
          <div style={{
              padding: '12px',
              borderRadius: '8px',
              backgroundColor: '#f8f9fa',
              border: `2px solid ${getStatusColor(daysUntilAssurance)}`,
              marginBottom: '12px'
            }}>
              <div style={{
                fontSize: '12px',
                fontWeight: 'bold',
                color: getStatusColor(daysUntilAssurance),
                marginBottom: '4px'
              }}>
                ASSURANCE
              </div>
              <div style={{
                fontSize: '11px',
                color: '#666',
                marginBottom: '4px'
              }}>
                {getStatusText(daysUntilAssurance, 'Expire')}
              </div>
              {vehicle.assuranceStartDate && vehicle.assuranceEndDate && (
                <div style={{
                  fontSize: '10px',
                  color: '#999'
                }}>
                  {new Date(vehicle.assuranceStartDate).toLocaleDateString()} - {new Date(vehicle.assuranceEndDate).toLocaleDateString()}
                </div>
              )}
            </div>

          {/* Remarques */}
          {vehicle.remarques && (
            <div style={{
              marginTop: '8px',
              padding: '8px 12px',
              backgroundColor: '#fff3cd',
              border: '1px solid #ffeaa7',
              borderRadius: '6px',
              fontSize: '12px',
              color: '#856404'
            }}>
              <strong>📝 Remarques:</strong> {vehicle.remarques}
            </div>
          )}

          {/* Last Updated */}
          <div style={{
            marginTop: '12px',
            fontSize: '10px',
            color: '#999',
            textAlign: 'right'
          }}>
            Mis à jour: {new Date(vehicle.updatedAt || vehicle.createdAt).toLocaleDateString()}
          </div>
        </div>
      </div>

      <style>{`
        .vehicle-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(0,0,0,0.15);
        }
      `}</style>
    </div>
  );
};

export default VehicleCard;
