/**
 * MongoDB backup script for FEMS
 * Usage: node scripts/backup-db.js
 * Requires mongodump in PATH
 */
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/fems';
const outDir = path.join(__dirname, '..', 'database', 'backups', `backup-${Date.now()}`);

fs.mkdirSync(outDir, { recursive: true });

try {
  execSync(`mongodump --uri="${uri}" --out="${outDir}"`, { stdio: 'inherit' });
  console.log(`Backup saved to ${outDir}`);
} catch (e) {
  console.error('Backup failed. Ensure MongoDB tools (mongodump) are installed.');
  console.error(e.message);
  process.exit(1);
}
