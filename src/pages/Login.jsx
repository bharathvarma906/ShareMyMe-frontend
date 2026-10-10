import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Mail, Lock, ArrowRight, ShieldCheck, HeartHandshake, Building2 } from 'lucide-react';

const Login = () => {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError]   = useState('');

  const { login, getDashboardPath } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!email || !password) { setFormError('Please enter both email and password.'); return; }

    setSubmitting(true);
    const result = await login({ email, password });
    setSubmitting(false);

    if (result.success) {
      navigate(getDashboardPath(result.user));
    } else {
      setFormError(result.message);
    }
  };

  const fillDemo = (role) => {
    if (role === 'DONOR') { setEmail('donor@sharemymeal.com'); setPassword('password123'); }
    if (role === 'NGO')   { setEmail('ngo@sharemymeal.com');   setPassword('password123'); }
    if (role === 'ADMIN') { setEmail('admin@sharemymeal.com'); setPassword('password123'); }
  };

  return (
    <div style={{ maxWidth: '440px', margin: '48px auto', padding: '0 16px' }}>
      <div className="glass-card" style={{ padding: '32px 28px' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ fontSize: '2.4rem', marginBottom: '8px' }}>🍲</div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: '800', marginBottom: '6px' }}>Welcome Back</h1>
          <p style={{ color: '#9CA3AF', fontSize: '0.88rem' }}>
            Sign in to your ShareMyMeal account
          </p>
        </div>

        {formError && <div className="alert alert-error">{formError}</div>}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label"><Mail size={15} color="#10B981" /> Email Address</label>
            <input type="email" className="form-input" placeholder="you@example.com"
              value={email} onChange={e => setEmail(e.target.value)} required autoFocus />
          </div>

          <div className="form-group">
            <label className="form-label"><Lock size={15} color="#10B981" /> Password</label>
            <input type="password" className="form-input" placeholder="••••••••"
              value={password} onChange={e => setPassword(e.target.value)} required />
          </div>

          <button type="submit" className="btn btn-primary"
            style={{ width: '100%', padding: '13px', marginTop: '8px' }}
            disabled={submitting}>
            {submitting ? 'Signing in...' : <><span>Sign In</span> <ArrowRight size={17} /></>}
          </button>
        </form>

        {/* Quick demo credentials */}
        <div style={{ marginTop: '24px', paddingTop: '18px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <p style={{ fontSize: '0.75rem', color: '#6B7280', textAlign: 'center', marginBottom: '10px' }}>
            💡 Quick test — click to auto-fill demo credentials:
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
            {[
              { role: 'DONOR', icon: <HeartHandshake size={14} color="#34D399" />, label: 'Donor' },
              { role: 'NGO',   icon: <Building2 size={14} color="#60A5FA" />,      label: 'NGO' },
              { role: 'ADMIN', icon: <ShieldCheck size={14} color="#FBBF24" />,    label: 'Admin' },
            ].map(r => (
              <button key={r.role} type="button" onClick={() => fillDemo(r.role)}
                className="btn btn-secondary"
                style={{ flexDirection: 'column', padding: '8px', fontSize: '0.75rem', gap: '4px' }}>
                {r.icon} {r.label}
              </button>
            ))}
          </div>
        </div>

        <p style={{ textAlign: 'center', marginTop: '18px', fontSize: '0.85rem', color: '#9CA3AF' }}>
          No account?{' '}
          <Link to="/register" style={{ color: '#10B981', fontWeight: 600, textDecoration: 'none' }}>
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
