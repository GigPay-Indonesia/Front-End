import fs from 'node:fs';
import path from 'node:path';

const workspaceRoot = process.cwd();
const manifestPath = path.join(workspaceRoot, 'public', '.well-known', 'farcaster.json');

const normalizeRootUrl = (raw) => {
  const v = String(raw || '').trim();
  if (!v) return '';
  const withScheme = v.startsWith('http://') || v.startsWith('https://') ? v : `https://${v}`;
  return withScheme.replace(/\/+$/, '');
};

const resolveRootUrl = () => {
  // Prefer explicit config.
  const explicit = normalizeRootUrl(process.env.VITE_PUBLIC_URL);
  if (explicit) return explicit;

  // Vercel provides hostname in VERCEL_URL (no scheme).
  const vercel = normalizeRootUrl(process.env.VERCEL_URL);
  if (vercel) return vercel;

  // Local fallback (only for dev/testing).
  return 'http://localhost:5173';
};

const readJson = (p) => {
  try {
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch {
    return null;
  }
};

const rootUrl = resolveRootUrl();
const existing = readJson(manifestPath) || {};
const existingAssoc = existing?.accountAssociation || {};

const accountAssociation = {
  header: typeof existingAssoc.header === 'string' ? existingAssoc.header : '',
  payload: typeof existingAssoc.payload === 'string' ? existingAssoc.payload : '',
  signature: typeof existingAssoc.signature === 'string' ? existingAssoc.signature : '',
};

const out = {
  accountAssociation,
  miniapp: {
    version: '1',
    name: 'GigPay Indonesia',
    subtitle: 'Treasury-backed freelancer payments',
    description: 'A yield-generating freelancer marketplace utilizing a Treasury + Escrow architecture.',
    screenshotUrls: [`${rootUrl}/miniapp/screenshot-portrait.png`],
    iconUrl: `${rootUrl}/miniapp/icon.png`,
    splashImageUrl: `${rootUrl}/miniapp/splash.png`,
    splashBackgroundColor: '#0b0f1a',
    homeUrl: rootUrl,
    webhookUrl: `${rootUrl}/api/webhook`,
    primaryCategory: 'finance',
    tags: ['gigpay', 'treasury', 'escrow', 'payments', 'base'],
    heroImageUrl: `${rootUrl}/miniapp/hero.png`,
    tagline: 'Treasury-backed escrow payments',
    ogTitle: 'GigPay Indonesia',
    ogDescription: 'Treasury-backed freelancer payments with escrow and optional yield.',
    ogImageUrl: `${rootUrl}/miniapp/embed.png`,
  },
};

fs.mkdirSync(path.dirname(manifestPath), { recursive: true });
fs.writeFileSync(manifestPath, JSON.stringify(out, null, 2) + '\n', 'utf8');
console.log(`[miniapp] wrote manifest ${manifestPath} (rootUrl=${rootUrl})`);

