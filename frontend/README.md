# Frontend - Ứng dụng To-Do List

## Mô tả

Đây là phần frontend của ứng dụng To-Do List được xây dựng bằng React.js. Phần này cung cấp giao diện người dùng để quản lý các nhiệm vụ (todos), bao gồm việc tạo, cập nhật, xóa và đánh dấu hoàn thành các nhiệm vụ.

## Công nghệ sử dụng

- **React.js**: Thư viện JavaScript để xây dựng giao diện người dùng.
- **Axios**: Thư viện để thực hiện các yêu cầu HTTP đến backend.
- **CSS/Bootstrap**: Để styling và responsive design (có thể tùy chỉnh).

## Cài đặt và chạy

1. Đảm bảo bạn đã cài đặt Node.js và npm.
2. Chạy lệnh sau để cài đặt các dependencies:
   ```
   npm install
   ```
3. Khởi động ứng dụng:
   ```
   npm start
   ```
   Ứng dụng sẽ chạy trên `http://localhost:3000` (mặc định).

## Cấu trúc thư mục

- `src/`: Chứa mã nguồn chính.
  - `components/`: Các component React.
  - `services/`: Các hàm gọi API đến backend.
  - `App.js`: Component chính.
  - `index.js`: Điểm vào của ứng dụng.
- `public/`: Chứa các tệp tĩnh như HTML, favicon, v.v.

## API Endpoints

Frontend giao tiếp với backend thông qua các API sau:

- `GET /api/todos`: Lấy danh sách todos.
- `POST /api/todos`: Tạo todo mới.
- `PATCH /api/todos/:id`: Cập nhật todo.
- `DELETE /api/todos/:id`: Xóa todo.

## Lưu ý

- Đảm bảo backend đang chạy trên `http://localhost:4000` để frontend có thể kết nối.
- Có thể cấu hình URL backend trong file config nếu cần.
