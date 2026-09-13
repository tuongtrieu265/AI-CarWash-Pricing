import React, { useEffect, useState, useMemo } from 'react';
import { Search, Filter, RefreshCcw, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { getAdminBookingsPaged, updateBookingStatus, updateBookingPaymentStatus } from '../../adminApi';
import type { AdminBooking } from '../../types';
import { AdminBookingStatus } from '../../types';
import { useToast } from '../../components/Toast';

const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
  PENDING: { bg: '#fef3c7', text: '#d97706', label: 'Chờ xử lý' },
  CONFIRMED: { bg: '#dbeafe', text: '#2563eb', label: 'Đã xác nhận' },
  COMPLETED: { bg: '#dcfce7', text: '#16a34a', label: 'Hoàn thành' },
  CANCELLED: { bg: '#fee2e2', text: '#dc2626', label: 'Đã hủy' },
};

const allStatuses = [
  { value: '', label: 'Tất cả' },
  { value: 'PENDING', label: 'Chờ xử lý' },
  { value: 'CONFIRMED', label: 'Đã xác nhận' },
  { value: 'COMPLETED', label: 'Hoàn thành' },
  { value: 'CANCELLED', label: 'Đã hủy' },
];

const cardStyle: React.CSSProperties = {
  background: '#fff',
  borderRadius: 16,
  border: '1px solid #e2e8f0',
  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
  overflow: 'hidden',
};

