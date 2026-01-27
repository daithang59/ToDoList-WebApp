---
name: Database Operations
description: Manage MongoDB database operations including backup, restore, and maintenance
---

# Database Operations Skill

This skill provides guidance for common MongoDB database operations in the To-Do List WebApp project.

## Prerequisites

- Docker running with MongoDB container
- MongoDB container name: `todolist-mongodb` (or check with `docker ps`)

## Connecting to MongoDB

### Using Docker Exec

Connect to MongoDB shell inside the container:

```bash
# Find container name
docker ps | grep mongo

# Connect to MongoDB shell
docker exec -it todolist-webapp-mongodb-1 mongosh todolist
```

### Using MongoDB Compass (GUI)

1. Install MongoDB Compass: https://www.mongodb.com/products/compass
2. Connect with URI: `mongodb://localhost:27017/todolist`

### Using mongo Shell Locally

If you have MongoDB installed locally:

```bash
mongosh "mongodb://localhost:27017/todolist"
```

## Viewing Data

### List All Collections

```javascript
// In mongosh
show collections
```

### View Documents

```javascript
// View all users
db.users.find().pretty()

// View all todos
db.todos.find().pretty()

// View all projects
db.projects.find().pretty()

// Count documents
db.todos.countDocuments()
db.users.countDocuments()
```

### Query Examples

```javascript
// Find todos by user
db.todos.find({ userId: 'USER_ID' })

// Find completed todos
db.todos.find({ completed: true })

// Find todos with specific priority
db.todos.find({ priority: 'high' })

// Find recent todos
db.todos.find().sort({ createdAt: -1 }).limit(10)
```

## Backup Database

### Using Docker and mongodump

Run the backup script:

```bash
node .agent/skills/db-operations/scripts/backup-db.js
```

Or manually:

```bash
# Create backup directory
mkdir -p db/backups

# Backup using mongodump
docker exec todolist-webapp-mongodb-1 mongodump --db todolist --archive=/data/db/backup.archive

# Copy backup from container to host
docker cp todolist-webapp-mongodb-1:/data/db/backup.archive ./db/backups/backup-$(date +%Y%m%d-%H%M%S).archive
```

### Scheduled Backups

For regular backups, create a cron job or scheduled task:

```bash
# Linux/Mac: Add to crontab
# Backup every day at 2 AM
0 2 * * * cd /path/to/project && node .agent/skills/db-operations/scripts/backup-db.js
```

## Restore Database

### From Backup Archive

Run the restore script:

```bash
node .agent/skills/db-operations/scripts/restore-db.js <backup-file>
```

Or manually:

```bash
# Copy backup to container
docker cp ./db/backups/backup-YYYYMMDD-HHMMSS.archive todolist-webapp-mongodb-1:/data/db/restore.archive

# Restore using mongorestore
docker exec todolist-webapp-mongodb-1 mongorestore --db todolist --archive=/data/db/restore.archive --drop
```

**Note**: The `--drop` flag will drop existing collections before restoring.

## Database Maintenance

### Clear All Data (Development Only)

**⚠️ WARNING: This will delete all data!**

```javascript
// In mongosh
db.todos.deleteMany({})
db.users.deleteMany({})
db.projects.deleteMany({})
db.notificationsubscriptions.deleteMany({})
```

### Reset Database

To completely reset the database:

```bash
# Stop containers
docker-compose down

# Remove volumes
docker volume rm todolist-webapp_mongodb-data

# Restart
docker-compose up -d
```

### Optimize Database

```javascript
// In mongosh
// Rebuild indexes
db.todos.reIndex()
db.users.reIndex()

// Compact collection
db.runCommand({ compact: 'todos' })

// Get database stats
db.stats()
```

## Index Management

### View Indexes

```javascript
// In mongosh
db.todos.getIndexes()
db.users.getIndexes()
```

### Create Indexes

```javascript
// Create index on userId for faster queries
db.todos.createIndex({ userId: 1 })

// Create compound index
db.todos.createIndex({ userId: 1, completed: 1 })

// Create text index for search
db.todos.createIndex({ title: 'text', description: 'text' })
```

### Drop Indexes

```javascript
// Drop specific index
db.todos.dropIndex('userId_1')

// Drop all indexes except _id
db.todos.dropIndexes()
```

## Data Migration

### Export Data to JSON

```bash
# Export entire database
docker exec todolist-webapp-mongodb-1 mongoexport --db todolist --collection todos --out /data/db/todos.json

# Copy to host
docker cp todolist-webapp-mongodb-1:/data/db/todos.json ./db/exports/todos.json
```

### Import Data from JSON

```bash
# Copy to container
docker cp ./db/exports/todos.json todolist-webapp-mongodb-1:/data/db/todos.json

# Import
docker exec todolist-webapp-mongodb-1 mongoimport --db todolist --collection todos --file /data/db/todos.json
```

## Monitoring

### Database Size

```javascript
// In mongosh
db.stats(1024*1024) // Size in MB
```

### Connection Status

```bash
# Check MongoDB container logs
docker logs todolist-webapp-mongodb-1

# Follow logs in real-time
docker logs -f todolist-webapp-mongodb-1
```

### Active Connections

```javascript
// In mongosh
db.serverStatus().connections
```

## Troubleshooting

### Connection Refused

1. Check if MongoDB container is running:
   ```bash
   docker ps | grep mongo
   ```

2. Check container logs:
   ```bash
   docker logs todolist-webapp-mongodb-1
   ```

3. Restart container:
   ```bash
   docker-compose restart mongodb
   ```

### Storage Full

1. Check disk usage:
   ```bash
   docker system df
   ```

2. Clean up unused volumes:
   ```bash
   docker volume prune
   ```

3. Remove old backups:
   ```bash
   rm -rf db/backups/old-backups
   ```

### Slow Queries

1. Enable profiling:
   ```javascript
   db.setProfilingLevel(1, { slowms: 100 })
   ```

2. View slow queries:
   ```javascript
   db.system.profile.find().sort({ ts: -1 }).limit(5)
   ```

3. Add appropriate indexes

## Best Practices

1. **Regular Backups**: Schedule daily backups to prevent data loss
2. **Index Optimization**: Create indexes for frequently queried fields
3. **Monitor Size**: Keep an eye on database size and plan for scaling
4. **Test Restores**: Periodically test backup restoration process
5. **Separate Environments**: Use different databases for dev, test, and production
6. **Access Control**: In production, enable authentication and use strong passwords

## Useful Commands

```bash
# Database status
docker exec todolist-webapp-mongodb-1 mongosh --eval "db.serverStatus()"

# List all databases
docker exec todolist-webapp-mongodb-1 mongosh --eval "show dbs"

# Database size
docker exec todolist-webapp-mongodb-1 mongosh todolist --eval "db.stats(1024*1024)"

# Collection stats
docker exec todolist-webapp-mongodb-1 mongosh todolist --eval "db.todos.stats()"
```
