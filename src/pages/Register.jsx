import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { User, Mail, Lock, Phone, MapPin, Building, ArrowRight } from 'lucide-react';

const ROLES = [
  { value: 'DONOR', icon: '🍲', label: 'DONOR',  sub: 'Hotels, Restaurants, Individuals' },
  { value: 'NGO',   icon: '🏛️', label: 'NGO',    sub: 'Charities & Non-profits' },
  { value: 'ADMIN', icon: '⚡', label: 'ADMIN',  sub: 'Platform Supervisor' },
];

const Register = () => {
  const [role, setRole] = useState('DONOR');
  const [form, setForm] = useState({
    name: '', email: '', password: '', phone: '', address: '',
    organizationName: '', registrationNumber: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError]   = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const { register, getDashboardPath } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(''); setSuccessMsg('');

    if (!form.name || !form.email || !form.password) {
      setFormError('Name, Email, and Password are required.'); return;
    }
    if (form.password.length < 6) {
      setFormError('Password must be at least 6 characters.'); return;
    }
    if (role === 'NGO' && (!form.organizationName || !form.registrationNumber)) {
      setFormError('NGO accounts require Organization Name and Registration Number.'); return;
    }

    setSubmitting(true);
    const result = await register({ ...form, role });
    setSubmitting(false);

    if (result.success) {
      setSuccessMsg(result.message);
      setTimeout(() => navigate(getDashboardPath(result.user)), 1000);
    } else {
      setFormError(result.message);
    }
  };

  return (
    <div style={{ maxWidth: '520px', margin: '36px auto', padding: '0 16px' }}>
      <div className="glass-card" style={{ padding: '32px 28px' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🌱</div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: '800', marginBottom: '6px' }}>Create Account</h1>
          <p style={{ color: '#9CA3AF', fontSize: '0.88rem' }}>Join the food rescue network</p>
        </div>

        {formError  && <div className="alert alert-error">{formError}</div>}
        {successMsg && <div className="alert alert-success">{successMsg}</div>}

        {/* Role Picker */}
        <div style={{ marginBottom: '18px' }}>
          <label className="form-label" style={{ marginBottom: '10px' }}>Select Your Role</label>
          <div className="role-grid">
            {ROLES.map(r => (
              <div key={r.value}
                className={`role-card ${role === r.value ? 'active' : ''}`}
                onClick={() => setRole(r.value)}>
                <div className="role-icon">{r.icon}</div>
                <div className="role-name">{r.label}</div>
                <div style={{ fontSize: '0.65rem', color: '#9CA3AF', marginTop: '2px' }}>{r.sub}</div>
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Core fields */}
          <div className="form-group">
            <label className="form-label"><User size={14} color="#10B981" /> Full Name *</label>
            <input name="name" type="text" className="form-input"
              placeholder="Your name or organization name"
              value={form.name} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label className="form-label"><Mail size={14} color="#10B981" /> Email Address *</label>
            <input name="email" type="email" className="form-input"
              placeholder="you@example.com"
              value={form.email} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label className="form-label"><Lock size={14} color="#10B981" /> Password * (min 6 chars)</label>
            <input name="password" type="password" className="form-input"
              placeholder="••••••••"
              value={form.password} onChange={handleChange} minLength={6} required />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label"><Phone size={14} color="#10B981" /> Phone</label>
              <input name="phone" type="text" className="form-input"
                placeholder="+91 98765 43210"
                value={form.phone} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label"><MapPin size={14} color="#10B981" /> City / Address</label>
              <input name="address" type="text" className="form-input"
                placeholder="Hyderabad"
                value={form.address} onChange={handleChange} />
            </div>
          </div>

          {/* NGO-specific fields */}
          {role === 'NGO' && (
            <div style={{
              background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.25)',
              borderRadius: '10px', padding: '16px', marginBottom: '14px',
            }}>
              <h4 style={{ fontSize: '0.82rem', color: '#60A5FA', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Building size={14} /> NGO Verification Details
              </h4>
              <div className="form-group">
                <label className="form-label">Organization Legal Name *</label>
                <input name="organizationName" type="text" className="form-input"
                  placeholder="e.g. Hope Food Relief Foundation"
                  value={form.organizationName} onChange={handleChange} required={role === 'NGO'} />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">NGO Registration / Tax ID *</label>
                <input name="registrationNumber" type="text" className="form-input"
                  placeholder="e.g. NGO-REG-2024-889"
                  value={form.registrationNumber} onChange={handleChange} required={role === 'NGO'} />
              </div>
            </div>
          )}

          {role === 'NGO' && (
            <div className="alert alert-info" style={{ marginBottom: '14px', fontSize: '0.82rem' }}>
              ℹ️ NGO accounts require admin approval before accessing the platform.
            </div>
          )}

          <button type="submit" className="btn btn-primary"
            style={{ width: '100%', padding: '13px', marginTop: '4px' }}
            disabled={submitting}>
            {submitting ? 'Creating Account...' : <><span>Create Account</span> <ArrowRight size={17} /></>}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '18px', fontSize: '0.85rem', color: '#9CA3AF' }}>
          Already registered?{' '}
          <Link to="/login" style={{ color: '#10B981', fontWeight: 600, textDecoration: 'none' }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
