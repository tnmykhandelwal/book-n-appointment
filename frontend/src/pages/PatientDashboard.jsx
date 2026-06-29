import React, { useState, useEffect } from 'react';
import API from '../api';

function PatientDashboard() {
  const user = JSON.parse(localStorage.getItem('user'));
  
  // State for doctors list and booking parameters
  const [doctors, setDoctors] = useState([]);
  const [formData, setFormData] = useState({
    doctorId: '',
    appointmentType: 'OPD',
    type: 'regular',
    purposeOfVisit: '',
    date: '',
    timeSlot: ''
  });
  
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // 1. Hardcoded timeslots matching your exact scheduling rules
  const opdSlots = [
    "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", 
    "11:30 AM", "12:00 PM", "12:30 PM", "01:00 PM", "01:30 PM"
  ];

  const surgerySlots = [
    "04:00 PM", "07:00 PM"
  ];

  // Fetch doctors on mount to fill selection dropdown
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        // For development, we'll hit our auth route or make a quick query. 
        // Tip: You can create an explicit GET /api/auth/doctors endpoint if needed, 
        // or mock a fallback if your database has limited records.
        const res = await API.get('/auth/doctors').catch(() => {
          // Fallback mockup array if explicit route isn't separated yet
          return { data: [{ _id: "65cd1234abcd5678", name: "Sharma", specialization: "MD" }] };
        });
        setDoctors(res.data);
        if (res.data.length > 0) {
          setFormData(prev => ({ ...prev, doctorId: res.data[0]._id }));
        }
      } catch (err) {
        console.error("Error fetching doctors list");
      }
    };
    fetchDoctors();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 2. Form submission handler to communicate with the Booking API
  const handleBookAppointment = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    try {
      const res = await API.post('/appointments/book', formData);
      setMessage(res.data.message);
      
      // 3. Trigger automatic PDF receipt download stream directly
      const appointmentId = res.data.appointment._id;
      handleDownloadReceipt(appointmentId);
    } catch (err) {
      setError(err.response?.data?.message || 'Booking failed. Slot might be full or double-booked.');
    }
  };

  // 4. File Downloader Streaming Logic
  const handleDownloadReceipt = async (appointmentId) => {
    try {
      const response = await API.get(`/appointments/${appointmentId}/receipt`, {
        responseType: 'blob' // CRITICAL: Tells Axios to process raw binary file stream data
      });

      // Create a hidden link in the DOM to click it automatically for download execution
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Receipt-${appointmentId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Failed to automatically stream PDF download.");
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '40px auto', padding: '25px', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
      <h2>Welcome, {user?.name || 'Patient'} 👋</h2>
      <p style={{ color: '#718096' }}>Book N' Appointment Dashboard Panel</p>
      <hr style={{ borderColor: '#edf2f7', margin: '20px 0' }} />

      {message && <p style={{ color: 'green', padding: '10px', background: '#f0fff4', borderRadius: '6px' }}>{message}</p>}
      {error && <p style={{ color: 'red', padding: '10px', background: '#fff5f5', borderRadius: '6px' }}>{error}</p>}

      <form onSubmit={handleBookAppointment}>
        {/* Doctor Selection */}
        <div style={{ marginBottom: '15px' }}>
          <label style={{ fontWeight: 'bold' }}>Select Available Practitioner:</label>
          <select name="doctorId" value={formData.doctorId} onChange={handleChange} style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '6px' }}>
            {doctors.map(doc => (
              <option key={doc._id} value={doc._id}>Dr. {doc.name} ({doc.specialization || 'General'})</option>
            ))}
          </select>
        </div>

        {/* Appointment Type (OPD vs Surgery Layout Switching) */}
        <div style={{ marginBottom: '15px' }}>
          <label style={{ fontWeight: 'bold' }}>Department Stream:</label>
          <select name="appointmentType" value={formData.appointmentType} onChange={handleChange} style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '6px' }}>
            <option value="OPD">OPD Consultation (9:00 AM - 2:00 PM)</option>
            <option value="Surgery">Operation/Surgery Unit (4:00 PM - 10:00 PM)</option>
          </select>
        </div>

        {/* Urgency Level */}
        <div style={{ marginBottom: '15px' }}>
          <label style={{ fontWeight: 'bold' }}>Urgency Tier:</label>
          <select name="type" value={formData.type} onChange={handleChange} style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '6px' }}>
            <option value="regular">Regular Check-up</option>
            <option value="emergency">Emergency / Acute Case</option>
          </select>
        </div>

        {/* Date Field */}
        <div style={{ marginBottom: '15px' }}>
          <label style={{ fontWeight: 'bold' }}>Choose Date:</label>
          <input type="date" name="date" required value={formData.date} onChange={handleChange} style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
        </div>

        {/* Time Slots Options (Switched dynamically on UI depending on selection) */}
        <div style={{ marginBottom: '15px' }}>
          <label style={{ fontWeight: 'bold' }}>Select Chronological Block Slot:</label>
          <select name="timeSlot" required value={formData.timeSlot} onChange={handleChange} style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '6px' }}>
            <option value="">-- Click to reveal slots --</option>
            {formData.appointmentType === 'OPD' 
              ? opdSlots.map(slot => <option key={slot} value={slot}>{slot}</option>)
              : surgerySlots.map(slot => <option key={slot} value={slot}>{slot}</option>)
            }
          </select>
        </div>

        {/* Purpose of Visit */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ fontWeight: 'bold' }}>Purpose of Visit / Chief Complaints:</label>
          <textarea name="purposeOfVisit" rows="3" required placeholder="Describe symptoms or reasons brief..." value={formData.purposeOfVisit} onChange={handleChange} style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '6px', border: '1px solid #cbd5e1', resize: 'none' }} />
        </div>

        <button type="submit" style={{ width: '100%', padding: '12px', background: '#1A365D', color: 'white', border: 'none', borderRadius: '6px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}>
          Confirm Slot & Auto-Download PDF
        </button>
      </form>
    </div>
  );
}

export default PatientDashboard;