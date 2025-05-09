# Hướng Dẫn Cài Đặt Dự Án ZBase

Tài liệu này cung cấp các bước chi tiết để cài đặt và chạy dự án ZBase - một ứng dụng web xây dựng trên NestJS framework với các chức năng quản lý người dùng, phân quyền và ghi nhật ký hoạt động.

## Yêu Cầu Hệ Thống

Trước khi bắt đầu, hãy đảm bảo máy tính của bạn đã cài đặt các phần mềm sau:

- **Node.js**: Phiên bản 16.x trở lên
- **npm** hoặc **yarn**: Công cụ quản lý gói cho Node.js
- **PostgreSQL**: Phiên bản 12.x trở lên
- **Git**: Để clone dự án (nếu cần)

## Các Bước Cài Đặt

### 1. Clone Dự Án (Nếu Chưa Có)

```bash
git clone <repository_url> zbase
cd zbase
```

### 2. Cài Đặt Các Gói Phụ Thuộc

```bash
npm install
```

hoặc nếu bạn sử dụng yarn:

```bash
yarn install
```

### 3. Cấu Hình Môi Trường

Tạo file `.env` trong thư mục gốc của dự án và thiết lập các biến môi trường cần thiết. Bạn có thể sao chép từ file mẫu `.env.example` (nếu có) hoặc tạo mới với nội dung sau:

```
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=your_postgres_username
DB_PASSWORD=your_postgres_password
DB_DATABASE=zbase

# JWT Secret
JWT_SECRET=your_secure_jwt_secret
JWT_EXPIRES_IN=1d
```

Lưu ý: Hãy thay thế các giá trị `your_postgres_username`, `your_postgres_password` và `your_secure_jwt_secret` bằng thông tin thực tế của bạn.

### 4. Chuẩn Bị Cơ Sở Dữ Liệu

#### 4.1. Tạo Cơ Sở Dữ Liệu PostgreSQL

Đầu tiên, hãy đăng nhập vào PostgreSQL và tạo cơ sở dữ liệu mới:

```bash
psql -U postgres
```

Sau khi đăng nhập, tạo cơ sở dữ liệu:

```sql
CREATE DATABASE zbase;
\q
```

#### 4.2. Kiểm Tra Kết Nối Cơ Sở Dữ Liệu

Chạy lệnh sau để kiểm tra kết nối đến cơ sở dữ liệu:

```bash
npx ts-node test-db-connection.ts
```

Nếu thành công, bạn sẽ thấy thông báo "Database connection successful".

### 5. Khởi Tạo Dữ Liệu Ban Đầu

Chạy script seed để tạo dữ liệu ban đầu cho ứng dụng:

```bash
npx ts-node src/seed.ts
```

Script này sẽ tạo người dùng admin mặc định, các vai trò và quyền cơ bản.

### 6. Xây Dựng Ứng Dụng

Chạy lệnh sau để biên dịch TypeScript sang JavaScript:

```bash
npm run build
```

### 7. Chạy Ứng Dụng

#### 7.1. Chế Độ Phát Triển

```bash
npm run start:dev
```

Lệnh này sẽ khởi động ứng dụng ở chế độ phát triển với tính năng hot-reloading (tự động tải lại khi có thay đổi).

#### 7.2. Chế Độ Sản Xuất

```bash
npm run start:prod
```

### 8. Truy Cập Ứng Dụng

Sau khi khởi động thành công, bạn có thể truy cập ứng dụng qua trình duyệt web:

- **Trang Chủ**: http://localhost:3000
- **Trang Đăng Nhập**: http://localhost:3000/login
- **Trang Quản Trị**: http://localhost:3000/admin (yêu cầu đăng nhập với quyền admin)

### 9. Tài Khoản Mặc Định

Sau khi chạy script seed, bạn có thể đăng nhập với tài khoản admin mặc định:

- **Email**: admin@example.com
- **Mật khẩu**: admin123

**Lưu ý quan trọng**: Vì lý do bảo mật, hãy đổi mật khẩu admin ngay sau khi đăng nhập lần đầu.

## Kiểm Tra Cài Đặt

Để kiểm tra xem ứng dụng đã được cài đặt đúng cách, hãy thực hiện các bước sau:

1. Truy cập trang đăng nhập: http://localhost:3000/login
2. Đăng nhập với tài khoản admin mặc định
3. Truy cập vào trang quản trị: http://localhost:3000/admin
4. Kiểm tra xem bạn có thể xem danh sách người dùng, vai trò và quyền không

## Khắc Phục Sự Cố

### Lỗi Kết Nối Cơ Sở Dữ Liệu

- Kiểm tra thông tin kết nối trong file `.env`
- Đảm bảo dịch vụ PostgreSQL đang chạy
- Kiểm tra xem người dùng PostgreSQL có quyền truy cập vào cơ sở dữ liệu không

### Lỗi Xác Thực

Nếu bạn không thể đăng nhập sau khi chạy script seed:

```bash
node reset-admin.js
```

Script này sẽ đặt lại mật khẩu tài khoản admin về giá trị mặc định.

### Lỗi Khác

Để xem logs chi tiết, hãy chạy ứng dụng ở chế độ debug:

```bash
npm run start:debug
```

## Phát Triển

### Tạo Module Mới

```bash
npx nest g module tên-module
npx nest g controller tên-module
npx nest g service tên-module
```

### Tạo Entity Mới

1. Tạo file entity trong thư mục `src/entities`
2. Cập nhật module cơ sở dữ liệu để bao gồm entity mới

### Cập Nhật Quyền

Sau khi thêm chức năng mới, hãy cập nhật các quyền trong hệ thống:

1. Thêm quyền mới vào cơ sở dữ liệu thông qua API hoặc giao diện quản trị
2. Gán quyền cho các vai trò thích hợp

## Kết Luận

Dự án ZBase giờ đây đã được cài đặt và chạy thành công trên môi trường của bạn. Tham khảo tài liệu `project-overview.md` để hiểu thêm về cấu trúc và tính năng của dự án.

Nếu bạn gặp vấn đề trong quá trình cài đặt hoặc sử dụng, vui lòng tạo issue trên hệ thống quản lý dự án hoặc liên hệ với đội phát triển.