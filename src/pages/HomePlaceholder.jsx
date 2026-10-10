import React, { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import API from '../api/axios';
import { CheckCircle2, User, ShieldCheck, Database, Key, ArrowRight, RefreshCw, AlertCircle } from 'lucide-react';

const HomePlaceholder = () => {
  const { user, token, logout } = useContext(AuthContext);
  const [apiResponse, setApiResponse] = useState(null);
  const [loadingApi, setLoadingApi] = useState(false);

  const testAuthApi = async () => {
    setLoadingApi(true);
    try {
      const res = await API.get('/auth/me');
      setApiResponse(res.data);
    } catch (err) {
      setApiResponse({
        error: true,
        message: err.response?.data?.message || err.message,
      });
    }
    setLoadingApi(false);
  };

  return (
    <div style={{ maxWidth: '960px', margin: '40px auto', padding: '0 20px' }}>
      {/* Banner */}
      <div className="glass-card" style={{ padding: '32px', marginBottom: '28px', borderLeft: '4px solid #10B981' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '20px', flexWrap: 'wrap' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <span className="badge badge-donor" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                <CheckCircle2 size={14} /> STEP 1 COMPLETED
              </span>
              <span style={{ fontSize: '0.85rem', color: '#9CA3AF' }}>Authentication & JWT Auth System</span>
            </div>
            <h1 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '12px', color: '#ffffff' }}>
              Welcome, {user?.name}! 👋
            </h1>
            <p style={{ color: '#9CA3AF', fontSize: '1rem', maxWidth: '650px', lineHeight: 1.6 }}>
              You are logged in as a <strong>{user?.role}</strong>. Your JWT authentication token is verified and active.
            </p>
          </div>

          <div style={{ textAlign: 'right' }}>
            <button onClick={logout} className="btn btn-secondary" style={{ fontSize: '0.85rem' }}>
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Grid status view */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '28px' }}>
        {/* Profile Card */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: '#34D399' }}>
            <User size={20} /> Authenticated User Record
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.9rem' }}>
            <div>
              <span style={{ color: '#9CA3AF', display: 'block', fontSize: '0.78rem' }}>User ID</span>
              <code style={{ background: 'rgba(255,255,255,0.08)', padding: '2px 6px', borderRadius: '4px', fontSize: '0.8rem' }}>
                {user?._id}
              </code>
            </div>
            <div>
              <span style={{ color: '#9CA3AF', display: 'block', fontSize: '0.78rem' }}>Full Name</span>
              <strong style={{ color: '#F9FAFB' }}>{user?.name}</strong>
            </div>
            <div>
              <span style={{ color: '#9CA3AF', display: 'block', fontSize: '0.78rem' }}>Email Address</span>
              <span style={{ color: '#F9FAFB' }}>{user?.email}</span>
            </div>
            <div>
              <span style={{ color: '#9CA3AF', display: 'block', fontSize: '0.78rem' }}>Role</span>
              <span className={`badge ${user?.role === 'ADMIN' ? 'badge-admin' : user?.role === 'NGO' ? 'badge-ngo' : 'badge-donor'}`}>
                {user?.role}
              </span>
            </div>

            {user?.role === 'NGO' && (
              <div style={{ marginTop: '8px', padding: '10px', background: 'rgba(59,130,246,0.1)', borderRadius: '8px', border: '1px solid rgba(59,130,246,0.2)' }}>
                <span style={{ fontSize: '0.75rem', color: '#60A5FA', display: 'block' }}>Organization: {user?.organizationName}</span>
                <span style={{ fontSize: '0.75rem', color: '#60A5FA', display: 'block' }}>Reg #: {user?.registrationNumber}</span>
                <span style={{ fontSize: '0.75rem', color: user?.isApproved ? '#34D399' : '#F59E0B', display: 'block', marginTop: '4px', fontWeight: 'bold' }}>
                  Approval Status: {user?.isApproved ? 'Approved ✅' : 'Pending Admin Approval ⏳'}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Security & Token Info */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: '#60A5FA' }}>
            <Key size={20} /> JWT Session & Bearer Header
          </h3>
          <p style={{ fontSize: '0.85rem', color: '#9CA3AF', marginBottom: '12px' }}>
            JWT Bearer token automatically attached by Axios interceptors to all backend requests:
          </p>
          <div style={{
            background: 'rgba(0,0,0,0.3)',
            padding: '12px',
            borderRadius: '8px',
            border: '1px solid rgba(255,255,255,0.1)',
            wordBreak: 'break-all',
            fontFamily: 'monospace',
            fontSize: '0.75rem',
            color: '#A7F3D0',
            maxHeight: '110px',
            overflowY: 'auto'
          }}>
            {token}
          </div>

          <button
            onClick={testAuthApi}
            className="btn btn-secondary"
            style={{ width: '100%', marginTop: '16px', fontSize: '0.85rem' }}
            disabled={loadingApi}
          >
            {loadingApi ? (
              <RefreshCw size={14} className="spin" />
            ) : (
              <RefreshCw size={14} />
            )}
            Test /api/auth/me Endpoint
          </button>
        </div>
      </div>

      {/* Live API response viewer */}
      {apiResponse && (
        <div className="glass-card" style={{ padding: '20px', marginBottom: '28px' }}>
          <h4 style={{ fontSize: '0.95rem', marginBottom: '10px', color: '#FBBF24', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Database size={16} /> Server Response from GET /api/auth/me:
          </h4>
          <pre style={{
            background: 'rgba(0, 0, 0, 0.4)',
            padding: '12px',
            borderRadius: '8px',
            fontSize: '0.8rem',
            color: '#34D399',
            overflowX: 'auto'
          }}>
            {JSON.stringify(apiResponse, null, 2)}
          </pre>
        </div>
      )}

      {/* Next Modules Roadmap */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.1rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ArrowRight size={20} color="#10B981" /> System Module Roadmap
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
          <div style={{ padding: '12px', background: 'rgba(16,185,129,0.15)', borderRadius: '8px', border: '1px solid rgba(16,185,129,0.4)' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#34D399' }}>STEP 1 (Current)</span>
            <p style={{ fontSize: '0.85rem', color: '#ffffff', fontWeight: 'bold' }}>Login & Registration</p>
            <p style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>MongoDB, User Schema, JWT, bcrypt, Auth Forms</p>
          </div>

          <div style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#9CA3AF' }}>STEP 2</span>
            <p style={{ fontSize: '0.85rem', color: '#E5E7EB' }}>Role-Based Dashboards</p>
            <p style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>DONOR, NGO & ADMIN custom views</p>
          </div>

          <div style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#9CA3AF' }}>STEPS 3 - 10</span>
            <p style={{ fontSize: '0.85rem', color: '#E5E7EB' }}>Donations, Claims & Analytics</p>
            <p style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>Food rescue workflow & impact reports</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePlaceholder;
