// src/components/Partner.jsx
import React, { useState } from 'react';
import axios from 'axios';

const Partner = () => {
  const [view, setView] = useState('choice'); // 'choice', 'register', 'login'
  const [form, setForm] = useState({
    name: '',
    entreprise: '',
    number: '',
    email: '',
    password: '',
    logoEntreprise: '', // this will store URL or base64
    country: '',
    city: ''
  });
  const [message, setMessage] = useState('');
  const [logoPreview, setLogoPreview] = useState(null); // preview image

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Handle file selection for logo
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setForm({ ...form, logoEntreprise: file }); // store the File object
      const reader = new FileReader();
      reader.onloadend = () => setLogoPreview(reader.result); // preview
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
        'https://locationvoiture-alpha.vercel.app/users/demande',
        data,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      setMessage(res.data.message);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Error submitting demande');
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('https://locationvoiture-alpha.vercel.app/users/login', { email: form.email, password: form.password });
      setMessage(`Welcome ${res.data.user.name}!`);
    } catch (err) {
      setMessage(err.response?.data?.error || 'Login failed');
    }
  };

  if (view === 'choice') {
    return (
      <div style={{ textAlign: 'center', marginTop: '50px' }}>
        <h2>Are you a Supplier / Partner?</h2>
        <button onClick={() => setView('register')} style={{ margin: '10px', padding: '10px 20px' }}>Register</button>
        <button onClick={() => setView('login')} style={{ margin: '10px', padding: '10px 20px' }}>Login</button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', textAlign: 'center' }}>
      {view === 'register' ? (
        <>
          <h2>Partner Registration</h2>
          <form onSubmit={handleRegister}>
            <input name="name" placeholder="Name" value={form.name} onChange={handleChange} required />
            <input name="entreprise" placeholder="Entreprise" value={form.entreprise} onChange={handleChange} required />
            <input name="number" placeholder="Phone Number" value={form.number} onChange={handleChange} required />
            <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required />
            <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} required />
            
            {/* File input for logo */}
            <input type="file" accept="image/*" onChange={handleFileChange} />
            {logoPreview && <img src={logoPreview} alt="Logo Preview" style={{ marginTop: '10px', maxWidth: '100px' }} />}
            
            <input name="country" placeholder="Country" value={form.country} onChange={handleChange} />
            <input name="city" placeholder="City" value={form.city} onChange={handleChange} />
            <button type="submit" style={{ marginTop: '10px' }}>Submit Demande</button>
          </form>
        </>
      ) : (
        <>
          <h2>Partner Login</h2>
          <form onSubmit={handleLogin}>
            <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required />
            <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} required />
            <button type="submit" style={{ marginTop: '10px' }}>Login</button>
          </form>
        </>
      )}
      {message && <p style={{ marginTop: '20px' }}>{message}</p>}
      <button onClick={() => setView('choice')} style={{ marginTop: '20px' }}>Back</button>
    </div>
  );
};

export default Partner;

