// components/VehiclesManagement.jsx
import React, { useState } from 'react';
import api from '../../../utils/api';
import VehicleForm from './forms/VehicleForm';
import VehiclesList from './lists/VehiclesList';

const VehiclesManagement = ({ user, vehicles, setVehicles, setMessage, loadVehicles }) => {
  const [vehicleForm, setVehicleForm] = useState({
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

  const [imagePreview, setImagePreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);

  // Définir isEditing basé sur editingVehicle
  const isEditing = !!editingVehicle;

  const handleVehicleChange = (e) => {
    const { name, value, files, type, checked } = e.target;

    // Handle checkboxes
    if (type === 'checkbox') {
      setVehicleForm(prevData => ({
        ...prevData,
        [name]: checked
      }));
      return;
    }

    // Validate input to ensure it contains a maximum of 10 words (for text fields)
    if (!files) {
      const wordCount = value.trim().split(/\s+/).length;
      if (wordCount > 10 && (name === 'name' || name === 'type' || name === 'description' || name === 'remarques')) {
        setErrors(prevErrors => ({
          ...prevErrors,
          [name]: 'Ce champ ne doit pas dépasser 10 mots.'
        }));
        return;
      } else {
        setErrors(prevErrors => ({
          ...prevErrors,
          [name]: ''
        }));
      }
    }

    if (files) {
      const file = files[0];
      if (file) {
        // Check file type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
        if (!allowedTypes.includes(file.type)) {
          setErrors(prevErrors => ({
            ...prevErrors,
            image: 'Format de fichier non supporté. Utilisez JPEG, JPG, PNG ou GIF.'
          }));
          setImagePreview(null);
          return;
        } else {
          setErrors(prevErrors => ({
            ...prevErrors,
            image: ''
          }));
        }

        setVehicleForm(prevData => ({ ...prevData, [name]: file }));
        const reader = new FileReader();
        reader.onloadend = () => setImagePreview(reader.result);
        reader.readAsDataURL(file);
      }
    } else {
      setVehicleForm(prevData => ({
        ...prevData,
        [name]: value
      }));
    }
  };

  const addVehicle = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Check for errors before submitting
    const hasErrors = Object.values(errors).some(error => error !== '');
    if (hasErrors) {
      setMessage('❌ Veuillez corriger les erreurs dans le formulaire.');
      setLoading(false);
      return;
    }

    // Basic validation for required fields
    const requiredFields = [
      'name', 'type', 'boiteVitesse', 'pricePerDay', 'carburant', 
      'niveauReservoir', 'nombreCles', 'kmDepart', 'kmRetour',
      'assuranceStartDate', 'assuranceEndDate', 'vidangeInterval',
      'description', 'remarques'
    ];

    const missingFields = requiredFields.filter(field => !vehicleForm[field]);
    if (missingFields.length > 0 || (!vehicleForm.image && !isEditing)) {
      setMessage('❌ Veuillez remplir tous les champs obligatoires.');
      setLoading(false);
      return;
    }

    try {
      const formData = new FormData();

      // Append all form data
      Object.keys(vehicleForm).forEach(key => {
        if (vehicleForm[key] !== null && vehicleForm[key] !== '') {
          if (key === 'dommages' && Array.isArray(vehicleForm[key])) {
            // Handle damages array
            vehicleForm[key].forEach((damage, index) => {
              formData.append(`dommages[${index}]`, damage);
            });
          } else if (typeof vehicleForm[key] === 'boolean') {
            // Handle boolean fields
            formData.append(key, vehicleForm[key].toString());
          } else {
            formData.append(key, vehicleForm[key]);
          }
        }
      });

      // Add partner information
      formData.append('partnerId', user.id);
      formData.append('partnerName', user.name);
      if (user.logoEntreprise) {
        formData.append('partnerLogo', user.logoEntreprise);
      }

      const res = await api.post('/vehicles', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      console.log('✅ Véhicule ajouté:', res.data);

      // Reset form
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
      setShowForm(false);
      setErrors({});

      // Reload vehicles list
      await loadVehicles();

      setMessage('✅ Véhicule ajouté avec succès!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error('❌ Erreur ajout véhicule:', err);
      console.error('Détails erreur:', err.response?.data);
      setMessage('❌ Erreur lors de l\'ajout du véhicule: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const updateVehicle = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Check for errors before submitting
    const hasErrors = Object.values(errors).some(error => error !== '');
    if (hasErrors) {
      setMessage('❌ Veuillez corriger les erreurs dans le formulaire.');
      setLoading(false);
      return;
    }

    // Basic validation for required fields
    const requiredFields = [
      'name', 'type', 'boiteVitesse', 'pricePerDay', 'carburant', 
      'niveauReservoir', 'nombreCles', 'kmDepart', 'kmRetour',
      'assuranceStartDate', 'assuranceEndDate', 'vidangeInterval',
      'description', 'remarques'
    ];

    const missingFields = requiredFields.filter(field => !vehicleForm[field]);
    if (missingFields.length > 0) {
      setMessage('❌ Veuillez remplir tous les champs obligatoires.');
      setLoading(false);
      return;
    }

    try {
      const formData = new FormData();

      // Append all form data
      Object.keys(vehicleForm).forEach(key => {
        if (vehicleForm[key] !== null && vehicleForm[key] !== '') {
          if (key === 'dommages' && Array.isArray(vehicleForm[key])) {
            // Handle damages array
            vehicleForm[key].forEach((damage, index) => {
              formData.append(`dommages[${index}]`, damage);
            });
          } else if (typeof vehicleForm[key] === 'boolean') {
            // Handle boolean fields
            formData.append(key, vehicleForm[key].toString());
          } else {
            formData.append(key, vehicleForm[key]);
          }
        }
      });

      const res = await api.put(`/vehicles/${editingVehicle._id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      console.log('✅ Véhicule modifié:', res.data);

      // Reset form and editing state
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
      setShowForm(false);
      setEditingVehicle(null);
      setErrors({});

      // Reload vehicles list
      await loadVehicles();

      setMessage('✅ Véhicule modifié avec succès!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error('❌ Erreur modification véhicule:', err);
      console.error('Détails erreur:', err.response?.data);
      setMessage('❌ Erreur lors de la modification du véhicule: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const deleteVehicle = async (vehicleId) => {
    try {
      await api.delete(`/vehicles/${vehicleId}`);

      // Update local state immediately
      setVehicles(vehicles.filter(vehicle => vehicle._id !== vehicleId));

      setMessage('✅ Véhicule supprimé avec succès!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error('❌ Erreur suppression véhicule:', err);
      setMessage('❌ Erreur lors de la suppression du véhicule: ' + (err.response?.data?.message || err.message));
    }
  };

  const toggleVehicleAvailability = async (vehicleId, available) => {
    try {
      const res = await api.patch(`/vehicles/${vehicleId}`, { available });

      // Update local state immediately
      setVehicles(vehicles.map(vehicle =>
        vehicle._id === vehicleId ? { ...vehicle, available } : vehicle
      ));

      setMessage(`✅ Véhicule ${available ? 'activé' : 'désactivé'} avec succès!`);
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error('❌ Erreur changement statut véhicule:', err);
      setMessage('❌ Erreur lors du changement de statut: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleEdit = (vehicle) => {
    setEditingVehicle(vehicle);
    setVehicleForm({
      name: vehicle.name || '',
      type: vehicle.type || '',
      boiteVitesse: vehicle.boiteVitesse || '',
      description: vehicle.description || '',
      image: null,
      existingImage: vehicle.image,
      pricePerDay: vehicle.pricePerDay || '',
      carburant: vehicle.carburant || '',
      niveauReservoir: vehicle.niveauReservoir || '',
      gps: vehicle.gps || false,
      mp3: vehicle.mp3 || false,
      cd: vehicle.cd || false,
      radio: vehicle.radio || false,
      nombreCles: vehicle.nombreCles || '',
      kmDepart: vehicle.kmDepart || '',
      kmRetour: vehicle.kmRetour || '',
      impot2026: vehicle.impot2026 || false,
      impot2027: vehicle.impot2027 || false,
      impot2028: vehicle.impot2028 || false,
      impot2029: vehicle.impot2029 || false,
      assuranceStartDate: vehicle.assuranceStartDate ? vehicle.assuranceStartDate.split('T')[0] : '',
      assuranceEndDate: vehicle.assuranceEndDate ? vehicle.assuranceEndDate.split('T')[0] : '',
      vidangeInterval: vehicle.vidangeInterval || '',
      remarques: vehicle.remarques || '',
      dommages: vehicle.dommages || []
    });
    setImagePreview(null);
    setShowForm(true);
    setErrors({});
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingVehicle(null);
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
    setErrors({});
  };

  // If not showing form, display the add vehicle button
  if (!showForm) {
    return (
      <div>
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <button
            onClick={() => setShowForm(true)}
            className="add-vehicle-btn"
            style={{
              padding: '12px 24px',
              backgroundColor: '#36c275',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold',
              boxShadow: '0 2px 8px rgba(54, 194, 117, 0.3)',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 4px 12px rgba(54, 194, 117, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 2px 8px rgba(54, 194, 117, 0.3)';
            }}
          >
            + Ajouter un Véhicule
          </button>
        </div>
        <VehiclesList
          vehicles={vehicles}
          onEdit={handleEdit}
          onDelete={deleteVehicle}
          onToggleAvailability={toggleVehicleAvailability}
        />
      </div>
    );
  }

  return (
    <div>
      <VehicleForm
        vehicleForm={vehicleForm}
        imagePreview={imagePreview}
        errors={errors}
        loading={loading}
        isEditing={isEditing}
        handleVehicleChange={handleVehicleChange}
        addVehicle={addVehicle}
        updateVehicle={updateVehicle}
        setShowForm={setShowForm}
        setVehicleForm={setVehicleForm}
        setImagePreview={setImagePreview}
        setErrors={setErrors}
      />
      <VehiclesList
        vehicles={vehicles}
        onEdit={handleEdit}
        onDelete={deleteVehicle}
        onToggleAvailability={toggleVehicleAvailability}
      />
    </div>
  );
};

export default VehiclesManagement;
