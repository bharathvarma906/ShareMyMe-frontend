import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import API from '../api/axios';
import { HeartHandshake, PlusCircle, Clock, Bell, Package, MapPin, Sparkles, X, AlertCircle, CheckCircle2, XCircle, Loader2 } from 'lucide-react';

const statusColors = {
  AVAILABLE: { bg: 'rgba(16,185,129,0.15)', border: 'rgba(16,185,129,0.4)', color: '#34D399' },
  CLAIMED: { bg: 'rgba(59,130,246,0.15)', border: 'rgba(59,130,246,0.4)', color: '#60A5FA' },
  COLLECTING: { bg: 'rgba(245,158,11,0.15)', border: 'rgba(245,158,11,0.4)', color: '#FBBF24' },
  COLLECTED: { bg: 'rgba(139,92,246,0.15)', border: 'rgba(139,92,246,0.4)', color: '#A78BFA' },
  DISTRIBUTED: { bg: 'rgba(16,185,129,0.2)', border: 'rgba(16,185,129,0.5)', color: '#6EE7B7' },
  EXPIRED: { bg: 'rgba(239,68,68,0.15)', border: 'rgba(239,68,68,0.4)', color: '#FCA5A5' },
  CANCELLED: { bg: 'rgba(107,114,128,0.15)', border: 'rgba(107,114,128,0.4)', color: '#9CA3AF' },
};

