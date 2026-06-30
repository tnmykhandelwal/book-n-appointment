import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Logo from './Logo';

function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user'));

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 1000,
      padding: '16px 40px', background: 'rgba(15, 23, 42, 0.95)', backdropFilter: 'blur(8px)',
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      borderBottom: '1px solid #1e293b'
    }}>
      <Link to="/" style={{ color: '#fff', textDecoration: 'none', fontSize: '20px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '12px' }}>
  <Logo size={36} /> Book N' Appointment
</Link>
      
      <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
        {!token ? (
          <>
            <Link to="/login" style={{ color: '#94a3b8', textDecoration: 'none', fontWeight: '600', transition: 'color 0.2s' }}>Sign In</Link>
            <Link to="/register" style={{ backgroundColor: '#2563eb', color: '#fff', textDecoration: 'none', fontWeight: '600', padding: '8px 18px', borderRadius: '8px', transition: 'background 0.2s' }}>Register</Link>
          </>
        ) : (
          <>
            <span style={{ color: '#94a3b8', fontSize: '14px', marginRight: '8px' }}>
              Logged in as: <strong style={{ color: '#f8fafc' }}>{user?.name} ({user?.role})</strong>
            </span>
            <button onClick={handleLogout} style={{ background: 'transparent', color: '#f87171', border: '1px solid #f87171', padding: '6px 14px', borderRadius: '6px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s' }}>
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;