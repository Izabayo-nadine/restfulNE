import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const backupPath = process.argv[2];
if (!backupPath) {
  console.error('Usage: node scripts/restore-db.js <backup-folder>');
  process.exit(1);
}
const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/fems';
const fullPath = path.isAbsolute(backupPath) ? backupPath : path.join(__dirname, '..', backupPath);
execSync(`mongorestore --uri="${uri}" --drop "${fullPath}"`, { stdio: 'inherit' });
console.log('Restore complete');
