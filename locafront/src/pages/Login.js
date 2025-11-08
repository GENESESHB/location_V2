import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loggedIn } = useAuth();

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const msg = query.get('message');
    if (msg) {
      setMessage(decodeURIComponent(msg));
    }
  }, [location.search]);

  useEffect(() => {
    if (loggedIn) {
      navigate('/dashboard');
    }
  }, [loggedIn, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:3001/api/auth/login', {
        email,
        password,
      });
      setLoading(false);
      console.log('Login successful:', response.data);
      setMessage('Connexion réussie');
      const token = response.data.token;
      console.log('Received token:', token);
      await login(token);
      navigate('/dashboard');
    } catch (error) {
      setLoading(false);
      console.error('Login failed:', error);
      setMessage(error.response?.data?.message || 'Échec de la connexion');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#fff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        background: 'var(--card)',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-8)',
        boxShadow: 'var(--shadow)',
        width: '100%',
        maxWidth: '420px',
        border: '1px solid var(--ring)'
      }}>
        {/* Header avec logo et texte */}
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-6)' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 'var(--space-3)',
            marginBottom: 'var(--space-4)'
          }}>
            <div style={{
              width: '50px',
              height: '50px',
              borderRadius: '12px',
              display: 'grid',
              placeItems: 'center',
              background: '#36c275',
              boxShadow: '0 6px 18px rgba(54, 194, 117, .35)',
              color: '#fff',
              fontSize: '20px',
              fontWeight: '800'
            }}>
              W.
            </div>
            <div style={{ textAlign: 'left' }}>
              <h1 style={{
                fontSize: '20px',
                fontWeight: '800',
                color: '#36c275',
                margin: 0,
                lineHeight: '1.2'
              }}>
                WegoRent
              </h1>
              <p style={{
                color: 'var(--muted)',
                fontWeight: '600',
                margin: 0,
                fontSize: '14px'
              }}>
                Espace Partenaires
              </p>
            </div>
          </div>

          <p style={{
            color: 'var(--text)',
            fontWeight: '500',
            margin: 'var(--space-4) 0 0 0',
            fontSize: '15px',
            lineHeight: '1.5'
          }}>
            Connectez-vous à votre compte partenaire pour gérer votre flotte automobile
          </p>
        </div>

        {/* Message */}
        {message && (
          <div style={{
            padding: 'var(--space-3) var(--space-4)',
            borderRadius: '12px',
            background: message.includes('réussie') ? '#e8f7eb' : '#fde8e8',
            color: message.includes('réussie') ? '#1e8a3a' : '#dc2626',
            fontWeight: '600',
            fontSize: '14px',
            marginBottom: 'var(--space-4)',
            border: `1px solid ${message.includes('réussie') ? '#c9f0cf' : '#fecaca'}`
          }}>
            {message}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            marginBottom: 'var(--space-4)'
          }}>
            <div style={{
              width: '32px',
              height: '32px',
              border: '3px solid var(--ring)',
              borderTop: '3px solid #36c275',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}></div>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 'var(--space-5)' }}>
          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: 'var(--text)',
              marginBottom: 'var(--space-2)'
            }}>
              Email Partenaire
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                placeholder="partenaire@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
                style={{
                  width: '100%',
                  padding: '14px 16px 14px 48px',
                  border: '1px solid var(--ring)',
                  borderRadius: '12px',
                  fontSize: '15px',
                  background: '#fff',
                  outline: 'none',
                  transition: 'all 0.2s'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#36c275';
                  e.target.style.boxShadow = '0 0 0 3px rgba(54, 194, 117, .28), 0 0 0 1px #36c275';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'var(--ring)';
                  e.target.style.boxShadow = 'none';
                }}
              />
              <div style={{
                position: 'absolute',
                left: '14px',
                top: '50%',
                transform: 'translateY(-50%)',
                opacity: '0.75',
                color: '#36c275'
              }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
              </div>
            </div>
          </div>

          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: 'var(--text)',
              marginBottom: 'var(--space-2)'
            }}>
              Mot de passe
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                placeholder="Votre mot de passe partenaire"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '14px 16px 14px 48px',
                  border: '1px solid var(--ring)',
                  borderRadius: '12px',
                  fontSize: '15px',
                  background: '#fff',
                  outline: 'none',
                  transition: 'all 0.2s'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#36c275';
                  e.target.style.boxShadow = '0 0 0 3px rgba(54, 194, 117, .28), 0 0 0 1px #36c275';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'var(--ring)';
                  e.target.style.boxShadow = 'none';
                }}
              />
              <div style={{
                position: 'absolute',
                left: '14px',
                top: '50%',
                transform: 'translateY(-50%)',
                opacity: '0.75',
                color: '#36c275'
              }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <circle cx="12" cy="16" r="1"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '16px',
              fontSize: '16px',
              fontWeight: '700',
              marginTop: 'var(--space-3)',
              opacity: loading ? 0.7 : 1,
              cursor: loading ? 'not-allowed' : 'pointer',
              background: '#36c275',
              color: '#fff',
              border: 'none',
              borderRadius: '14px',
              boxShadow: '0 10px 22px rgba(54, 194, 117, .28), inset 0 -2px 0 rgba(0,0,0,.08)',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => {
              if (!loading) {
                e.target.style.background = '#2da864';
                e.target.style.filter = 'saturate(1.05)';
              }
            }}
            onMouseOut={(e) => {
              if (!loading) {
                e.target.style.background = '#36c275';
                e.target.style.filter = 'none';
              }
            }}
            onMouseDown={(e) => {
              if (!loading) {
                e.target.style.transform = 'translateY(1px)';
                e.target.style.boxShadow = '0 6px 16px rgba(54, 194, 117, .33), inset 0 1px 0 rgba(255,255,255,.2)';
              }
            }}
            onMouseUp={(e) => {
              if (!loading) {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 10px 22px rgba(54, 194, 117, .28), inset 0 -2px 0 rgba(0,0,0,.08)';
              }
            }}
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        {/* Support Link */}
        <div style={{
          marginTop: 'var(--space-6)',
          paddingTop: 'var(--space-4)',
          borderTop: '1px solid var(--ring)',
          textAlign: 'center'
        }}>
          <p style={{
            color: 'var(--muted)',
            fontWeight: '600',
            fontSize: '14px',
            marginBottom: 'var(--space-3)'
          }}>
            Problème de connexion ?
          </p>
          <button
            onClick={() => window.location.href = 'mailto:support@wegorent.com'}
            style={{
              width: '100%',
              padding: '12px 16px',
              border: '2px solid var(--ring)',
              borderRadius: '12px',
              background: 'transparent',
              color: 'var(--muted)',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => {
              e.target.style.background = 'var(--pill)';
              e.target.style.borderColor = '#36c275';
              e.target.style.color = '#36c275';
            }}
            onMouseOut={(e) => {
              e.target.style.background = 'transparent';
              e.target.style.borderColor = 'var(--ring)';
              e.target.style.color = 'var(--muted)';
            }}
          >
            Contacter le support
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Login;
