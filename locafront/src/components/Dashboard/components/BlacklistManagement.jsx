// components/BlacklistManagement.jsx
import React, { useState } from 'react';
import axios from 'axios';

const BlacklistManagement = ({ user, setMessage }) => {
  const [checkData, setCheckData] = useState({
    clientCIN: '',
    clientEmail: '',
    clientPhone: ''
  });
  const [checkResult, setCheckResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleCheckChange = (e) => {
    setCheckData({ ...checkData, [e.target.name]: e.target.value });
    setCheckResult(null);
  };

  const checkBlacklist = async (e) => {
    e.preventDefault();
    setLoading(true);
    setCheckResult(null);

    try {
      const res = await axios.post('http://localhost:3001/blacklist/check', checkData);
      setCheckResult(res.data);
      setMessage(res.data.isBlacklisted ? '❌ Client trouvé dans la liste noire!' : '✅ Client non trouvé dans la liste noire');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('❌ Erreur lors de la vérification');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{
        background: 'white',
        padding: '30px',
        borderRadius: '10px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        marginBottom: '30px'
      }}>
        <h2 style={{ color: '#333', marginBottom: '20px' }}>🔍 Vérifier Client dans Liste Noire</h2>

        <form onSubmit={checkBlacklist}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>CIN du client</label>
              <input
                type="text"
                name="clientCIN"
                value={checkData.clientCIN}
                onChange={handleCheckChange}
                placeholder="Saisir le CIN"
                style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Email du client</label>
              <input
                type="email"
                name="clientEmail"
                value={checkData.clientEmail}
                onChange={handleCheckChange}
                placeholder="Saisir l'email"
                style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Téléphone du client</label>
              <input
                type="text"
                name="clientPhone"
                value={checkData.clientPhone}
                onChange={handleCheckChange}
                placeholder="Saisir le téléphone"
                style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || (!checkData.clientCIN && !checkData.clientEmail && !checkData.clientPhone)}
            style={{
              padding: '12px 30px',
              background: loading ? '#6c757d' : '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: '600',
              opacity: loading ? 0.6 : 1
            }}
          >
            {loading ? 'Vérification...' : 'Vérifier Client'}
          </button>
        </form>

        {/* Display Results */}
        {checkResult && (
          <div style={{
            marginTop: '20px',
            padding: '15px',
            border: `2px solid ${checkResult.isBlacklisted ? '#dc3545' : '#28a745'}`,
            borderRadius: '8px',
            background: checkResult.isBlacklisted ? '#f8d7da' : '#d4edda'
          }}>
            <h4 style={{ 
              color: checkResult.isBlacklisted ? '#721c24' : '#155724',
              marginBottom: '10px'
            }}>
              {checkResult.isBlacklisted ? '🚫 Client dans la Liste Noire' : '✅ Client Non Listé'}
            </h4>
            
            {checkResult.isBlacklisted && checkResult.client && (
              <div>
                <p><strong>Nom:</strong> {checkResult.client.clientName}</p>
                <p><strong>CIN:</strong> {checkResult.client.clientCIN}</p>
                {checkResult.client.clientEmail && <p><strong>Email:</strong> {checkResult.client.clientEmail}</p>}
                {checkResult.client.clientPhone && <p><strong>Téléphone:</strong> {checkResult.client.clientPhone}</p>}
                <p><strong>Raison:</strong> {checkResult.client.reason}</p>
                <p style={{ fontSize: '12px', color: '#721c24' }}>
                  <strong>Ajouté le:</strong> {new Date(checkResult.client.createdAt).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BlacklistManagement;
