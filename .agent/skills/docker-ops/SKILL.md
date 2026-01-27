---
name: Docker Operations
description: Manage Docker containers and troubleshoot common issues
---

# Docker Operations Skill

This skill provides guidance for managing Docker containers for the To-Do List WebApp project.

## Quick Commands

```bash
# Start all services
npm run dev
# or
docker-compose up

# Start in background
docker-compose up -d

# Stop all services
npm run stop
# or
docker-compose down

# Restart services
npm run restart

# View status
npm run status
# or
docker-compose ps
```

## Container Management

### View Running Containers

```bash
# All running containers
docker ps

# All containers (including stopped)
docker ps -a

# Specific to this project
docker ps | grep todolist
```

### Start/Stop Individual Services

```bash
# Start specific service
docker-compose start mongodb
docker-compose start backend
docker-compose start frontend

# Stop specific service
docker-compose stop mongodb
docker-compose stop backend
docker-compose stop frontend

# Restart specific service
docker-compose restart backend
```

### Remove Containers

```bash
# Stop and remove all containers
docker-compose down

# Remove containers and volumes (deletes data!)
docker-compose down -v

# Remove specific container
docker rm <container-id>

# Force remove running container
docker rm -f <container-id>
```

## Logs and Debugging

### View Logs

```bash
# All services
npm run logs
# or
docker-compose logs

# Follow logs (real-time)
npm run logs
# or
docker-compose logs -f

# Specific service
npm run logs:backend
npm run logs:frontend
docker-compose logs mongodb

# Last N lines
docker-compose logs --tail=100 backend

# With timestamps
docker-compose logs -t backend
```

### Execute Commands in Container

```bash
# Open shell in backend container
docker exec -it todolist-webapp-backend-1 sh

# Open shell in MongoDB container
docker exec -it todolist-webapp-mongodb-1 sh

# Run single command
docker exec todolist-webapp-backend-1 ls -la
docker exec todolist-webapp-mongodb-1 mongosh --eval "db.stats()"
```

## Building and Rebuilding

### Rebuild Containers

```bash
# Rebuild all services
docker-compose up --build

# Rebuild specific service
docker-compose build backend
docker-compose up -d backend

# Force rebuild (no cache)
docker-compose build --no-cache
```

### Pull Latest Images

```bash
# Pull latest base images
docker-compose pull
```

## Image Management

### List Images

```bash
# All images
docker images

# Project images
docker images | grep todolist
```

### Remove Images

```bash
# Remove specific image
docker rmi <image-id>

# Remove unused images
docker image prune

# Remove all unused images
docker image prune -a
```

## Volume Management

### List Volumes

```bash
# All volumes
docker volume ls

# Project volumes
docker volume ls | grep todolist
```

### Inspect Volume

```bash
docker volume inspect todolist-webapp_mongodb-data
```

### Remove Volumes

```bash
# Remove specific volume (data will be lost!)
docker volume rm todolist-webapp_mongodb-data

# Remove all unused volumes
docker volume prune
```

## Network Management

### List Networks

```bash
docker network ls
```

### Inspect Network

```bash
docker network inspect todolist-webapp_default
```

### Test Network Connectivity

```bash
# From backend to MongoDB
docker exec todolist-webapp-backend-1 ping mongodb

# Check MongoDB connection
docker exec todolist-webapp-backend-1 nc -zv mongodb 27017
```

## Resource Usage

### View Resource Usage

```bash
# All containers
docker stats

# Specific container
docker stats todolist-webapp-backend-1

# One-time snapshot
docker stats --no-stream
```

### Disk Usage

```bash
# Overall Docker disk usage
docker system df

# Detailed view
docker system df -v
```

## Cleanup

### Clean Everything

```bash
# WARNING: This removes all unused Docker resources!

# Remove stopped containers
docker container prune

# Remove unused images
docker image prune

# Remove unused volumes
docker volume prune

# Remove unused networks
docker network prune

# Remove everything unused
docker system prune

# Remove everything including volumes
docker system prune --volumes

# Nuclear option (remove ALL containers, images, volumes)
docker system prune -a --volumes
```

### Project-Specific Cleanup

```bash
# Stop and remove project containers
docker-compose down

# Remove project containers and volumes
docker-compose down -v

# Clean and reinstall everything
npm run clean
npm run install:all
npm run dev
```

