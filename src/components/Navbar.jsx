import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Utensils, LogOut, User as UserIcon, ShieldAlert, Bell } from 'lucide-react';
import API from '../api/axios';

const Navbar = () => {
  const { user, logout, token } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [unread, setUnread] = useState(0);

  // Poll unread notification count every 30s when user is logged in
  useEffect(() => {
    if (!token || !user) { setUnread(0); return; }
    const fetchCount = async () => {
      try {
        const res = await API.get('/notifications');
        if (res.data.success) setUnread(res.data.unreadCount);
      } catch (_) {}
    };
    fetchCount();
    const interval = setInterval(fetchCount, 30000);
    return () => clearInterval(interval);
  }, [token, user]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getDashboardLink = () => {
    if (!user) return '/';
    switch (user.role) {
      case 'DONOR': return '/donor';
      case 'NGO':   return '/ngo';
      case 'ADMIN': return '/admin';
      default:      return '/';
    }
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'ADMIN': return <span className="badge badge-admin">⚡ Admin</span>;
      case 'NGO':   return <span className="badge badge-ngo">🏛️ NGO</span>;
      default:      return <span className="badge badge-donor">🍲 Donor</span>;
    }
  };

  const isOnDashboard = ['/donor', '/ngo', '/admin'].includes(location.pathname);

  return (
    <header style={{
      background: 'rgba(11, 19, 43, 0.92)',
      backdropFilter: 'blur(14px)',
      WebkitBackdropFilter: 'blur(14px)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
      position: 'sticky',
      top: 0,
      zIndex: 200,
      padding: '0 24px',
      height: '60px',
      display: 'flex',
      alignItems: 'center',
    }}>
      <div style={{
        maxWidth: '1300px',
        margin: '0 auto',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
      }}>
        {/* Brand */}
        <Link to={getDashboardLink()} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '10px',
            background: 'linear-gradient(135deg, #10B981, #059669)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 3px 10px rgba(16, 185, 129, 0.4)',
          }}>
            <Utensils color="#fff" size={18} />
          </div>
          <div>
            <span style={{ fontSize: '1.1rem', fontWeight: '800', color: '#fff', lineHeight: 1 }}>
              ShareMy<span style={{ color: '#10B981' }}>Meal</span>
            </span>
            <span style={{ fontSize: '0.6rem', color: '#6B7280', display: 'block', letterSpacing: '0.06em' }}>
              FOOD RESCUE NETWORK
            </span>
          </div>
        </Link>

        {/* Nav links for logged-in users */}
        {user && (
          <nav style={{ display: 'flex', gap: '6px' }}>
            <Link
              to={getDashboardLink()}
              style={{
                padding: '6px 14px', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 600,
                textDecoration: 'none', transition: 'all 0.2s',
                background: isOnDashboard ? 'rgba(16,185,129,0.15)' : 'transparent',
                color: isOnDashboard ? '#34D399' : '#9CA3AF',
                border: isOnDashboard ? '1px solid rgba(16,185,129,0.3)' : '1px solid transparent',
              }}
            >
              Dashboard
            </Link>
          </nav>
        )}

        {/* Right side: user info or auth buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {user ? (
            <>
              {/* Notification Bell */}
              <div style={{ position: 'relative' }}>
                <div style={{
                  width: '34px', height: '34px', borderRadius: '50%',
                  background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                }}>
                  <Bell size={16} color="#9CA3AF" />
                </div>
                {unread > 0 && (
                  <span style={{
                    position: 'absolute', top: '-4px', right: '-4px',
                    background: '#EF4444', color: '#fff', fontSize: '0.6rem', fontWeight: 800,
                    width: '16px', height: '16px', borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: '2px solid #0B132B',
                  }}>{unread > 9 ? '9+' : unread}</span>
                )}
              </div>

              {/* User info */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '32px', height: '32px', borderRadius: '50%',
                  background: 'rgba(16,185,129,0.2)', border: '1px solid rgba(16,185,129,0.4)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <UserIcon size={16} color="#10B981" />
                </div>
                <div style={{ display: 'none' }}>
                  {/* Hidden on small screens, shown via CSS on md+ */}
                </div>
                <div>
                  <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#F9FAFB', display: 'block', lineHeight: 1.1 }}>
                    {user.name.split(' ')[0]}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {getRoleBadge(user.role)}
                    {user.role === 'NGO' && !user.isApproved && (
                      <ShieldAlert size={12} color="#F59E0B" title="Pending approval" />
                    )}
                  </div>
                </div>
              </div>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="btn btn-secondary"
                style={{ padding: '7px 12px', fontSize: '0.82rem', gap: '5px' }}
                title="Sign out"
              >
                <LogOut size={14} /> Logout
              </button>
            </>
          ) : (
            <div style={{ display: 'flex', gap: '8px' }}>
              <Link to="/login"    className="btn btn-secondary" style={{ padding: '7px 16px', fontSize: '0.85rem' }}>Login</Link>
              <Link to="/register" className="btn btn-primary"   style={{ padding: '7px 16px', fontSize: '0.85rem' }}>Register</Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
