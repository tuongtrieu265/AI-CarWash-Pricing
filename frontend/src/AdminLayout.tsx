import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  ShoppingCart, 
  Settings, 
  Search, 
  Bell 
} from 'lucide-react';
import './AdminLayout.css'; // Import file CSS

const AdminLayout: React.FC = () => {
  return (
    <div className="admin-container">
      {/* 1. SIDEBAR */}
      <aside className="admin-sidebar">
        <div className="admin-logo">
          AdminPanel<span style={{color: '#3b82f6'}}>.</span>
        </div>
        
        <nav className="admin-nav">
          <NavLink 
            to="/admin" 
            end
            className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
          >
            <LayoutDashboard size={20} />
            Tổng quan
          </NavLink>
          
          <NavLink 
            to="/admin/users" 
            className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
          >
            <Users size={20} />
            Người dùng
          </NavLink>

          <NavLink 
            to="/admin/products" 
            className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
          >
            <ShoppingCart size={20} />
            Sản phẩm
          </NavLink>

          <div style={{ flex: 1 }}></div> {/* Đẩy phần Settings xuống dưới cùng */}

          <NavLink 
            to="/admin/settings" 
            className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
          >
            <Settings size={20} />
            Cài đặt
          </NavLink>
        </nav>
      </aside>

      {/* 2. KHU VỰC CHÍNH */}
      <main className="admin-main">
        {/* HEADER */}
        <header className="admin-header">
          <div className="admin-header-search">
            <Search size={18} color="#94a3b8" />
            <input type="text" placeholder="Tìm kiếm nhanh..." />
          </div>

          <div className="admin-header-actions">
            <button className="admin-icon-btn">
              <Bell size={22} />
            </button>
            <div className="admin-avatar">AD</div>
          </div>
        </header>

        {/* NỘI DUNG THAY ĐỔI ĐƯỢC (Content) */}
        <div className="admin-content-area">
          <Outlet /> 
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