## Troubleshooting

### Port Already in Use

**Error**: "Port is already allocated"

**Solutions**:
```bash
# Find process using port (Windows)
netstat -ano | findstr :5000
netstat -ano | findstr :5173

# Kill process by PID (Windows)
taskkill /PID <pid> /F

# Or change port in docker-compose.yml or .env
```

### Container Keeps Restarting

**Solutions**:
```bash
# Check logs
docker-compose logs backend

# Check container status
docker ps -a

# Inspect container
docker inspect todolist-webapp-backend-1

# Try running without detached mode
docker-compose up
```

### Cannot Connect to MongoDB

**Solutions**:
```bash
# Check if MongoDB is running
docker ps | grep mongo

# Check MongoDB logs
docker-compose logs mongodb

# Restart MongoDB
docker-compose restart mongodb

# Verify connection from backend
docker exec todolist-webapp-backend-1 nc -zv mongodb 27017
```

### Out of Disk Space

**Solutions**:
```bash
# Check disk usage
docker system df

# Clean up unused resources
docker system prune

# Remove specific large images
docker images
docker rmi <image-id>
```

### Permission Denied

**Solutions**:
```bash
# Run Docker commands with elevated privileges (Windows)
# Ensure Docker Desktop is running

# On Linux, add user to docker group
sudo usermod -aG docker $USER

# Restart Docker service
# Windows: Restart Docker Desktop
# Linux: sudo systemctl restart docker
```

### Container Build Fails

**Solutions**:
```bash
# Build with no cache
docker-compose build --no-cache

# Check Dockerfile syntax
cat backend/Dockerfile

# View build logs
docker-compose up --build

# Try building manually
cd backend
docker build -t test-backend .
```

## Health Checks

### Check Container Health

```bash
# Inspect health status
docker inspect --format='{{.State.Health.Status}}' todolist-webapp-backend-1

# View health check logs
docker inspect --format='{{json .State.Health}}' todolist-webapp-backend-1
```

### Manual Health Checks

```bash
# Backend
curl http://localhost:5000/api/health

# Frontend
curl http://localhost:5173

# MongoDB
docker exec todolist-webapp-mongodb-1 mongosh --eval "db.serverStatus().ok"
```

## Performance Optimization

### Limit Resource Usage

Add to `docker-compose.yml`:

```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
        reservations:
          memory: 256M
```

### Reduce Build Time

1. Use `.dockerignore` files
2. Order Dockerfile commands efficiently (dependencies first)
3. Use multi-stage builds
4. Leverage build cache

## Best Practices

1. **Always use docker-compose**: Don't run `docker run` manually
2. **Check logs first**: When troubleshooting, always check logs
3. **Clean up regularly**: Remove unused images and containers
4. **Use volumes for data**: Never store data in containers
5. **Don't run as root**: Use non-root users in production
6. **Tag images**: Use versioning for images
7. **Monitor resources**: Keep an eye on disk and memory usage
8. **Backup volumes**: Regular backups of MongoDB data

## Useful Aliases

Add to your shell profile (.bashrc, .zshrc, PowerShell profile):

```bash
# Docker shortcuts
alias dps='docker ps'
alias dlog='docker-compose logs -f'
alias dup='docker-compose up -d'
alias ddown='docker-compose down'
alias drestart='docker-compose restart'
```

## Docker Compose Reference

### Common docker-compose Commands

```bash
# Start services
docker-compose up
docker-compose up -d                    # Detached mode
docker-compose up --build               # Rebuild before starting
docker-compose up --force-recreate      # Recreate containers

# Stop services
docker-compose stop                     # Stop without removing
docker-compose down                     # Stop and remove
docker-compose down -v                  # Stop, remove, and delete volumes

# Manage services
docker-compose restart <service>
docker-compose pause <service>
docker-compose unpause <service>

# View information
docker-compose ps                       # List containers
docker-compose logs                     # View logs
docker-compose top                      # View running processes
docker-compose config                   # Validate and view config

# Execute commands
docker-compose exec <service> <command>
docker-compose run <service> <command>
```

## See Also

- Docker documentation: https://docs.docker.com
- Docker Compose documentation: https://docs.docker.com/compose
- Project's docker-compose.yml
- Individual Dockerfiles in backend/ and frontend/