const DonorDashboard = () => {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('overview');
  const [donations, setDonations] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ text: '', type: '' });

  const [form, setForm] = useState({
    foodName: '', category: 'RICE', quantity: '', unit: 'MEALS',
    description: '', expiryTime: '', pickupAddress: user?.address || '', pickupCity: '',
  });

  const fetchDonations = async () => {
    setLoading(true);
    try {
      const res = await API.get('/donations/my');
      if (res.data.success) setDonations(res.data.data);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const fetchNotifications = async () => {
    try {
      const res = await API.get('/notifications');
      if (res.data.success) { setNotifications(res.data.data); setUnreadCount(res.data.unreadCount); }
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchDonations(); fetchNotifications(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setMsg({ text: '', type: '' });
    if (!form.foodName || !form.quantity || !form.expiryTime || !form.pickupAddress) {
      setMsg({ text: 'Please fill all required fields', type: 'error' }); return;
    }
    if (new Date(form.expiryTime) <= new Date()) {
      setMsg({ text: 'Expiry time must be in the future', type: 'error' }); return;
    }
    setLoading(true);
    try {
      const res = await API.post('/donations', { ...form, quantity: Number(form.quantity) });
      if (res.data.success) {
        setMsg({ text: 'Donation published! NGOs in your area have been notified.', type: 'success' });
        setForm({ foodName: '', category: 'RICE', quantity: '', unit: 'MEALS', description: '', expiryTime: '', pickupAddress: user?.address || '', pickupCity: '' });
        fetchDonations();
      }
    } catch (err) { setMsg({ text: err.response?.data?.message || 'Failed to create', type: 'error' }); }
    setLoading(false);
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this donation?')) return;
    try {
      const res = await API.patch(`/donations/${id}/cancel`);
      if (res.data.success) fetchDonations();
    } catch (err) { console.error(err); }
  };

  const markAllRead = async () => {
    try {
      await API.patch('/notifications/read-all');
      fetchNotifications();
    } catch (err) { console.error(err); }
  };

  const stats = {
    total: donations.length,
    available: donations.filter(d => d.status === 'AVAILABLE').length,
    claimed: donations.filter(d => d.status === 'CLAIMED').length,
    distributed: donations.filter(d => d.status === 'DISTRIBUTED').length,
    totalMeals: donations.reduce((s, d) => s + d.quantity, 0),
  };

  const sideItems = [
    { key: 'overview', icon: <Package size={18} />, label: 'Dashboard' },
    { key: 'create', icon: <PlusCircle size={18} />, label: 'Create Donation' },
    { key: 'my-donations', icon: <HeartHandshake size={18} />, label: 'My Donations' },
    { key: 'notifications', icon: <Bell size={18} />, label: `Notifications${unreadCount ? ` (${unreadCount})` : ''}` },
  ];

  return (
    <div style={{ maxWidth: '1200px', margin: '20px auto', padding: '0 20px' }}>
      {/* Banner */}
      <div className="glass-card" style={{ padding: '24px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span className="badge badge-donor"><Sparkles size={12} /> DONOR PORTAL</span>
          </div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: '800' }}>Welcome, {user?.name} 🍲</h1>
          <p style={{ color: '#9CA3AF', fontSize: '0.9rem' }}>Share surplus food and track your impact</p>
        </div>
        <button onClick={() => setActiveTab('create')} className="btn btn-primary"><PlusCircle size={18} /> Create Donation</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '20px' }}>
        {/* Sidebar */}
        <div className="glass-card" style={{ padding: '14px', height: 'fit-content' }}>
          {sideItems.map(item => (
            <button key={item.key} onClick={() => setActiveTab(item.key)}
              className={`btn ${activeTab === item.key ? 'btn-primary' : 'btn-secondary'}`}
              style={{ justifyContent: 'flex-start', width: '100%', padding: '10px 14px', marginBottom: '6px', textAlign: 'left' }}>
              {item.icon} {item.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div>
          {/* OVERVIEW */}
          {activeTab === 'overview' && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '14px', marginBottom: '20px' }}>
                {[
                  { label: 'Total Donations', value: stats.total, color: '#34D399' },
                  { label: 'Available Now', value: stats.available, color: '#60A5FA' },
                  { label: 'Claimed by NGOs', value: stats.claimed, color: '#FBBF24' },
                  { label: 'Distributed', value: stats.distributed, color: '#A78BFA' },
                  { label: 'Total Meals Shared', value: stats.totalMeals, color: '#F472B6' },
                ].map((s, i) => (
                  <div key={i} className="glass-card" style={{ padding: '16px' }}>
                    <span style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>{s.label}</span>
                    <div style={{ fontSize: '1.8rem', fontWeight: '800', color: s.color }}>{s.value}</div>
                  </div>
                ))}
              </div>
              {/* Recent Donations */}
              <div className="glass-card" style={{ padding: '20px' }}>
                <h3 style={{ marginBottom: '14px', fontSize: '1rem' }}><Package size={18} color="#10B981" /> Recent Donations</h3>
                {donations.length === 0 ? (
                  <p style={{ color: '#9CA3AF', textAlign: 'center', padding: '20px' }}>No donations yet. Create your first one!</p>
                ) : (
                  donations.slice(0, 5).map(d => {
                    const sc = statusColors[d.status] || statusColors.AVAILABLE;
                    return (
                      <div key={d._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', borderBottom: '1px solid rgba(255,255,255,0.06)', flexWrap: 'wrap', gap: '8px' }}>
                        <div>
                          <strong style={{ color: '#fff' }}>{d.foodName}</strong>
                          <span style={{ fontSize: '0.8rem', color: '#9CA3AF', display: 'block' }}>{d.quantity} {d.unit} • {d.pickupAddress}</span>
                        </div>
                        <span style={{ padding: '4px 10px', borderRadius: '12px', fontSize: '0.72rem', fontWeight: 700, background: sc.bg, border: `1px solid ${sc.border}`, color: sc.color }}>{d.status}</span>
                      </div>
                    );
                  })
                )}
              </div>
            </>
          )}

          {/* CREATE DONATION */}
          {activeTab === 'create' && (
            <div className="glass-card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '16px', color: '#10B981' }}><PlusCircle size={20} /> Create Food Donation</h3>
              {msg.text && <div className={`alert alert-${msg.type}`}>{msg.text}</div>}
              <form onSubmit={handleCreate}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="form-group">
                    <label className="form-label">Food Name *</label>
                    <input className="form-input" placeholder="e.g. Biryani & Raita" value={form.foodName} onChange={e => setForm({ ...form, foodName: e.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <select className="form-select" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                      <option value="RICE">Rice & Grains</option><option value="CURRY">Curry & Cooked Meals</option>
                      <option value="BAKERY">Bread & Bakery</option><option value="PACKAGED">Packaged Food</option>
                      <option value="FRUITS">Fruits & Vegetables</option><option value="DAIRY">Dairy</option>
                      <option value="BEVERAGES">Beverages</option><option value="OTHER">Other</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Quantity *</label>
                    <input type="number" min="1" className="form-input" placeholder="e.g. 50" value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Unit</label>
                    <select className="form-select" value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })}>
                      <option value="MEALS">Meals</option><option value="KG">Kilograms</option>
                      <option value="LITERS">Liters</option><option value="PACKETS">Packets</option><option value="BOXES">Boxes</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Expiry Date & Time *</label>
                    <input type="datetime-local" className="form-input" value={form.expiryTime} onChange={e => setForm({ ...form, expiryTime: e.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">City</label>
                    <input className="form-input" placeholder="e.g. Hyderabad" value={form.pickupCity} onChange={e => setForm({ ...form, pickupCity: e.target.value })} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Pickup Address *</label>
                  <input className="form-input" placeholder="Full address" value={form.pickupAddress} onChange={e => setForm({ ...form, pickupAddress: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Description / Notes</label>
                  <textarea className="form-textarea" rows={3} placeholder="Allergen info, storage details..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}></textarea>
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '8px' }} disabled={loading}>
                  {loading ? <><Loader2 size={18} /> Publishing...</> : 'Publish Donation'}
                </button>
              </form>
            </div>
          )}

          {/* MY DONATIONS */}
          {activeTab === 'my-donations' && (
            <div className="glass-card" style={{ padding: '20px' }}>
              <h3 style={{ marginBottom: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span><HeartHandshake size={18} color="#10B981" /> My Donations ({donations.length})</span>
                <button onClick={fetchDonations} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>Refresh</button>
              </h3>
              {donations.length === 0 ? (
                <p style={{ color: '#9CA3AF', textAlign: 'center', padding: '30px' }}>No donations found. Start by creating one!</p>
              ) : (
                donations.map(d => {
                  const sc = statusColors[d.status] || statusColors.AVAILABLE;
                  return (
                    <div key={d._id} className="glass-card" style={{ padding: '16px', marginBottom: '12px', borderLeft: `3px solid ${sc.color}` }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                        <div>
                          <h4 style={{ color: '#fff', marginBottom: '4px' }}>{d.foodName}</h4>
                          <p style={{ fontSize: '0.8rem', color: '#9CA3AF' }}>
                            {d.quantity} {d.unit} • {d.category} • <MapPin size={12} style={{ display: 'inline' }} /> {d.pickupAddress}
                          </p>
                          <p style={{ fontSize: '0.75rem', color: '#9CA3AF', marginTop: '4px' }}>
                            Expires: {new Date(d.expiryTime).toLocaleString()}
                          </p>
                          {d.claimedBy && (
                            <p style={{ fontSize: '0.8rem', color: '#60A5FA', marginTop: '4px' }}>
                              Claimed by: {d.claimedBy.organizationName || d.claimedBy.name}
                            </p>
                          )}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'flex-end' }}>
                          <span style={{ padding: '4px 10px', borderRadius: '12px', fontSize: '0.72rem', fontWeight: 700, background: sc.bg, border: `1px solid ${sc.border}`, color: sc.color }}>{d.status}</span>
                          {d.status === 'AVAILABLE' && (
                            <button onClick={() => handleCancel(d._id)} className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: '0.75rem', color: '#FCA5A5' }}>
                              <XCircle size={14} /> Cancel
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
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
                <p style={{ color: '#9CA3AF', textAlign: 'center', padding: '30px' }}>No notifications yet.</p>
              ) : (
                notifications.map(n => (
                  <div key={n._id} style={{
                    padding: '12px', marginBottom: '8px', borderRadius: '8px',
                    background: n.isRead ? 'rgba(255,255,255,0.02)' : 'rgba(16,185,129,0.08)',
                    borderLeft: n.isRead ? '3px solid rgba(255,255,255,0.1)' : '3px solid #10B981',
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
      </div>
    </div>
  );
};

export default DonorDashboard;
