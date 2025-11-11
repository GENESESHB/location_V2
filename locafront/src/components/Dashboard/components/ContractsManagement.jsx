// components/ContractsManagement.jsx
import React, { useState } from 'react';
import api from '../../../utils/api';
import ContractForm from './forms/ContractForm';
import ContractsList from './lists/ContractsList';

const ContractsManagement = ({ user, vehicles, contracts, setContracts, setMessage, loadContracts }) => {
  const [contractForm, setContractForm] = useState({
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
    prixParJour: '',
    prixTotal: 0
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingContract, setEditingContract] = useState(null);

  const handleContractChange = (e) => {
    const { name, value } = e.target;
    setContractForm({ ...contractForm, [name]: value });
    setErrors({ ...errors, [name]: '' });
  };

  const checkBlacklist = async (cin, passport) => {
    try {
      const response = await api.get('/blacklist/check', {
        params: { cin, passport }
      });
      return response.data.isBlacklisted;
    } catch (error) {
      console.error('Error checking blacklist:', error);
      return false;
    }
  };

  const createContract = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validation
    if (!contractForm.clientLastName || !contractForm.clientFirstName || !contractForm.clientBirthDate ||
        !contractForm.clientPhone || !contractForm.clientAddress || !contractForm.clientLicenseNumber ||
        !contractForm.clientLicenseIssueDate || !contractForm.vehicleId || !contractForm.startDateTime ||
        !contractForm.endDateTime || !contractForm.startLocation || !contractForm.endLocation) {
      setMessage('❌ Veuillez remplir tous les champs obligatoires.');
      setLoading(false);
      return;
    }

    try {
      // Check blacklist using CIN or passport
      const isBlacklisted = await checkBlacklist(contractForm.clientCIN, contractForm.clientPassport);
      if (isBlacklisted) {
        setMessage('❌ Ce client est dans la liste noire! Contrat non autorisé.');
        setLoading(false);
        return;
      }

      // Get selected vehicle details from database
      const selectedVehicle = vehicles.find(v => v._id === contractForm.vehicleId);
      if (!selectedVehicle) {
        setMessage('❌ Véhicule non trouvé.');
        setLoading(false);
        return;
      }

      // Use custom price if provided, otherwise use vehicle's price
      const prixParJour = contractForm.prixParJour || selectedVehicle.pricePerDay;

      // Calculate rental days for total price
      const start = new Date(contractForm.startDateTime);
      const end = new Date(contractForm.endDateTime);
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const rentalDays = diffDays === 0 ? 1 : diffDays;
      const prixTotal = rentalDays * prixParJour;

      // Create contract data with ALL vehicle details and COMPLETE user information
      const contractData = {
        // 1. COMPLETE User/Partner information
        partnerInfo: {
          partnerId: user._id || user.id,
          partnerName: user.entreprise || user.name,
          partnerEmail: user.email,
          partnerPhone: user.number || user.telephone,
          partnerLogo: user.logoEntreprise,
          partnerCountry: user.country,
          partnerCity: user.city,
          partnerStatus: user.status,
          partnerRole: user.role,
          partnerCreatedAt: user.createdAt,
          partnerUpdatedAt: user.updatedAt
        },

        // 2. Client/Locataire information
        clientInfo: {
          lastName: contractForm.clientLastName,
          firstName: contractForm.clientFirstName,
          birthDate: contractForm.clientBirthDate,
          phone: contractForm.clientPhone,
          address: contractForm.clientAddress,
          passport: contractForm.clientPassport,
          cin: contractForm.clientCIN,
          licenseNumber: contractForm.clientLicenseNumber,
          licenseIssueDate: contractForm.clientLicenseIssueDate
        },

        // Second driver information
        secondDriverInfo: {
          lastName: contractForm.secondDriverLastName,
          firstName: contractForm.secondDriverFirstName,
          licenseNumber: contractForm.secondDriverLicenseNumber,
          licenseIssueDate: contractForm.secondDriverLicenseIssueDate
        },

        // 3. Complete vehicle information
        vehicleInfo: {
          vehicleId: selectedVehicle._id,
          name: selectedVehicle.name,
          type: selectedVehicle.type,
          boiteVitesse: selectedVehicle.boiteVitesse,
          description: selectedVehicle.description,
          image: selectedVehicle.image,
          pricePerDay: selectedVehicle.pricePerDay,
          carburant: selectedVehicle.carburant,
          niveauReservoir: selectedVehicle.niveauReservoir,
          radio: selectedVehicle.radio,
          gps: selectedVehicle.gps,
          mp3: selectedVehicle.mp3,
          cd: selectedVehicle.cd,
          nombreCles: selectedVehicle.nombreCles,
          kmDepart: selectedVehicle.kmDepart,
          kmRetour: selectedVehicle.kmRetour,
          impot2026: selectedVehicle.impot2026,
          impot2027: selectedVehicle.impot2027,
          impot2028: selectedVehicle.impot2028,
          impot2029: selectedVehicle.impot2029,
          assuranceStartDate: selectedVehicle.assuranceStartDate,
          assuranceEndDate: selectedVehicle.assuranceEndDate,
          vidangeInterval: selectedVehicle.vidangeInterval,
          remarques: selectedVehicle.remarques,
          dommages: selectedVehicle.dommages,
          available: selectedVehicle.available,
          createdAt: selectedVehicle.createdAt,
          updatedAt: selectedVehicle.updatedAt
        },

        // Rental information
        rentalInfo: {
          startDateTime: contractForm.startDateTime,
          endDateTime: contractForm.endDateTime,
          startLocation: contractForm.startLocation,
          endLocation: contractForm.endLocation,
          prixParJour: prixParJour,
          prixTotal: prixTotal,
          rentalDays: rentalDays
        },

        // Contract metadata
        contractMetadata: {
          createdBy: user._id || user.id,
          createdAt: new Date().toISOString(),
          status: 'pending'
        }
      };

      console.log('📤 Données complètes du contrat envoyées:', contractData);
      console.log('👤 COMPLETE Informations utilisateur:', user);
      console.log('🚗 Véhicule sélectionné:', selectedVehicle);

      // Send complete contract data to server
      const res = await api.post('/contracts', contractData);

      console.log('✅ Réponse du serveur:', res.data);

      // Reset form
      setContractForm({
        clientLastName: '',
        clientFirstName: '',
        clientBirthDate: '',
        clientPhone: '',
        clientAddress: '',
        clientPassport: '',
        clientCIN: '',
        clientLicenseNumber: '',
        clientLicenseIssueDate: '',
        secondDriverLastName: '',
        secondDriverFirstName: '',
        secondDriverLicenseNumber: '',
        secondDriverLicenseIssueDate: '',
        vehicleId: '',
        startDateTime: '',
        endDateTime: '',
        startLocation: '',
        endLocation: '',
        prixParJour: '',
        prixTotal: 0
      });
      setShowForm(false);
      setErrors({});

      // Reload contracts
      await loadContracts();

      setMessage('✅ Contrat créé avec succès! Toutes les informations ont été sauvegardées.');
      setTimeout(() => setMessage(''), 4000);
    } catch (err) {
      console.error('❌ Erreur création contrat:', err);
      console.error('Détails erreur:', err.response?.data);

      // More detailed error information
      if (err.response?.data?.errors) {
        console.error('Erreurs de validation:', err.response.data.errors);
        const validationErrors = err.response.data.errors;
        if (validationErrors.partnerName) {
          setMessage(`❌ Erreur partenaire: ${validationErrors.partnerName.message}`);
        } else {
          setMessage('❌ Erreur de validation des données');
        }
      } else {
        setMessage('❌ Erreur lors de la création du contrat: ' + (err.response?.data?.message || err.message));
      }
    } finally {
      setLoading(false);
    }
  };

  const updateContract = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Get selected vehicle details
      const selectedVehicle = vehicles.find(v => v._id === contractForm.vehicleId);
      if (!selectedVehicle) {
        setMessage('❌ Véhicule non trouvé.');
        setLoading(false);
        return;
      }

      // Use custom price if provided, otherwise use vehicle's price
      const prixParJour = contractForm.prixParJour || selectedVehicle.pricePerDay;

      // Calculate rental days for total price
      const start = new Date(contractForm.startDateTime);
      const end = new Date(contractForm.endDateTime);
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const rentalDays = diffDays === 0 ? 1 : diffDays;
      const prixTotal = rentalDays * prixParJour;

      // Create complete contract data for update with ALL user information
      const contractData = {
        // 1. COMPLETE User/Partner information
        partnerInfo: {
          partnerId: user._id || user.id,
          partnerName: user.entreprise || user.name,
          partnerEmail: user.email,
          partnerPhone: user.number || user.telephone,
          partnerLogo: user.logoEntreprise,
          partnerCountry: user.country,
          partnerCity: user.city,
          partnerStatus: user.status,
          partnerRole: user.role,
          partnerCreatedAt: user.createdAt,
          partnerUpdatedAt: user.updatedAt
        },

        // 2. Client information
        clientInfo: {
          lastName: contractForm.clientLastName,
          firstName: contractForm.clientFirstName,
          birthDate: contractForm.clientBirthDate,
          phone: contractForm.clientPhone,
          address: contractForm.clientAddress,
          passport: contractForm.clientPassport,
          cin: contractForm.clientCIN,
          licenseNumber: contractForm.clientLicenseNumber,
          licenseIssueDate: contractForm.clientLicenseIssueDate
        },

        // Second driver information
        secondDriverInfo: {
          lastName: contractForm.secondDriverLastName,
          firstName: contractForm.secondDriverFirstName,
          licenseNumber: contractForm.secondDriverLicenseNumber,
          licenseIssueDate: contractForm.secondDriverLicenseIssueDate
        },

        // 3. Complete vehicle information
        vehicleInfo: {
          vehicleId: selectedVehicle._id,
          name: selectedVehicle.name,
          type: selectedVehicle.type,
          boiteVitesse: selectedVehicle.boiteVitesse,
          description: selectedVehicle.description,
          image: selectedVehicle.image,
          pricePerDay: selectedVehicle.pricePerDay,
          carburant: selectedVehicle.carburant,
          niveauReservoir: selectedVehicle.niveauReservoir,
          radio: selectedVehicle.radio,
          gps: selectedVehicle.gps,
          mp3: selectedVehicle.mp3,
          cd: selectedVehicle.cd,
          nombreCles: selectedVehicle.nombreCles,
          kmDepart: selectedVehicle.kmDepart,
          kmRetour: selectedVehicle.kmRetour,
          impot2026: selectedVehicle.impot2026,
          impot2027: selectedVehicle.impot2027,
          impot2028: selectedVehicle.impot2028,
          impot2029: selectedVehicle.impot2029,
          assuranceStartDate: selectedVehicle.assuranceStartDate,
          assuranceEndDate: selectedVehicle.assuranceEndDate,
          vidangeInterval: selectedVehicle.vidangeInterval,
          remarques: selectedVehicle.remarques,
          dommages: selectedVehicle.dommages,
          available: selectedVehicle.available
        },

        // Rental information
        rentalInfo: {
          startDateTime: contractForm.startDateTime,
          endDateTime: contractForm.endDateTime,
          startLocation: contractForm.startLocation,
          endLocation: contractForm.endLocation,
          prixParJour: prixParJour,
          prixTotal: prixTotal,
          rentalDays: rentalDays
        },

        // Status
        status: contractForm.status || 'pending'
      };

      console.log('📤 Mise à jour complète du contrat:', contractData);

      const res = await api.put(`/contracts/${editingContract._id}`, contractData);

      // Reset form
      setContractForm({
        clientLastName: '',
        clientFirstName: '',
        clientBirthDate: '',
        clientPhone: '',
        clientAddress: '',
        clientPassport: '',
        clientCIN: '',
        clientLicenseNumber: '',
        clientLicenseIssueDate: '',
        secondDriverLastName: '',
        secondDriverFirstName: '',
        secondDriverLicenseNumber: '',
        secondDriverLicenseIssueDate: '',
        vehicleId: '',
        startDateTime: '',
        endDateTime: '',
        startLocation: '',
        endLocation: '',
        prixParJour: '',
        prixTotal: 0
      });
      setShowForm(false);
      setEditingContract(null);
      setErrors({});

      // Reload contracts
      await loadContracts();

      setMessage('✅ Contrat modifié avec succès! Toutes les informations ont été mises à jour.');
      setTimeout(() => setMessage(''), 4000);
    } catch (err) {
      console.error('❌ Erreur modification contrat:', err);
      console.error('Détails erreur:', err.response?.data);
      setMessage('❌ Erreur lors de la modification du contrat: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const deleteContract = async (contractId) => {
    try {
      await api.delete(`/contracts/${contractId}`);

      // Update local state
      setContracts(contracts.filter(contract => contract._id !== contractId));

      setMessage('✅ Contrat supprimé avec succès!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error('❌ Erreur suppression contrat:', err);
      setMessage('❌ Erreur lors de la suppression du contrat: ' + (err.response?.data?.message || err.message));
    }
  };

  const updateContractStatus = async (contractId, status) => {
    try {
      await api.patch(`/contracts/${contractId}`, { status });

      // Update local state
      setContracts(contracts.map(contract =>
        contract._id === contractId ? { ...contract, status } : contract
      ));

      setMessage(`✅ Statut du contrat mis à jour: ${status}`);
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error('❌ Erreur changement statut contrat:', err);
      setMessage('❌ Erreur lors du changement de statut: ' + (err.response?.data?.message || err.message));
    }
  };

  const downloadContract = (contract) => {
    const contractWindow = window.open('', '_blank');
    const partnerName = user.entreprise || user.name;
    const partnerLogo = user.logoEntreprise || '';

    // Format dates for display
    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    // Use the complete vehicle information stored in the contract
    const vehicleInfo = contract.vehicleInfo ? contract.vehicleInfo : null;
    // Use the complete partner information stored in the contract
    const partnerInfo = contract.partnerInfo ? contract.partnerInfo : user;

    // Get vehicle image
    const vehicleImage = vehicleInfo?.image || '';

    contractWindow.document.write(`
      <html>
        <head>
          <title>Contrat de Location - ${contract.clientInfo.firstName} ${contract.clientInfo.lastName}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
            
            body { 
              font-family: 'Inter', Arial, sans-serif; 
              margin: 0;
              padding: 40px;
              line-height: 1.6;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: #333;
            }
            
            .contract-container {
              background: white;
              border-radius: 20px;
              box-shadow: 0 20px 60px rgba(0,0,0,0.1);
              padding: 50px;
              max-width: 1000px;
              margin: 0 auto;
              position: relative;
              overflow: hidden;
            }
            
            .contract-container::before {
              content: '';
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              height: 6px;
              background: linear-gradient(90deg, #36c275, #667eea, #764ba2);
            }
            
            .header { 
              text-align: center; 
              border-bottom: 3px solid #f8f9fa;
              padding-bottom: 30px; 
              margin-bottom: 40px;
              position: relative;
            }
            
            .header-content {
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 20px;
              margin-bottom: 20px;
            }
            
            .logo-container {
              width: 120px;
              height: 120px;
              border-radius: 20px;
              overflow: hidden;
              box-shadow: 0 10px 30px rgba(0,0,0,0.1);
              border: 3px solid #36c275;
            }
            
            .logo-container img {
              width: 100%;
              height: 100%;
              object-fit: cover;
            }
            
            .company-info {
              text-align: left;
            }
            
            .header h1 { 
              color: #2c3e50;
              font-size: 32px;
              font-weight: 700;
              margin: 0 0 10px 0;
              text-transform: uppercase;
              letter-spacing: 1px;
            }
            
            .header h2 { 
              color: #36c275;
              font-size: 24px;
              font-weight: 600;
              margin: 0 0 20px 0;
            }
            
            .contract-number {
              background: linear-gradient(135deg, #36c275, #2ecc71);
              color: white;
              padding: 12px 24px;
              border-radius: 50px;
              display: inline-block;
              font-weight: 600;
              box-shadow: 0 5px 15px rgba(54, 194, 117, 0.3);
            }
            
            .section { 
              margin: 35px 0; 
              background: #f8f9fa;
              padding: 25px;
              border-radius: 15px;
              border-left: 5px solid #36c275;
              transition: all 0.3s ease;
            }
            
            .section:hover {
              transform: translateY(-2px);
              box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            }
            
            .section h3 {
              color: #2c3e50;
              font-size: 20px;
              font-weight: 600;
              margin: 0 0 20px 0;
              display: flex;
              align-items: center;
              gap: 10px;
            }
            
            .section h3::before {
              content: '📋';
              font-size: 18px;
            }
            
            .signature { 
              margin-top: 80px; 
              padding-top: 30px;
              border-top: 2px solid #e9ecef;
            }
            
            .footer { 
              margin-top: 50px; 
              font-size: 12px; 
              color: #6c757d; 
              text-align: center;
              padding: 20px;
              background: #f8f9fa;
              border-radius: 10px;
            }
            
            .highlight { 
              background: linear-gradient(135deg, #ffffff, #f8f9fa);
              padding: 20px;
              border-radius: 12px;
              border: 2px solid #e9ecef;
              box-shadow: 0 5px 15px rgba(0,0,0,0.05);
            }
            
            table { 
              width: 100%; 
              border-collapse: separate;
              border-spacing: 0;
              margin: 20px 0;
              border-radius: 12px;
              overflow: hidden;
              box-shadow: 0 5px 15px rgba(0,0,0,0.05);
            }
            
            table, th, td { 
              border: 1px solid #dee2e6; 
            }
            
            th, td { 
              padding: 16px; 
              text-align: left; 
            }
            
            th { 
              background: linear-gradient(135deg, #36c275, #2ecc71);
              color: white;
              font-weight: 600;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              font-size: 14px;
            }
            
            tr:nth-child(even) {
              background-color: #f8f9fa;
            }
            
            tr:hover {
              background-color: #e9ecef;
              transform: scale(1.01);
              transition: all 0.2s ease;
            }
            
            .subsection { 
              margin-left: 25px; 
              margin-top: 20px; 
            }
            
            .vehicle-details { 
              display: grid; 
              grid-template-columns: 1fr 1fr; 
              gap: 15px; 
              margin-top: 15px; 
            }
            
            .info-grid { 
              display: grid; 
              grid-template-columns: 1fr 1fr; 
              gap: 25px; 
              margin: 20px 0; 
            }
            
            .info-item {
              background: white;
              padding: 15px;
              border-radius: 10px;
              border-left: 4px solid #36c275;
              box-shadow: 0 3px 10px rgba(0,0,0,0.05);
            }
            
            .info-item strong {
              color: #2c3e50;
              display: block;
              margin-bottom: 5px;
              font-weight: 600;
            }
            
            .vehicle-image-container {
              text-align: center;
              margin: 20px 0;
            }
            
            .vehicle-image {
              max-width: 300px;
              max-height: 200px;
              border-radius: 15px;
              box-shadow: 0 10px 30px rgba(0,0,0,0.2);
              border: 3px solid #36c275;
            }
            
            .damages-list {
              display: flex;
              flex-wrap: wrap;
              gap: 10px;
              margin-top: 10px;
            }
            
            .damage-tag {
              background: #ffeaa7;
              color: #2d3436;
              padding: 8px 16px;
              border-radius: 20px;
              font-size: 12px;
              font-weight: 500;
              box-shadow: 0 2px 5px rgba(0,0,0,0.1);
            }
            
            .equipment-tag {
              background: #74b9ff;
              color: white;
              padding: 6px 12px;
              border-radius: 15px;
              font-size: 11px;
              font-weight: 500;
              margin-right: 5px;
            }
            
            .signature-box {
              border: 2px dashed #dee2e6;
              padding: 30px;
              border-radius: 10px;
              text-align: center;
              margin: 20px 0;
              background: #f8f9fa;
            }
            
            .status-badge {
              display: inline-block;
              padding: 8px 16px;
              border-radius: 20px;
              font-weight: 600;
              font-size: 12px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            
            .status-pending { background: #ffeaa7; color: #e17055; }
            .status-active { background: #55efc4; color: #00b894; }
            .status-completed { background: #74b9ff; color: #0984e3; }
            .status-cancelled { background: #fab1a0; color: #d63031; }
          </style>
        </head>
        <body>
          <div class="contract-container">
            <div class="header">
              <div class="header-content">
                ${partnerLogo ? `
                  <div class="logo-container">
                    <img src="${partnerLogo}" alt="Logo ${partnerName}" />
                  </div>
                ` : ''}
                <div class="company-info">
                  <h1>CONTRAT DE LOCATION DE VÉHICULE</h1>
                  <h2>${partnerName}</h2>
                </div>
              </div>
              <div class="contract-number">
                Contrat N°: ${contract._id}
              </div>
              <p style="margin-top: 15px; color: #6c757d;">
                Date de génération: ${new Date().toLocaleDateString('fr-FR', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>

            <div class="section">
              <h3>📝 INFORMATIONS DES PARTIES</h3>
              <table>
                <tr>
                  <th style="background: linear-gradient(135deg, #667eea, #764ba2);">LOUEUR (Partenaire)</th>
                  <th style="background: linear-gradient(135deg, #36c275, #2ecc71);">LOCATAIRE (Client)</th>
                </tr>
                <tr>
                  <td>
                    <div class="info-item">
                      <strong>🏢 Nom Entreprise:</strong> ${partnerInfo.partnerName || partnerName}
                    </div>
                    <div class="info-item">
                      <strong>🆔 ID Partenaire:</strong> ${partnerInfo.partnerId || user._id || user.id}
                    </div>
                    <div class="info-item">
                      <strong>📧 Email:</strong> ${partnerInfo.partnerEmail || user.email}
                    </div>
                    <div class="info-item">
                      <strong>📞 Téléphone:</strong> ${partnerInfo.partnerPhone || user.number || user.telephone || 'Non spécifié'}
                    </div>
                    <div class="info-item">
                      <strong>🌍 Pays:</strong> ${partnerInfo.partnerCountry || user.country || 'Non spécifié'}
                    </div>
                    <div class="info-item">
                      <strong>🏙️ Ville:</strong> ${partnerInfo.partnerCity || user.city || 'Non spécifié'}
                    </div>
                  </td>
                  <td>
                    <div class="info-item">
                      <strong>👤 Nom:</strong> ${contract.clientInfo.lastName}
                    </div>
                    <div class="info-item">
                      <strong>👤 Prénom:</strong> ${contract.clientInfo.firstName}
                    </div>
                    <div class="info-item">
                      <strong>🎂 Date de naissance:</strong> ${contract.clientInfo.birthDate ? new Date(contract.clientInfo.birthDate).toLocaleDateString('fr-FR') : 'Non spécifiée'}
                    </div>
                    <div class="info-item">
                      <strong>📞 Téléphone:</strong> ${contract.clientInfo.phone}
                    </div>
                    <div class="info-item">
                      <strong>🏠 Adresse:</strong> ${contract.clientInfo.address}
                    </div>
                    <div class="info-item">
                      <strong>🛂 Passeport:</strong> ${contract.clientInfo.passport || 'Non spécifié'}
                    </div>
                    <div class="info-item">
                      <strong>🆔 CIN:</strong> ${contract.clientInfo.cin || 'Non spécifié'}
                    </div>
                    <div class="info-item">
                      <strong>🚗 Permis de conduire:</strong> ${contract.clientInfo.licenseNumber}
                    </div>
                    <div class="info-item">
                      <strong>📅 Délivré le:</strong> ${contract.clientInfo.licenseIssueDate ? new Date(contract.clientInfo.licenseIssueDate).toLocaleDateString('fr-FR') : 'Non spécifié'}
                    </div>
                  </td>
                </tr>
              </table>
            </div>

            ${contract.secondDriverInfo && (contract.secondDriverInfo.lastName || contract.secondDriverInfo.firstName) ? `
            <div class="section">
              <h3>👥 DEUXIÈME CONDUCTEUR</h3>
              <div class="highlight">
                <div class="info-grid">
                  <div class="info-item">
                    <strong>👤 Nom:</strong> ${contract.secondDriverInfo.lastName}
                  </div>
                  <div class="info-item">
                    <strong>👤 Prénom:</strong> ${contract.secondDriverInfo.firstName}
                  </div>
                  <div class="info-item">
                    <strong>🚗 Permis de conduire:</strong> ${contract.secondDriverInfo.licenseNumber || 'Non spécifié'}
                  </div>
                  <div class="info-item">
                    <strong>📅 Délivré le:</strong> ${contract.secondDriverInfo.licenseIssueDate ? new Date(contract.secondDriverInfo.licenseIssueDate).toLocaleDateString('fr-FR') : 'Non spécifié'}
                  </div>
                </div>
              </div>
            </div>
            ` : ''}

            <div class="section">
              <h3>🚗 VÉHICULE LOUÉ</h3>
              <div class="highlight">
                ${vehicleInfo ? `
                  ${vehicleImage ? `
                    <div class="vehicle-image-container">
                      <img src="${vehicleImage}" alt="${vehicleInfo.name}" class="vehicle-image" />
                    </div>
                  ` : ''}
                  
                  <div class="info-grid">
                    <div class="info-item">
                      <strong>🚘 Véhicule:</strong> ${vehicleInfo.name}
                    </div>
                    <div class="info-item">
                      <strong>📊 Type:</strong> ${vehicleInfo.type}
                    </div>
                    <div class="info-item">
                      <strong>⚙️ Boîte de vitesse:</strong> ${vehicleInfo.boiteVitesse}
                    </div>
                    <div class="info-item">
                      <strong>⛽ Carburant:</strong> ${vehicleInfo.carburant || 'Non spécifié'}
                    </div>
                    <div class="info-item">
                      <strong>📊 Niveau réservoir:</strong> ${vehicleInfo.niveauReservoir || 'Non spécifié'}
                    </div>
                    <div class="info-item">
                      <strong>🛣️ Kilométrage départ:</strong> ${vehicleInfo.kmDepart || 'Non spécifié'} km
                    </div>
                    <div class="info-item">
                      <strong>🛣️ Kilométrage retour:</strong> ${vehicleInfo.kmRetour || 'Non spécifié'} km
                    </div>
                    <div class="info-item">
                      <strong>🔑 Nombre de clés:</strong> ${vehicleInfo.nombreCles || 'Non spécifié'}
                    </div>
                  </div>
                  
                  <div style="margin-top: 20px;">
                    <div class="info-item">
                      <strong>🎛️ Équipements:</strong><br>
                      ${vehicleInfo.radio ? '<span class="equipment-tag">📻 Radio</span>' : ''}
                      ${vehicleInfo.gps ? '<span class="equipment-tag">🧭 GPS</span>' : ''}
                      ${vehicleInfo.mp3 ? '<span class="equipment-tag">🎵 MP3</span>' : ''}
                      ${vehicleInfo.cd ? '<span class="equipment-tag">💿 CD</span>' : ''}
                      ${!vehicleInfo.radio && !vehicleInfo.gps && !vehicleInfo.mp3 && !vehicleInfo.cd ? 'Aucun équipement spécifié' : ''}
                    </div>
                    
                    <div class="info-item">
                      <strong>💰 Prix par jour:</strong> ${contract.rentalInfo.prixParJour || vehicleInfo.pricePerDay} DH
                    </div>
                    
                    ${vehicleInfo.description ? `
                      <div class="info-item">
                        <strong>📝 Description:</strong> ${vehicleInfo.description}
                      </div>
                    ` : ''}
                    
                    ${vehicleInfo.remarques ? `
                      <div class="info-item">
                        <strong>💡 Remarques:</strong> ${vehicleInfo.remarques}
                      </div>
                    ` : ''}
                    
                    ${vehicleInfo.dommages && vehicleInfo.dommages.length > 0 ? `
                      <div class="info-item">
                        <strong>⚠️ Dommages existants:</strong>
                        <div class="damages-list">
                          ${vehicleInfo.dommages.map(damage => `
                            <span class="damage-tag">${damage}</span>
                          `).join('')}
                        </div>
                      </div>
                    ` : ''}
                    
                    ${vehicleInfo.assuranceStartDate && vehicleInfo.assuranceEndDate ? `
                      <div class="info-item">
                        <strong>🛡️ Assurance:</strong> 
                        Du ${new Date(vehicleInfo.assuranceStartDate).toLocaleDateString('fr-FR')} 
                        au ${new Date(vehicleInfo.assuranceEndDate).toLocaleDateString('fr-FR')}
                      </div>
                    ` : ''}
                  </div>
                ` : '<p>❌ Informations véhicule non disponibles</p>'}
              </div>
            </div>

            <div class="section">
              <h3>📅 DÉTAILS DE LA LOCATION</h3>
              <div class="highlight">
                <div class="info-grid">
                  <div class="info-item">
                    <strong>🛫 Date et heure de départ:</strong> ${formatDate(contract.rentalInfo.startDateTime)}
                  </div>
                  <div class="info-item">
                    <strong>🛬 Date et heure de retour:</strong> ${formatDate(contract.rentalInfo.endDateTime)}
                  </div>
                  <div class="info-item">
                    <strong>📍 Lieu de départ:</strong> ${contract.rentalInfo.startLocation}
                  </div>
                  <div class="info-item">
                    <strong>📍 Lieu de retour:</strong> ${contract.rentalInfo.endLocation}
                  </div>
                  <div class="info-item">
                    <strong>⏱️ Durée totale:</strong> ${contract.rentalInfo.rentalDays} jours
                  </div>
                  <div class="info-item">
                    <strong>💰 Prix par jour:</strong> ${contract.rentalInfo.prixParJour} DH
                  </div>
                  <div class="info-item" style="background: linear-gradient(135deg, #ffeaa7, #fdcb6e); border-left-color: #e17055;">
                    <strong>💵 Prix total:</strong> ${contract.rentalInfo.prixTotal} DH
                  </div>
                </div>
              </div>
            </div>

            <div class="section">
              <h3>📋 CONDITIONS GÉNÉRALES</h3>
              <div class="highlight">
                <ul style="margin: 0; padding-left: 20px;">
                  <li>📝 Le client s'engage à restituer le véhicule dans l'état où il l'a reçu</li>
                  <li>⚠️ Tout dommage sera à la charge du client</li>
                  <li>⛽ Le carburant est à la charge du client</li>
                  <li>⏰ Retard de restitution: majoration de 50% du prix journalier</li>
                  <li>🛢️ Le véhicule doit être rendu avec le plein de carburant</li>
                  <li>🚭 Interdiction de fumer dans le véhicule</li>
                  <li>🆔 Le client doit présenter son permis de conduire et sa pièce d'identité</li>
                  <li>💰 Caution: 5000 DH (remboursable après vérification du véhicule)</li>
                  <li>🛣️ Kilométrage illimité selon les conditions du contrat</li>
                  <li>🛡️ Assurance tous risques incluse</li>
                </ul>
              </div>
            </div>

            <div class="signature">
              <div class="signature-box">
                <p>Fait à <strong>${contract.rentalInfo.startLocation}</strong>, le ${new Date().toLocaleDateString('fr-FR', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric'
                })}</p>
              </div>
              
              <table width="100%">
                <tr>
                  <td width="50%" align="center">
                    <div class="signature-box">
                      <p style="font-weight: 600; margin-bottom: 10px;">SIGNATURE DU CLIENT</p>
                      <p style="color: #36c275; font-weight: 600;">${contract.clientInfo.firstName} ${contract.clientInfo.lastName}</p>
                      <p style="color: #6c757d; font-size: 14px;">CIN: ${contract.clientInfo.cin || 'Non spécifié'}</p>
                    </div>
                  </td>
                  <td width="50%" align="center">
                    <div class="signature-box">
                      <p style="font-weight: 600; margin-bottom: 10px;">SIGNATURE DU PARTENAIRE</p>
                      <p style="color: #667eea; font-weight: 600;">${partnerName}</p>
                      <p style="color: #6c757d; font-size: 14px;">Entreprise: ${partnerName}</p>
                    </div>
                  </td>
                </tr>
              </table>
            </div>

            <div class="footer">
              <p>📄 Contrat généré par <strong>WegoRent</strong> - ${partnerName} - ${new Date().toLocaleDateString('fr-FR')}</p>
              <p>📧 Pour toute réclamation, contactez: ${user.email}</p>
              <p style="margin-top: 10px; font-size: 10px; color: #adb5bd;">
                Ce document a une valeur contractuelle. Conservez-le précieusement.
              </p>
            </div>
          </div>
        </body>
      </html>
    `);
    contractWindow.document.close();
    contractWindow.print();
  };

  const handleEdit = (contract) => {
    setEditingContract(contract);
    setContractForm({
      // Client information
      clientLastName: contract.clientInfo?.lastName || '',
      clientFirstName: contract.clientInfo?.firstName || '',
      clientBirthDate: contract.clientInfo?.birthDate ? contract.clientInfo.birthDate.split('T')[0] : '',
      clientPhone: contract.clientInfo?.phone || '',
      clientAddress: contract.clientInfo?.address || '',
      clientPassport: contract.clientInfo?.passport || '',
      clientCIN: contract.clientInfo?.cin || '',
      clientLicenseNumber: contract.clientInfo?.licenseNumber || '',
      clientLicenseIssueDate: contract.clientInfo?.licenseIssueDate ? contract.clientInfo.licenseIssueDate.split('T')[0] : '',

      // Second driver information
      secondDriverLastName: contract.secondDriverInfo?.lastName || '',
      secondDriverFirstName: contract.secondDriverInfo?.firstName || '',
      secondDriverLicenseNumber: contract.secondDriverInfo?.licenseNumber || '',
      secondDriverLicenseIssueDate: contract.secondDriverInfo?.licenseIssueDate ? contract.secondDriverInfo.licenseIssueDate.split('T')[0] : '',

      // Rental information
      vehicleId: contract.vehicleInfo?.vehicleId || '',
      startDateTime: contract.rentalInfo?.startDateTime ? contract.rentalInfo.startDateTime.slice(0, 16) : '',
      endDateTime: contract.rentalInfo?.endDateTime ? contract.rentalInfo.endDateTime.slice(0, 16) : '',
      startLocation: contract.rentalInfo?.startLocation || '',
      endLocation: contract.rentalInfo?.endLocation || '',
      prixParJour: contract.rentalInfo?.prixParJour || '',
      prixTotal: contract.rentalInfo?.prixTotal || 0
    });
    setShowForm(true);
    setErrors({});
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingContract(null);
    setContractForm({
      clientLastName: '',
      clientFirstName: '',
      clientBirthDate: '',
      clientPhone: '',
      clientAddress: '',
      clientPassport: '',
      clientCIN: '',
      clientLicenseNumber: '',
      clientLicenseIssueDate: '',
      secondDriverLastName: '',
      secondDriverFirstName: '',
      secondDriverLicenseNumber: '',
      secondDriverLicenseIssueDate: '',
      vehicleId: '',
      startDateTime: '',
      endDateTime: '',
      startLocation: '',
      endLocation: '',
      prixParJour: '',
      prixTotal: 0
    });
    setErrors({});
  };

  // If not showing form, display the create contract button
  if (!showForm) {
    return (
      <div>
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <button
            onClick={() => setShowForm(true)}
            className="add-contract-btn"
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
            + Créer un Contrat
          </button>
        </div>
        <ContractsList
          contracts={contracts}
          vehicles={vehicles}
          onEdit={handleEdit}
          onDelete={deleteContract}
          onDownload={downloadContract}
          onUpdateStatus={updateContractStatus}
        />
      </div>
    );
  }

  return (
    <div>
      <ContractForm
        contractForm={contractForm}
        vehicles={vehicles}
        errors={errors}
        loading={loading}
        isEditing={!!editingContract}
        handleContractChange={handleContractChange}
        createContract={createContract}
        updateContract={updateContract}
        setShowForm={setShowForm}
        setContractForm={setContractForm}
        setErrors={setErrors}
      />
      <ContractsList
        contracts={contracts}
        vehicles={vehicles}
        onEdit={handleEdit}
        onDelete={deleteContract}
        onDownload={downloadContract}
        onUpdateStatus={updateContractStatus}
      />
    </div>
  );
};

export default ContractsManagement;
