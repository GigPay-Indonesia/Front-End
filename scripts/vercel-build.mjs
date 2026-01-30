import { execSync } from 'node:child_process';

const run = (cmd) => execSync(cmd, { stdio: 'inherit' });

// Always generate Prisma Client.
run('npx prisma generate');

// Only apply migrations on Vercel/CI where a hosted DB is configured.
// This prevents local builds from failing when Postgres isn't running.
if (process.env.VERCEL) {
  run('npx prisma migrate deploy');
}

run('vite build');

