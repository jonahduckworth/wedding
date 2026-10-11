import { readFile, lstat } from 'node:fs/promises';
import path from 'node:path';
import pg from 'pg';
import { Auth } from './auth.mjs';
import { createArchiveServer } from './app.mjs';
import { createRecordsReader, verifyReadOnlyRole } from './database.mjs';

async function secretFile(filename) {
  if (!filename || !path.isAbsolute(filename)) throw Error('Absolute secret file path required');
  const info = await lstat(filename);
  if (!info.isFile() || info.size > 16384 || (info.mode & 0o037) !== 0) throw Error('Secret file must be private and read-only to other users');
  return (await readFile(filename, 'utf8')).trim();
}

let pool;
try {
  const origin = process.env.ARCHIVE_ORIGIN;
  const publicDir = process.env.ARCHIVE_PUBLIC_DIR;
  const uploadsDir = process.env.ARCHIVE_UPLOADS_DIR;
  if (origin !== 'https://wedding.jdbuilds.ca') throw Error('Unexpected archive origin');
  if (!publicDir || !path.isAbsolute(publicDir)) throw Error('Absolute public directory required');
  if (uploadsDir && !path.isAbsolute(uploadsDir)) throw Error('Absolute uploads directory required');
  const auth = new Auth(JSON.parse(await secretFile(process.env.ARCHIVE_AUTH_FILE)));
  const connectionString = await secretFile(process.env.ARCHIVE_DATABASE_URL_FILE);
  const databaseURL = new URL(connectionString);
  if (!['postgres:', 'postgresql:'].includes(databaseURL.protocol) || databaseURL.search) throw Error('Plain PostgreSQL URL without SSL overrides required');
  // TLS validation is mandatory by default. A deployment reviewer may choose
  // private-network plaintext only with the explicit acknowledgement below.
  let ssl;
  if (process.env.ARCHIVE_DB_TRANSPORT === 'private-network-plaintext-reviewed') ssl = false;
  else {
    ssl = { rejectUnauthorized: true };
    if (process.env.ARCHIVE_DB_CA_FILE) ssl.ca = await readFile(process.env.ARCHIVE_DB_CA_FILE, 'utf8');
  }
  pool = new pg.Pool({ connectionString, ssl, max: 3, connectionTimeoutMillis: 5000, idleTimeoutMillis: 10000,
    options: '-c default_transaction_read_only=on -c statement_timeout=5000 -c lock_timeout=1000 -c search_path=pg_catalog,public' });
  pool.on('error', () => { console.error('Archive database connection interrupted'); });
  await verifyReadOnlyRole(pool);
  const server = createArchiveServer({ auth, readRecords: createRecordsReader(pool), publicDir, uploadsDir, origin });
  const port = Number(process.env.PORT ?? 8080);
  if (!Number.isInteger(port) || port < 1024 || port > 65535) throw Error('Invalid port');
  server.listen(port, '0.0.0.0', () => console.info('Read-only wedding archive ready'));
  for (const signal of ['SIGTERM', 'SIGINT']) process.once(signal, () => {
    server.close(() => pool.end().then(() => process.exit(0)));
    setTimeout(() => process.exit(1), 10000).unref();
  });
} catch {
  console.error('Archive startup refused: check private configuration, database access and read-only grants');
  if (pool) await pool.end().catch(() => {});
  process.exitCode = 1;
}
