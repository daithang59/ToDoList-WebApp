const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * Backup MongoDB Database Script
 * Creates a backup of the MongoDB database
 */

const BACKUP_DIR = path.join(__dirname, '../../../db/backups');
const CONTAINER_NAME = 'todolist-webapp-mongodb-1';
const DB_NAME = 'todolist';

function createBackup() {
  console.log('🔄 Starting MongoDB backup...\n');

  try {
    // Create backup directory if it doesn't exist
    if (!fs.existsSync(BACKUP_DIR)) {
      fs.mkdirSync(BACKUP_DIR, { recursive: true });
      console.log(`✅ Created backup directory: ${BACKUP_DIR}`);
    }

    // Generate backup filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = `backup-${timestamp}.archive`;
    const backupPath = path.join(BACKUP_DIR, backupFile);
    const containerBackupPath = '/data/db/temp-backup.archive';

    console.log(`📦 Creating backup: ${backupFile}`);

    // Create backup inside container
    console.log('   Running mongodump...');
    execSync(
      `docker exec ${CONTAINER_NAME} mongodump --db ${DB_NAME} --archive=${containerBackupPath}`,
      { stdio: 'inherit' },
    );

    // Copy backup from container to host
    console.log('   Copying backup to host...');
    execSync(`docker cp ${CONTAINER_NAME}:${containerBackupPath} "${backupPath}"`, {
      stdio: 'inherit',
    });

    // Clean up temporary file in container
    execSync(`docker exec ${CONTAINER_NAME} rm ${containerBackupPath}`);

    // Get file size
    const stats = fs.statSync(backupPath);
    const fileSizeInMB = (stats.size / (1024 * 1024)).toFixed(2);

    console.log(`\n✅ Backup completed successfully!`);
    console.log(`   File: ${backupFile}`);
    console.log(`   Size: ${fileSizeInMB} MB`);
    console.log(`   Location: ${backupPath}`);

    // List recent backups
    const backups = fs
      .readdirSync(BACKUP_DIR)
      .filter((file) => file.startsWith('backup-'))
      .sort()
      .reverse();

    console.log(`\n📋 Recent backups (showing last 5):`);
    backups.slice(0, 5).forEach((backup, index) => {
      const backupPath = path.join(BACKUP_DIR, backup);
      const stats = fs.statSync(backupPath);
      const size = (stats.size / (1024 * 1024)).toFixed(2);
      console.log(`   ${index + 1}. ${backup} (${size} MB)`);
    });

    // Cleanup old backups (keep last 10)
    if (backups.length > 10) {
      console.log(`\n🧹 Cleaning up old backups (keeping last 10)...`);
      backups.slice(10).forEach((backup) => {
        const oldBackupPath = path.join(BACKUP_DIR, backup);
        fs.unlinkSync(oldBackupPath);
        console.log(`   Deleted: ${backup}`);
      });
    }
  } catch (error) {
    console.error('❌ Backup failed:', error.message);
    process.exit(1);
  }
}

createBackup();
