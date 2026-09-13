/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Droplets, Phone, Sparkles, LogOut, User, LayoutDashboard } from 'lucide-react';
import { Link } from 'react-router-dom';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUser: { 
    fullName: string; 
    email: string; 
    phone?: string; 
    role?: string;
    loyaltyPoints?: number;
    loyaltyTier?: string;
  } | null;
  onOpenAuth: () => void;
  onLogout: () => void;
}

export default function Header({ activeTab, setActiveTab, currentUser, onOpenAuth, onLogout }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-sky-100 shadow-xs">
      {/* Main navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          {/* Logo brand */}
          <div
            onClick={() => setActiveTab('booking')}
            className="flex items-center gap-2.5 cursor-pointer select-none group"
          >
            <div className="relative p-2.5 bg-gradient-to-br from-sky-400 to-sky-600 rounded-2xl text-white shadow-md shadow-sky-100 group-hover:scale-105 transition-transform duration-300">
              <Droplets className="w-6 h-6 animate-pulse" />
              <div className="absolute -top-1 -right-1 bg-yellow-400 rounded-full p-0.5 animate-bounce">
                <Sparkles className="w-3 h-3 text-sky-900" />
              </div>
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-sky-700 via-sky-600 to-indigo-600 bg-clip-text text-transparent">
                AUTOCLEAN
              </h1>
              <p className="text-[10px] font-bold text-sky-500 uppercase tracking-widest -mt-0.5">
                Chăm Sóc Xe Chuyên Nghiệp
              </p>
            </div>
          </div>

          {/* Nav links */}
          <nav className="hidden md:flex items-center gap-1.5">
            {[
              { id: 'booking', label: 'Đặt Lịch Ngay' },
              { id: 'tracker', label: 'Theo Dõi Đơn Hàng' },
              { id: 'services', label: 'Bảng Giá & Dịch Vụ' }
            ].map((tab) => (
              <button
                key={tab.id}
                id={`nav-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${activeTab === tab.id
                    ? 'bg-sky-50 text-sky-700 shadow-xs'
                    : 'text-slate-600 hover:text-sky-600 hover:bg-slate-50'
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          {/* Auth Action & Hotline Call Action */}
          <div className="flex items-center gap-3">
            {currentUser ? (
              <div className="flex items-center gap-2">
                {currentUser.role === 'ROLE_ADMIN' && (
                  <Link
                    to="/admin"
                    className="mr-2 px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg text-xs font-bold transition-colors border border-indigo-200 flex items-center gap-1.5"
                  >
                    <LayoutDashboard className="w-3.5 h-3.5" />
                    Trang Quản Trị
                  </Link>
                )}
                <div className="hidden lg:flex flex-col text-right">
                  <span className="text-xs font-bold text-slate-800">Chào, {currentUser.fullName} 👋</span>
                  <span className="text-[10px] text-sky-600 font-bold flex items-center gap-1 justify-end mt-0.5">
                    <Sparkles className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                    {currentUser.loyaltyTier || 'BRONZE'} • {currentUser.loyaltyPoints || 0} pts
                  </span>
                </div>
                <div
                  className="w-8 h-8 rounded-full bg-sky-50 border border-sky-200 text-sky-600 flex items-center justify-center font-bold text-xs cursor-pointer hover:bg-sky-100 transition-colors shadow-sm"
                  onClick={() => setActiveTab('profile')}
                  title="Xem hồ sơ cá nhân"
                >
                  {currentUser.fullName ? currentUser.fullName.charAt(0).toUpperCase() : 'U'}
                </div>
                <button
                  id="btn-logout"
                  onClick={onLogout}
                  title="Đăng xuất"
                  className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                id="btn-open-login"
                onClick={onOpenAuth}
                className="flex items-center gap-1.5 px-3.5 py-2 border border-slate-200 hover:border-sky-500 hover:bg-sky-50 hover:text-sky-700 text-slate-600 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                <User className="w-4 h-4" />
                Đăng nhập
              </button>
            )}

            <a
              href="tel:19008899"
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-sky-500 to-sky-600 text-white rounded-xl text-sm font-bold shadow-md shadow-sky-100 hover:from-sky-600 hover:to-sky-700 group hover:-translate-y-0.5 transition-all duration-300"
            >
              <Phone className="w-4 h-4 group-hover:rotate-12 transition-transform duration-300" />
              <span className="hidden sm:inline">Hotline:</span> 1900.8899
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
