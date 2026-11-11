# Z&S Textiles (`zandstextiles.com`)

Luxury pure combed cotton bath linens and Hajj/Umrah Ehrams storefront & admin portal built with **Next.js 14 Static Export** (`output: "export"`), **Tailwind CSS**, **Cloudflare Workers Static Assets**, and **PostgreSQL / Cloud Storage**.

## Architecture Highlights
- **Zero-Load Static Storefront**: Builds into a pure static bundle in `./out` (`npx wrangler deploy` deploys directly to Cloudflare Edge with zero SSR compute cost).
- **WebP KB-Compressed Media Pipeline**: Product photos, banners, categories, and checkout payment proofs are compressed cleanly to KB-scale `.webp` binaries in object storage — zero Base64 strings stored in PostgreSQL.
- **Full-Featured Control Hub (`/admin`)**: Manages products, multi-tier subcategories, orders, payment proof previews, printable invoices, banners, coupons, and store settings.

## Local Development

```bash
npm install
cp .env.example .env.local # Populate credentials before building or running CLI scripts
npm run dev
```

## Production Build & Cloudflare Deployment

1. Configure environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_ADMIN_PIN`) in `.env.local` or Cloudflare Workers Builds settings.
2. Build static assets:
   ```bash
   npm run build
   ```
3. Preview or deploy via Wrangler:
   ```bash
   npx wrangler deploy
   ```
