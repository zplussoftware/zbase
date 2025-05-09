# 📱 React Native App - Quản lý người dùng với NestJS

Ứng dụng di động được phát triển bằng React Native, kết nối với hệ thống backend NestJS đã có sẵn.

---

## 🚀 Công nghệ sử dụng

- **React Native**: phát triển app mobile đa nền tảng (Android & iOS)
- **React Navigation**: điều hướng giữa các màn hình
- **Axios**: gửi request đến API
- **Redux Toolkit** (hoặc React Context): quản lý trạng thái
- **Formik + Yup**: xử lý form và validation
- **AsyncStorage**: lưu token (JWT)
- **React Native Paper** hoặc **NativeBase**: giao diện UI

---

## 🧱 Cấu trúc thư mục

```
/src
 ┣ /api           → xử lý gọi API (axios instance)
 ┣ /screens       → các màn hình chính
 ┣ /components    → các component tái sử dụng
 ┣ /redux         → store & slice (nếu dùng Redux)
 ┣ /navigations   → cấu hình React Navigation
 ┣ /utils         → hàm tiện ích (format, auth helper...)
 ┗ /config        → cấu hình URL backend, headers mặc định...
```

---

## 🔑 Auth Flow

1. **Login**
   - `POST /auth/login`
   - Nhận JWT token
   - Lưu token vào AsyncStorage

2. **Get current user**
   - `GET /me`
   - Kiểm tra token hợp lệ để truy cập app

3. **Logout**
   - Xoá token
   - Chuyển về màn hình đăng nhập

---

## 🧭 Màn hình chính

### ✅ Login Screen
- Form đăng nhập: email & password
- Gửi request đến `/auth/login`
- Lưu token vào local

### ✅ Home Screen
- Hiển thị thông tin người dùng
- Menu chuyển đến các chức năng khác

### ✅ User Management (Admin only)
- Danh sách user: `GET /users`
- Tạo user mới: `POST /users`
- Gán role cho user: `PATCH /users/:id`

### ✅ Role Management
- Danh sách role: `GET /roles`
- Gán permission: `PATCH /roles/:id`

### ✅ Permission Management
- Danh sách permission: `GET /permissions`

### ✅ Profile
- Thông tin cá nhân
- Đổi mật khẩu

---

## 📡 Yêu cầu API từ phía NestJS

- `POST /auth/login`
- `GET /me`
- `GET /users`, `POST /users`, `PATCH /users/:id`
- `GET /roles`, `POST /roles`, `PATCH /roles/:id`
- `GET /permissions`, `POST /permissions`

---

## 📝 Ghi chú

- Kiểm tra token hết hạn và tự động đăng xuất
- Hiển thị giao diện khác nhau tuỳ theo role của user
