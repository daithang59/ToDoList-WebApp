# Thư mục Src

## Mô tả

Thư mục `src/` là nơi chứa toàn bộ mã nguồn chính của ứng dụng React. Đây là thư mục được Vite xử lý và bundle khi build ứng dụng.

## Cấu trúc thư mục

- `api.js`: Chứa các hàm để giao tiếp với backend API (sử dụng Axios hoặc fetch).
- `App.css`: File CSS chính cho component App.
- `App.jsx`: Component gốc của ứng dụng React.
- `assets/`: Thư mục chứa các tài nguyên như hình ảnh, icon, font được import trong mã.
- `index.css`: File CSS toàn cục, bao gồm reset CSS và styles chung.
- `main.jsx`: Điểm vào của ứng dụng, nơi render App vào DOM.

## Cách sử dụng

- Viết mã React trong các file .jsx.
- Import CSS trong các component tương ứng.
- Sử dụng `api.js` để gọi API từ backend.
- Đặt hình ảnh và tài nguyên khác trong `assets/` và import chúng.

## Lưu ý

- File `main.jsx` phải import và render `<App />` để ứng dụng hoạt động.
- Sử dụng ES6 modules để import/export giữa các file.
- Để tối ưu, chia nhỏ component thành các thư mục con nếu ứng dụng lớn hơn.
