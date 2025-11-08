// src/components/Partner.jsx
import React, { useState } from 'react';
import axios from 'axios';

const Partner = () => {
  const [form, setForm] = useState({
    name: '',
    entreprise: '',
    number: '',
    email: '',
    password: '',
    logoEntreprise: '',
    country: '',
    city: ''
  });
  const [message, setMessage] = useState('');
  const [logoPreview, setLogoPreview] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setForm({ ...form, logoEntreprise: file });
      const reader = new FileReader();
      reader.onloadend = () => setLogoPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();
      Object.keys(form).forEach(key => {
        data.append(key, form[key]);
      });

      const res = await axios.post(
        'http://localhost:3001/users/demande',
        data,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      setMessage(res.data.message);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Error submitting demande');
    }
  };

  const handleLogin = () => {
    // Redirect to login page or show login modal
    window.location.href = '/login'; // Adjust based on your routing
  };

  return (
    <div className="partner-section" style={{ background: '#fff', minHeight: '100vh', padding: '40px 0' }}>
      <div className="wrap">
        <div style={{ maxWidth: '500px', margin: '0 auto', textAlign: 'center' }}>
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
                W
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
              </div>
            </div>
            
            <h2 style={{
              fontSize: '28px',
              fontWeight: '800',
              color: '#142534',
              marginBottom: '8px'
            }}>
              Devenez Partenaire
            </h2>
            <p style={{
              color: '#6b7b8a',
              fontWeight: '600',
              marginBottom: '32px',
              fontSize: '16px'
            }}>
              Rejoignez notre réseau de fournisseurs et développez votre activité
            </p>

            <form onSubmit={handleRegister} style={{ textAlign: 'left' }}>
              <div style={{ display: 'grid', gap: '16px' }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#142534',
                    marginBottom: '6px'
                  }}>
                    Nom complet *
                  </label>
                  <input
                    name="name"
                    placeholder="Votre nom complet"
                    value={form.name}
                    onChange={handleChange}
                    required
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '12px',
                      fontSize: '14px',
                      background: '#fff',
                      transition: 'all 0.2s'
                    }}
                  />
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#142534',
                    marginBottom: '6px'
                  }}>
                    Nom de l'entreprise *
                  </label>
                  <input
                    name="entreprise"
                    placeholder="Nom de votre entreprise"
                    value={form.entreprise}
                    onChange={handleChange}
                    required
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '12px',
                      fontSize: '14px',
                      background: '#fff'
                    }}
                  />
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#142534',
                    marginBottom: '6px'
                  }}>
                    Numéro de téléphone *
                  </label>
                  <input
                    name="number"
                    placeholder="Votre numéro"
                    value={form.number}
                    onChange={handleChange}
                    required
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '12px',
                      fontSize: '14px',
                      background: '#fff'
                    }}
                  />
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#142534',
                    marginBottom: '6px'
                  }}>
                    Email *
                  </label>
                  <input
                    name="email"
                    type="email"
                    placeholder="votre@email.com"
                    value={form.email}
                    onChange={handleChange}
                    required
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '12px',
                      fontSize: '14px',
                      background: '#fff'
                    }}
                  />
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#142534',
                    marginBottom: '6px'
                  }}>
                    Mot de passe *
                  </label>
                  <input
                    name="password"
                    type="password"
                    placeholder="Créez un mot de passe"
                    value={form.password}
                    onChange={handleChange}
                    required
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '12px',
                      fontSize: '14px',
                      background: '#fff'
                    }}
                  />
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#142534',
                    marginBottom: '6px'
                  }}>
                    Logo de l'entreprise
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '12px',
                      fontSize: '14px',
                      background: '#fff'
                    }}
                  />
                  {logoPreview && (
                    <img
                      src={logoPreview}
                      alt="Logo Preview"
                      style={{
                        marginTop: '12px',
                        maxWidth: '100px',
                        borderRadius: '8px'
                      }}
                    />
                  )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#142534',
                      marginBottom: '6px'
                    }}>
                      Pays
                    </label>
                    <input
                      name="country"
                      placeholder="Pays"
                      value={form.country}
                      onChange={handleChange}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '1px solid #e2e8f0',
                        borderRadius: '12px',
                        fontSize: '14px',
                        background: '#fff'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#142534',
                      marginBottom: '6px'
                    }}>
                      Ville
                    </label>
                    <input
                      name="city"
                      placeholder="Ville"
                      value={form.city}
                      onChange={handleChange}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '1px solid #e2e8f0',
                        borderRadius: '12px',
                        fontSize: '14px',
                        background: '#fff'
                      }}
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                style={{
                  width: '100%',
                  marginTop: '24px',
                  padding: '16px',
                  fontSize: '16px',
                  fontWeight: '700',
                  background: '#36c275',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '12px',
                  cursor: 'pointer'
                }}
              >
                Devenir Partenaire
              </button>
            </form>

            {message && (
              <p style={{
                marginTop: '20px',
                padding: '12px',
                borderRadius: '8px',
                background: message.includes('Welcome') ? '#d4edda' : '#f8d7da',
                color: message.includes('Welcome') ? '#155724' : '#721c24',
                fontWeight: '600'
              }}>
                {message}
              </p>
            )}

            <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid #e2e8f0' }}>
              <p style={{
                color: '#6b7b8a',
                fontWeight: '600',
                marginBottom: '16px'
              }}>
                Déjà partenaire ?
              </p>
              <button
                onClick={handleLogin}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '2px solid #36c275',
                  borderRadius: '12px',
                  background: 'transparent',
                  color: '#36c275',
                  fontSize: '16px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => {
                  e.target.style.background = '#36c275';
                  e.target.style.color = '#fff';
                }}
                onMouseOut={(e) => {
                  e.target.style.background = 'transparent';
                  e.target.style.color = '#36c275';
                }}
              >
                Se connecter
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Partner;
