/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum VehicleType {
  XE_MAY = 'XE_MAY',
  SEDAN = 'SEDAN',
  SUV = 'SUV',
  PICKUP = 'PICKUP'
}

export interface VehicleDetails {
  id: VehicleType;
  name: string;
  priceMultiplier: number;
  icon: string;
}

export interface WashService {
  id: string;
  name: string;
  subtitle: string;
  basePrice: number;
  description: string;
  duration: string;
  features: string[];
  isPopular?: boolean;
}

export interface AddOnService {
  id: string;
  name: string;
  price: number;
  description: string;
}

export type BookingStatus = 'pending' | 'processing' | 'completed' | 'cancelled';

export interface Booking {
  id: string;
  customerName: string;
  phone: string;
  licensePlate: string;
  vehicleType: VehicleType;
  serviceId: string;
  addOnIds: string[];
  date: string;
  timeSlot: string;
  notes: string;
  status: BookingStatus;
  totalCost: number;
  createdAt: string;
  paymentMethod?: 'CASH' | 'TRANSFER';
  paymentStatus?: 'UNPAID' | 'PAID' | 'CANCELLED';
  checkoutUrl?: string;
}

export interface Review {
  id: string;
  reviewerName: string;
  rating: number;
  comment: string;
  date: string;
  vehicleType: string;
}
// ===== Admin Types =====

export enum AdminBookingStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export enum MachineState {
  AVAILABLE = 'AVAILABLE',
  IN_USE = 'IN_USE',
  MAINTENANCE = 'MAINTENANCE'
}

export enum LoyaltyTier {
  BRONZE = 'BRONZE',
  SILVER = 'SILVER',
  GOLD = 'GOLD'
}

export enum Role {
  ROLE_CUSTOMER = 'ROLE_CUSTOMER',
  ROLE_ADMIN = 'ROLE_ADMIN'
}

export interface AdminUser {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  role: Role;
  loyaltyPoints: number;
  loyaltyTier: LoyaltyTier;
  createdAt: string;
}

export interface ServicePackage {
  id: number;
  name: string;
  description: string;
  price: number;
  durationMinutes: number;
  pointsEarned: number;
  active: boolean;
}

export interface AdminBooking {
  id: number;
  user: AdminUser;
  servicePackage: ServicePackage;
  bookingDate: string;
  timeSlot: string;
  status: AdminBookingStatus;
  pointsEarned: number;
  pointsRedeemed: number;
  discountApplied: number;
  createdAt: string;
  licensePlate: string;
  vehicleType: VehicleType;
  notes: string;
  totalCost: number;
  addOnIds: string[];
  paymentMethod?: 'CASH' | 'TRANSFER';
  paymentStatus?: 'UNPAID' | 'PAID' | 'CANCELLED';
}

export interface Machine {
  id: number;
  machineName: string;
  state: MachineState;
  currentBookingId: number | null;
  lastMaintenanceDate: string;
  updatedAt: string;
}

export interface LoyaltyInfo {
  userId: number;
  fullName: string;
  totalPoints: number;
  currentTier: LoyaltyTier;
  nextTier: LoyaltyTier;
  pointsToNextTier: number;
  totalWashes: number;
  redeemablePoints: number;
}
export interface User {
  id: number;
  fullName: string;
  email: string;
  phone?: string;
  role?: string;
  loyaltyPoints?: number;
  loyaltyTier?: string;
  createdAt?: string;
}

export interface CustomerVehicle {
  id: number;
  licensePlate: string;
  vehicleType: VehicleType;
  name: string;
}
