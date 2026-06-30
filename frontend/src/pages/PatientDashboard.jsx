import React, { useState, useEffect } from 'react';
import API from '../api';

function PatientDashboard() {
  const user = JSON.parse(localStorage.getItem('user'));
  const [activeTab, setActiveTab] = useState('book'); // Tabs: 'book' or 'history'
  const [history, setHistory] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState('General Physician');
  const [doctors, setDoctors] = useState([]);
  const [formData, setFormData] = useState({ doctorId: '', appointmentType: 'OPD', type: 'regular', purposeOfVisit: '', date: '', timeSlot: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const departmentsList = ['General Physician', 'Cardiologist', 'Dentist', 'Urologist', 'Gynaecologist', 'Neurologist', 'ENT Specialist', 'Psychiatrist'];
  const opdSlots = ["09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM", "01:00 PM", "01:30 PM"];
  const surgerySlots = ["04:00 PM", "07:00 PM"];

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await API.get(`/auth/doctors?specialization=${selectedDepartment}`);
        setDoctors(res.data);
        setFormData(prev => ({ ...prev, doctorId: res.data.length > 0 ? res.data[0]._id : '' }));
      } catch (err) { console.error(err); }
    };
    fetchDoctors();
  }, [selectedDepartment]);

  // Fetch medical history records
  const fetchMedicalHistory = async () => {
    try {
      const res = await API.get('/appointments/patient/history');
      setHistory(res.data);
    } catch (err) { console.error("Error fetching history archive", err); }
  };

  useEffect(() => {
    if (activeTab === 'history') fetchMedicalHistory();
  }, [activeTab]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleBookAppointment = async (e) => {
    e.preventDefault();
    setError(''); setMessage('');
    try {
      const res = await API.post('/appointments/book', formData);
      setMessage(res.data.message);
      handleDownloadReceipt(res.data.appointment._id);
    } catch (err) { setError(err.response?.data?.message || 'Booking failed.'); }
  };

  const handleDownloadReceipt = async (appointmentId) => {
  try {
    const response = await API.get(`/appointments/${appointmentId}/receipt`, {
      responseType: 'blob' // Processes raw binary byte fragments cleanly
    });

    // 1. Convert the binary blob layout directly to an ephemeral browser-accessible URL string
    const file = new Blob([response.data], { type: 'application/pdf' });
    const fileURL = window.URL.createObjectURL(file);

    // 2. Instruct the browser shell container to mount the target URL into a brand new standalone tab
    window.open(fileURL, '_blank');
    
  } catch (err) {
    console.error("Failed to render internal PDF preview window tab:", err);
  }
};

  return (
    <div style={{ maxWidth: '750px', margin: '40px auto', padding: '0 20px', fontFamily: 'system-ui' }}>
      
      {/* Dynamic Tab Switches */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '25px' }}>
        <button onClick={() => setActiveTab('book')} style={{ padding: '10px 20px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', background: activeTab === 'book' ? '#2563eb' : '#e2e8f0', color: activeTab === 'book' ? 'white' : '#334155' }}>
          📅 Book Slots
        </button>
        <button onClick={() => setActiveTab('history')} style={{ padding: '10px 20px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', background: activeTab === 'history' ? '#2563eb' : '#e2e8f0', color: activeTab === 'history' ? 'white' : '#334155' }}>
          📜 Past Health Records
        </button>
      </div>

      {activeTab === 'book' ? (
        <div className="animate-fade-in-up" style={{ background: 'white', padding: '30px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
          <h2>Welcome, {user?.name} 👋</h2>
          <form onSubmit={handleBookAppointment}>
            <div>
              <label>Choose Medical Department:</label>
              <select value={selectedDepartment} onChange={(e) => setSelectedDepartment(e.target.value)}>
                {departmentsList.map(dept => <option key={dept} value={dept}>{dept}</option>)}
              </select>
            </div>
            <div style={{ marginTop: '15px' }}>
              <label>Select Available Practitioner:</label>
              {doctors.length === 0 ? <p style={{ color: 'red' }}>No doctors found in this category.</p> : (
                <select name="doctorId" value={formData.doctorId} onChange={handleChange}>
                  {doctors.map(doc => <option key={doc._id} value={doc._id}>Dr. {doc.name}</option>)}
                </select>
              )}
            </div>
            {/* Rest of booking inputs identical to previous step */}
            <div style={{ marginTop: '15px' }}><label>Department Stream:</label>
              <select name="appointmentType" value={formData.appointmentType} onChange={handleChange}><option value="OPD">OPD Consultation</option><option value="Surgery">Surgery Unit</option></select>
            </div>
            <div style={{ marginTop: '15px' }}><label>Choose Date:</label><input type="date" name="date" required value={formData.date} onChange={handleChange} /></div>
            <div style={{ marginTop: '15px' }}><label>Select Time Slot:</label>
              <select name="timeSlot" required value={formData.timeSlot} onChange={handleChange}>
                <option value="">-- Choose Slot --</option>
                {formData.appointmentType === 'OPD' ? opdSlots.map(s => <option key={s} value={s}>{s}</option>) : surgerySlots.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div style={{ marginTop: '15px' }}><label>Purpose of Visit:</label><textarea name="purposeOfVisit" required rows="2" value={formData.purposeOfVisit} onChange={handleChange} /></div>
            <button type="submit" disabled={doctors.length === 0} style={{ width: '100%', marginTop: '20px', padding: '12px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Confirm Booking</button>
          </form>
        </div>
      ) : (
        <div className="animate-fade-in-up">
          <h2>Your Digital Health Records Vault</h2>
          {history.length === 0 ? <p style={{ color: '#64748b' }}>No clinical history logs discovered.</p> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {history.map(record => (
                <div key={record._id} className="interactive-card" style={{ display: 'flex', justifyContent: 'between', alignItems: 'center' }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ margin: '0' }}>Dr. {record.doctorId?.name} ({record.doctorId?.specialization})</h3>
                    <p style={{ margin: '4px 0', fontSize: '13px', color: '#64748b' }}>Consultation Date: <strong>{record.date}</strong> | Block: {record.timeSlot}</p>
                    <div style={{ background: '#f1f5f9', padding: '10px', borderRadius: '6px', marginTop: '8px', fontSize: '14px' }}>
                      <strong>Doctor Notes:</strong> {record.comments}
                    </div>
                  </div>
                  <button onClick={() => handleDownloadReceipt(record._id)} style={{ marginLeft: '20px', padding: '10px 16px', background: '#10b981', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
                    📥 Download PDF
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default PatientDashboard;