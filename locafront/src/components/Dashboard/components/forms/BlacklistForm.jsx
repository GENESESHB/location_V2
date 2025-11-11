// components/forms/BlacklistForm.jsx
import React from 'react';

const BlacklistForm = ({ blacklistForm, handleBlacklistChange, addToBlacklist }) => {
  return (
    <div style={{
      background: 'white',
      padding: '30px',
      borderRadius: '10px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
      marginBottom: '30px'
    }}>
      <h2 style={{ color: '#333', marginBottom: '20px' }}>Ajouter à la Liste Noire</h2>

      <form onSubmit={addToBlacklist}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Nom du client *</label>
            <input
              type="text"
              name="clientName"
              value={blacklistForm.clientName}
              onChange={handleBlacklistChange}
              required
              style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Email</label>
            <input
              type="email"
              name="clientEmail"
              value={blacklistForm.clientEmail}
              onChange={handleBlacklistChange}
              style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Téléphone</label>
            <input
              type="text"
              name="clientPhone"
              value={blacklistForm.clientPhone}
              onChange={handleBlacklistChange}
              style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>CIN *</label>
            <input
              type="text"
              name="clientCIN"
              value={blacklistForm.clientCIN}
              onChange={handleBlacklistChange}
              required
              style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}
            />
          </div>

          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Raison *</label>
            <textarea
              name="reason"
              value={blacklistForm.reason}
              onChange={handleBlacklistChange}
              required
              rows="3"
              style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}
            />
          </div>
        </div>

        <button
          type="submit"
          style={{
            marginTop: '20px',
            padding: '12px 30px',
            background: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontWeight: '600'
          }}
        >
          Ajouter à la Liste Noire
        </button>
      </form>
    </div>
  );
};

export default BlacklistForm;
