import api from './api';
import type { AdminBooking, AdminUser, Machine, ServicePackage, LoyaltyInfo } from './types';

// ===== Booking Management =====

export async function getAdminBookings(): Promise<AdminBooking[]> {
  const res = await api.get('/admin/bookings');
  return res.data.data;
}

export async function getAdminBookingsPaged(page: number = 0, size: number = 10): Promise<any> {
  const res = await api.get(`/admin/bookings/paged?page=${page}&size=${size}`);
  return res.data.data;
}

export async function updateBookingStatus(id: number, status: string): Promise<AdminBooking> {
  const res = await api.patch(`/admin/bookings/${id}/status`, null, {
    params: { status }
  });
  return res.data.data;
}

export async function updateBookingPaymentStatus(id: number, status: string): Promise<AdminBooking> {
  const res = await api.patch(`/admin/bookings/${id}/payment-status`, null, {
    params: { status }
  });
  return res.data.data;
}

// ===== User Management =====

export async function getAllUsers(): Promise<AdminUser[]> {
  const res = await api.get('/admin/users');
  return res.data.data;
}

export async function getAllCustomers(): Promise<AdminUser[]> {
  const res = await api.get('/admin/users/customers');
  return res.data.data;
}

export async function updateUserPoints(userId: number, points: number): Promise<LoyaltyInfo> {
  const res = await api.patch(`/admin/users/${userId}/points`, null, {
    params: { points }
  });
  return res.data.data;
}

// ===== Machine Management =====

export async function getAllMachines(): Promise<Machine[]> {
  const res = await api.get('/admin/machines');
  return res.data.data;
}

export async function updateMachineStatus(
  machineId: number,
  state: string,
  currentBookingId?: number
): Promise<Machine> {
  const res = await api.patch('/admin/machines/status', {
    machineId,
    state,
    currentBookingId: currentBookingId ?? null
  });
  return res.data.data;
}

// ===== Service Package Management =====

export async function getAllServices(): Promise<ServicePackage[]> {
  const res = await api.get('/admin/services');
  return res.data.data;
}
