# Quick Start Scripts

Các câu lệnh hữu ích để làm việc với dự án:

## Development (Local)

```bash
# Chạy cả frontend và backend cùng lúc với Docker
npm run dev

# Chạy riêng backend (không cần Docker)
npm run dev:backend

# Chạy riêng frontend (không cần Docker)  
npm run dev:frontend
```

## Build

```bash
# Build cả backend và frontend
npm run build

# Build riêng frontend
npm run build:frontend

# Build riêng backend
npm run build:backend
```

## Testing & Linting

```bash
# Chạy tất cả tests
npm test

# Chạy test riêng
npm run test:backend
npm run test:frontend

# Chạy lint cho cả hai
npm run lint

# Chạy lint riêng
npm run lint:backend
npm run lint:frontend

# Auto-fix lint issues
npm run lint:fix

# Format code với Prettier
npm run format

# Kiểm tra format
npm run format:check
```

## Docker Commands

```bash
# Khởi động lại containers
npm run restart

# Dừng containers
npm run stop

# Kiểm tra trạng thái containers
npm run status

# Dọn dẹp containers và volumes
npm run clean

# Xem tất cả logs
npm run logs

# Xem logs backend
npm run logs:backend

# Xem logs frontend  
npm run logs:frontend
```

## Installation

```bash
# Install tất cả dependencies
npm run install:all

# Clean và reinstall
npm run clean:modules && npm run install:all
```

## Vercel Deployment

```bash
# Build production
cd frontend && npm run build

# Preview production build locally
cd frontend && npm run preview
```

## Useful Git Commands

```bash
# Check status
git status

# Add all changes
git add -A

# Commit with message
git commit -m "your message"

# Push to GitHub
git push origin main

# View recent commits
git log --oneline -n 5
```

## Environment Variables

### Local Development
- Backend: `backend/.env`
- Frontend: `frontend/.env`

### Production (Vercel)
- Xem hướng dẫn trong `VERCEL_DEPLOYMENT.md`

## Port Configuration

- **Frontend (Dev)**: http://localhost:5173
- **Backend (Dev)**: http://localhost:4000
- **API Docs**: http://localhost:4000/api-docs
- **API Endpoint**: http://localhost:4000/api

## Common Issues

### Port already in use
```bash
# Windows
netstat -ano | findstr :4000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:4000 | xargs kill -9
```

### CORS errors
- Kiểm tra `CORS_ORIGIN` trong backend/.env
- Đảm bảo frontend domain được thêm vào allowed origins

### Docker issues
```bash
# Restart Docker
npm run stop
npm run clean
npm run dev
```
