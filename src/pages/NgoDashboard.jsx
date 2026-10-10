import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import API from '../api/axios';
import { Building2, Search, MapPin, Clock, ShieldAlert, CheckCircle2, Truck, Bell, Package, Loader2, ClipboardList } from 'lucide-react';

const statusColors = {
  AVAILABLE: { bg: 'rgba(16,185,129,0.15)', border: 'rgba(16,185,129,0.4)', color: '#34D399' },
  CLAIMED: { bg: 'rgba(59,130,246,0.15)', border: 'rgba(59,130,246,0.4)', color: '#60A5FA' },
  COLLECTING: { bg: 'rgba(245,158,11,0.15)', border: 'rgba(245,158,11,0.4)', color: '#FBBF24' },
  COLLECTED: { bg: 'rgba(139,92,246,0.15)', border: 'rgba(139,92,246,0.4)', color: '#A78BFA' },
  DISTRIBUTED: { bg: 'rgba(16,185,129,0.2)', border: 'rgba(16,185,129,0.5)', color: '#6EE7B7' },
  EXPIRED: { bg: 'rgba(239,68,68,0.15)', border: 'rgba(239,68,68,0.4)', color: '#FCA5A5' },
  CANCELLED: { bg: 'rgba(107,114,128,0.15)', border: 'rgba(107,114,128,0.4)', color: '#9CA3AF' },
};

