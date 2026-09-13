import React, { useEffect, useState } from 'react';
import { RefreshCcw, Package } from 'lucide-react';
import { getAllServices } from '../../adminApi';
import type { ServicePackage } from '../../types';

const cardStyle: React.CSSProperties = {
  background: '#fff', borderRadius: 16,
  border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
  overflow: 'hidden',
};

export default function ServiceManagement() {
  const [services, setServices] = useState<ServicePackage[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchServices = () => {
    setLoading(true);
    getAllServices()
      .then(setServices)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchServices(); }, []);

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', margin: 0 }}>Quản Lý Gói Dịch Vụ</h2>
          <p style={{ fontSize: 13, color: '#64748b', marginTop: 4, fontWeight: 500 }}>
            Danh sách các gói dịch vụ rửa xe đang được cung cấp.
          </p>
        </div>
        <button
          onClick={fetchServices}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '9px 16px', borderRadius: 10,
            fontSize: 12, fontWeight: 700, color: '#0ea5e9',
            background: '#f0f9ff', border: '1px solid #bae6fd', cursor: 'pointer',
          }}
        >
          <RefreshCcw style={{ width: 14, height: 14 }} /> Tải lại
        </button>
      </div>

      {/* Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
        gap: 16,
      }}>
        {services.map(service => (
          <div key={service.id} style={{
            background: '#fff', borderRadius: 18,
            border: '1px solid #e2e8f0',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            overflow: 'hidden', transition: 'all 0.2s',
          }}>
            {/* Card header */}
            <div style={{
              background: 'linear-gradient(135deg, #f0f9ff, #eef2ff)',
              padding: '20px 22px',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 12,
                  background: 'linear-gradient(135deg, #0ea5e9, #6366f1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 2px 8px rgba(14,165,233,0.2)',
                  flexShrink: 0,
                }}>
                  <Package style={{ width: 22, height: 22, color: '#fff' }} />
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: '#0f172a' }}>
                    {service.name}
                  </div>
                  <div style={{ fontSize: 10, fontWeight: 600, color: '#64748b', marginTop: 2 }}>
                    ID: #{service.id}
                  </div>
                </div>
              </div>
              <span style={{
                padding: '4px 12px', borderRadius: 8, fontSize: 10, fontWeight: 700,
                background: service.active ? '#dcfce7' : '#fee2e2',
                color: service.active ? '#15803d' : '#dc2626',
                border: service.active ? '1px solid #86efac' : '1px solid #fca5a5',
              }}>
                {service.active ? 'Đang hoạt động' : 'Ngưng cung cấp'}
              </span>
            </div>

            {/* Card body */}
            <div style={{ padding: '16px 22px', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {/* Description */}
              {service.description && (
                <p style={{ fontSize: 12, color: '#64748b', lineHeight: 1.6, margin: 0, fontWeight: 500 }}>
                  {service.description}
                </p>
              )}

              {/* Info grid */}
              <div style={{
                display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10,
                paddingTop: 8, borderTop: '1px solid #f1f5f9',
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Giá tiền
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: '#0ea5e9', marginTop: 4 }}>
                    {new Intl.NumberFormat('vi-VN').format(service.price)}đ
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Thời gian
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: '#6366f1', marginTop: 4 }}>
                    {service.durationMinutes} phút
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Tích lũy
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: '#f59e0b', marginTop: 4 }}>
                    +{service.pointsEarned} pts
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {services.length === 0 && (
          <div style={{
            gridColumn: '1 / -1', padding: 48, textAlign: 'center',
            color: '#94a3b8', fontSize: 13, background: '#fff', borderRadius: 16,
            border: '1px solid #e2e8f0',
          }}>
            Chưa có gói dịch vụ nào trong hệ thống.
          </div>
        )}
      </div>

      {/* Table view */}
      <div style={cardStyle}>
        <div style={{
          padding: '14px 20px', borderBottom: '1px solid #f1f5f9',
        }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: '#1e293b', margin: 0 }}>📊 Bảng tổng hợp</h3>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                {['ID', 'Tên gói', 'Mô tả', 'Giá (VND)', 'Thời gian (phút)', 'Điểm tích lũy', 'Trạng thái'].map(h => (
                  <th key={h} style={{
                    padding: '12px 14px', textAlign: 'left', fontWeight: 700,
                    color: '#64748b', fontSize: 10, textTransform: 'uppercase',
                    letterSpacing: '0.06em', borderBottom: '1px solid #e2e8f0', whiteSpace: 'nowrap',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {services.map(s => (
                <tr key={s.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '14px', fontWeight: 700, color: '#6366f1' }}>#{s.id}</td>
                  <td style={{ padding: '14px', fontWeight: 700, color: '#0f172a' }}>{s.name}</td>
                  <td style={{ padding: '14px', color: '#64748b', fontWeight: 500, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {s.description || '—'}
                  </td>
                  <td style={{ padding: '14px', fontWeight: 700, color: '#0ea5e9' }}>
                    {new Intl.NumberFormat('vi-VN').format(s.price)}đ
                  </td>
                  <td style={{ padding: '14px', fontWeight: 600, color: '#475569' }}>{s.durationMinutes} phút</td>
                  <td style={{ padding: '14px', fontWeight: 700, color: '#f59e0b' }}>+{s.pointsEarned} pts</td>
                  <td style={{ padding: '14px' }}>
                    <span style={{
                      padding: '3px 10px', borderRadius: 8, fontSize: 10, fontWeight: 700,
                      background: s.active ? '#dcfce7' : '#fee2e2',
                      color: s.active ? '#15803d' : '#dc2626',
                    }}>
                      {s.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
