import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, CalendarCheck, Users, Wrench, Package, Droplets, Sparkles
} from 'lucide-react';

const navItems = [
  { to: '/admin', icon: LayoutDashboard, label: 'Tổng Quan', end: true },
  { to: '/admin/bookings', icon: CalendarCheck, label: 'Quản Lý Đơn Hàng', end: false },
  { to: '/admin/users', icon: Users, label: 'Quản Lý Khách Hàng', end: false },
  { to: '/admin/machines', icon: Wrench, label: 'Quản Lý Máy Móc', end: false },
  { to: '/admin/services', icon: Package, label: 'Quản Lý Dịch Vụ', end: false },
];

export default function AdminSidebar() {
  return (
    <aside
      style={{
        width: 260,
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        left: 0,
        top: 0,
        zIndex: 40,
        borderRight: '1px solid rgba(56,189,248,0.08)',
      }}
    >
      {/* Brand */}
      <div style={{
        padding: '28px 24px 20px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            background: 'linear-gradient(135deg, #0ea5e9, #6366f1)',
            borderRadius: 14,
            padding: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 16px rgba(14,165,233,0.25)',
            position: 'relative',
          }}>
            <Droplets style={{ width: 22, height: 22, color: '#fff' }} />
            <div style={{
              position: 'absolute',
              top: -4,
              right: -4,
              background: '#facc15',
              borderRadius: '50%',
              padding: 2,
            }}>
              <Sparkles style={{ width: 10, height: 10, color: '#0f172a' }} />
            </div>
          </div>
          <div>
            <div style={{
              fontSize: 18,
              fontWeight: 800,
              letterSpacing: '-0.02em',
              background: 'linear-gradient(90deg, #38bdf8, #818cf8)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              AUTOCLEAN
            </div>
            <div style={{
              fontSize: 9,
              fontWeight: 700,
              color: '#64748b',
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
            }}>
              Admin Panel
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div style={{
          fontSize: 9,
          fontWeight: 800,
          color: '#475569',
          textTransform: 'uppercase',
          letterSpacing: '0.15em',
          padding: '8px 12px 6px',
        }}>
          Menu Quản Trị
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '11px 14px',
                borderRadius: 12,
                fontSize: 13,
                fontWeight: isActive ? 700 : 500,
                color: isActive ? '#fff' : '#94a3b8',
                background: isActive
                  ? 'linear-gradient(135deg, rgba(14,165,233,0.15), rgba(99,102,241,0.1))'
                  : 'transparent',
                textDecoration: 'none',
                transition: 'all 0.2s ease',
                border: isActive ? '1px solid rgba(56,189,248,0.15)' : '1px solid transparent',
                boxShadow: isActive ? '0 2px 12px rgba(14,165,233,0.08)' : 'none',
              })}
            >
              <div style={{
                width: 34,
                height: 34,
                borderRadius: 10,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                <Icon style={{ width: 18, height: 18 }} />
              </div>
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      <div style={{
        padding: '16px 20px',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        fontSize: 10,
        color: '#475569',
        textAlign: 'center',
        fontWeight: 500,
      }}>
        © 2026 AutoClean Admin v1.0
      </div>
    </aside>
  );
}
