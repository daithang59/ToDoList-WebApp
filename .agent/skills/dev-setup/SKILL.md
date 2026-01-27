---
name: Development Setup
description: Set up the development environment for the To-Do List WebApp project
---

# Development Setup Skill

This skill guides you through setting up the complete development environment for the To-Do List WebApp project.

## Prerequisites

- Node.js >= 20.19.0
- npm >= 9.0.0
- Docker Desktop installed and running
- Git installed

## Setup Steps

### 1. Verify Prerequisites

First, verify that all required tools are installed:

```bash
node --version
npm --version
docker --version
git --version
```

### 2. Clone Repository (if needed)

If starting fresh:

```bash
git clone <repository-url>
cd To-DoList_WebApp
```

### 3. Install Dependencies

Install all dependencies for the monorepo (root, backend, and frontend):

```bash
npm run install:all
```

This command will:
- Install root dependencies
- Install backend dependencies
- Install frontend dependencies

### 4. Set Up Environment Variables

#### Backend Environment Variables

Create `backend/.env` from the example:

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env` and configure:
- `MONGODB_URI` - MongoDB connection string (default: mongodb://mongodb:27017/todolist)
- `JWT_SECRET` - Secret key for JWT tokens (generate a secure random string)
- `PORT` - Backend port (default: 5000)
- `FRONTEND_URL` - Frontend URL for CORS (default: http://localhost:5173)

#### Frontend Environment Variables

Create `frontend/.env` from the example:

```bash
cp frontend/.env.example frontend/.env
```

Edit `frontend/.env` and configure:
- `VITE_API_URL` - Backend API URL (default: http://localhost:5000/api)

### 5. Start Development Environment

Start all services using Docker Compose:

```bash
npm run dev
```

This will start:
- **MongoDB** on port 27017
- **Backend** on port 5000
- **Frontend** on port 5173

### 6. Verify Setup

Run the verification script to check that all services are running:

```bash
node .agent/skills/dev-setup/scripts/verify-setup.js
```

Or manually verify:

1. **Frontend**: Open http://localhost:5173 in your browser
2. **Backend API**: Check http://localhost:5000/api/health
3. **MongoDB**: Check Docker containers with `docker ps`

### 7. Alternative: Run Services Separately

If you prefer not to use Docker, you can run services separately:

```bash
# Terminal 1 - Start MongoDB (requires local MongoDB installation)
mongod

# Terminal 2 - Start Backend
npm run dev:backend

# Terminal 3 - Start Frontend
npm run dev:frontend
```

## Common Issues and Solutions

### Port Already in Use

If ports 5000 or 5173 are already in use:

1. Stop the conflicting process
2. Or change the port in the respective `.env` file

### Docker Not Starting

1. Ensure Docker Desktop is running
2. Check Docker logs: `docker-compose logs`
3. Restart Docker Desktop
4. Try rebuilding: `docker-compose up --build`

### Dependencies Installation Fails

1. Clear npm cache: `npm cache clean --force`
2. Delete `node_modules` and lock files: `npm run clean:modules`
3. Reinstall: `npm run install:all`

### MongoDB Connection Issues

1. Check Docker container status: `docker ps`
2. Check MongoDB logs: `docker-compose logs mongodb`
3. Verify MONGODB_URI in `backend/.env`
4. Restart containers: `npm run restart`

## Next Steps

After setup is complete:

1. **Run Tests**: Use the `run-tests` skill to verify everything works
2. **Check Code Quality**: Use the `lint-fix` skill to ensure code quality
3. **Start Development**: Begin working on features using `add-api-endpoint` or `add-react-component` skills

## Useful Commands

```bash
# View all running containers
docker ps

# View logs from all services
npm run logs

# View logs from specific service
npm run logs:backend
npm run logs:frontend

# Stop all services
npm run stop

# Restart all services
npm run restart

# Clean everything (including volumes)
npm run clean
```

## Development Workflow

1. Make changes to code
2. Backend auto-reloads on file changes (nodemon)
3. Frontend auto-reloads on file changes (Vite HMR)
4. MongoDB data persists in Docker volume

## Testing the Setup

Create a test todo item to verify the full stack is working:

1. Open http://localhost:5173
2. Register a new account
3. Create a new todo item
4. Verify it appears in the list
5. Check backend logs to see API requests
6. Check MongoDB using: `docker exec -it <mongodb-container-id> mongosh`
