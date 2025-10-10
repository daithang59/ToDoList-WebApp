# Backend - Máy chủ API cho Ứng dụng To-Do List

## Mô tả

Đây là phần backend của ứng dụng To-Do List, được xây dựng bằng Node.js và Express.js. Nó cung cấp các API RESTful để quản lý dữ liệu todos, sử dụng MongoDB làm cơ sở dữ liệu.

## Công nghệ sử dụng

- **Node.js**: Môi trường chạy JavaScript phía server.
- **Express.js**: Framework web để xây dựng API.
- **MongoDB**: Cơ sở dữ liệu NoSQL để lưu trữ dữ liệu todos.
- **Mongoose**: ODM (Object Data Modeling) cho MongoDB.
- **CORS**: Để cho phép cross-origin requests từ frontend.
- **Morgan**: Middleware để log các yêu cầu HTTP.
- **Dotenv**: Để quản lý biến môi trường.

## Cài đặt và chạy

1. Đảm bảo bạn đã cài đặt Node.js, npm và MongoDB.
2. Chạy lệnh sau để cài đặt các dependencies:
   ```
   npm install
   ```
3. Tạo file `.env` trong thư mục `backend/` với nội dung:
   ```
   MONGODB_URI=mongodb://localhost:27017
   PORT=4000
   ```
4. Khởi động MongoDB (nếu chạy local).
5. Chạy server:
   ```
   npm run dev
   ```
   Server sẽ chạy trên `http://localhost:4000`.

## Cấu trúc thư mục

- `src/`: Chứa mã nguồn chính.
  - `config/`: Cấu hình kết nối cơ sở dữ liệu.
  - `middlewares/`: Middleware cho xử lý lỗi và xác thực.
  - `models/`: Mô hình dữ liệu (Todo schema).
  - `routes/`: Định nghĩa các routes API.
  - `index.js`: Điểm vào của server.
- `package.json`: Quản lý dependencies và scripts.

## API Endpoints

- `GET /api/health`: Kiểm tra trạng thái server.
- `POST /api/todos`: Tạo todo mới (yêu cầu JSON: `{"title": "string", "description": "string"}`).
- `GET /api/todos`: Lấy tất cả todos.
- `PATCH /api/todos/:id`: Cập nhật todo (có thể cập nhật title, description, completed).
- `DELETE /api/todos/:id`: Xóa todo.

## Lưu ý

- Đảm bảo MongoDB đang chạy và URI được cấu hình đúng.
- Sử dụng Postman hoặc curl để test các API.
- Server sử dụng ES modules (`"type": "module"` trong package.json).
