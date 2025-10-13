# ---------- Build stage (Node >= 22.12, glibc) ----------
FROM node:22.12.0-bookworm-slim AS build
WORKDIR /app

# Cài deps trước để tận dụng cache
COPY package*.json ./
# Frontend cần devDependencies để build -> KHÔNG dùng --omit=dev / --production
RUN npm ci

# Copy source & build
COPY . .
# Nếu dùng biến Vite, docker-compose đã set VITE_API_BASE=/api
RUN npm run build

# ---------- Serve stage (Nginx) ----------
FROM nginx:stable-alpine
# Nginx reverse proxy + SPA fallback
COPY nginx.conf /etc/nginx/conf.d/default.conf
# Static files
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
