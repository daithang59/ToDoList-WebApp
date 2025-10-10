# Thư mục Public

## Mô tả

Thư mục `public/` chứa các tệp tĩnh của ứng dụng React. Các tệp trong thư mục này sẽ được sao chép trực tiếp vào thư mục build khi ứng dụng được build, và có thể truy cập trực tiếp qua URL của ứng dụng.

## Các tệp chính

- `vite.svg`: Icon SVG của Vite, được sử dụng làm favicon hoặc icon mặc định cho ứng dụng.

## Cách sử dụng

- Đặt các tệp tĩnh như hình ảnh, font, hoặc các tệp không cần xử lý bởi bundler vào đây.
- Ví dụ: favicon.ico, manifest.json, robots.txt, v.v.
- Để thay đổi favicon, thay thế `vite.svg` hoặc thêm tệp favicon.ico và cập nhật trong `index.html`.

## Lưu ý

- Các tệp trong `public/` không được xử lý bởi Vite, nên không thể sử dụng import hoặc biến môi trường.
- Đường dẫn đến các tệp này sẽ là `/tên-tệp` (từ root của ứng dụng).
