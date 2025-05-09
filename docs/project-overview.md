# Tài Liệu Dự Án ZBase

## Tổng Quan Dự Án

ZBase là ứng dụng web được xây dựng bằng framework NestJS, cung cấp các chức năng quản lý người dùng, kiểm soát truy cập dựa trên vai trò và ghi nhật ký hoạt động. Ứng dụng tuân theo mô hình kiến trúc module và sử dụng TypeORM để tương tác với cơ sở dữ liệu PostgreSQL.

## Công Nghệ Sử Dụng

- **Framework Backend**: NestJS (v11)
- **Cơ Sở Dữ Liệu**: PostgreSQL với TypeORM
- **Xác Thực**: JWT và Passport.js
- **Giao Diện Frontend**: EJS
- **Bảo Mật API**: Kiểm soát truy cập dựa trên vai trò

## Cấu Trúc Dự Án

Dự án tuân theo kiến trúc module của NestJS:

### Module Chính

- **App Module**: Điểm khởi đầu cho ứng dụng
- **Auth Module**: Xử lý xác thực và phân quyền
- **User Module**: Chức năng quản lý người dùng
- **Role Module**: Quản lý và gán vai trò
- **Permission Module**: Quản lý quyền
- **Activity Log Module**: Ghi lại hành động của người dùng và sự kiện hệ thống
- **View Module**: Xử lý việc hiển thị template EJS

### Module Hỗ Trợ

- **Config Module**: Cấu hình ứng dụng
- **Database Module**: Kết nối và cấu hình cơ sở dữ liệu

### Cấu Trúc Thư Mục

```
src/
├── app.module.ts              # Module chính của ứng dụng
├── main.ts                    # Điểm khởi đầu ứng dụng
├── activity-log/              # Chức năng ghi nhật ký hoạt động
├── admin/                     # Chức năng bảng điều khiển admin
├── auth/                      # Xác thực và phân quyền
│   ├── decorators/
│   ├── guards/
│   ├── strategies/
├── common/                    # Chức năng dùng chung
│   ├── filters/
├── config/                    # Cấu hình ứng dụng
├── database/                  # Cấu hình cơ sở dữ liệu
├── entities/                  # Định nghĩa entity cơ sở dữ liệu
├── permission/                # Quản lý quyền
├── role/                      # Quản lý vai trò
├── user/                      # Quản lý người dùng
├── view/                      # Hiển thị giao diện
└── views/                     # Template EJS
    ├── pages/
    ├── partials/
```

## Tính Năng Chính

1. **Xác Thực Người Dùng**:
   - Xác thực cục bộ với tên đăng nhập/mật khẩu
   - Xác thực API dựa trên JWT
   - Quản lý phiên làm việc

2. **Quản Lý Người Dùng**:
   - Đăng ký và quản lý hồ sơ người dùng
   - Chức năng đặt lại mật khẩu
   - Kích hoạt/vô hiệu hóa người dùng

3. **Kiểm Soát Truy Cập Dựa Trên Vai Trò**:
   - Gán vai trò cho người dùng
   - Gán quyền cho vai trò
   - Bảo vệ quyền truy cập dựa trên vai trò

4. **Hệ Thống Phân Quyền**:
   - Kiểm soát quyền chi tiết
   - Quyền tính năng và quyền controller
   - Phân loại quyền

5. **Ghi Nhật Ký Hoạt Động**:
   - Theo dõi hành động của người dùng
   - Ghi lại sự kiện hệ thống
   - Dấu vết kiểm toán cho tuân thủ và bảo mật

6. **Bảng Điều Khiển Admin**:
   - Giao diện quản lý người dùng
   - Quản lý vai trò và quyền
   - Giám sát nhật ký hoạt động
   - Cài đặt hệ thống

## Sơ Đồ Cơ Sở Dữ Liệu

### Các Entity

#### Entity Người Dùng (User)
- **Trường**: id, name, email, password, roles, active, createdAt, updatedAt, deletedAt
- **Quan hệ**: Nhiều-Nhiều với entity Role

