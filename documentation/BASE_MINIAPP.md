# Deploy as Base Mini App (Vite)

This project is deployable as a Base Mini App (MiniKit) while keeping the current Vite app.

References:
- Base “Create a Mini App”: `https://docs.base.org/mini-apps/quickstart/create-new-miniapp`
- Base “Migrate an Existing App”: `https://docs.base.org/mini-apps/quickstart/migrate-existing-apps`

## 1) What we added

- **Manifest**: `public/.well-known/farcaster.json`
  - Generated at build-time by `scripts/generate-miniapp-manifest.mjs` so URLs are correct in production.
- **Embed metadata**: `index.html`
  - Adds `<meta name="fc:miniapp" ...>` for rich previews + “Launch” button.
- **No-op webhook**: `api/webhook.js`
  - Returns 200 OK so Base Build preview doesn’t fail even if we aren’t using notifications yet.
- **Vercel rewrite**: `vercel.json`
  - Ensures `/api/webhook` routes to `api/webhook.js` (and is not swallowed by `/api/[...path]`).

## 2) Required Vercel settings

- **Deployment Protection OFF**
  - In Vercel: Settings → Deployment Protection → toggle off “Vercel Authentication”.
  - This is required so Base Build can fetch your manifest and embed metadata.

## 3) Environment variables

- **`VITE_PUBLIC_URL` (recommended)**: set to your production origin, e.g. `https://gigpay.vercel.app`
  - If not set, the build script falls back to `https://${VERCEL_URL}` on Vercel.

## 4) Verify URLs after deploying

Open these in a browser:

- `https://<your-domain>/.well-known/farcaster.json`
- `https://<your-domain>/api/webhook`
- `https://<your-domain>/` (app home)

## 5) Account association (Base Build)

1. Deploy to production and confirm the manifest is reachable at:
   - `https://<your-domain>/.well-known/farcaster.json`
2. Go to Base Build account association tool:
   - `https://www.base.dev/preview?tab=account`
3. Paste your domain and follow the “Verify” flow.
4. Copy the returned `accountAssociation` fields into the manifest object.

## 6) Preview + publish

- Preview: `https://www.base.dev/preview`
  - Add your app URL, validate embeds, and click Launch.
- Publish:
  - Create a post in the Base app that includes your app URL.

