import React, { useEffect, useState } from 'react';
import { RefreshCcw, CheckCircle2, Wrench, AlertTriangle } from 'lucide-react';
import { getAllMachines, updateMachineStatus } from '../../adminApi';
import type { Machine } from '../../types';
import { MachineState } from '../../types';
import { useToast } from '../../components/Toast';

const stateConfig: Record<string, { bg: string; text: string; label: string; border: string; gradient: string; icon: React.ElementType }> = {
  AVAILABLE: {
    bg: '#ecfdf5', text: '#059669', label: 'Đang rảnh', border: '#a7f3d0',
    gradient: 'linear-gradient(135deg, #ecfdf5, #d1fae5)', icon: CheckCircle2,
  },
  IN_USE: {
    bg: '#f0f9ff', text: '#0284c7', label: 'Đang phục vụ', border: '#7dd3fc',
    gradient: 'linear-gradient(135deg, #f0f9ff, #e0f2fe)', icon: Wrench,
  },
  MAINTENANCE: {
    bg: '#fffbeb', text: '#d97706', label: 'Bảo trì', border: '#fcd34d',
    gradient: 'linear-gradient(135deg, #fffbeb, #fef3c7)', icon: AlertTriangle,
  },
};

const allStates = [MachineState.AVAILABLE, MachineState.IN_USE, MachineState.MAINTENANCE];

export default function MachineManagement() {
  const { success, error } = useToast();
  const [machines, setMachines] = useState<Machine[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const fetchMachines = () => {
    setLoading(true);
    getAllMachines()
      .then(setMachines)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchMachines(); }, []);

  const handleStateChange = async (machine: Machine, newState: MachineState) => {
    if (newState === machine.state) return;
    setUpdatingId(machine.id);
    try {
      const updated = await updateMachineStatus(
        machine.id,
        newState,
        newState === MachineState.IN_USE ? machine.currentBookingId ?? undefined : undefined
      );
      setMachines(prev => prev.map(m => m.id === machine.id ? updated : m));
      success('Cập nhật trạng thái máy thành công!');
    } catch (err) {
      console.error(err);
      error('Lỗi khi cập nhật trạng thái máy!');
    }
    setUpdatingId(null);
  };

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
          <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', margin: 0 }}>Quản Lý Máy Móc</h2>
          <p style={{ fontSize: 13, color: '#64748b', marginTop: 4, fontWeight: 500 }}>
            Quản lý trạng thái các khoang rửa xe và cầu nâng.
          </p>
        </div>
        <button
          onClick={fetchMachines}
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

      {/* Summary bar */}
      <div style={{
        display: 'flex', gap: 12, flexWrap: 'wrap',
      }}>
        {allStates.map(state => {
          const cfg = stateConfig[state];
          const count = machines.filter(m => m.state === state).length;
          const Icon = cfg.icon;
          return (
            <div key={state} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '10px 18px', borderRadius: 12,
              background: cfg.bg, border: `1px solid ${cfg.border}`,
              fontSize: 12, fontWeight: 700, color: cfg.text,
            }}>
              <Icon style={{ width: 16, height: 16 }} />
              {cfg.label}: <span style={{ fontSize: 16, fontWeight: 800 }}>{count}</span>
            </div>
          );
        })}
      </div>

      {/* Machine Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: 16,
      }}>
        {machines.map(machine => {
          const cfg = stateConfig[machine.state] || stateConfig.AVAILABLE;
          const Icon = cfg.icon;
          const isUpdating = updatingId === machine.id;

          return (
            <div key={machine.id} style={{
              background: '#fff', borderRadius: 18,
              border: `1px solid ${cfg.border}`,
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              overflow: 'hidden', transition: 'all 0.2s',
              opacity: isUpdating ? 0.6 : 1,
            }}>
              {/* Card header */}
              <div style={{
                background: cfg.gradient,
                padding: '18px 20px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                borderBottom: `1px solid ${cfg.border}`,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 12,
                    background: '#fff', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  }}>
                    <Icon style={{ width: 22, height: 22, color: cfg.text }} />
                  </div>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 800, color: '#0f172a' }}>
                      {machine.machineName}
                    </div>
                    <div style={{ fontSize: 10, fontWeight: 600, color: '#64748b' }}>
                      ID: #{machine.id}
                    </div>
                  </div>
                </div>
                <span style={{
                  padding: '5px 12px', borderRadius: 8,
                  fontSize: 11, fontWeight: 700,
                  background: cfg.bg, color: cfg.text,
                  border: `1px solid ${cfg.border}`,
                }}>
                  {cfg.label}
                </span>
              </div>

              {/* Card body */}
              <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                {/* Info rows */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                    <span style={{ color: '#94a3b8', fontWeight: 500 }}>Booking đang phục vụ:</span>
                    <span style={{ fontWeight: 700, color: machine.currentBookingId ? '#6366f1' : '#cbd5e1' }}>
                      {machine.currentBookingId ? `#${machine.currentBookingId}` : '— Không có'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                    <span style={{ color: '#94a3b8', fontWeight: 500 }}>Bảo trì lần cuối:</span>
                    <span style={{ fontWeight: 600, color: '#475569' }}>
                      {machine.lastMaintenanceDate
                        ? new Date(machine.lastMaintenanceDate).toLocaleDateString('vi-VN')
                        : '—'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                    <span style={{ color: '#94a3b8', fontWeight: 500 }}>Cập nhật cuối:</span>
                    <span style={{ fontWeight: 600, color: '#475569' }}>
                      {machine.updatedAt
                        ? new Date(machine.updatedAt).toLocaleString('vi-VN')
                        : '—'}
                    </span>
                  </div>
                </div>

                {/* State change buttons */}
                <div style={{
                  display: 'flex', gap: 6, paddingTop: 8,
                  borderTop: '1px solid #f1f5f9',
                }}>
                  {allStates.map(s => {
                    const sc = stateConfig[s];
                    const isActive = machine.state === s;
                    return (
                      <button
                        key={s}
                        disabled={isUpdating || isActive}
                        onClick={() => handleStateChange(machine, s)}
                        style={{
                          flex: 1, padding: '8px 0', borderRadius: 8,
                          fontSize: 10, fontWeight: 700,
                          background: isActive ? sc.bg : '#f8fafc',
                          color: isActive ? sc.text : '#94a3b8',
                          border: isActive ? `1.5px solid ${sc.border}` : '1px solid #e2e8f0',
                          cursor: isActive || isUpdating ? 'default' : 'pointer',
                          opacity: isActive ? 1 : 0.7,
                          transition: 'all 0.15s',
                        }}
                      >
                        {sc.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}

        {machines.length === 0 && (
          <div style={{
            gridColumn: '1 / -1', padding: 48, textAlign: 'center',
            color: '#94a3b8', fontSize: 13, background: '#fff', borderRadius: 16,
            border: '1px solid #e2e8f0',
          }}>
            Chưa có máy móc nào trong hệ thống.
          </div>
        )}
      </div>
    </div>
  );
}
