// components/BlacklistManagement.jsx
import React, { useState } from 'react';
import api from '../../../utils/api';

const BlacklistManagement = ({ user, setMessage }) => {
  const [cin, setCin] = useState('');
  const [checkResult, setCheckResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleCinChange = (e) => {
    setCin(e.target.value);
    setCheckResult(null);
  };

  const verifyByCIN = async (e) => {
    e.preventDefault();
    setLoading(true);
    setCheckResult(null);

    try {
      // Use the new dedicated route
      const res = await api.get('/blacklist-verify/verify-by-cin', {
        params: { cin }
      });

      setCheckResult(res.data);
      setMessage(res.data.isBlacklisted ? '❌ Client trouvé dans la liste noire!' : '✅ Client non trouvé dans la liste noire');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error('Error verifying CIN:', err);
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
        <h2 style={{ color: '#333', marginBottom: '20px' }}>🔍 Vérifier Client par CIN</h2>

        <form onSubmit={verifyByCIN}>
          <div style={{ marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>CIN du client</label>
              <input
                type="text"
                name="cin"
                value={cin}
                onChange={handleCinChange}
                placeholder="Saisir le CIN"
                style={{ 
                  width: '100%', 
                  maxWidth: '300px',
                  padding: '10px', 
                  border: '1px solid #ddd', 
                  borderRadius: '5px',
                  fontSize: '16px'
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !cin.trim()}
            style={{
              padding: '12px 30px',
              background: loading ? '#6c757d' : '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: '600',
              opacity: loading ? 0.6 : 1,
              fontSize: '16px'
            }}
          >
            {loading ? 'Vérification...' : 'Vérifier par CIN'}
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
                <p><strong>Identifiants:</strong></p>
                {checkResult.client.cin && <p><strong>CIN:</strong> {checkResult.client.cin}</p>}
                {checkResult.client.passport && <p><strong>Passeport:</strong> {checkResult.client.passport}</p>}
                {checkResult.client.licenseNumber && <p><strong>Permis:</strong> {checkResult.client.licenseNumber}</p>}
                <p><strong>Raison:</strong> {checkResult.client.reason}</p>
                <p style={{ fontSize: '12px', color: '#721c24' }}>
                  <strong>Ajouté le:</strong> {new Date(checkResult.client.dateAdded).toLocaleDateString()}
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
