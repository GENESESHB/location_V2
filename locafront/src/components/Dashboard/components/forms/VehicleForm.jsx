// components/forms/VehicleForm.jsx
import React, { useEffect, useState } from 'react';

const VehicleForm = ({
  vehicleForm,
  imagePreview,
  errors,
  loading,
  isEditing,
  handleVehicleChange,
  addVehicle,
  updateVehicle,
  setShowForm,
  setVehicleForm,
  setImagePreview,
  setErrors
}) => {
  const [damageAreas, setDamageAreas] = useState([]);
  const [carParts, setCarParts] = useState([
    { id: 'pare-chocs-avant', name: 'Pare-chocs Avant', selected: false },
    { id: 'pare-chocs-arriere', name: 'Pare-chocs Arrière', selected: false },
    { id: 'porte-avant-gauche', name: 'Porte Avant Gauche', selected: false },
    { id: 'porte-avant-droite', name: 'Porte Avant Droite', selected: false },
    { id: 'porte-arriere-gauche', name: 'Porte Arrière Gauche', selected: false },
    { id: 'porte-arriere-droite', name: 'Porte Arrière Droite', selected: false },
    { id: 'aile-avant-gauche', name: 'Aile Avant Gauche', selected: false },
    { id: 'aile-avant-droite', name: 'Aile Avant Droite', selected: false },
    { id: 'aile-arriere-gauche', name: 'Aile Arrière Gauche', selected: false },
    { id: 'aile-arriere-droite', name: 'Aile Arrière Droite', selected: false },
    { id: 'capot', name: 'Capot', selected: false },
    { id: 'coffre', name: 'Coffre', selected: false },
    { id: 'toit', name: 'Toit', selected: false },
    { id: 'retroviseur-gauche', name: 'Rétroviseur Gauche', selected: false },
    { id: 'retroviseur-droit', name: 'Rétroviseur Droit', selected: false },
    { id: 'phare-avant-gauche', name: 'Phare Avant Gauche', selected: false },
    { id: 'phare-avant-droit', name: 'Phare Avant Droit', selected: false },
    { id: 'feu-arriere-gauche', name: 'Feu Arrière Gauche', selected: false },
    { id: 'feu-arriere-droit', name: 'Feu Arrière Droit', selected: false },
    { id: 'vitre-avant', name: 'Vitre Avant', selected: false },
    { id: 'vitre-arriere', name: 'Vitre Arrière', selected: false },
    { id: 'jante-avant-gauche', name: 'Jante Avant Gauche', selected: false },
    { id: 'jante-avant-droite', name: 'Jante Avant Droite', selected: false },
    { id: 'jante-arriere-gauche', name: 'Jante Arrière Gauche', selected: false },
    { id: 'jante-arriere-droite', name: 'Jante Arrière Droite', selected: false }
  ]);

  // Reset form when switching between add/edit modes
  useEffect(() => {
    if (!isEditing) {
      setVehicleForm({
        name: '',
        type: '',
        boiteVitesse: '',
        description: '',
        image: null,
        pricePerDay: '',
        carburant: '',
        niveauReservoir: '',
        gps: false,
        mp3: false,
        cd: false,
        radio: false,
        nombreCles: '',
        kmDepart: '',
        kmRetour: '',
        impot2026: false,
        impot2027: false,
        impot2028: false,
        impot2029: false,
        assuranceStartDate: '',
        assuranceEndDate: '',
        vidangeInterval: '',
        remarques: '',
        dommages: []
      });
      setImagePreview(null);
      setDamageAreas([]);
      resetCarParts();
    }
  }, [isEditing, setVehicleForm, setImagePreview]);

  // Load existing damages when editing
  useEffect(() => {
    if (isEditing && vehicleForm.dommages) {
      const updatedParts = carParts.map(part => ({
        ...part,
        selected: vehicleForm.dommages.includes(part.id)
      }));
      setCarParts(updatedParts);
    }
  }, [isEditing, vehicleForm.dommages]);

  const resetCarParts = () => {
    setCarParts(parts => parts.map(part => ({ ...part, selected: false })));
  };

  const handleCarPartClick = (partId) => {
    const updatedParts = carParts.map(part => 
      part.id === partId ? { ...part, selected: !part.selected } : part
    );
    
    setCarParts(updatedParts);
    
    const selectedDamages = updatedParts
      .filter(part => part.selected)
      .map(part => part.id);
    
    setVehicleForm(prev => ({
      ...prev,
      dommages: selectedDamages
    }));
  };

  const handleCancel = () => {
    setShowForm(false);
    setVehicleForm({
      name: '',
      type: '',
      boiteVitesse: '',
      description: '',
      image: null,
      pricePerDay: '',
      carburant: '',
      niveauReservoir: '',
      gps: false,
      mp3: false,
      cd: false,
      radio: false,
      nombreCles: '',
      kmDepart: '',
      kmRetour: '',
      impot2026: false,
      impot2027: false,
      impot2028: false,
      impot2029: false,
      assuranceStartDate: '',
      assuranceEndDate: '',
      vidangeInterval: '',
      remarques: '',
      dommages: []
    });
    setImagePreview(null);
    setDamageAreas([]);
    resetCarParts();
    setErrors({});
  };

  const handleSubmit = (e) => {
    if (isEditing) {
      updateVehicle(e);
    } else {
      addVehicle(e);
    }
  };

  const selectedDamagesCount = carParts.filter(part => part.selected).length;

  return (
    <form onSubmit={handleSubmit} className="vehicle-form">
      <div style={{
        backgroundColor: isEditing ? '#fff3cd' : '#e8f5e8',
        padding: '12px 16px',
        borderRadius: '8px',
        marginBottom: '20px',
        border: `2px solid ${isEditing ? '#ffc107' : '#36c275'}`
      }}>
        <h3 style={{ margin: 0, color: isEditing ? '#856404' : '#2e7d32' }}>
          {isEditing ? '✏️ Modifier le Véhicule' : '🚗 Ajouter un Nouveau Véhicule'}
        </h3>
        <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: isEditing ? '#856404' : '#2e7d32' }}>
          {isEditing ? 'Modifiez les informations du véhicule ci-dessous' : 'Remplissez les informations du nouveau véhicule'}
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
        
        {/* Informations de Base - REQUIRED */}
        <div>
          <label>Nom du Véhicule: <span style={{color: 'red'}}>*</span></label>
          <input
            type="text"
            name="name"
            value={vehicleForm.name}
            onChange={handleVehicleChange}
            required
          />
          {errors.name && <span style={{ color: 'red', fontSize: '12px' }}>{errors.name}</span>}
        </div>

        <div>
          <label>Type de Véhicule: <span style={{color: 'red'}}>*</span></label>
          <select
            name="type"
            value={vehicleForm.type}
            onChange={handleVehicleChange}
            required
          >
            <option value="">Sélectionnez un type</option>
            <optgroup label="🚗 Véhicules légers">
              <option value="Citadine">Citadine</option>
              <option value="Compacte">Compacte</option>
              <option value="Berline">Berline</option>
              <option value="Berline premium">Berline premium</option>
              <option value="Coupé">Coupé</option>
              <option value="Cabriolet">Cabriolet</option>
              <option value="Break">Break</option>
              <option value="SUV">SUV</option>
              <option value="SUV compact">SUV compact</option>
              <option value="SUV premium">SUV premium</option>
              <option value="Crossover">Crossover</option>
            </optgroup>
          </select>
          {errors.type && <span style={{ color: 'red', fontSize: '12px' }}>{errors.type}</span>}
        </div>

        <div>
          <label>Boîte de Vitesse: <span style={{color: 'red'}}>*</span></label>
          <select
            name="boiteVitesse"
            value={vehicleForm.boiteVitesse}
            onChange={handleVehicleChange}
            required
          >
            <option value="">Sélectionnez</option>
            <option value="Manuelle">Manuelle</option>
            <option value="Automatique">Automatique</option>
          </select>
          {errors.boiteVitesse && <span style={{ color: 'red', fontSize: '12px' }}>{errors.boiteVitesse}</span>}
        </div>

        <div>
          <label>Prix par Jour (€): <span style={{color: 'red'}}>*</span></label>
          <input
            type="number"
            name="pricePerDay"
            value={vehicleForm.pricePerDay}
            onChange={handleVehicleChange}
            required
            min="0"
            step="0.01"
          />
        </div>

        {/* Carburant et État - REQUIRED */}
        <div>
          <label>Type de Carburant: <span style={{color: 'red'}}>*</span></label>
          <select
            name="carburant"
            value={vehicleForm.carburant}
            onChange={handleVehicleChange}
            required
          >
            <option value="">Sélectionnez</option>
            <option value="Gasoil">Gasoil</option>
            <option value="Essence">Essence</option>
            <option value="Hybride">Hybride</option>
            <option value="Électrique">Électrique</option>
          </select>
        </div>

        <div>
          <label>Niveau du Réservoir: <span style={{color: 'red'}}>*</span></label>
          <select
            name="niveauReservoir"
            value={vehicleForm.niveauReservoir}
            onChange={handleVehicleChange}
            required
          >
            <option value="">Sélectionnez</option>
            <option value="1/4">1/4</option>
            <option value="1/2">1/2</option>
            <option value="3/4">3/4</option>
            <option value="PLEIN">PLEIN</option>
          </select>
        </div>

        {/* Équipements Radio - REQUIRED */}
        <div style={{ gridColumn: '1 / -1', border: '1px solid #ddd', padding: '15px', borderRadius: '8px' }}>
          <label style={{ fontWeight: 'bold', marginBottom: '10px', display: 'block' }}>Équipements Audio: <span style={{color: 'red'}}>*</span></label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="checkbox"
                name="radio"
                checked={vehicleForm.radio}
                onChange={(e) => setVehicleForm(prev => ({ ...prev, radio: e.target.checked }))}
                required
              />
              Radio
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="checkbox"
                name="gps"
                checked={vehicleForm.gps}
                onChange={(e) => setVehicleForm(prev => ({ ...prev, gps: e.target.checked }))}
                required
              />
              GPS
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="checkbox"
                name="mp3"
                checked={vehicleForm.mp3}
                onChange={(e) => setVehicleForm(prev => ({ ...prev, mp3: e.target.checked }))}
                required
              />
              MP3
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="checkbox"
                name="cd"
                checked={vehicleForm.cd}
                onChange={(e) => setVehicleForm(prev => ({ ...prev, cd: e.target.checked }))}
                required
              />
              CD
            </label>
          </div>
        </div>

        {/* Impôts - REQUIRED avec cases à cocher */}
        <div style={{ gridColumn: '1 / -1', border: '1px solid #ddd', padding: '15px', borderRadius: '8px' }}>
          <label style={{ fontWeight: 'bold', marginBottom: '10px', display: 'block' }}>Impôts du Véhicule: <span style={{color: 'red'}}>*</span></label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="checkbox"
                name="impot2026"
                checked={vehicleForm.impot2026}
                onChange={(e) => setVehicleForm(prev => ({ ...prev, impot2026: e.target.checked }))}
                required
              />
              Impôt 2026
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="checkbox"
                name="impot2027"
                checked={vehicleForm.impot2027}
                onChange={(e) => setVehicleForm(prev => ({ ...prev, impot2027: e.target.checked }))}
                required
              />
              Impôt 2027
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="checkbox"
                name="impot2028"
                checked={vehicleForm.impot2028}
                onChange={(e) => setVehicleForm(prev => ({ ...prev, impot2028: e.target.checked }))}
                required
              />
              Impôt 2028
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="checkbox"
                name="impot2029"
                checked={vehicleForm.impot2029}
                onChange={(e) => setVehicleForm(prev => ({ ...prev, impot2029: e.target.checked }))}
                required
              />
              Impôt 2029
            </label>
          </div>
        </div>

        {/* Clés et Kilométrage - REQUIRED */}
        <div>
          <label>Nombre de Clés de Sécurité: <span style={{color: 'red'}}>*</span></label>
          <input
            type="number"
            name="nombreCles"
            value={vehicleForm.nombreCles}
            onChange={handleVehicleChange}
            min="0"
            max="5"
            required
          />
        </div>

        <div>
          <label>Kilométrage Départ: <span style={{color: 'red'}}>*</span></label>
          <input
            type="number"
            name="kmDepart"
            value={vehicleForm.kmDepart}
            onChange={handleVehicleChange}
            min="0"
            placeholder="KM au départ"
            required
          />
        </div>

        <div>
          <label>Kilométrage Retour: <span style={{color: 'red'}}>*</span></label>
          <input
            type="number"
            name="kmRetour"
            value={vehicleForm.kmRetour}
            onChange={handleVehicleChange}
            min="0"
            placeholder="KM au retour"
            required
          />
        </div>

        {/* Assurance et Vidange - REQUIRED */}
        <div>
          <label>Date Début Assurance: <span style={{color: 'red'}}>*</span></label>
          <input
            type="date"
            name="assuranceStartDate"
            value={vehicleForm.assuranceStartDate}
            onChange={handleVehicleChange}
            required
          />
        </div>

        <div>
          <label>Date Fin Assurance: <span style={{color: 'red'}}>*</span></label>
          <input
            type="date"
            name="assuranceEndDate"
            value={vehicleForm.assuranceEndDate}
            onChange={handleVehicleChange}
            required
          />
        </div>

        <div>
          <label>Intervalle Vidange: <span style={{color: 'red'}}>*</span></label>
          <select
            name="vidangeInterval"
            value={vehicleForm.vidangeInterval}
            onChange={handleVehicleChange}
            required
          >
            <option value="">Sélectionnez</option>
            <option value="8000">8000 KM</option>
            <option value="10000">10000 KM</option>
            <option value="12000">12000 KM</option>
          </select>
        </div>

        {/* Image du véhicule - REQUIRED seulement pour l'ajout */}
        <div style={{ gridColumn: '1 / -1' }}>
          <label>
            Image du Véhicule: 
            {!isEditing && <span style={{color: 'red'}}> *</span>}
            {isEditing && <span style={{color: '#666', fontSize: '12px'}}> (Laissez vide pour garder l'image actuelle)</span>}
          </label>
          <input
            type="file"
            name="image"
            onChange={handleVehicleChange}
            accept="image/jpeg, image/jpg, image/png, image/gif"
            required={!isEditing}
          />
          <small style={{ color: '#666', fontSize: '12px' }}>
            Formats acceptés: JPEG, JPG, PNG, GIF
          </small>
          {errors.image && <span style={{ color: 'red', fontSize: '12px', display: 'block' }}>{errors.image}</span>}
          
          {imagePreview && (
            <div style={{ marginTop: '10px' }}>
              <img
                src={imagePreview}
                alt="Aperçu"
                style={{
                  maxWidth: '400px',
                  maxHeight: '300px',
                  borderRadius: '8px'
                }}
              />
            </div>
          )}
          
          {isEditing && vehicleForm.existingImage && !imagePreview && (
            <div style={{ marginTop: '10px' }}>
              <p style={{ fontSize: '12px', color: '#666', margin: '4px 0' }}>Image actuelle:</p>
              <img
                src={vehicleForm.existingImage}
                alt="Actuel"
                style={{
                  maxWidth: '200px',
                  maxHeight: '150px',
                  borderRadius: '8px'
                }}
              />
            </div>
          )}
        </div>

        {/* Sélection des parties endommagées - REQUIRED */}
        <div style={{ gridColumn: '1 / -1', border: '1px solid #ddd', padding: '15px', borderRadius: '8px' }}>
          <label style={{ fontWeight: 'bold', marginBottom: '15px', display: 'block' }}>
            🚨 Parties Endommagées du Véhicule: <span style={{color: 'red'}}>*</span>
            {selectedDamagesCount > 0 && (
              <span style={{ color: 'red', marginLeft: '10px' }}>
                ({selectedDamagesCount} partie(s) endommagée(s))
              </span>
            )}
          </label>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', 
            gap: '10px',
            maxHeight: '300px',
            overflowY: 'auto',
            padding: '10px',
            border: '1px solid #eee',
            borderRadius: '4px'
          }}>
            {carParts.map((part) => (
              <div
                key={part.id}
                onClick={() => handleCarPartClick(part.id)}
                style={{
                  padding: '10px',
                  border: `2px solid ${part.selected ? 'red' : '#ddd'}`,
                  borderRadius: '4px',
                  backgroundColor: part.selected ? '#fff0f0' : '#f9f9f9',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  textAlign: 'center'
                }}
                onMouseEnter={(e) => {
                  if (!part.selected) {
                    e.currentTarget.style.backgroundColor = '#f0f0f0';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!part.selected) {
                    e.currentTarget.style.backgroundColor = '#f9f9f9';
                  }
                }}
              >
                <span style={{ 
                  color: part.selected ? 'red' : '#333',
                  fontWeight: part.selected ? 'bold' : 'normal'
                }}>
                  {part.name}
                </span>
                {part.selected && (
                  <span style={{ color: 'red', marginLeft: '5px' }}>●</span>
                )}
              </div>
            ))}
          </div>
          
          {selectedDamagesCount > 0 && (
            <div style={{ marginTop: '15px', padding: '10px', backgroundColor: '#fff0f0', borderRadius: '4px' }}>
              <p style={{ margin: 0, fontWeight: 'bold', color: 'red' }}>Parties endommagées sélectionnées:</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginTop: '5px' }}>
                {carParts
                  .filter(part => part.selected)
                  .map(part => (
                    <span
                      key={part.id}
                      style={{
                        padding: '2px 8px',
                        backgroundColor: 'red',
                        color: 'white',
                        borderRadius: '12px',
                        fontSize: '12px'
                      }}
                    >
                      {part.name}
                    </span>
                  ))
                }
              </div>
            </div>
          )}
        </div>

        {/* Description et Remarques - REQUIRED */}
        <div style={{ gridColumn: '1 / -1' }}>
          <label>Description: <span style={{color: 'red'}}>*</span></label>
          <textarea
            name="description"
            value={vehicleForm.description}
            onChange={handleVehicleChange}
            rows="3"
            placeholder="Description du véhicule"
            required
          />
          {errors.description && <span style={{ color: 'red', fontSize: '12px' }}>{errors.description}</span>}
        </div>

        <div style={{ gridColumn: '1 / -1' }}>
          <label>Remarques: <span style={{color: 'red'}}>*</span></label>
          <textarea
            name="remarques"
            value={vehicleForm.remarques}
            onChange={handleVehicleChange}
            rows="2"
            placeholder="Remarques supplémentaires"
            required
          />
          {errors.remarques && <span style={{ color: 'red', fontSize: '12px' }}>{errors.remarques}</span>}
        </div>
      </div>

      <div style={{ 
        padding: '15px', 
        backgroundColor: '#fff0f0', 
        borderRadius: '8px', 
        marginBottom: '20px',
        border: '1px solid #ffcccc'
      }}>
        <p style={{ margin: 0, fontSize: '14px', color: '#cc0000', textAlign: 'center' }}>
          <strong>⚠️ Attention:</strong> Tous les champs sont obligatoires et doivent être remplis.
        </p>
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
          {loading ? 'En cours...' : (isEditing ? '💾 Mettre à jour' : '🚗 Ajouter le Véhicule')}
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

export default VehicleForm;