export default function BookingManagement() {
  const { success, error } = useToast();
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [updatingPaymentId, setUpdatingPaymentId] = useState<number | null>(null);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  // Server-side pagination state
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const fetchBookings = (page: number = 0, size: number = pageSize) => {
    setLoading(true);
    getAdminBookingsPaged(page, size)
      .then(data => {
        setBookings(data.content);
        setCurrentPage(data.pageNumber);
        setTotalPages(data.totalPages);
        setTotalElements(data.totalElements);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchBookings(0, pageSize); }, [pageSize]);

  useEffect(() => {
    const handleNewBooking = () => {
      fetchBookings(currentPage, pageSize);
    };
    window.addEventListener('new-booking-received', handleNewBooking);
    return () => {
      window.removeEventListener('new-booking-received', handleNewBooking);
    };
  }, [currentPage, pageSize]);

  const handleStatusChange = (id: number, newStatus: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Thay đổi trạng thái',
      message: 'Bạn có chắc chắn muốn thay đổi trạng thái đơn đặt lịch này?',
      onConfirm: async () => {
        setUpdatingId(id);
        try {
          const updated = await updateBookingStatus(id, newStatus);
          setBookings(prev => prev.map(b => b.id === id ? updated : b));
          success('Cập nhật trạng thái lịch đặt thành công!');
        } catch (err) {
          console.error(err);
          error('Lỗi khi cập nhật trạng thái!');
        }
        setUpdatingId(null);
      }
    });
  };

  const handlePaymentStatusChange = (id: number, newStatus: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Thay đổi thanh toán',
      message: 'Bạn có chắc chắn muốn thay đổi trạng thái thanh toán của đơn đặt lịch này?',
      onConfirm: async () => {
        setUpdatingPaymentId(id);
        try {
          const updated = await updateBookingPaymentStatus(id, newStatus);
          setBookings(prev => prev.map(b => b.id === id ? updated : b));
          success('Cập nhật trạng thái thanh toán thành công!');
        } catch (err) {
          console.error(err);
          error('Lỗi khi cập nhật trạng thái thanh toán!');
        }
        setUpdatingPaymentId(null);
      }
    });
  };

  // Client-side filter on current page data
  const filtered = useMemo(() => bookings.filter(b => {
    const matchStatus = !filterStatus || b.status === filterStatus;
    const query = searchQuery.toLowerCase();
    const matchSearch = !query
      || (b.user?.fullName || '').toLowerCase().includes(query)
      || (b.licensePlate || '').toLowerCase().includes(query)
      || String(b.id).includes(query);
    return matchStatus && matchSearch;
  }), [bookings, filterStatus, searchQuery]);

  const getPageNumbers = (): (number | '...')[] => {
    const pages: (number | '...')[] = [];
    const maxVisible = 5;
    if (totalPages <= maxVisible + 2) {
      for (let i = 0; i < totalPages; i++) pages.push(i);
    } else {
      pages.push(0);
      if (currentPage > 2) pages.push('...');
      const start = Math.max(1, currentPage - 1);
      const end = Math.min(totalPages - 2, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (currentPage < totalPages - 3) pages.push('...');
      pages.push(totalPages - 1);
    }
    return pages;
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
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', margin: 0 }}>Quản Lý Đơn Đặt Lịch</h2>
          <p style={{ fontSize: 13, color: '#64748b', marginTop: 4, fontWeight: 500 }}>
            Tổng cộng {totalElements} đơn hàng trong hệ thống.
          </p>
        </div>
        <button
          onClick={() => fetchBookings(currentPage)}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '9px 16px', borderRadius: 10,
            fontSize: 12, fontWeight: 700, color: '#0ea5e9',
            background: '#f0f9ff', border: '1px solid #bae6fd',
            cursor: 'pointer',
          }}
        >
          <RefreshCcw style={{ width: 14, height: 14 }} /> Tải lại
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: '1 1 260px', maxWidth: 360 }}>
          <Search style={{
            position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
            width: 16, height: 16, color: '#94a3b8',
          }} />
          <input
            placeholder="Tìm theo tên KH, biển số, mã đơn..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{
              width: '100%', padding: '10px 14px 10px 38px', borderRadius: 10,
              border: '1px solid #e2e8f0', fontSize: 12, fontWeight: 500,
              outline: 'none', background: '#fff',
            }}
          />
        </div>

        {/* Status filter */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 6 }}>
          <Filter style={{ width: 14, height: 14, color: '#94a3b8' }} />
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            style={{
              padding: '10px 14px', borderRadius: 10,
              border: '1px solid #e2e8f0', fontSize: 12, fontWeight: 600,
              outline: 'none', background: '#fff', cursor: 'pointer', color: '#334155',
            }}
          >
            {allStatuses.map(s => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div style={cardStyle}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                {['ID', 'Khách hàng', 'SĐT', 'BKS', 'Dịch vụ', 'Ngày hẹn', 'Khung giờ', 'Trạng thái', 'Thanh toán', 'Tổng tiền'].map(h => (
                  <th key={h} style={{
                    padding: '12px 14px', textAlign: 'left', fontWeight: 700,
                    color: '#64748b', fontSize: 10, textTransform: 'uppercase',
                    letterSpacing: '0.06em', borderBottom: '1px solid #e2e8f0',
                    whiteSpace: 'nowrap',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(b => {
                const sc = statusConfig[b.status] || statusConfig.PENDING;
                return (
                  <tr key={b.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.15s' }}>
                    <td style={{ padding: '14px', fontWeight: 700, color: '#6366f1' }}>#{b.id}</td>
                    <td style={{ padding: '14px', fontWeight: 600, color: '#334155' }}>{b.user?.fullName || '—'}</td>
                    <td style={{ padding: '14px', color: '#64748b', fontWeight: 500 }}>{b.user?.phone || '—'}</td>
                    <td style={{ padding: '14px' }}>
                      <span style={{
                        fontFamily: 'monospace', fontWeight: 700, fontSize: 11,
                        background: '#f0f9ff', color: '#0c4a6e', padding: '3px 8px',
                        borderRadius: 6, border: '1px solid #bae6fd',
                      }}>{b.licensePlate}</span>
                    </td>
                    <td style={{ padding: '14px', color: '#475569', fontWeight: 500 }}>{b.servicePackage?.name || '—'}</td>
                    <td style={{ padding: '14px', color: '#334155', fontWeight: 500 }}>
                      {b.bookingDate ? b.bookingDate.split('-').reverse().join('/') : '—'}
                    </td>
                    <td style={{ padding: '14px', color: '#64748b', fontWeight: 500, whiteSpace: 'nowrap' }}>
                      {b.timeSlot || '—'}
                    </td>
                    <td style={{ padding: '14px' }}>
                      <select
                        value={b.status}
                        disabled={updatingId === b.id}
                        onChange={e => handleStatusChange(b.id, e.target.value)}
                        style={{
                          padding: '5px 10px', borderRadius: 8,
                          fontSize: 11, fontWeight: 700,
                          background: sc.bg, color: sc.text,
                          border: `1px solid ${sc.text}30`,
                          cursor: updatingId === b.id ? 'wait' : 'pointer',
                          outline: 'none',
                          opacity: updatingId === b.id ? 0.6 : 1,
                        }}
                      >
                        {Object.entries(statusConfig).map(([val, cfg]) => (
                          <option key={val} value={val}>{cfg.label}</option>
                        ))}
                      </select>
                    </td>
                    <td style={{ padding: '14px' }}>
                      <div style={{ display: 'inline-flex', flexDirection: 'column', gap: 4 }}>
                        <select
                          value={b.paymentStatus || 'UNPAID'}
                          disabled={updatingPaymentId === b.id}
                          onChange={e => handlePaymentStatusChange(b.id, e.target.value)}
                          style={{
                            padding: '5px 10px', borderRadius: 8,
                            fontSize: 11, fontWeight: 700,
                            background: b.paymentStatus === 'PAID' ? '#dcfce7' : b.paymentStatus === 'CANCELLED' ? '#fee2e2' : '#fef3c7',
                            color: b.paymentStatus === 'PAID' ? '#16a34a' : b.paymentStatus === 'CANCELLED' ? '#dc2626' : '#d97706',
                            border: `1px solid ${b.paymentStatus === 'PAID' ? '#16a34a' : b.paymentStatus === 'CANCELLED' ? '#dc2626' : '#d97706'}30`,
                            cursor: updatingPaymentId === b.id ? 'wait' : 'pointer',
                            outline: 'none',
                            opacity: updatingPaymentId === b.id ? 0.6 : 1,
                          }}
                        >
                          <option value="UNPAID">Chưa trả</option>
                          <option value="PAID">Đã trả</option>
                          <option value="CANCELLED">Đã hủy</option>
                        </select>
                        <span style={{ fontSize: 10, color: '#64748b', fontWeight: 500, paddingLeft: 4 }}>
                          {b.paymentMethod === 'TRANSFER' ? 'Chuyển khoản' : 'Tiền mặt'}
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: '14px', fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap' }}>
                      {new Intl.NumberFormat('vi-VN').format(b.totalCost || 0)}đ
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={10} style={{ padding: 48, textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>
                    Không tìm thấy đơn hàng nào phù hợp.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div style={{
          padding: '14px 20px',
          background: '#f8fafc',
          borderTop: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
        }}>
          {/* Left: info + page size */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ fontSize: 12, color: '#64748b', fontWeight: 500 }}>
              Hiển thị {filtered.length} / {totalElements} đơn hàng
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 500 }}>Hiển thị</span>
              <select
                value={pageSize}
                onChange={e => { setPageSize(Number(e.target.value)); }}
                style={{
                  padding: '4px 8px', borderRadius: 6,
                  border: '1px solid #e2e8f0', fontSize: 11, fontWeight: 600,
                  outline: 'none', background: '#fff', cursor: 'pointer', color: '#334155',
                }}
              >
                {[5, 10, 20, 50].map(n => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
              <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 500 }}>dòng</span>
            </div>
          </div>

          {/* Center: page buttons */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              {/* First page */}
              <button
                onClick={() => fetchBookings(0)}
                disabled={currentPage === 0}
                style={{
                  padding: '6px 8px', borderRadius: 8, border: '1px solid #e2e8f0',
                  background: currentPage === 0 ? '#f1f5f9' : '#fff',
                  color: currentPage === 0 ? '#cbd5e1' : '#475569',
                  cursor: currentPage === 0 ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.15s',
                }}
                title="Trang đầu"
              >
                <ChevronsLeft style={{ width: 14, height: 14 }} />
              </button>

              {/* Prev page */}
              <button
                onClick={() => fetchBookings(currentPage - 1)}
                disabled={currentPage === 0}
                style={{
                  padding: '6px 8px', borderRadius: 8, border: '1px solid #e2e8f0',
                  background: currentPage === 0 ? '#f1f5f9' : '#fff',
                  color: currentPage === 0 ? '#cbd5e1' : '#475569',
                  cursor: currentPage === 0 ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.15s',
                }}
                title="Trang trước"
              >
                <ChevronLeft style={{ width: 14, height: 14 }} />
              </button>

              {/* Page numbers */}
              {getPageNumbers().map((page, idx) =>
                page === '...' ? (
                  <span key={`ellipsis-${idx}`} style={{ padding: '6px 4px', color: '#94a3b8', fontSize: 12, fontWeight: 600, userSelect: 'none' }}>…</span>
                ) : (
                  <button
                    key={page}
                    onClick={() => fetchBookings(page)}
                    style={{
                      minWidth: 32, height: 32, borderRadius: 8,
                      border: currentPage === page ? '1.5px solid #6366f1' : '1px solid #e2e8f0',
                      background: currentPage === page
                        ? 'linear-gradient(135deg, #6366f1, #818cf8)'
                        : '#fff',
                      color: currentPage === page ? '#fff' : '#475569',
                      fontWeight: currentPage === page ? 700 : 500,
                      fontSize: 12, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 0.2s',
                      boxShadow: currentPage === page ? '0 2px 8px rgba(99,102,241,0.3)' : 'none',
                    }}
                  >
                    {page + 1}
                  </button>
                )
              )}

              {/* Next page */}
              <button
                onClick={() => fetchBookings(currentPage + 1)}
                disabled={currentPage === totalPages - 1}
                style={{
                  padding: '6px 8px', borderRadius: 8, border: '1px solid #e2e8f0',
                  background: currentPage === totalPages - 1 ? '#f1f5f9' : '#fff',
                  color: currentPage === totalPages - 1 ? '#cbd5e1' : '#475569',
                  cursor: currentPage === totalPages - 1 ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.15s',
                }}
                title="Trang sau"
              >
                <ChevronRight style={{ width: 14, height: 14 }} />
              </button>

              {/* Last page */}
              <button
                onClick={() => fetchBookings(totalPages - 1)}
                disabled={currentPage === totalPages - 1}
                style={{
                  padding: '6px 8px', borderRadius: 8, border: '1px solid #e2e8f0',
                  background: currentPage === totalPages - 1 ? '#f1f5f9' : '#fff',
                  color: currentPage === totalPages - 1 ? '#cbd5e1' : '#475569',
                  cursor: currentPage === totalPages - 1 ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.15s',
                }}
                title="Trang cuối"
              >
                <ChevronsRight style={{ width: 14, height: 14 }} />
              </button>
            </div>
          )}

          {/* Right: revenue */}
          <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>
            Tổng doanh thu (Hoàn thành):{' '}
            <strong style={{ color: '#10b981' }}>
              {new Intl.NumberFormat('vi-VN').format(
                filtered.filter(b => b.status === AdminBookingStatus.COMPLETED).reduce((s, b) => s + (b.totalCost || 0), 0)
              )}đ
            </strong>
          </span>
        </div>
      </div>

      {/* Custom Confirm Modal */}
      {confirmModal.isOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.4)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          animation: 'fadeIn 0.2s ease-out',
        }}>
          <div style={{
            background: '#fff',
            borderRadius: 24,
            padding: 32,
            width: '90%',
            maxWidth: 400,
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            border: '1px solid #f1f5f9',
            animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            textAlign: 'center',
          }}>
            {/* Warning Icon/Circle */}
            <div style={{
              width: 56,
              height: 56,
              background: '#fef3c7',
              color: '#d97706',
              borderRadius: 28,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 24,
              margin: '0 auto 20px',
            }}>
              ⚠️
            </div>
            
            <h3 style={{
              fontSize: 18,
              fontWeight: 800,
              color: '#0f172a',
              marginBottom: 12,
            }}>{confirmModal.title}</h3>
            
            <p style={{
              fontSize: 14,
              color: '#64748b',
              lineHeight: 1.6,
              marginBottom: 28,
            }}>{confirmModal.message}</p>
            
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button
                onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                style={{
                  flex: 1,
                  padding: '12px 18px',
                  borderRadius: 14,
                  border: '1px solid #e2e8f0',
                  background: '#fff',
                  color: '#334155',
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                onMouseLeave={e => e.currentTarget.style.background = '#fff'}
              >
                Hủy
              </button>
              <button
                onClick={() => {
                  confirmModal.onConfirm();
                  setConfirmModal(prev => ({ ...prev, isOpen: false }));
                }}
                style={{
                  flex: 1,
                  padding: '12px 18px',
                  borderRadius: 14,
                  border: 'none',
                  background: 'linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%)',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'none'}
              >
                Xác nhận
              </button>
            </div>
          </div>
          <style>{`
            @keyframes fadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }
            @keyframes slideUp {
              from { transform: translateY(16px); opacity: 0; }
              to { transform: translateY(0); opacity: 1; }
            }
          `}</style>
        </div>
      )}
    </div>
  );
}
