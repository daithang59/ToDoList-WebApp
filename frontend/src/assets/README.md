# Thư mục Assets

## Mô tả

Thư mục `assets/` chứa các tài nguyên tĩnh như hình ảnh, icon, font được sử dụng trong ứng dụng React. Các tệp này được xử lý bởi Vite và có thể được import trực tiếp trong mã JavaScript/JSX.

## Các tệp chính

- `react.svg`: Icon SVG của React, có thể được sử dụng trong component hoặc làm logo.

## Cách sử dụng

- Import tệp trong component: `import logo from './assets/react.svg'`
- Sử dụng trong JSX: `<img src={logo} alt="Logo" />`
- Đặt các hình ảnh, icon, font cần thiết vào đây để Vite tối ưu hóa (nén, đổi tên, v.v.).

## Lưu ý

- Khác với `public/`, các tệp trong `assets/` được bundle và có thể được theo dõi thay đổi trong development.
- Sử dụng định dạng SVG cho icon để có thể thay đổi màu sắc qua CSS.
- Nếu có nhiều tài nguyên, chia thành thư mục con như `images/`, `icons/`, `fonts/`.
