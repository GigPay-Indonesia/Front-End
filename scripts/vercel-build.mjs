import { execSync, spawnSync } from 'node:child_process';

const LOG_ENDPOINT = 'http://127.0.0.1:7245/ingest/db4bbdf7-65ed-4d2d-8f1f-a869c687e301';
const SESSION_ID = 'debug-session';

const debugLog = (hypothesisId, location, message, data) => {
  // #region agent log
  try {
    fetch(LOG_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: SESSION_ID,
        runId: process.env.VERCEL ? 'vercel-build' : 'local-build',
        hypothesisId,
        location,
        message,
        data,
        timestamp: Date.now(),
      }),
    }).catch(() => {});
  } catch {}
  // #endregion agent log
};

const envPresent = (k) => Boolean(process.env[k]);

const resolveDbEnvPresence = () => {
  const keys = [
    'DIRECT_DATABASE_URL',
    'DATABASE_URL',
    'POSTGRES_PRISMA_URL',
    'POSTGRES_URL',
    // allow previously used prefixes
    'DIRECT_DATABASE_URL_POSTGRES_PRISMA_URL',
    'DIRECT_DATABASE_URL_POSTGRES_URL',
    'DIRECT_DATABASE_URL_PRISMA_DATABASE_URL',
    'DIRECT_DATABASE_URL_DATABASE_URL',
    'DIRECT_DATABASE_POSTGRES_URL',
    'DIRECT_DATABASE_PRISMA_DATABASE_URL',
    'DIRECT_DATABASE_DATABASE_URL',
  ];
  const present = Object.fromEntries(keys.map((k) => [k, envPresent(k)]));
  return { keys, present, hasAny: Object.values(present).some(Boolean) };
};

const run = (cmd, hypothesisId) => {
  console.log(`[build] RUN ${cmd}`);
  debugLog(hypothesisId, 'scripts/vercel-build.mjs:run', 'RUN', {
    cmd,
    node: process.version,
    vercel: Boolean(process.env.VERCEL),
  });
  try {
    execSync(cmd, { stdio: 'inherit' });
  } catch (e) {
    console.error(`[build] FAIL ${cmd}`);
    debugLog(hypothesisId, 'scripts/vercel-build.mjs:run', 'FAIL', {
      cmd,
      node: process.version,
      vercel: Boolean(process.env.VERCEL),
      errorName: e?.name,
      status: e?.status ?? null,
      signal: e?.signal ?? null,
      message: typeof e?.message === 'string' ? e.message.slice(0, 500) : undefined,
    });
    throw e;
  }
};

const runCapture = (cmd, hypothesisId) => {
  console.log(`[build] RUN ${cmd}`);
  debugLog(hypothesisId, 'scripts/vercel-build.mjs:runCapture', 'RUN', {
    cmd,
    node: process.version,
    vercel: Boolean(process.env.VERCEL),
  });
  const res = spawnSync(cmd, { shell: true, encoding: 'utf8' });
  const out = `${res.stdout || ''}${res.stderr || ''}`.trim();
  if (out) console.log(out);
  if (res.status === 0) return out;

  console.error(`[build] FAIL ${cmd}`);
  debugLog(hypothesisId, 'scripts/vercel-build.mjs:runCapture', 'FAIL', {
    cmd,
    node: process.version,
    vercel: Boolean(process.env.VERCEL),
    status: res.status ?? null,
    signal: res.signal ?? null,
    // don't spam logs; enough for detection + debugging
    outputHead: out.slice(0, 2000),
  });
  const err = new Error(`Command failed: ${cmd}\n${out.slice(0, 2000)}`);
  err.status = res.status;
  throw err;
};

const tryResolveFailedMigration = (migrationName) => {
  console.warn(`[build] attempting prisma migrate resolve --rolled-back ${migrationName}`);
  debugLog('D', 'scripts/vercel-build.mjs:resolve', 'TRY_RESOLVE_ROLLED_BACK', { migrationName });
  execSync(`npx prisma migrate resolve --rolled-back ${migrationName}`, { stdio: 'inherit' });
};

debugLog('A', 'scripts/vercel-build.mjs:top', 'BUILD_START', {
  node: process.version,
  vercel: Boolean(process.env.VERCEL),
});

// Ensure a stable public URL is available for Vite HTML env replacement.
// Vercel provides VERCEL_URL as hostname without scheme.
if (!process.env.VITE_PUBLIC_URL && process.env.VERCEL_URL) {
  process.env.VITE_PUBLIC_URL = `https://${process.env.VERCEL_URL}`;
}

// Always generate Prisma Client.
run('npx prisma generate', 'A');

// Generate Base Mini App manifest with correct absolute URLs.
run('node scripts/generate-miniapp-manifest.mjs', 'A');

// Only apply migrations on Vercel/CI where a hosted DB is configured.
// This prevents local builds from failing when Postgres isn't running.
if (process.env.VERCEL) {
  const dbEnv = resolveDbEnvPresence();
  debugLog('B', 'scripts/vercel-build.mjs:dbEnv', 'DB_ENV_PRESENCE', {
    node: process.version,
    vercel: true,
    hasAny: dbEnv.hasAny,
    present: dbEnv.present,
  });

  if (!dbEnv.hasAny) {
    console.warn('[build] SKIP prisma migrate deploy (no DB env vars present at build time)');
    debugLog('B', 'scripts/vercel-build.mjs:migrate', 'MIGRATE_SKIPPED_NO_DB_ENV', {
      node: process.version,
      present: dbEnv.present,
    });
  } else {
    try {
      runCapture('npx prisma migrate deploy', 'B');
    } catch (e) {
      const msg = typeof e?.message === 'string' ? e.message : '';
      // Runtime evidence: Vercel build can fail with P3009 if a migration is marked failed.
      // We can safely mark it rolled-back (Postgres migrations are transactional) and retry once.
      if (msg.includes('P3009') && msg.includes('20260126_coreflow_update')) {
        debugLog('D', 'scripts/vercel-build.mjs:migrate', 'P3009_DETECTED_RETRYING', {
          migrationName: '20260126_coreflow_update',
        });
        tryResolveFailedMigration('20260126_coreflow_update');
        runCapture('npx prisma migrate deploy', 'D');
      } else {
        throw e;
      }
    }
  }
}

run('npx vite build', 'C');

