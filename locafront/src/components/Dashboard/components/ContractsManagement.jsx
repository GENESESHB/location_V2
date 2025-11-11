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

      // Create contract data with all new fields
      const contractData = {
        // Client information
        clientLastName: contractForm.clientLastName,
        clientFirstName: contractForm.clientFirstName,
        clientBirthDate: contractForm.clientBirthDate,
        clientPhone: contractForm.clientPhone,
        clientAddress: contractForm.clientAddress,
        clientPassport: contractForm.clientPassport,
        clientCIN: contractForm.clientCIN,
        clientLicenseNumber: contractForm.clientLicenseNumber,
        clientLicenseIssueDate: contractForm.clientLicenseIssueDate,

        // Second driver information
        secondDriverLastName: contractForm.secondDriverLastName,
        secondDriverFirstName: contractForm.secondDriverFirstName,
        secondDriverLicenseNumber: contractForm.secondDriverLicenseNumber,
        secondDriverLicenseIssueDate: contractForm.secondDriverLicenseIssueDate,

        // Vehicle information - only send vehicleId, backend will inherit all vehicle info
        vehicleId: contractForm.vehicleId,

        // Rental information
        startDateTime: contractForm.startDateTime,
        endDateTime: contractForm.endDateTime,
        startLocation: contractForm.startLocation,
        endLocation: contractForm.endLocation,

        // Price information - backend will calculate total automatically
        prixParJour: prixParJour

        // Note: prixTotal is no longer sent - backend calculates it automatically
        // partnerId and partnerName are set by backend from user data
        // status is set by backend to 'pending' by default
      };

      console.log('📤 Données du contrat envoyées:', contractData);
      console.log('🚗 Véhicule sélectionné:', selectedVehicle);

      // Send contract data
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

      setMessage('✅ Contrat créé avec succès!');
      setTimeout(() => setMessage(''), 3000);
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

      // Create contract data with all new fields
      const contractData = {
        // Client information
        clientLastName: contractForm.clientLastName,
        clientFirstName: contractForm.clientFirstName,
        clientBirthDate: contractForm.clientBirthDate,
        clientPhone: contractForm.clientPhone,
        clientAddress: contractForm.clientAddress,
        clientPassport: contractForm.clientPassport,
        clientCIN: contractForm.clientCIN,
        clientLicenseNumber: contractForm.clientLicenseNumber,
        clientLicenseIssueDate: contractForm.clientLicenseIssueDate,

        // Second driver information
        secondDriverLastName: contractForm.secondDriverLastName,
        secondDriverFirstName: contractForm.secondDriverFirstName,
        secondDriverLicenseNumber: contractForm.secondDriverLicenseNumber,
        secondDriverLicenseIssueDate: contractForm.secondDriverLicenseIssueDate,

        // Vehicle information
        vehicleId: contractForm.vehicleId,

        // Rental information
        startDateTime: contractForm.startDateTime,
        endDateTime: contractForm.endDateTime,
        startLocation: contractForm.startLocation,
        endLocation: contractForm.endLocation,

        // Price information - backend will calculate total automatically
        prixParJour: prixParJour,

        // Status
        status: contractForm.status || 'pending'
      };

      console.log('📤 Mise à jour du contrat:', contractData);

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

      setMessage('✅ Contrat modifié avec succès!');
      setTimeout(() => setMessage(''), 3000);
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
    const partnerName = user.entreprise;

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

    // Use inherited vehicle information from contract
    const vehicleInfo = contract.vehicleName ? {
      name: contract.vehicleName,
      type: contract.vehicleType,
      boiteVitesse: contract.vehicleBoiteVitesse,
      description: contract.vehicleDescription || '',
      pricePerDay: contract.vehiclePricePerDay,
      marque: contract.vehicleMarque || '',
      modele: contract.vehicleModele || '',
      annee: contract.vehicleAnnee || '',
      couleur: contract.vehicleCouleur || '',
      carburant: contract.vehicleCarburant || '',
      plaqueImmatriculation: contract.vehiclePlaqueImmatriculation || ''
    } : null;

    contractWindow.document.write(`
      <html>
        <head>
          <title>Contrat de Location - ${contract.clientFirstName} ${contract.clientLastName}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
            .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
            .section { margin: 25px 0; }
            .signature { margin-top: 100px; }
            .footer { margin-top: 50px; font-size: 12px; color: #666; text-align: center; }
            .highlight { background-color: #f8f9fa; padding: 15px; border-radius: 8px; border-left: 4px solid #36c275; }
            table { width: 100%; border-collapse: collapse; margin: 10px 0; }
            table, th, td { border: 1px solid #ddd; }
            th, td { padding: 12px; text-align: left; }
            th { background-color: #f8f9fa; }
            .subsection { margin-left: 20px; margin-top: 15px; }
            .vehicle-details { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 10px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>CONTRAT DE LOCATION DE VÉHICULE</h1>
            <h2>${partnerName}</h2>
            <p>Contrat N°: ${contract._id}</p>
            <p>Date de génération: ${new Date().toLocaleDateString('fr-FR')}</p>
          </div>

          <div class="section">
            <h3>1. INFORMATIONS DES PARTIES</h3>
            <table>
              <tr>
                <th>LOUEUR (Partenaire)</th>
                <th>LOCATAIRE (Client)</th>
              </tr>
              <tr>
                <td>
                  <strong>Nom:</strong> ${partnerName}<br>
                  <strong>ID Partenaire:</strong> ${user.id}<br>
                  <strong>Email:</strong> ${user.email}
                </td>
                <td>
                  <strong>Nom:</strong> ${contract.clientLastName}<br>
                  <strong>Prénom:</strong> ${contract.clientFirstName}<br>
                  <strong>Date de naissance:</strong> ${contract.clientBirthDate ? new Date(contract.clientBirthDate).toLocaleDateString('fr-FR') : 'Non spécifiée'}<br>
                  <strong>Téléphone:</strong> ${contract.clientPhone}<br>
                  <strong>Adresse:</strong> ${contract.clientAddress}<br>
                  <strong>Passeport:</strong> ${contract.clientPassport || 'Non spécifié'}<br>
                  <strong>CIN:</strong> ${contract.clientCIN || 'Non spécifié'}<br>
                  <strong>Permis de conduire:</strong> ${contract.clientLicenseNumber}<br>
                  <strong>Délivré le:</strong> ${contract.clientLicenseIssueDate ? new Date(contract.clientLicenseIssueDate).toLocaleDateString('fr-FR') : 'Non spécifié'}
                </td>
              </tr>
            </table>
          </div>

          ${contract.secondDriverLastName || contract.secondDriverFirstName ? `
          <div class="section">
            <h3>2. DEUXIÈME CONDUCTEUR</h3>
            <div class="highlight">
              <p><strong>Nom:</strong> ${contract.secondDriverLastName}</p>
              <p><strong>Prénom:</strong> ${contract.secondDriverFirstName}</p>
              <p><strong>Permis de conduire:</strong> ${contract.secondDriverLicenseNumber || 'Non spécifié'}</p>
              <p><strong>Délivré le:</strong> ${contract.secondDriverLicenseIssueDate ? new Date(contract.secondDriverLicenseIssueDate).toLocaleDateString('fr-FR') : 'Non spécifié'}</p>
            </div>
          </div>
          ` : ''}

          <div class="section">
            <h3>${contract.secondDriverLastName ? '3' : '2'}. VÉHICULE LOUÉ</h3>
            <div class="highlight">
              ${vehicleInfo ? `
                <div class="vehicle-details">
                  <div><strong>Véhicule:</strong> ${vehicleInfo.name}</div>
                  <div><strong>Type:</strong> ${vehicleInfo.type}</div>
                  <div><strong>Boîte de vitesse:</strong> ${vehicleInfo.boiteVitesse}</div>
                  <div><strong>Marque:</strong> ${vehicleInfo.marque || 'Non spécifiée'}</div>
                  <div><strong>Modèle:</strong> ${vehicleInfo.modele || 'Non spécifié'}</div>
                  <div><strong>Année:</strong> ${vehicleInfo.annee || 'Non spécifiée'}</div>
                  <div><strong>Couleur:</strong> ${vehicleInfo.couleur || 'Non spécifiée'}</div>
                  <div><strong>Carburant:</strong> ${vehicleInfo.carburant || 'Non spécifié'}</div>
                  <div><strong>Plaque d'immatriculation:</strong> ${vehicleInfo.plaqueImmatriculation || 'Non spécifiée'}</div>
                </div>
                <div style="margin-top: 15px;">
                  <p><strong>Prix par jour:</strong> ${contract.prixParJour || vehicleInfo.pricePerDay}€</p>
                  <p><strong>Description:</strong> ${vehicleInfo.description}</p>
                </div>
              ` : '<p>Véhicule non spécifié</p>'}
            </div>
          </div>

          <div class="section">
            <h3>${contract.secondDriverLastName ? '4' : '3'}. DÉTAILS DE LA LOCATION</h3>
            <div class="highlight">
              <p><strong>Date et heure de départ:</strong> ${formatDate(contract.startDateTime)}</p>
              <p><strong>Date et heure de retour:</strong> ${formatDate(contract.endDateTime)}</p>
              <p><strong>Lieu de départ:</strong> ${contract.startLocation}</p>
              <p><strong>Lieu de retour:</strong> ${contract.endLocation}</p>
              <p><strong>Durée totale:</strong> ${Math.ceil((new Date(contract.endDateTime) - new Date(contract.startDateTime)) / (1000 * 60 * 60 * 24))} jours</p>
              <p><strong>Prix total:</strong> ${contract.prixTotal}€</p>
            </div>
          </div>

          <div class="section">
            <h3>${contract.secondDriverLastName ? '5' : '4'}. CONDITIONS GÉNÉRALES</h3>
            <ul>
              <li>Le client s'engage à restituer le véhicule dans l'état où il l'a reçu</li>
              <li>Tout dommage sera à la charge du client</li>
              <li>Le carburant est à la charge du client</li>
              <li>Retard de restitution: majoration de 50% du prix journalier</li>
              <li>Le véhicule doit être rendu avec le plein de carburant</li>
              <li>Interdiction de fumer dans le véhicule</li>
              <li>Le client doit présenter son permis de conduire et sa pièce d'identité</li>
              <li>Caution: 5000 DH (remboursable après vérification du véhicule)</li>
              <li>Kilométrage illimité selon les conditions du contrat</li>
              <li>Assurance tous risques incluse</li>
            </ul>
          </div>

          <div class="signature">
            <p>Fait à ${contract.startLocation}, le ${new Date().toLocaleDateString('fr-FR')}</p>
            <br><br><br>
            <table width="100%">
              <tr>
                <td width="50%" align="center">
                  <p>Signature du Client</p>
                  <p>${contract.clientFirstName} ${contract.clientLastName}</p>
                  <p>CIN: ${contract.clientCIN || 'Non spécifié'}</p>
                </td>
                <td width="50%" align="center">
                  <p>Signature du Partenaire</p>
                  <p>${partnerName}</p>
                </td>
              </tr>
            </table>
          </div>

          <div class="footer">
            <p>Contrat généré par WegoRent - ${partnerName} - ${new Date().toLocaleDateString('fr-FR')}</p>
            <p>Pour toute réclamation, contactez: ${user.email}</p>
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
      clientLastName: contract.clientLastName || '',
      clientFirstName: contract.clientFirstName || '',
      clientBirthDate: contract.clientBirthDate ? contract.clientBirthDate.split('T')[0] : '',
      clientPhone: contract.clientPhone || '',
      clientAddress: contract.clientAddress || '',
      clientPassport: contract.clientPassport || '',
      clientCIN: contract.clientCIN || '',
      clientLicenseNumber: contract.clientLicenseNumber || '',
      clientLicenseIssueDate: contract.clientLicenseIssueDate ? contract.clientLicenseIssueDate.split('T')[0] : '',

      // Second driver information
      secondDriverLastName: contract.secondDriverLastName || '',
      secondDriverFirstName: contract.secondDriverFirstName || '',
      secondDriverLicenseNumber: contract.secondDriverLicenseNumber || '',
      secondDriverLicenseIssueDate: contract.secondDriverLicenseIssueDate ? contract.secondDriverLicenseIssueDate.split('T')[0] : '',

      // Rental information
      vehicleId: contract.vehicleId || '',
      startDateTime: contract.startDateTime ? contract.startDateTime.slice(0, 16) : '',
      endDateTime: contract.endDateTime ? contract.endDateTime.slice(0, 16) : '',
      startLocation: contract.startLocation || '',
      endLocation: contract.endLocation || '',
      prixParJour: contract.prixParJour || '',
      prixTotal: contract.prixTotal || 0
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
