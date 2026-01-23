# ---------- Build stage (Node >= 22.12, glibc) ----------
FROM node:22.12.0-bookworm-slim AS build

# Thiết lập thư mục làm việc
WORKDIR /app

# Cài deps trước để tận dụng cache
COPY package*.json ./

# Cài đặt dependencies
RUN npm ci

# Sao chép toàn bộ mã nguồn vào container
COPY . .

# Xây dựng ứng dụng
RUN npm run build

# ---------- Serve stage (Nginx) ----------
FROM nginx:stable-alpine
# Nginx reverse proxy + SPA fallback
COPY nginx.conf /etc/nginx/conf.d/default.conf
# Static files
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