#### Entity Vai Trò (Role)
- **Trường**: id, name, description, permissions, createdAt, updatedAt, deletedAt
- **Quan hệ**: Nhiều-Nhiều với entity User

#### Entity Quyền (Permission)
- **Trường**: id, type, name, category, controller, action, route, description, createdAt, updatedAt, deletedAt
- **Loại**:
  - Quyền tính năng (name, category)
  - Quyền controller (controller, action, route)

#### Entity Nhật Ký Hoạt Động (ActivityLog)
- **Trường**: id, userId, userName, action, module, description, details, ipAddress, userAgent, createdBy, createdAt, deletedAt
- **Đánh chỉ mục**: userId, action, createdAt để truy vấn hiệu quả

## Quy Trình Xác Thực

1. **Xác Thực Cục Bộ**:
   - Người dùng gửi thông tin đăng nhập
   - Local strategy xác thực tên đăng nhập/mật khẩu
   - JWT token được tạo và cung cấp cho client

2. **Xác Thực JWT**:
   - Client bao gồm JWT token trong header xác thực
   - JWT strategy xác thực token
   - Danh tính người dùng được thiết lập cho request

3. **Phân Quyền**:
   - Role guards kiểm tra xem người dùng có vai trò cần thiết không
   - Kiểm soát truy cập dựa trên quyền hạn giới hạn các route

## Hiển Thị Giao Diện

Ứng dụng sử dụng công cụ template EJS để hiển thị giao diện:

- **Bảng Điều Khiển Admin**: Giao diện quản lý dành cho người quản trị
- **Trang Công Khai**: Các trang dành cho người dùng (đăng nhập, đăng ký, v.v.)
- **Trang Lỗi**: Giao diện xử lý lỗi tùy chỉnh

## Vấn Đề Bảo Mật

- Mật khẩu được băm bằng bcrypt
- JWT token cho truy cập API an toàn
- Kiểm soát truy cập dựa trên vai trò cho tài nguyên hạn chế
- Ghi nhật ký hoạt động để kiểm tra bảo mật
- Xác thực đầu vào bằng class-validator
- Lọc ngoại lệ toàn cục

## Hướng Dẫn Phát Triển

### Thêm Tính Năng Mới

1. Tạo entity trong thư mục entities
2. Tạo hoặc tạo module, controller và service
3. Cập nhật các DTO phù hợp
4. Thêm quyền cần thiết
5. Cập nhật giao diện nếu cần
6. Thêm ghi nhật ký hoạt động

### Làm Việc Với Quyền

- Quyền tính năng nên được phân loại
- Quyền controller nên chỉ định controller, action và route
- Cập nhật entity vai trò khi thêm quyền mới

### Xử Lý Lỗi

- Sử dụng bộ lọc ngoại lệ toàn cục để có phản hồi lỗi nhất quán
- Thêm bộ lọc ngoại lệ cụ thể cho xử lý chuyên biệt

## Triển Khai

Ứng dụng có thể được triển khai bằng cách sử dụng:
- Triển khai Node.js tiêu chuẩn
- Container Docker
- Trình quản lý tiến trình PM2

## Tài Liệu API

API tuân theo nguyên tắc RESTful với các endpoint chính sau:

- **/api/auth**: Endpoint xác thực
- **/api/users**: Quản lý người dùng
- **/api/roles**: Quản lý vai trò
- **/api/permissions**: Quản lý quyền
- **/api/activity-logs**: Truy cập nhật ký hoạt động

## Cấu Hình

Cấu hình được quản lý thông qua biến môi trường được tải qua dotenv.
Các biến cấu hình chính bao gồm:

- Chi tiết kết nối cơ sở dữ liệu
- JWT secret và thời gian hết hạn
- Port và host server
- Cài đặt ghi nhật ký

## Kết Luận

ZBase cung cấp nền tảng vững chắc để xây dựng ứng dụng web bảo mật với khả năng quản lý người dùng, kiểm soát truy cập dựa trên vai trò và theo dõi hoạt động. Kiến trúc module cho phép dễ dàng mở rộng và tùy chỉnh để đáp ứng các yêu cầu nghiệp vụ cụ thể.