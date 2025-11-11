// components/lists/Blacklist.jsx
import React from 'react';

const Blacklist = ({ blacklist }) => {
  return (
    <div style={{
      background: 'white',
      padding: '30px',
      borderRadius: '10px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
    }}>
      <h2 style={{ color: '#333', marginBottom: '20px' }}>Liste Noire ({blacklist.length})</h2>

      {blacklist.length === 0 ? (
        <p style={{ color: '#666', textAlign: 'center', padding: '40px' }}>
          Aucun client dans la liste noire
        </p>
      ) : (
        <div style={{ display: 'grid', gap: '15px' }}>
          {blacklist.map(client => (
            <div key={client.id} style={{
              border: '1px solid #dc3545',
              borderRadius: '10px',
              padding: '20px',
              background: '#f8d7da'
            }}>
              <h4 style={{ margin: '0 0 10px 0', color: '#721c24' }}>🚫 {client.clientName}</h4>
              <p style={{ margin: '5px 0', color: '#721c24' }}><strong>CIN:</strong> {client.clientCIN}</p>
              {client.clientEmail && <p style={{ margin: '5px 0', color: '#721c24' }}><strong>Email:</strong> {client.clientEmail}</p>}
              {client.clientPhone && <p style={{ margin: '5px 0', color: '#721c24' }}><strong>Téléphone:</strong> {client.clientPhone}</p>}
              <p style={{ margin: '5px 0', color: '#721c24' }}><strong>Raison:</strong> {client.reason}</p>
              <p style={{ margin: '5px 0', color: '#721c24', fontSize: '12px' }}>
                <strong>Ajouté le:</strong> {new Date(client.createdAt).toLocaleDateString()} par {client.addedBy}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Blacklist;
