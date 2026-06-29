import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../api';

function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'patient',
    specialization: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const res = await API.post('/auth/register', formData);
      setSuccess(res.data.message + ' Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Try again.');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h2>Sign Up - Book N' Appointment</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}
      
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label>Full Name:</label>
          <input type="text" name="name" required value={formData.name} onChange={handleChange} style={{ width: '100%', padding: '8px', marginTop: '5px' }} />
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <label>Email Address:</label>
          <input type="email" name="email" required value={formData.email} onChange={handleChange} style={{ width: '100%', padding: '8px', marginTop: '5px' }} />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Password:</label>
          <input type="password" name="password" required value={formData.password} onChange={handleChange} style={{ width: '100%', padding: '8px', marginTop: '5px' }} />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>I am a:</label>
          <select name="role" value={formData.role} onChange={handleChange} style={{ width: '100%', padding: '8px', marginTop: '5px' }}>
            <option value="patient">Patient</option>
            <option value="doctor">Doctor</option>
          </select>
        </div>

        {/* Conditional Field: Only renders when the user selects Doctor */}
        {formData.role === 'doctor' && (
          <div style={{ marginBottom: '15px' }}>
            <label>Medical Specialization / Degrees:</label>
            <input type="text" name="specialization" placeholder="e.g., MBBS, MD Cardiologist" required value={formData.specialization} onChange={handleChange} style={{ width: '100%', padding: '8px', marginTop: '5px' }} />
          </div>
        )}

        <button type="submit" style={{ width: '100%', padding: '10px', background: '#1A365D', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Register
        </button>
      </form>
      <p style={{ marginTop: '15px', textAlign: 'center' }}>
        Already have an account? <Link to="/login">Login here</Link>
      </p>
    </div>
  );
}

export default Register;