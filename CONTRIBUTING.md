# Contributing Guide

Cảm ơn bạn đã quan tâm đến việc đóng góp cho TodoList WebApp! 🎉

## Development Setup

### Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0
- MongoDB (local hoặc Atlas)
- Docker (optional, để chạy với docker-compose)

### Installation

1. Clone repository:
```bash
git clone https://github.com/daithang59/ToDoList-WebApp.git
cd ToDoList-WebApp
```

2. Install dependencies:
```bash
npm run install:all
```

3. Setup environment variables:
```bash
# Copy example files
cp .env.example .env
cp backend/.env.example backend/.env  
cp frontend/.env.example frontend/.env

# Update với thông tin của bạn
```

4. Start development server:
```bash
npm run dev:backend  # Terminal 1
npm run dev:frontend # Terminal 2
```

## Code Style

### JavaScript/JSX
- Sử dụng ESLint configuration có sẵn
- Format code với Prettier trước khi commit
- Tuân theo React best practices

### Commits
Sử dụng conventional commits format:
```
type(scope): subject

body (optional)
```

**Types:**
- `feat`: Tính năng mới
- `fix`: Sửa bug
- `docs`: Cập nhật documentation
- `style`: Format, không thay đổi logic
- `refactor`: Refactor code
- `test`: Thêm/sửa tests
- `chore`: Maintenance tasks

**Examples:**
```bash
git commit -m "feat(todos): add drag and drop sorting"
git commit -m "fix(auth): resolve token expiration issue"
git commit -m "docs: update API documentation"
```

## Testing

```bash
# Run all tests
npm test

# Run backend tests only
npm run test:backend

# Run frontend tests only  
npm run test:frontend

# Watch mode
cd backend && npm run test:watch
```

## Linting & Formatting

```bash
# Lint all code
npm run lint

# Fix lint issues
npm run lint -- --fix

# Format all code
npm run format

# Check format
npm run format:check
```

## Pull Request Process

1. **Fork** repository
2. **Create branch** từ `main`:
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make changes** và test kỹ
4. **Commit** với conventional commits
5. **Push** lên fork của bạn:
   ```bash
   git push origin feature/amazing-feature
   ```
6. **Open Pull Request** với description đầy đủ

### PR Checklist
- [ ] Code đã được test
- [ ] Đã chạy `npm run lint` và fix errors
- [ ] Đã chạy `npm run format`
- [ ] Đã update CHANGELOG.md (nếu cần)
- [ ] Đã update documentation (nếu cần)
- [ ] PR description rõ ràng

## Project Structure

```
To-DoList_WebApp/
├── frontend/           # React frontend
│   ├── src/
│   │   ├── components/ # React components
│   │   ├── services/   # API services
│   │   └── ...
│   └── package.json
├── backend/            # Express backend
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   └── ...
│   └── package.json
├── CHANGELOG.md        # Version history
├── VERCEL_DEPLOYMENT.md # Deployment guide
└── package.json        # Root scripts
```

## Need Help?

- 📖 Đọc [README.md](README.md)
- 🚀 Xem [QUICK_START.md](QUICK_START.md)
- 🐛 Mở [Issue](https://github.com/daithang59/ToDoList-WebApp/issues)

Thank you for contributing! 🙏
