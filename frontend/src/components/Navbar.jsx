import React from 'react';
import { Link } from 'react-router-dom';

function Navbar() {
  return (
    <nav style={{ padding: '10px', background: '#1A365D', color: '#fff', display: 'flex', gap: '15px' }}>
      <strong>Book N' Appointment</strong>
      <Link to="/login" style={{ color: '#fff' }}>Login</Link>
      <Link to="/register" style={{ color: '#fff' }}>Register</Link>
    </nav>
  );
}

export default Navbar;