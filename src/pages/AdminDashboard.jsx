import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import API from '../api/axios';
import {
  ShieldCheck, Users, Building2, HeartHandshake, CheckCircle2, XCircle, Bell,
  BarChart3, Package, TrendingUp, Award, Loader2
} from 'lucide-react';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('overview');
  const [users, setUsers] = useState([]);
  const [userStats, setUserStats] = useState({ totalUsers: 0, totalDonors: 0, totalNgos: 0, pendingNgos: 0 });
  const [donations, setDonations] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [distributionLogs, setDistributionLogs] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ text: '', type: '' });

  const fetchUsers = async () => {
    try {
      const res = await API.get('/auth/admin/users');
      if (res.data.success) { setUsers(res.data.data); setUserStats(res.data.stats); }
    } catch (err) { console.error(err); }
  };

  const fetchDonations = async () => {
    try {
      const res = await API.get('/donations/all');
      if (res.data.success) setDonations(res.data.data);
    } catch (err) { console.error(err); }
  };

  const fetchAssignments = async () => {
    try {
      const res = await API.get('/assignments/all');
      if (res.data.success) setAssignments(res.data.data);
    } catch (err) { console.error(err); }
  };

  const fetchDistributions = async () => {
    try {
      const res = await API.get('/distribution/all');
      if (res.data.success) setDistributionLogs(res.data.data);
    } catch (err) { console.error(err); }
  };

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await API.get('/analytics');
      if (res.data.success) setAnalytics(res.data.data);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const fetchNotifications = async () => {
    try {
      const res = await API.get('/notifications');
      if (res.data.success) { setNotifications(res.data.data); setUnreadCount(res.data.unreadCount); }
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    fetchUsers(); fetchDonations(); fetchAssignments(); fetchDistributions(); fetchAnalytics(); fetchNotifications();
  }, []);

  const handleApproveNgo = async (id, approve) => {
    try {
      const res = await API.patch(`/auth/admin/approve-ngo/${id}`, { approve });
      if (res.data.success) {
        setMsg({ text: res.data.message, type: 'success' });
        fetchUsers();
      }
    } catch (err) { setMsg({ text: err.response?.data?.message || 'Error', type: 'error' }); }
  };

  const markAllRead = async () => {
    try { await API.patch('/notifications/read-all'); fetchNotifications(); } catch (err) { console.error(err); }
  };

  const pendingNgoList = users.filter(u => u.role === 'NGO' && !u.isApproved);

  const tabs = [
    { key: 'overview', icon: <BarChart3 size={16} />, label: 'Overview' },
    { key: 'users', icon: <Users size={16} />, label: `Users (${users.length})` },
    { key: 'ngo-approvals', icon: <Building2 size={16} />, label: `NGO Approvals (${pendingNgoList.length})` },
    { key: 'donations', icon: <Package size={16} />, label: `Donations (${donations.length})` },
    { key: 'assignments', icon: <HeartHandshake size={16} />, label: `Assignments (${assignments.length})` },
    { key: 'distributions', icon: <CheckCircle2 size={16} />, label: `Distributions (${distributionLogs.length})` },
    { key: 'analytics', icon: <TrendingUp size={16} />, label: 'Analytics' },
    { key: 'notifications', icon: <Bell size={16} />, label: `Notifications${unreadCount ? ` (${unreadCount})` : ''}` },
  ];

  return (
    <div style={{ maxWidth: '1300px', margin: '20px auto', padding: '0 20px' }}>
      {/* Header */}
      <div className="glass-card" style={{ padding: '24px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <span className="badge badge-admin"><ShieldCheck size={12} /> ADMIN CONTROL CENTER</span>
            <h1 style={{ fontSize: '1.6rem', fontWeight: '800', marginTop: '6px' }}>Welcome, {user?.name} ⚡</h1>
            <p style={{ color: '#9CA3AF', fontSize: '0.9rem' }}>Full platform oversight and NGO partner management</p>
          </div>
        </div>
      </div>

      {msg.text && <div className={`alert alert-${msg.type}`} style={{ marginBottom: '14px' }}>{msg.text}</div>}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '16px', overflowX: 'auto', paddingBottom: '8px' }}>
        {tabs.map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            className={`btn ${activeTab === t.key ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '8px 14px', fontSize: '0.82rem', whiteSpace: 'nowrap' }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* OVERVIEW */}
      {activeTab === 'overview' && analytics && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '14px', marginBottom: '20px' }}>
            {[
              { label: 'Total Users', value: analytics.users.totalUsers, color: '#34D399' },
              { label: 'Donors', value: analytics.users.totalDonors, color: '#60A5FA' },
              { label: 'Approved NGOs', value: analytics.users.approvedNgos, color: '#A78BFA' },
              { label: 'Pending NGOs', value: analytics.users.pendingNgos, color: '#FBBF24' },
              { label: 'Total Donations', value: analytics.donations.totalDonations, color: '#F472B6' },
              { label: 'Available', value: analytics.donations.availableDonations, color: '#34D399' },
              { label: 'Distributed', value: analytics.donations.distributedDonations, color: '#6EE7B7' },
              { label: 'Total Meals', value: analytics.donations.totalMealsDonated, color: '#FBBF24' },
              { label: 'People Served', value: analytics.distribution.totalPeopleServed, color: '#F472B6' },
              { label: 'Expired', value: analytics.donations.expiredDonations, color: '#FCA5A5' },
            ].map((s, i) => (
              <div key={i} className="glass-card" style={{ padding: '14px' }}>
                <span style={{ fontSize: '0.72rem', color: '#9CA3AF' }}>{s.label}</span>
                <div style={{ fontSize: '1.6rem', fontWeight: '800', color: s.color }}>{s.value}</div>
              </div>
            ))}
          </div>

          {/* Category breakdown */}
          {analytics.charts.donationsByCategory.length > 0 && (
            <div className="glass-card" style={{ padding: '20px', marginBottom: '16px' }}>
              <h3 style={{ marginBottom: '14px', fontSize: '1rem' }}><Package size={16} color="#10B981" /> Donations by Food Category</h3>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {analytics.charts.donationsByCategory.map((c, i) => (
                  <div key={i} style={{ padding: '10px 16px', background: 'rgba(255,255,255,0.04)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', textAlign: 'center' }}>
                    <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#34D399' }}>{c.count}</div>
                    <div style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>{c._id}</div>
                    <div style={{ fontSize: '0.7rem', color: '#6B7280' }}>{c.totalMeals} meals</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {activeTab === 'overview' && !analytics && (
        <div className="glass-card" style={{ padding: '40px', textAlign: 'center', color: '#9CA3AF' }}>
          <Loader2 size={32} /><p style={{ marginTop: '10px' }}>Loading analytics...</p>
        </div>
      )}

      {/* USERS */}
      {activeTab === 'users' && (
        <div className="glass-card" style={{ padding: '20px' }}>
          <h3 style={{ marginBottom: '14px' }}><Users size={18} color="#34D399" /> All Users ({users.length})</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                  <th style={{ padding: '10px', textAlign: 'left', color: '#9CA3AF' }}>Name</th>
                  <th style={{ padding: '10px', textAlign: 'left', color: '#9CA3AF' }}>Email</th>
                  <th style={{ padding: '10px', textAlign: 'left', color: '#9CA3AF' }}>Role</th>
                  <th style={{ padding: '10px', textAlign: 'left', color: '#9CA3AF' }}>Status</th>
                  <th style={{ padding: '10px', textAlign: 'left', color: '#9CA3AF' }}>Joined</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '10px', color: '#fff' }}>{u.name}</td>
                    <td style={{ padding: '10px', color: '#E5E7EB' }}>{u.email}</td>
                    <td style={{ padding: '10px' }}>
                      <span className={`badge ${u.role === 'ADMIN' ? 'badge-admin' : u.role === 'NGO' ? 'badge-ngo' : 'badge-donor'}`}>{u.role}</span>
                    </td>
                    <td style={{ padding: '10px' }}>
                      {u.role === 'NGO' ? (
                        <span style={{ color: u.isApproved ? '#34D399' : '#FBBF24', fontSize: '0.8rem' }}>
                          {u.isApproved ? '✅ Approved' : '⏳ Pending'}
                        </span>
                      ) : <span style={{ color: '#34D399', fontSize: '0.8rem' }}>✅ Active</span>}
                    </td>
                    <td style={{ padding: '10px', color: '#9CA3AF', fontSize: '0.8rem' }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* NGO APPROVALS */}
      {activeTab === 'ngo-approvals' && (
        <div className="glass-card" style={{ padding: '20px' }}>
          <h3 style={{ marginBottom: '14px' }}><Building2 size={18} color="#FBBF24" /> Pending NGO Approvals ({pendingNgoList.length})</h3>
          {pendingNgoList.length === 0 ? (
            <p style={{ color: '#9CA3AF', textAlign: 'center', padding: '20px' }}>No pending NGO registrations.</p>
          ) : (
            pendingNgoList.map(ngo => (
              <div key={ngo._id} className="glass-card" style={{ padding: '16px', marginBottom: '12px', borderLeft: '3px solid #FBBF24' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                  <div>
                    <h4 style={{ color: '#fff' }}>{ngo.organizationName || ngo.name}</h4>
                    <p style={{ fontSize: '0.82rem', color: '#9CA3AF' }}>
                      Contact: {ngo.name} • {ngo.email} • {ngo.phone || 'N/A'}
                    </p>
                    <p style={{ fontSize: '0.8rem', color: '#60A5FA' }}>
                      Reg #: {ngo.registrationNumber || 'N/A'} • Address: {ngo.address || 'N/A'}
                    </p>
                    <p style={{ fontSize: '0.75rem', color: '#6B7280' }}>Registered: {new Date(ngo.createdAt).toLocaleString()}</p>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => handleApproveNgo(ngo._id, true)} className="btn btn-primary" style={{ padding: '8px 14px', fontSize: '0.85rem' }}>
                      <CheckCircle2 size={16} /> Approve
                    </button>
                    <button onClick={() => handleApproveNgo(ngo._id, false)} className="btn btn-secondary"
                      style={{ padding: '8px 14px', fontSize: '0.85rem', color: '#FCA5A5', borderColor: 'rgba(239,68,68,0.3)' }}>
                      <XCircle size={16} /> Reject
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
          {/* Already approved NGOs */}
          <h4 style={{ marginTop: '20px', marginBottom: '10px', color: '#34D399' }}>Approved NGOs ({users.filter(u => u.role === 'NGO' && u.isApproved).length})</h4>
          {users.filter(u => u.role === 'NGO' && u.isApproved).map(ngo => (
            <div key={ngo._id} style={{ padding: '10px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong style={{ color: '#fff', fontSize: '0.9rem' }}>{ngo.organizationName || ngo.name}</strong>
                <span style={{ fontSize: '0.78rem', color: '#9CA3AF', marginLeft: '8px' }}>{ngo.email}</span>
              </div>
              <span style={{ color: '#34D399', fontSize: '0.8rem' }}>✅ Approved</span>
            </div>
          ))}
        </div>
      )}

      {/* DONATIONS */}
      {activeTab === 'donations' && (
        <div className="glass-card" style={{ padding: '20px' }}>
          <h3 style={{ marginBottom: '14px' }}><Package size={18} color="#10B981" /> All Donations ({donations.length})</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                  <th style={{ padding: '8px', textAlign: 'left', color: '#9CA3AF' }}>Food</th>
                  <th style={{ padding: '8px', textAlign: 'left', color: '#9CA3AF' }}>Qty</th>
                  <th style={{ padding: '8px', textAlign: 'left', color: '#9CA3AF' }}>Category</th>
                  <th style={{ padding: '8px', textAlign: 'left', color: '#9CA3AF' }}>Donor</th>
                  <th style={{ padding: '8px', textAlign: 'left', color: '#9CA3AF' }}>Status</th>
                  <th style={{ padding: '8px', textAlign: 'left', color: '#9CA3AF' }}>Claimed By</th>
                  <th style={{ padding: '8px', textAlign: 'left', color: '#9CA3AF' }}>Date</th>
                </tr>
              </thead>
              <tbody>
                {donations.map(d => (
                  <tr key={d._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '8px', color: '#fff' }}>{d.foodName}</td>
                    <td style={{ padding: '8px', color: '#E5E7EB' }}>{d.quantity} {d.unit}</td>
                    <td style={{ padding: '8px', color: '#9CA3AF' }}>{d.category}</td>
                    <td style={{ padding: '8px', color: '#E5E7EB' }}>{d.donorId?.name || 'N/A'}</td>
                    <td style={{ padding: '8px' }}>
                      <span style={{ padding: '2px 8px', borderRadius: '10px', fontSize: '0.72rem', fontWeight: 700,
                        background: d.status === 'DISTRIBUTED' ? 'rgba(16,185,129,0.2)' : d.status === 'AVAILABLE' ? 'rgba(59,130,246,0.2)' : 'rgba(245,158,11,0.2)',
                        color: d.status === 'DISTRIBUTED' ? '#6EE7B7' : d.status === 'AVAILABLE' ? '#60A5FA' : '#FBBF24' }}>
                        {d.status}
                      </span>
                    </td>
                    <td style={{ padding: '8px', color: '#9CA3AF' }}>{d.claimedBy?.organizationName || d.claimedBy?.name || '-'}</td>
                    <td style={{ padding: '8px', color: '#6B7280', fontSize: '0.78rem' }}>{new Date(d.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ASSIGNMENTS */}
      {activeTab === 'assignments' && (
        <div className="glass-card" style={{ padding: '20px' }}>
          <h3 style={{ marginBottom: '14px' }}><HeartHandshake size={18} color="#60A5FA" /> All Assignments ({assignments.length})</h3>
          {assignments.length === 0 ? (
            <p style={{ color: '#9CA3AF', textAlign: 'center', padding: '20px' }}>No assignments yet.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <th style={{ padding: '8px', textAlign: 'left', color: '#9CA3AF' }}>Donation</th>
                    <th style={{ padding: '8px', textAlign: 'left', color: '#9CA3AF' }}>Donor</th>
                    <th style={{ padding: '8px', textAlign: 'left', color: '#9CA3AF' }}>NGO</th>
                    <th style={{ padding: '8px', textAlign: 'left', color: '#9CA3AF' }}>Status</th>
                    <th style={{ padding: '8px', textAlign: 'left', color: '#9CA3AF' }}>Claimed At</th>
                  </tr>
                </thead>
                <tbody>
                  {assignments.map(a => (
                    <tr key={a._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '8px', color: '#fff' }}>{a.donationId?.foodName || 'N/A'}</td>
                      <td style={{ padding: '8px', color: '#E5E7EB' }}>{a.donorId?.name || 'N/A'}</td>
                      <td style={{ padding: '8px', color: '#E5E7EB' }}>{a.ngoId?.organizationName || a.ngoId?.name || 'N/A'}</td>
                      <td style={{ padding: '8px' }}>
                        <span style={{ padding: '2px 8px', borderRadius: '10px', fontSize: '0.72rem', fontWeight: 700,
                          background: 'rgba(59,130,246,0.2)', color: '#60A5FA' }}>
                          {a.status}
                        </span>
                      </td>
                      <td style={{ padding: '8px', color: '#6B7280', fontSize: '0.78rem' }}>{new Date(a.claimedAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* DISTRIBUTIONS */}
      {activeTab === 'distributions' && (
        <div className="glass-card" style={{ padding: '20px' }}>
          <h3 style={{ marginBottom: '14px' }}><CheckCircle2 size={18} color="#6EE7B7" /> All Distribution Logs ({distributionLogs.length})</h3>
          {distributionLogs.length === 0 ? (
            <p style={{ color: '#9CA3AF', textAlign: 'center', padding: '20px' }}>No distribution logs yet.</p>
          ) : (
            distributionLogs.map(dl => (
              <div key={dl._id} style={{ padding: '12px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                  <div>
                    <strong style={{ color: '#fff' }}>{dl.donationId?.foodName || 'Food'}</strong>
                    <span style={{ color: '#60A5FA', fontSize: '0.82rem', marginLeft: '8px' }}>by {dl.ngoId?.organizationName || dl.ngoId?.name || 'NGO'}</span>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: '#6B7280' }}>{new Date(dl.distributionDate).toLocaleString()}</span>
                </div>
                <p style={{ fontSize: '0.82rem', color: '#9CA3AF', marginTop: '4px' }}>
                  Distributed: {dl.quantityDistributed} • Served: {dl.peopleServed} people • 📍 {dl.location}
                </p>
                {dl.remarks && <p style={{ fontSize: '0.78rem', color: '#A78BFA', fontStyle: 'italic' }}>"{dl.remarks}"</p>}
              </div>
            ))
          )}
        </div>
      )}

      {/* ANALYTICS */}
      {activeTab === 'analytics' && analytics && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px', marginBottom: '16px' }}>
            {/* Donations per month chart */}
            <div className="glass-card" style={{ padding: '20px' }}>
              <h4 style={{ marginBottom: '12px', fontSize: '0.95rem' }}><TrendingUp size={16} color="#34D399" /> Donations Per Month</h4>
              {analytics.charts.donationsPerMonth.length === 0 ? (
                <p style={{ color: '#9CA3AF', fontSize: '0.85rem' }}>No data yet.</p>
              ) : (
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', height: '140px' }}>
                  {analytics.charts.donationsPerMonth.map((m, i) => {
                    const max = Math.max(...analytics.charts.donationsPerMonth.map(x => x.count), 1);
                    const h = (m.count / max) * 120;
                    return (
                      <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                        <span style={{ fontSize: '0.65rem', color: '#34D399' }}>{m.count}</span>
                        <div style={{ width: '100%', height: `${h}px`, background: 'linear-gradient(180deg, #10B981, #059669)', borderRadius: '4px 4px 0 0', minHeight: '4px' }}></div>
                        <span style={{ fontSize: '0.6rem', color: '#6B7280' }}>{MONTHS[m._id.month - 1]}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Distribution per month */}
            <div className="glass-card" style={{ padding: '20px' }}>
              <h4 style={{ marginBottom: '12px', fontSize: '0.95rem' }}><TrendingUp size={16} color="#A78BFA" /> People Served Per Month</h4>
              {analytics.charts.distributionPerMonth.length === 0 ? (
                <p style={{ color: '#9CA3AF', fontSize: '0.85rem' }}>No data yet.</p>
              ) : (
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', height: '140px' }}>
                  {analytics.charts.distributionPerMonth.map((m, i) => {
                    const max = Math.max(...analytics.charts.distributionPerMonth.map(x => x.peopleServed), 1);
                    const h = (m.peopleServed / max) * 120;
                    return (
                      <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                        <span style={{ fontSize: '0.65rem', color: '#A78BFA' }}>{m.peopleServed}</span>
                        <div style={{ width: '100%', height: `${h}px`, background: 'linear-gradient(180deg, #8B5CF6, #6D28D9)', borderRadius: '4px 4px 0 0', minHeight: '4px' }}></div>
                        <span style={{ fontSize: '0.6rem', color: '#6B7280' }}>{MONTHS[m._id.month - 1]}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Leaderboards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
            <div className="glass-card" style={{ padding: '20px' }}>
              <h4 style={{ marginBottom: '12px', fontSize: '0.95rem' }}><Award size={16} color="#FBBF24" /> Top Donors</h4>
              {analytics.leaderboard.topDonors.length === 0 ? (
                <p style={{ color: '#9CA3AF', fontSize: '0.85rem' }}>No donors yet.</p>
              ) : (
                analytics.leaderboard.topDonors.map((d, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <span style={{ color: '#fff', fontSize: '0.85rem' }}>#{i + 1} {d.donorName}</span>
                    <span style={{ color: '#FBBF24', fontSize: '0.82rem' }}>{d.totalMeals} meals ({d.donationCount} donations)</span>
                  </div>
                ))
              )}
            </div>

            <div className="glass-card" style={{ padding: '20px' }}>
              <h4 style={{ marginBottom: '12px', fontSize: '0.95rem' }}><Award size={16} color="#60A5FA" /> Top NGOs by People Served</h4>
              {analytics.leaderboard.topNgos.length === 0 ? (
                <p style={{ color: '#9CA3AF', fontSize: '0.85rem' }}>No NGO data yet.</p>
              ) : (
                analytics.leaderboard.topNgos.map((n, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <span style={{ color: '#fff', fontSize: '0.85rem' }}>#{i + 1} {n.ngoName}</span>
                    <span style={{ color: '#60A5FA', fontSize: '0.82rem' }}>{n.totalServed} served ({n.distributionCount} runs)</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'analytics' && !analytics && (
        <div className="glass-card" style={{ padding: '40px', textAlign: 'center', color: '#9CA3AF' }}>
          <Loader2 size={32} /><p style={{ marginTop: '10px' }}>Loading analytics data...</p>
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
                background: n.isRead ? 'rgba(255,255,255,0.02)' : 'rgba(245,158,11,0.08)',
                borderLeft: n.isRead ? '3px solid rgba(255,255,255,0.1)' : '3px solid #F59E0B',
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

export default AdminDashboard;
