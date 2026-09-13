import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CalendarCheck, Users, Wrench, TrendingUp, Clock,
  CheckCircle2, XCircle, AlertCircle, ArrowRight
} from 'lucide-react';
import { getAdminBookings, getAllCustomers, getAllMachines } from '../../adminApi';
import type { AdminBooking, AdminUser, Machine } from '../../types';
import { AdminBookingStatus, MachineState } from '../../types';

const cardStyle: React.CSSProperties = {
  background: '#fff',
  borderRadius: 16,
  padding: '22px 24px',
  border: '1px solid #e2e8f0',
  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
  transition: 'all 0.2s',
};

const statusColors: Record<string, { bg: string; text: string; label: string }> = {
  PENDING: { bg: '#fef3c7', text: '#d97706', label: 'Chờ xử lý' },
  CONFIRMED: { bg: '#dbeafe', text: '#2563eb', label: 'Đã xác nhận' },
  COMPLETED: { bg: '#dcfce7', text: '#16a34a', label: 'Hoàn thành' },
  CANCELLED: { bg: '#fee2e2', text: '#dc2626', label: 'Đã hủy' },
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [customers, setCustomers] = useState<AdminUser[]>([]);
  const [machines, setMachines] = useState<Machine[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getAdminBookings(), getAllCustomers(), getAllMachines()])
      .then(([b, c, m]) => {
        setBookings(b);
        setCustomers(c);
        setMachines(m);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const pendingCount = bookings.filter(b => b.status === AdminBookingStatus.PENDING).length;
  const todayBookings = bookings.filter(b => {
    const today = new Date().toISOString().split('T')[0];
    return b.bookingDate === today;
  });
  const activeMachines = machines.filter(m => m.state === MachineState.IN_USE).length;

  const totalRevenue = bookings
    .filter(b => b.status === AdminBookingStatus.COMPLETED)
    .reduce((sum, b) => sum + (b.totalCost || 0), 0);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}>
        <div style={{
          width: 40, height: 40,
          border: '3px solid #e2e8f0', borderTopColor: '#0ea5e9',
          borderRadius: '50%', animation: 'spin 0.8s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Page Header */}
      <div>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
          Tổng Quan Hệ Thống
        </h2>
        <p style={{ fontSize: 13, color: '#64748b', marginTop: 4, fontWeight: 500 }}>
          Xin chào! Đây là bảng điều khiển tổng quan hoạt động của AutoClean.
        </p>
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
        {[
          {
            icon: CalendarCheck, label: 'Đơn hôm nay', value: todayBookings.length,
            accent: '#0ea5e9', bgAccent: '#f0f9ff', borderAccent: '#bae6fd',
          },
          {
            icon: Clock, label: 'Chờ xử lý', value: pendingCount,
            accent: '#f59e0b', bgAccent: '#fffbeb', borderAccent: '#fed7aa',
          },
          {
            icon: Users, label: 'Khách hàng', value: customers.length,
            accent: '#6366f1', bgAccent: '#eef2ff', borderAccent: '#c7d2fe',
          },
          {
            icon: TrendingUp, label: 'Doanh thu (Hoàn thành)', value: new Intl.NumberFormat('vi-VN').format(totalRevenue) + 'đ',
            accent: '#10b981', bgAccent: '#ecfdf5', borderAccent: '#a7f3d0',
          },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} style={{ ...cardStyle, display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{
                width: 48, height: 48, borderRadius: 14,
                background: stat.bgAccent, border: `1px solid ${stat.borderAccent}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <Icon style={{ width: 22, height: 22, color: stat.accent }} />
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  {stat.label}
                </div>
                <div style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', marginTop: 2, letterSpacing: '-0.02em' }}>
                  {stat.value}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Two Column: Recent Bookings + Machine Status */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20, alignItems: 'start' }}>
        {/* Recent Bookings */}
        <div style={{ ...cardStyle, padding: 0, overflow: 'hidden' }}>
          <div style={{
            padding: '18px 24px',
            borderBottom: '1px solid #f1f5f9',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#1e293b', margin: 0 }}>
              📋 Đơn đặt lịch gần đây
            </h3>
            <button
              onClick={() => navigate('/admin/bookings')}
              style={{
                display: 'flex', alignItems: 'center', gap: 4,
                fontSize: 11, fontWeight: 700, color: '#0ea5e9',
                background: 'none', border: 'none', cursor: 'pointer',
              }}
            >
              Xem tất cả <ArrowRight style={{ width: 13, height: 13 }} />
            </button>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr style={{ background: '#f8fafc' }}>
                  {['ID', 'Khách hàng', 'Dịch vụ', 'Ngày hẹn', 'Trạng thái', 'Tổng tiền'].map(h => (
                    <th key={h} style={{
                      padding: '10px 16px', textAlign: 'left', fontWeight: 700,
                      color: '#64748b', fontSize: 10, textTransform: 'uppercase',
                      letterSpacing: '0.06em', borderBottom: '1px solid #f1f5f9',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {bookings.slice(0, 5).map(b => {
                  const sc = statusColors[b.status] || statusColors.PENDING;
                  return (
                    <tr key={b.id} style={{ borderBottom: '1px solid #f8fafc' }}>
                      <td style={{ padding: '12px 16px', fontWeight: 700, color: '#6366f1' }}>#{b.id}</td>
                      <td style={{ padding: '12px 16px', fontWeight: 600, color: '#334155' }}>{b.user?.fullName || '—'}</td>
                      <td style={{ padding: '12px 16px', color: '#64748b' }}>{b.servicePackage?.name || '—'}</td>
                      <td style={{ padding: '12px 16px', color: '#334155', fontWeight: 500 }}>
                        {b.bookingDate ? b.bookingDate.split('-').reverse().join('/') : '—'}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{
                          display: 'inline-block', padding: '3px 10px', borderRadius: 8,
                          fontSize: 10, fontWeight: 700, background: sc.bg, color: sc.text,
                        }}>{sc.label}</span>
                      </td>
                      <td style={{ padding: '12px 16px', fontWeight: 700, color: '#0f172a' }}>
                        {new Intl.NumberFormat('vi-VN').format(b.totalCost || 0)}đ
                      </td>
                    </tr>
                  );
                })}
                {bookings.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ padding: 40, textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>
                      Chưa có đơn đặt lịch nào.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Machine Status Summary */}
        <div style={cardStyle}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: '#1e293b', margin: '0 0 16px 0' }}>
            🔧 Trạng thái máy móc
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              {
                state: MachineState.AVAILABLE, label: 'Đang rảnh',
                count: machines.filter(m => m.state === MachineState.AVAILABLE).length,
                color: '#10b981', bg: '#ecfdf5', icon: CheckCircle2,
              },
              {
                state: MachineState.IN_USE, label: 'Đang phục vụ',
                count: activeMachines,
                color: '#0ea5e9', bg: '#f0f9ff', icon: Wrench,
              },
              {
                state: MachineState.MAINTENANCE, label: 'Bảo trì',
                count: machines.filter(m => m.state === MachineState.MAINTENANCE).length,
                color: '#f59e0b', bg: '#fffbeb', icon: AlertCircle,
              },
            ].map(item => {
              const Icon = item.icon;
              return (
                <div key={item.state} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '12px 14px', borderRadius: 12,
                  background: item.bg, border: `1px solid ${item.color}15`,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Icon style={{ width: 16, height: 16, color: item.color }} />
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#334155' }}>{item.label}</span>
                  </div>
                  <span style={{
                    fontSize: 18, fontWeight: 800, color: item.color,
                  }}>{item.count}</span>
                </div>
              );
            })}
          </div>
          <button
            onClick={() => navigate('/admin/machines')}
            style={{
              width: '100%', marginTop: 16, padding: '10px 0', borderRadius: 10,
              fontSize: 11, fontWeight: 700, color: '#0ea5e9',
              background: '#f0f9ff', border: '1px solid #bae6fd',
              cursor: 'pointer', transition: 'all 0.2s',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
            }}
          >
            Quản lý chi tiết <ArrowRight style={{ width: 13, height: 13 }} />
          </button>
        </div>
      </div>
    </div>
  );
}
