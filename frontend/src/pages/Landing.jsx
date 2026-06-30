import React from 'react';
import { useNavigate } from 'react-router-dom';

function Landing() {
  const navigate = useNavigate();

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', paddingBottom: '60px' }}>
      
      {/* --- HERO BANNER --- */}
      <header style={{ textAlign: 'center', padding: '90px 20px 70px 20px', background: 'radial-gradient(circle at top, #1e3a8a 0%, #0f172a 100%)', color: '#ffffff' }}>
        <div className="animate-fade-in-up">
          <h1 style={{ fontSize: '3.5rem', fontWeight: '800', marginBottom: '20px', letterSpacing: '-0.03em', lineHeight: '1.2' }}>
            Smart Clinic Coordination <br/>
            <span style={{ color: '#3b82f6' }}>Without the Waiting Room</span>
          </h1>
          <p style={{ fontSize: '1.2rem', color: '#94a3b8', maxWidth: '650px', margin: '0 auto 40px auto', lineHeight: '1.7' }}>
            Enforcing strict OPD scheduling quotas, automated queue capacities, and live clinical history logging to make overcrowding ancient history.
          </p>
          
          <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
            <button onClick={() => navigate('/register')} style={{ padding: '14px 32px', fontSize: '16px', fontWeight: '700', background: '#2563eb', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', boxShadow: '0 4px 14px rgba(37, 99, 235, 0.4)' }}>
              Get Started Now
            </button>
            <button onClick={() => navigate('/login')} style={{ padding: '14px 32px', fontSize: '16px', fontWeight: '700', background: 'transparent', color: 'white', border: '2px solid #334155', borderRadius: '10px', cursor: 'pointer' }}>
              Sign In to Profile
            </button>
          </div>
        </div>
      </header>

      {/* --- AUTOMATED SLIDESHOW SLIDER --- */}
      <section className="animate-fade-in" style={{ padding: '0 20px' }}>
        <div className="slider-container">
          <div className="slides-wrapper">
            <div className="slide slide-1">
              <h2>⚡ Immediate Emergency Sorting</h2>
              <p>Critical cases flag visual overrides immediately on active doctor dashboard sequences.</p>
            </div>
            <div className="slide slide-2">
              <h2>📅 Hard Cap Constraints Built In</h2>
              <p>Capping daily cycles cleanly to 10 OPD segments and 2 extensive Surgery units programmatically.</p>
            </div>
            <div className="slide slide-3">
              <h2>📄 Instant Compliant Receipts</h2>
              <p>Every single successful slot triggers high-speed server side stream layout generation downloads.</p>
            </div>
          </div>
        </div>
      </section>

      {/* --- INTERACTIVE GRID FEATURES --- */}
      <section style={{ maxWidth: '1100px', margin: '40px auto 0 auto', padding: '0 24px' }}>
        <h2 style={{ textAlign: 'center', fontSize: '2.25rem', fontWeight: '800', marginBottom: '48px', color: '#0f172a' }}>
          Platform Operations Overview
        </h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
          
          <div className="interactive-card">
            <div style={{ fontSize: '32px', marginBottom: '16px' }}>🔬</div>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '18px', fontWeight: '700' }}>Strict OPD Tracking</h3>
            <p style={{ margin: '0', fontSize: '14px', color: '#64748b', lineHeight: '1.6' }}>
              Calculates structural availability dynamically from 9:00 AM to 2:00 PM with hard failure flags when thresholds max out.
            </p>
          </div>

          <div className="interactive-card">
            <div style={{ fontSize: '32px', marginBottom: '16px' }}>🩺</div>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '18px', fontWeight: '700' }}>Targeted Specializations</h3>
            <p style={{ margin: '0', fontSize: '14px', color: '#64748b', lineHeight: '1.6' }}>
              Patients isolate workflows instantly using centralized dropdown query pipelines to fetch verified clinical personnel.
            </p>
          </div>

          <div className="interactive-card">
            <div style={{ fontSize: '32px', marginBottom: '16px' }}>🛡️</div>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '18px', fontWeight: '700' }}>Role Guard Rails</h3>
            <p style={{ margin: '0', fontSize: '14px', color: '#64748b', lineHeight: '1.6' }}>
              Frontend token interceptors scan local footprints thoroughly to prevent administrative bypass attempts.
            </p>
          </div>

        </div>
      </section>

    </div>
  );
}

export default Landing;