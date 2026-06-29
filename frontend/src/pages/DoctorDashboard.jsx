import React, { useState, useEffect } from 'react';
import API from '../api';

function DoctorDashboard() {
  const user = JSON.parse(localStorage.getItem('user'));
  const [appointments, setAppointments] = useState([]);
  const [commentsInput, setCommentsInput] = useState({});
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // 1. Fetch today's chronological schedule on component mount
  useEffect(() => {
    fetchTodaySchedule();
  }, []);

  const fetchTodaySchedule = async () => {
    try {
      const res = await API.get('/appointments/today');
      setAppointments(res.data);
    } catch (err) {
      console.error("Error fetching daily queue:", err);
      setError("Could not fetch your schedule. Make sure your server is running.");
    }
  };

  const handleCommentChange = (appointmentId, value) => {
    setCommentsInput({
      ...commentsInput,
      [appointmentId]: value
    });
  };

  // 2. Handler to save consultation logs and mark sessions as completed
  const handleCompleteSession = async (appointmentId) => {
    setError('');
    setMessage('');
    const sessionComments = commentsInput[appointmentId] || '';

    try {
      const res = await API.put(`/appointments/${appointmentId}/complete`, {
        comments: sessionComments
      });
      
      setMessage(res.data.message);
      
      // Refresh the local UI queue state to remove the completed patient
      fetchTodaySchedule();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update consultation status.');
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '40px auto', padding: '25px', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
      <div style={{ display: 'flex', justifyContent: 'between', alignItems: 'center', flexWrap: 'wrap' }}>
        <div>
          <h2>Welcome, Dr. {user?.name} 🩺</h2>
          <p style={{ color: '#718096' }}>Today's Live Consultation & Surgery Queue</p>
        </div>
      </div>
      <hr style={{ borderColor: '#edf2f7', margin: '20px 0' }} />

      {message && <p style={{ color: 'green', padding: '10px', background: '#f0fff4', borderRadius: '6px' }}>{message}</p>}
      {error && <p style={{ color: 'red', padding: '10px', background: '#fff5f5', borderRadius: '6px' }}>{error}</p>}

      {/* 3. Empty Queue Placeholder */}
      {appointments.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#a0aec0' }}>
          <h3>No more active appointments scheduled for today!</h3>
          <p>Overcrowding avoided. Your queue is clean.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {appointments.map((appt) => (
            <div key={appt._id} style={{ padding: '20px', border: '1px solid #e2e8f0', borderRadius: '8px', background: appt.type === 'emergency' ? '#fff5f5' : '#f8fafc' }}>
              
              {/* Patient Meta Details */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div>
                  <span style={{ fontSize: '12px', background: appt.appointmentType === 'Surgery' ? '#ed8936' : '#3182ce', color: 'white', padding: '2px 8px', borderRadius: '12px', marginRight: '8px', fontWeight: 'bold' }}>
                    {appt.appointmentType}
                  </span>
                  {appt.type === 'emergency' && (
                    <span style={{ fontSize: '12px', background: '#e53e3e', color: 'white', padding: '2px 8px', borderRadius: '12px', fontWeight: 'bold' }}>
                      EMERGENCY
                    </span>
                  )}
                  <h3 style={{ margin: '8px 0 4px 0' }}>Patient: {appt.patientId?.name}</h3>
                  <p style={{ margin: '0', fontSize: '14px', color: '#4a5568' }}><strong>Purpose:</strong> {appt.purposeOfVisit}</p>
                </div>
                
                {/* Time Badge */}
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#1a365d' }}>{appt.timeSlot}</span>
                </div>
              </div>

              {/* Consultation Input & Log updates */}
              <div style={{ marginTop: '15px', borderTop: '1px dashed #cbd5e1', paddingTop: '15px' }}>
                <label style={{ fontWeight: '500', fontSize: '14px' }}>Add Clinical Findings / Comments:</label>
                <textarea
                  rows="2"
                  placeholder="Enter medical prescriptions, diagnosis notes, or tracking details..."
                  value={commentsInput[appt._id] || ''}
                  onChange={(e) => handleCommentChange(appt._id, e.target.value)}
                  style={{ width: '100%', padding: '8px', marginTop: '5px', borderRadius: '6px', border: '1px solid #cbd5e1', resize: 'none' }}
                />
                
                <button
                  onClick={() => handleCompleteSession(appt._id)}
                  style={{ marginTop: '10px', padding: '8px 16px', background: '#2f855a', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  Mark Consultation Complete & Close Log
                </button>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default DoctorDashboard;