const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * Restore MongoDB Database Script
 * Restores a backup of the MongoDB database
 */

const BACKUP_DIR = path.join(__dirname, '../../../db/backups');
const CONTAINER_NAME = 'todolist-webapp-mongodb-1';
const DB_NAME = 'todolist';

function listBackups() {
  if (!fs.existsSync(BACKUP_DIR)) {
    console.log('❌ No backups directory found.');
    return [];
  }

  const backups = fs
    .readdirSync(BACKUP_DIR)
    .filter((file) => file.endsWith('.archive'))
    .sort()
    .reverse();

  return backups;
}

function restoreBackup(backupFile) {
  console.log('🔄 Starting MongoDB restore...\n');

  try {
    // Verify backup file exists
    const backupPath = path.join(BACKUP_DIR, backupFile);
    if (!fs.existsSync(backupPath)) {
      throw new Error(`Backup file not found: ${backupFile}`);
    }

    const stats = fs.statSync(backupPath);
    const fileSizeInMB = (stats.size / (1024 * 1024)).toFixed(2);

    console.log(`📦 Restoring from: ${backupFile}`);
    console.log(`   Size: ${fileSizeInMB} MB`);

    // Confirm restore
    console.log(
      '\n⚠️  WARNING: This will replace all existing data in the database!',
    );
    console.log('   Press Ctrl+C to cancel, or wait 5 seconds to continue...\n');

    // Wait 5 seconds
    execSync('timeout 5', { stdio: 'inherit' }).catch(() => {});

    const containerRestorePath = '/data/db/temp-restore.archive';

    // Copy backup to container
    console.log('   Copying backup to container...');
    execSync(`docker cp "${backupPath}" ${CONTAINER_NAME}:${containerRestorePath}`, {
      stdio: 'inherit',
    });

    // Restore using mongorestore
    console.log('   Running mongorestore...');
    execSync(
      `docker exec ${CONTAINER_NAME} mongorestore --db ${DB_NAME} --archive=${containerRestorePath} --drop`,
      { stdio: 'inherit' },
    );

    // Clean up temporary file in container
    execSync(`docker exec ${CONTAINER_NAME} rm ${containerRestorePath}`);

    console.log('\n✅ Restore completed successfully!');
    console.log(
      `   Database '${DB_NAME}' has been restored from ${backupFile}`,
    );

    // Verify collections
    console.log('\n📋 Verifying collections:');
    try {
      const collections = execSync(
        `docker exec ${CONTAINER_NAME} mongosh ${DB_NAME} --quiet --eval "db.getCollectionNames().forEach(c => print(c + ': ' + db[c].countDocuments()))"`,
      ).toString();
      console.log(collections);
    } catch (err) {
      console.log('   (Could not verify collections)');
    }
  } catch (error) {
    console.error('❌ Restore failed:', error.message);
    process.exit(1);
  }
}

// Main
const args = process.argv.slice(2);

if (args.length === 0) {
  console.log('📋 Available backups:\n');
  const backups = listBackups();

  if (backups.length === 0) {
    console.log('No backups found.');
    console.log('\nRun backup first:');
    console.log('  node .agent/skills/db-operations/scripts/backup-db.js');
  } else {
    backups.forEach((backup, index) => {
      const backupPath = path.join(BACKUP_DIR, backup);
      const stats = fs.statSync(backupPath);
      const size = (stats.size / (1024 * 1024)).toFixed(2);
      const date = new Date(stats.mtime).toLocaleString();
      console.log(`${index + 1}. ${backup}`);
      console.log(`   Size: ${size} MB | Modified: ${date}\n`);
    });

    console.log('\nUsage:');
    console.log('  node restore-db.js <backup-filename>');
    console.log('\nExample:');
    console.log(
      `  node restore-db.js ${backups[0]}`,
    );
  }
} else {
  restoreBackup(args[0]);
}
