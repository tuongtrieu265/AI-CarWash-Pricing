link chia cong việc cu thể
https://docs.google.com/spreadsheets/d/11Od3UTkjM2TxU25_7LJ7FWYWMshOxn3DdUHXRVrShtE/edit?gid=554510438#gid=554510438
# 🚗 AutoClean - Hệ Thống Quản Lý Rửa Xe Thông Minh

Hệ thống quản lý dịch vụ rửa xe full-stack tích hợp tính năng đặt lịch trước (Advance Booking), quản lý người dùng và theo dõi tiến độ rửa xe.

## 🛠️ Công Nghệ Sử Dụng (Tech Stack)

| Lớp | Công Nghệ |
|-------|-----------|
| **Frontend** | React 19 + Vite + TypeScript |
| **Styling** | Tailwind CSS v4 |
| **Backend** | Java 17 + Spring Boot 3 |
| **Security** | Spring Security + JWT |
| **Database** | PostgreSQL |
| **ORM** | Spring Data JPA + Hibernate |

## 📁 Cấu Trúc Dự Án

```
do_an_nhom/
├── backend/     → Spring Boot REST API (Chạy trên cổng 8080)
├── frontend/    → React SPA (Chạy trên cổng 3000, gọi API qua proxy tới 8080)
└── README.md
```

## ⚙️ Yêu Cầu Cài Đặt (Prerequisites)

Để chạy dự án trên máy cá nhân, bạn cần cài đặt các phần mềm sau:
- **Java 17+** (JDK)
- **Node.js 18+** & npm
- **PostgreSQL 15+**

---

## 🚀 Hướng Dẫn Chạy Dự Án (Chạy ở môi trường Local)

### Bước 1: Khởi tạo Database
Mở công cụ quản lý PostgreSQL (như pgAdmin hoặc psql) và chạy câu lệnh sau để tạo database:
```sql
CREATE DATABASE carwash_db;
```
*(Lưu ý: Bạn có thể cập nhật User / Password trong file `backend/src/main/resources/application.yml` nếu tài khoản Postgres của bạn khác với mặc định `postgres/postgres`)*

### Bước 2: Chạy Backend (Spring Boot)
Mở một cửa sổ Terminal (hoặc PowerShell) mới, điều hướng vào thư mục `backend` và sử dụng Maven Wrapper để chạy:

```bash
cd backend

# Dành cho Windows (PowerShell / Command Prompt):
.\mvnw spring-boot:run

# Dành cho Windows (Git Bash):
./mvnw.cmd spring-boot:run
```
> **Lưu ý:** Lần chạy đầu tiên sẽ tốn một ít thời gian để Maven tải các thư viện về.
Backend sẽ được khởi chạy thành công ở địa chỉ `http://localhost:8080`. Hệ thống sẽ tự động nạp các dữ liệu mẫu (Seeding) ban đầu vào Database.

### Bước 3: Chạy Frontend (React + Vite)
Mở thêm **một cửa sổ Terminal thứ hai**, điều hướng vào thư mục `frontend` và chạy:

```bash
cd frontend

# Cài đặt các gói thư viện
npm install

# Khởi chạy server phát triển
npm run dev
```
Server Frontend sẽ khởi chạy tại địa chỉ `http://localhost:3000`. Khi truy cập địa chỉ này trên trình duyệt, bạn sẽ thấy giao diện của trang web! (Tất cả các lệnh gọi `/api` từ frontend sẽ được tự động proxy sang backend 8080).

---

## ✨ Các Tính Năng Nổi Bật

- 🔐 **Xác thực JWT** - Đăng nhập an toàn với phân quyền truy cập (Khách hàng/Admin)
- 📅 **Đặt lịch thông minh** - Khách hàng có thể chọn gói dịch vụ, thêm add-ons, chọn khung giờ và đặt vé điện tử
- 🔍 **Theo dõi đơn hàng trực tuyến** - Kiểm tra trạng thái rửa xe (Đang đợi, Đang rửa, Đã xong) thông qua biển số/số điện thoại
- 📊 **Cơ sở dữ liệu tự động** - Tự động đồng bộ các thay đổi vào CSDL PostgreSQL bằng Hibernate (JPA)

## 📡 Danh sách API Chính (Preview)

| Method | Endpoint | Chức năng |
|--------|---------|-------------|
| POST | `/api/auth/register` | Đăng ký tài khoản khách hàng mới |
| POST | `/api/auth/login` | Đăng nhập & lấy token JWT |
| POST | `/api/bookings` | Đặt lịch hẹn rửa xe |
| GET | `/api/bookings/my-bookings` | Lấy danh sách lịch đã đặt của User |