const NgoDashboard = () => {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('available');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [availableDonations, setAvailableDonations] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [distributions, setDistributions] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ text: '', type: '' });

  // Distribution form
  const [distForm, setDistForm] = useState({ assignmentId: '', quantityDistributed: '', peopleServed: '', location: '', remarks: '' });
  const [showDistForm, setShowDistForm] = useState(false);

  const fetchAvailable = async () => {
    setLoading(true);
    try {
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (categoryFilter) params.category = categoryFilter;
      const res = await API.get('/donations/available', { params });
      if (res.data.success) setAvailableDonations(res.data.data);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const fetchAssignments = async () => {
    try {
      const res = await API.get('/assignments/my');
      if (res.data.success) setAssignments(res.data.data);
    } catch (err) { console.error(err); }
  };

  const fetchDistributions = async () => {
    try {
      const res = await API.get('/distribution/my');
      if (res.data.success) setDistributions(res.data.data);
    } catch (err) { console.error(err); }
  };

  const fetchNotifications = async () => {
    try {
      const res = await API.get('/notifications');
      if (res.data.success) { setNotifications(res.data.data); setUnreadCount(res.data.unreadCount); }
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchAvailable(); fetchAssignments(); fetchDistributions(); fetchNotifications(); }, []);

  const handleClaim = async (donationId) => {
    if (!window.confirm('Claim this donation for collection?')) return;
    setMsg({ text: '', type: '' });
    try {
      const res = await API.post(`/assignments/claim/${donationId}`);
      if (res.data.success) {
        setMsg({ text: 'Donation claimed successfully! Proceed to collect.', type: 'success' });
        fetchAvailable(); fetchAssignments();
      }
    } catch (err) { setMsg({ text: err.response?.data?.message || 'Claim failed', type: 'error' }); }
  };

  const handleCollect = async (assignmentId) => {
    if (!window.confirm('Mark as collected?')) return;
    try {
      const res = await API.patch(`/assignments/${assignmentId}/collect`, { remarks: 'Food collected on time' });
      if (res.data.success) { setMsg({ text: 'Marked as collected!', type: 'success' }); fetchAssignments(); }
    } catch (err) { setMsg({ text: err.response?.data?.message || 'Error', type: 'error' }); }
  };

  const handleDistribute = async (e) => {
    e.preventDefault();
    if (!distForm.assignmentId || !distForm.quantityDistributed || !distForm.peopleServed || !distForm.location) {
      setMsg({ text: 'Fill all required distribution fields', type: 'error' }); return;
    }
    try {
      const res = await API.post('/distribution', {
        ...distForm, quantityDistributed: Number(distForm.quantityDistributed), peopleServed: Number(distForm.peopleServed),
      });
      if (res.data.success) {
        setMsg({ text: 'Distribution logged successfully!', type: 'success' });
        setShowDistForm(false);
        setDistForm({ assignmentId: '', quantityDistributed: '', peopleServed: '', location: '', remarks: '' });
        fetchAssignments(); fetchDistributions();
      }
    } catch (err) { setMsg({ text: err.response?.data?.message || 'Error', type: 'error' }); }
  };

  const markAllRead = async () => {
    try { await API.patch('/notifications/read-all'); fetchNotifications(); } catch (err) { console.error(err); }
  };

  const claimedAssignments = assignments.filter(a => a.status === 'CLAIMED');
  const collectedAssignments = assignments.filter(a => a.status === 'COLLECTED');

  const tabs = [
    { key: 'available', label: `Available (${availableDonations.length})` },
    { key: 'claimed', label: `Claimed (${claimedAssignments.length})` },
    { key: 'collected', label: `Collected (${collectedAssignments.length})` },
    { key: 'distributed', label: `Distributed (${distributions.length})` },
    { key: 'notifications', label: `Notifications${unreadCount ? ` (${unreadCount})` : ''}` },
  ];

  return (
    <div style={{ maxWidth: '1200px', margin: '20px auto', padding: '0 20px' }}>
      {/* Pending approval banner */}
      {user && !user.isApproved && (
        <div className="alert alert-info" style={{ marginBottom: '16px', borderLeft: '4px solid #F59E0B' }}>
          <ShieldAlert size={20} color="#F59E0B" />
          <div>
            <strong style={{ color: '#FBBF24' }}>Account Pending Admin Review</strong>
            <p style={{ fontSize: '0.85rem' }}>Your NGO registration is under admin review. Once approved, you can claim donations.</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="glass-card" style={{ padding: '24px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <span className="badge badge-ngo"><Building2 size={12} /> NGO PARTNER</span>
            <h1 style={{ fontSize: '1.6rem', fontWeight: '800', marginTop: '6px' }}>{user?.organizationName || user?.name} 🏛️</h1>
            <p style={{ color: '#9CA3AF', fontSize: '0.9rem' }}>Reg #: {user?.registrationNumber || 'N/A'}</p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <div style={{ background: 'rgba(59,130,246,0.15)', padding: '10px 16px', borderRadius: '10px', border: '1px solid rgba(59,130,246,0.3)' }}>
              <span style={{ fontSize: '0.7rem', color: '#60A5FA', display: 'block' }}>Active Claims</span>
              <span style={{ fontSize: '1.3rem', fontWeight: 800, color: '#fff' }}>{claimedAssignments.length}</span>
            </div>
            <div style={{ background: 'rgba(16,185,129,0.15)', padding: '10px 16px', borderRadius: '10px', border: '1px solid rgba(16,185,129,0.3)' }}>
              <span style={{ fontSize: '0.7rem', color: '#34D399', display: 'block' }}>People Served</span>
              <span style={{ fontSize: '1.3rem', fontWeight: 800, color: '#fff' }}>{distributions.reduce((s, d) => s + d.peopleServed, 0)}</span>
            </div>
          </div>
        </div>
      </div>

      {msg.text && <div className={`alert alert-${msg.type}`} style={{ marginBottom: '16px' }}>{msg.text}</div>}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', overflowX: 'auto', paddingBottom: '8px' }}>
        {tabs.map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            className={`btn ${activeTab === t.key ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '8px 16px', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>{t.label}</button>
        ))}
      </div>

      {/* AVAILABLE */}
      {activeTab === 'available' && (
        <>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <input className="form-input" placeholder="Search food name..." value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)} onKeyDown={e => e.key === 'Enter' && fetchAvailable()}
                style={{ paddingLeft: '38px' }} />
              <Search size={16} color="#9CA3AF" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
            <select className="form-select" style={{ width: '160px' }} value={categoryFilter} onChange={e => { setCategoryFilter(e.target.value); }}>
              <option value="">All Categories</option>
              <option value="RICE">Rice</option><option value="CURRY">Curry</option><option value="BAKERY">Bakery</option>
              <option value="PACKAGED">Packaged</option><option value="FRUITS">Fruits</option><option value="OTHER">Other</option>
            </select>
            <button onClick={fetchAvailable} className="btn btn-secondary" style={{ padding: '8px 14px' }}>Search</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
            {availableDonations.length === 0 ? (
              <div className="glass-card" style={{ padding: '30px', textAlign: 'center', color: '#9CA3AF', gridColumn: '1 / -1' }}>No available donations found.</div>
            ) : (
              availableDonations.map(d => (
                <div key={d._id} className="glass-card" style={{ padding: '18px', borderLeft: '4px solid #10B981' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <h4 style={{ color: '#fff' }}>{d.foodName}</h4>
                    <span className="badge badge-donor">{d.quantity} {d.unit}</span>
                  </div>
                  {d.description && <p style={{ fontSize: '0.82rem', color: '#9CA3AF', marginBottom: '8px' }}>{d.description}</p>}
                  <p style={{ fontSize: '0.8rem', color: '#E5E7EB', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <MapPin size={13} color="#10B981" /> {d.pickupAddress}
                  </p>
                  <p style={{ fontSize: '0.8rem', color: '#E5E7EB', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={13} color="#F59E0B" /> Expires: {new Date(d.expiryTime).toLocaleString()}
                  </p>
                  {d.donorId && <p style={{ fontSize: '0.75rem', color: '#9CA3AF', marginTop: '6px' }}>Donor: {d.donorId.name}</p>}
                  <button onClick={() => handleClaim(d._id)} className="btn btn-primary"
                    style={{ width: '100%', marginTop: '12px', fontSize: '0.85rem' }}
                    disabled={user && !user.isApproved}>
                    {user && !user.isApproved ? 'Approval Required' : 'Claim Donation'}
                  </button>
                </div>
              ))
            )}
          </div>
        </>
      )}

      {/* CLAIMED */}
      {activeTab === 'claimed' && (
        <div className="glass-card" style={{ padding: '20px' }}>
          <h3 style={{ marginBottom: '14px' }}><Truck size={18} color="#60A5FA" /> Claimed — Ready to Collect ({claimedAssignments.length})</h3>
          {claimedAssignments.length === 0 ? (
            <p style={{ color: '#9CA3AF', textAlign: 'center', padding: '20px' }}>No claimed donations pending collection.</p>
          ) : (
            claimedAssignments.map(a => (
              <div key={a._id} style={{ padding: '14px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                <div>
                  <strong style={{ color: '#fff' }}>{a.donationId?.foodName || 'Donation'}</strong>
                  <p style={{ fontSize: '0.8rem', color: '#9CA3AF' }}>
                    {a.donationId?.quantity} {a.donationId?.unit} • {a.donationId?.pickupAddress}
                  </p>
                  <p style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>Donor: {a.donationId?.donorId?.name}</p>
                </div>
                <button onClick={() => handleCollect(a._id)} className="btn btn-primary" style={{ fontSize: '0.85rem' }}>
                  <CheckCircle2 size={16} /> Mark Collected
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {/* COLLECTED */}
      {activeTab === 'collected' && (
        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h3><Package size={18} color="#A78BFA" /> Collected — Ready to Distribute ({collectedAssignments.length})</h3>
          </div>
          {collectedAssignments.length === 0 ? (
            <p style={{ color: '#9CA3AF', textAlign: 'center', padding: '20px' }}>No collected food pending distribution.</p>
          ) : (
            collectedAssignments.map(a => (
              <div key={a._id} style={{ padding: '14px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                <div>
                  <strong style={{ color: '#fff' }}>{a.donationId?.foodName || 'Donation'}</strong>
                  <p style={{ fontSize: '0.8rem', color: '#9CA3AF' }}>{a.donationId?.quantity} {a.donationId?.unit}</p>
                </div>
                <button onClick={() => { setDistForm({ ...distForm, assignmentId: a._id, quantityDistributed: String(a.donationId?.quantity || ''), location: '' }); setShowDistForm(true); }}
                  className="btn btn-primary" style={{ fontSize: '0.85rem' }}>
                  <ClipboardList size={16} /> Log Distribution
                </button>
              </div>
            ))
          )}

          {/* Distribution Form Modal */}
          {showDistForm && (
            <div style={{ marginTop: '20px', padding: '20px', background: 'rgba(139,92,246,0.1)', borderRadius: '12px', border: '1px solid rgba(139,92,246,0.3)' }}>
              <h4 style={{ color: '#A78BFA', marginBottom: '12px' }}><ClipboardList size={16} /> Log Distribution Report</h4>
              <form onSubmit={handleDistribute}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">Quantity Distributed *</label>
                    <input type="number" min="1" className="form-input" value={distForm.quantityDistributed}
                      onChange={e => setDistForm({ ...distForm, quantityDistributed: e.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">People Served *</label>
                    <input type="number" min="1" className="form-input" value={distForm.peopleServed}
                      onChange={e => setDistForm({ ...distForm, peopleServed: e.target.value })} required />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Distribution Location *</label>
                  <input className="form-input" placeholder="e.g. Community center, Hyderabad" value={distForm.location}
                    onChange={e => setDistForm({ ...distForm, location: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Remarks</label>
                  <textarea className="form-textarea" rows={2} placeholder="Impact notes..." value={distForm.remarks}
                    onChange={e => setDistForm({ ...distForm, remarks: e.target.value })}></textarea>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button type="submit" className="btn btn-primary">Submit Distribution Log</button>
                  <button type="button" onClick={() => setShowDistForm(false)} className="btn btn-secondary">Cancel</button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {/* DISTRIBUTED */}
      {activeTab === 'distributed' && (
        <div className="glass-card" style={{ padding: '20px' }}>
          <h3 style={{ marginBottom: '14px' }}><CheckCircle2 size={18} color="#6EE7B7" /> Distribution Logs ({distributions.length})</h3>
          {distributions.length === 0 ? (
            <p style={{ color: '#9CA3AF', textAlign: 'center', padding: '20px' }}>No distribution logs yet.</p>
          ) : (
            distributions.map(dl => (
              <div key={dl._id} style={{ padding: '14px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <strong style={{ color: '#fff' }}>{dl.donationId?.foodName || 'Food'}</strong>
                <p style={{ fontSize: '0.82rem', color: '#9CA3AF' }}>
                  Distributed: {dl.quantityDistributed} units • Served: {dl.peopleServed} people • Location: {dl.location}
                </p>
                {dl.remarks && <p style={{ fontSize: '0.78rem', color: '#A78BFA', fontStyle: 'italic' }}>"{dl.remarks}"</p>}
                <span style={{ fontSize: '0.7rem', color: '#6B7280' }}>{new Date(dl.distributionDate).toLocaleString()}</span>
              </div>
            ))
          )}
        </div>
      )}

      {/* NOTIFICATIONS */}
      {activeTab === 'notifications' && (
        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h3><Bell size={18} color="#FBBF24" /> Notifications ({unreadCount} unread)</h3>
            {unreadCount > 0 && <button onClick={markAllRead} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>Mark all read</button>}
          </div>
          {notifications.length === 0 ? (
            <p style={{ color: '#9CA3AF', textAlign: 'center', padding: '20px' }}>No notifications.</p>
          ) : (
            notifications.map(n => (
              <div key={n._id} style={{
                padding: '12px', marginBottom: '8px', borderRadius: '8px',
                background: n.isRead ? 'rgba(255,255,255,0.02)' : 'rgba(59,130,246,0.08)',
                borderLeft: n.isRead ? '3px solid rgba(255,255,255,0.1)' : '3px solid #3B82F6',
              }}>
                <strong style={{ color: '#fff', fontSize: '0.9rem' }}>{n.title}</strong>
                <p style={{ fontSize: '0.82rem', color: '#9CA3AF', marginTop: '2px' }}>{n.message}</p>
                <span style={{ fontSize: '0.7rem', color: '#6B7280' }}>{new Date(n.createdAt).toLocaleString()}</span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default NgoDashboard;
