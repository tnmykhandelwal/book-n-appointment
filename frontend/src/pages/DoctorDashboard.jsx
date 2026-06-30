import React, { useState, useEffect } from 'react';
import API from '../api';

function DoctorDashboard() {
  const user = JSON.parse(localStorage.getItem('user'));
  const [activeTab, setActiveTab] = useState('queue'); // 'queue' or 'archive'
  const [appointments, setAppointments] = useState([]);
  const [archive, setArchive] = useState([]);
  const [commentsInput, setCommentsInput] = useState({});
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Search and Sort Control State
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('newest');

  const fetchTodayQueue = async () => {
    try {
      const res = await API.get('/appointments/today');
      setAppointments(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchPastPatientsArchive = async () => {
    try {
      const res = await API.get('/appointments/doctor/history');
      setArchive(res.data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    if (activeTab === 'queue') fetchTodayQueue();
    if (activeTab === 'archive') fetchPastPatientsArchive();
  }, [activeTab]);

  const handleCompleteSession = async (id) => {
    try {
      const res = await API.put(`/appointments/${id}/complete`, { comments: commentsInput[id] || '' });
      setMessage(res.data.message);
      fetchTodayQueue();
    } catch (err) { setError('Failed closing session.'); }
  };

  // 🔍 APPLICATION FILTERING LOGIC
  const filteredArchive = archive
    .filter(record => record.patientId?.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      return sortOrder === 'newest' 
        ? new Date(b.date) - new Date(a.date)
        : new Date(a.date) - new Date(b.date);
    });

  return (
    <div style={{ maxWidth: '850px', margin: '40px auto', padding: '0 20px', fontFamily: 'system-ui' }}>
      
      {/* Navigation Tabs */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '25px' }}>
        <button onClick={() => setActiveTab('queue')} style={{ padding: '10px 20px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', background: activeTab === 'queue' ? '#2563eb' : '#e2e8f0', color: activeTab === 'queue' ? 'white' : '#334155' }}>
          🩺 Live Queue
        </button>
        <button onClick={() => setActiveTab('archive')} style={{ padding: '10px 20px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', background: activeTab === 'archive' ? '#2563eb' : '#e2e8f0', color: activeTab === 'archive' ? 'white' : '#334155' }}>
          🗃️ Patient Case History
        </button>
      </div>

      {message && <p style={{ color: 'green', background: '#f0fff4', padding: '10px', borderRadius: '6px' }}>{message}</p>}

      {activeTab === 'queue' ? (
        <div className="animate-fade-in-up">
          <h2>Welcome, Dr. {user?.name} 🩺</h2>
          {appointments.length === 0 ? <p style={{ color: '#64748b' }}>Queue completely empty.</p> : (
            appointments.map(appt => (
              <div key={appt._id} className="interactive-card" style={{ marginTop: '15px' }}>
                <h3>Patient: {appt.patientId?.name} ({appt.appointmentType})</h3>
                <p><strong>Purpose:</strong> {appt.purposeOfVisit} | <strong>Slot:</strong> {appt.timeSlot}</p>
                <textarea rows="2" placeholder="Prescriptions / Findings..." value={commentsInput[appt._id] || ''} onChange={(e) => setCommentsInput({...commentsInput, [appt._id]: e.target.value})} />
                <button onClick={() => handleCompleteSession(appt._id)} style={{ marginTop: '10px', padding: '8px 16px', background: '#2f855a', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Close Session</button>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="animate-fade-in-up">
          <h2>Historical Patient Archive</h2>
          
          {/* SEARCH & SORT PANEL UTILITIES */}
          <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', flexWrap: 'wrap' }}>
            <input 
              type="text" 
              placeholder="🔍 Search patient by full name..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              style={{ flex: 2, padding: '10px' }} 
            />
            <select 
              value={sortOrder} 
              onChange={(e) => setSortOrder(e.target.value)} 
              style={{ flex: 1, padding: '10px' }}
            >
              <option value="newest">Sort by: Newest First</option>
              <option value="oldest">Sort by: Oldest First</option>
            </select>
          </div>

          {filteredArchive.length === 0 ? <p style={{ color: '#64748b' }}>No archived records match your search parameters.</p> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {filteredArchive.map(record => (
                <div key={record._id} className="interactive-card" style={{ background: '#f8fafc' }}>
                  <div style={{ display: 'flex', justifyContent: 'between', alignItems: 'center' }}>
                    <h3 style={{ margin: '0', color: '#1e3a8a' }}>{record.patientId?.name}</h3>
                    <span style={{ fontSize: '13px', color: '#64748b' }}>Date: <strong>{record.date}</strong></span>
                  </div>
                  <p style={{ fontSize: '14px', margin: '8px 0' }}><strong>Initial Complaints:</strong> {record.purposeOfVisit}</p>
                  <p style={{ fontSize: '14px', margin: '0', padding: '8px', background: '#e2e8f0', borderRadius: '6px' }}>
                    <strong>Prescription Issued:</strong> {record.comments}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default DoctorDashboard;