// components/BlacklistManagement.jsx
import React, { useState } from 'react';
import axios from 'axios';
import BlacklistForm from './forms/BlacklistForm';
import Blacklist from './lists/Blacklist';

const BlacklistManagement = ({ user, blacklist, setBlacklist, setMessage }) => {
  const [blacklistForm, setBlacklistForm] = useState({
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    clientCIN: '',
    reason: ''
  });

  const handleBlacklistChange = (e) => {
    setBlacklistForm({ ...blacklistForm, [e.target.name]: e.target.value });
  };

  const addToBlacklist = async (e) => {
    e.preventDefault();
    try {
      const blacklistData = {
        ...blacklistForm,
        partnerId: user.id,
        addedBy: user.name
      };

      const res = await axios.post('http://localhost:3001/blacklist', blacklistData);
      setBlacklist([...blacklist, res.data.blacklistedClient]);
      setBlacklistForm({
        clientName: '',
        clientEmail: '',
        clientPhone: '',
        clientCIN: '',
        reason: ''
      });
      setMessage('✅ Client ajouté à la liste noire!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('❌ Erreur lors de l\'ajout à la liste noire');
    }
  };

  return (
    <div>
      <BlacklistForm
        blacklistForm={blacklistForm}
        handleBlacklistChange={handleBlacklistChange}
        addToBlacklist={addToBlacklist}
      />
      
      <Blacklist blacklist={blacklist} />
    </div>
  );
};

export default BlacklistManagement;
