/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, Clock, MapPin, CheckCircle2, AlertCircle, ChevronRight, 
  Trash2, Smartphone, Hash, Navigation, Filter 
} from 'lucide-react';
import { Booking, BookingStatus } from '../types';
import { VEHICLE_LIST, WASH_SERVICES } from '../data';

interface BookingTrackerProps {
  bookings: Booking[];
  onUpdateStatus: (id: string, newStatus: BookingStatus) => void;
  onDeleteBooking: (id: string) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function BookingTracker({ 
  bookings, 
  onUpdateStatus, 
  onDeleteBooking,
  currentPage,
  totalPages,
  onPageChange
}: BookingTrackerProps) {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const formattedSearch = useMemo(() => {
    return searchQuery.trim().toLowerCase().replace(/[\s.-]/g, '');
  }, [searchQuery]);

  // Filter bookings based on search criteria (phone, license plate, or name)
  const filteredBookings = useMemo(() => {
    return bookings.filter(b => {
      // Hide cancelled bookings from the customer interface
      if (b.status?.toLowerCase() === 'cancelled') return false;

      // Filter status
      if (filterStatus !== 'all' && b.status?.toLowerCase() !== filterStatus) return false;

      if (!formattedSearch) return true; // Show all if empty search

      const cName = (b as any).user?.fullName || b.customerName || '';
      const cPhone = (b as any).user?.phone || b.phone || '';

      const customerNameMatch = cName.toLowerCase().includes(formattedSearch);
      const phoneMatch = cPhone.includes(formattedSearch);
      const plateMatch = (b.licensePlate || '').toLowerCase().replace(/[\s.-]/g, '').includes(formattedSearch);
      const idMatch = b.id.toString().toLowerCase().includes(formattedSearch);

      return customerNameMatch || phoneMatch || plateMatch || idMatch;
    });
  }, [bookings, formattedSearch, filterStatus]);

  const getStatusText = (status: BookingStatus) => {
    switch (status?.toLowerCase()) {
      case 'pending': return 'Đang đợi tiếp nhận';
      case 'confirmed':
      case 'processing': return 'Đang rửa xe';
      case 'completed': return 'Đã hoàn thành';
      case 'cancelled': return 'Đã hủy lịch';
      default: return 'Không xác định';
    }
  };

  const getStatusColor = (status: BookingStatus) => {
    switch (status?.toLowerCase()) {
      case 'pending': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'confirmed':
      case 'processing': return 'bg-sky-50 text-sky-700 border-sky-200';
      case 'completed': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'cancelled': return 'bg-rose-50 text-rose-700 border-rose-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };



  return (
    <div className="space-y-6">
      {/* Search Header Banner */}
      <div className="bg-sky-600 text-white p-6 sm:p-8 rounded-3xl shadow-lg relative overflow-hidden select-none">
        <div className="absolute right-0 bottom-0 top-0 opacity-15 pointer-events-none w-1/3">
          <div className="w-full h-full bg-[radial-gradient(circle_at_bottom_right,var(--color-sky-300),transparent)]" />
        </div>

        <div className="max-w-2xl space-y-3 relative z-10 text-center sm:text-left">
          <h2 className="text-xl sm:text-2xl font-black tracking-tight">Tra Cứu & Theo Dõi Trạng Thái Lót Lịch</h2>
          <p className="text-sky-100 text-sm leading-relaxed font-medium">
            Nhập số điện thoại di động hoặc biển số kiểm soát của bạn để tìm kiếm tức thì vị trí hàng chờ và tiến độ làm sạch xe tại Garage.
          </p>
        </div>
      </div>

      {/* Control Filters */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-sky-100 shadow-md flex flex-col md:flex-row gap-4 justify-between items-center">
        {/* Search Input Bar */}
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-slate-400" />
          <input
            id="track-search-input"
            type="text"
            placeholder="Tìm theo SĐT, Biển số (ví dụ: 30A-123.45)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-slate-50 hover:bg-slate-100/50 border border-slate-200 rounded-xl focus:border-sky-500 focus:bg-white focus:ring-1 focus:ring-sky-200 outline-none transition-all text-sm font-medium placeholder-slate-400"
          />
        </div>

        {/* Status Filters */}
        <div className="flex flex-wrap items-center gap-2 select-none w-full md:w-auto">
          <span className="text-xs font-bold text-slate-500 mr-2 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            Lọc trạng thái:
          </span>
          {[
            { id: 'all', label: 'Tất cả' },
            { id: 'pending', label: 'Đang đợi' },
            { id: 'processing', label: 'Đang rửa' },
            { id: 'completed', label: 'Đã xong' }
          ].map((item) => (
            <button
              key={item.id}
              id={`filter-btn-${item.id}`}
              onClick={() => setFilterStatus(item.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filterStatus === item.id
                  ? 'bg-sky-500 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings Display Container */}
      <div className="space-y-6">
        <AnimatePresence mode="popLayout">
          {filteredBookings.length > 0 ? (
            filteredBookings.map((bk: any) => {
              const vehicleObj = VEHICLE_LIST.find(v => v.id === bk.vehicleType);
              const serviceIdStr = bk.servicePackage?.id?.toString() || bk.serviceId;
              const washObj = WASH_SERVICES.find(s => s.id === serviceIdStr);
              
              // Define step active level
              const normStatus = bk.status?.toLowerCase();
              let activeStepInt = 1;
              if (normStatus === 'processing' || normStatus === 'confirmed') activeStepInt = 2;
              if (normStatus === 'completed') activeStepInt = 3;
              if (normStatus === 'cancelled') activeStepInt = -1;

              return (
                <motion.div
                  key={bk.id}
                  layout
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white rounded-3xl border border-sky-100 shadow-lg overflow-hidden"
                >
                  {/* Top Ticket strip */}
                  <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex flex-wrap justify-between items-center gap-4">
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-extrabold text-sky-700 bg-sky-50 px-3 py-1 rounded-lg border border-sky-100">
                        Mã {bk.id}
                      </span>
                      <span className="text-slate-400 text-xs">
                        Đặt ngày {bk.createdAt.split('T')[0].split('-').reverse().join('/')}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 border rounded-full text-xs font-bold uppercase tracking-wider ${getStatusColor(bk.status)}`}>
                        {getStatusText(bk.status)}
                      </span>
                      <button
                        title="Xoá lịch hẹn"
                        id={`btn-delete-bk-${bk.id}`}
                        onClick={() => onDeleteBooking(bk.id)}
                        className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="p-6 space-y-6">
                    {/* Visual Progress Steps Map */}
                    {activeStepInt !== -1 ? (
                      <div className="space-y-4 max-w-3xl mx-auto py-2 select-none">
                        <div className="relative flex justify-between items-center">
                          {/* Progress connector line */}
                          <div className="absolute left-[10%] right-[10%] top-1/2 -translate-y-1/2 h-1 bg-slate-150 rounded-full z-0">
                            <div 
                              className="h-full bg-sky-500 rounded-full transition-all duration-700" 
                              style={{ 
                                width: activeStepInt === 1 ? '0%' : activeStepInt === 2 ? '50%' : '100%' 
                              }}
                            />
                          </div>

                          {/* Step Nodes */}
                          {[
                            { step: 1, label: 'Đã Tiếp Nhận', desc: 'Có mặt đúng giờ hẹn' },
                            { step: 2, label: 'Đang Rửa Xe', desc: 'Chăm sóc chuyên sâu' },
                            { step: 3, label: 'Hoàn Thành', desc: 'Nhận bàn giao lấp lánh' }
                          ].map((item) => {
                            const isPast = activeStepInt > item.step;
                            const isActive = activeStepInt === item.step;
                            return (
                              <div key={item.step} className="relative z-10 flex flex-col items-center text-center max-w-[28%]">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500 font-bold text-xs ${
                                  isPast 
                                    ? 'bg-emerald-500 text-white ring-4 ring-emerald-100' 
                                    : isActive 
                                    ? 'bg-sky-500 text-white ring-4 ring-sky-100 animate-pulse' 
                                    : 'bg-slate-100 text-slate-400'
                                }`}>
                                  {isPast ? <CheckCircle2 className="w-4 h-4 stroke-[3]" /> : item.step}
                                </div>
                                <span className={`text-xs font-extrabold mt-2 ${isActive ? 'text-sky-600' : isPast ? 'text-emerald-600' : 'text-slate-500'}`}>
                                  {item.label}
                                </span>
                                <span className="hidden sm:inline text-[9px] text-slate-400 mt-0.5">
                                  {item.desc}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 bg-red-50 text-red-600 border border-red-100 rounded-xl flex items-center gap-3 text-sm">
                        <AlertCircle className="w-5 h-5" />
                        <div>
                          <span className="font-bold">Đơn hàng này đã bị huỷ lịch.</span> Vui lòng liên hệ Hotline 1900.8899 nếu đây là sự nhầm lẫn.
                        </div>
                      </div>
                    )}

                    {/* Booking Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
                      {/* Customer & Vehicle Info */}
                      <div className="space-y-3 text-sm">
                        <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest">Thông tin phương tiện & Khách hàng</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-slate-500 font-medium">Họ tên chủ xe:</span>
                            <span className="font-bold text-slate-800">{bk.user?.fullName || bk.customerName}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500 font-medium">Số điện thoại:</span>
                            <span className="font-bold text-slate-800">
                              {(bk.user?.phone || bk.phone || '').replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3')}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500 font-medium">Biển số đăng ký:</span>
                            <span className="font-mono font-extrabold text-sky-800 bg-sky-50 px-2 py-0.5 rounded border border-sky-100">
                              {bk.licensePlate}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500 font-medium">Nhóm xe:</span>
                            <span className="font-bold text-slate-800">{vehicleObj?.name || bk.vehicleType}</span>
                          </div>
                        </div>
                      </div>

                      {/* Package & Schedule Info */}
                      <div className="space-y-3 text-sm">
                        <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest">Quy trình hẹn phục vụ</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-slate-500 font-medium">Gói vệ sinh:</span>
                            <span className="font-bold text-sky-600">{washObj?.name || bk.servicePackage?.name || 'Tùy chỉnh'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500 font-medium">Lịch hẹn rửa:</span>
                            <span className="font-bold text-slate-800">
                              {(bk.bookingDate || bk.date || '').split('-').reverse().join('/')} ({bk.timeSlot.split(' - ')[0]})
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500 font-medium">Ghi chú yêu cầu:</span>
                            <span className="font-bold text-slate-500 select-all truncate max-w-[200px]" title={bk.notes}>
                              {bk.notes || 'Không có ghi chú'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500 font-medium">Thanh toán:</span>
                            <span className="font-bold text-slate-800">
                              {bk.paymentMethod === 'TRANSFER' ? 'Chuyển khoản' : 'Tiền mặt'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500 font-medium">Trạng thái:</span>
                            <span className={`font-bold ${bk.paymentStatus === 'PAID' ? 'text-emerald-600' : bk.paymentStatus === 'CANCELLED' ? 'text-rose-600' : 'text-amber-600'}`}>
                              {bk.paymentStatus === 'PAID' ? 'Đã thanh toán' : bk.paymentStatus === 'CANCELLED' ? 'Đã huỷ' : 'Chưa thanh toán'}
                            </span>
                          </div>
                          <div className="flex justify-between border-t border-slate-100 pt-2 font-bold">
                            <span className="text-slate-700">Tổng thanh toán:</span>
                            <span className="text-lg text-sky-600 font-black">{formatPrice(bk.totalCost)}</span>
                          </div>
                        </div>
                      </div>
                    </div>


                  </div>
                </motion.div>
              );
            })
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white border border-slate-150 py-12 px-6 rounded-3xl text-center shadow-xs"
            >
              <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-slate-700">Chưa tìm thấy lịch rửa xe nào</h3>
              <p className="text-slate-400 text-sm max-w-md mx-auto mt-1 leading-relaxed">
                {searchQuery 
                  ? 'Không tìm thấy đơn đặt nào trùng khớp với số điện thoại hoặc biển số nhập vào. Vui lòng sửa lại từ khóa tìm kiếm.' 
                  : 'Danh sách lịch hẹn trống hoặc chưa có dữ liệu rửa xe nào được thiết lập.'}
              </p>
              
              {searchQuery && (
                <button
                  id="btn-clear-track-search"
                  onClick={() => setSearchQuery('')}
                  className="px-4 py-2 mt-4 text-xs font-bold text-sky-500 hover:text-sky-600 hover:bg-sky-50 rounded-lg border border-sky-200 transition-all"
                >
                  Xoá bộ lọc tìm kiếm
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-8 pb-4">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 0}
              className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg font-bold text-xs disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
            >
              Trang Trước
            </button>
            
            <div className="flex gap-1">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => onPageChange(i)}
                  className={`w-8 h-8 rounded-lg font-bold text-xs flex items-center justify-center transition-colors ${
                    currentPage === i 
                      ? 'bg-sky-500 text-white shadow-md shadow-sky-200' 
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>

            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages - 1}
              className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg font-bold text-xs disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
            >
              Trang Sau
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
