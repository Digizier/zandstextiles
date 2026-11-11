import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import { createClient } from '@supabase/supabase-js';
import pg from 'pg';
import { getPgConfig, getRequiredEnv } from './load-env.mjs';

const { Client } = pg;

const SUPABASE_URL = getRequiredEnv('NEXT_PUBLIC_SUPABASE_URL');
const SERVICE_ROLE_KEY = getRequiredEnv('SUPABASE_SERVICE_ROLE_KEY');

const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const pgClient = new Client(getPgConfig());

const ARTIFACT_DIR = getRequiredEnv('ASSET_SOURCE_DIR');
const LOGO_SRC = path.join(
  ARTIFACT_DIR,
  '.user_uploaded',
  'media_1794341369890_4e25e5b7.png'
);

const BANNERS = [
  {
    file: path.join(ARTIFACT_DIR, 'luxury_spa_towels_hero_banner_1794411181184.jpg'),
    storagePath: 'hero-luxury-spa-towels-v1.webp',
    title: 'Faisalabad Luxury Combed Cotton Bath Towels',
    link_url: '/shop/towels/',
    sort_order: 1,
  },
  {
    file: path.join(ARTIFACT_DIR, 'hajj_umrah_hero_banner_1794411185362.jpg'),
    storagePath: 'hero-hajj-umrah-ehram-v2.webp',
    title: 'Sacred Pilgrimage Comfort - 100% Terry Cotton Ehram Sets',
    link_url: '/shop/ehram/',
    sort_order: 2,
    trimEdges: true,
  },
  {
    file: path.join(ARTIFACT_DIR, 'towel_bundles_hero_banner_1794411185367.jpg'),
    storagePath: 'hero-family-towel-bundles-v1.webp',
    title: 'Family Luxury Bundles - Factory Direct Prices Nationwide',
    link_url: '/shop/',
    sort_order: 3,
  },
];

const CATEGORIES = [
  {
    slug: 'towels',
    file: path.join(ARTIFACT_DIR, 'towels_bath_linens_category_1794411200501.jpg'),
    storagePath: 'categories/towels-bath-linens-v1.webp',
  },
  {
    slug: 'ehram',
    file: path.join(ARTIFACT_DIR, 'hajj_umrah_ehram_set_1794411207751.jpg'),
    storagePath: 'categories/hajj-umrah-ehram-v1.webp',
  },
  {
    slug: 'bedding',
    file: path.join(ARTIFACT_DIR, 'luxury_bedding_category_1794411207758.jpg'),
    storagePath: 'categories/luxury-bedding-v1.webp',
  },
  {
    slug: 'winter-collection',
    file: path.join(ARTIFACT_DIR, 'winter_seasonal_linens_1794411207771.jpg'),
    storagePath: 'categories/winter-seasonal-linens-v1.webp',
  },
];

const PRODUCTS = [
  {
    slug: 'premium-bath-towel-600-gsm',
    file: path.join(ARTIFACT_DIR, 'premium_bath_towel_navy_white_1794411234610.jpg'),
    storagePath: 'products/premium-bath-towel-600-gsm-v1.webp',
  },
  {
    slug: 'luxury-hand-towel-500-gsm',
    file: path.join(ARTIFACT_DIR, 'luxury_hand_towels_500gsm_1794411234614.jpg'),
    storagePath: 'products/luxury-hand-towel-500-gsm-v1.webp',
  },
  {
    slug: 'face-towels-ultra-soft-pack-of-4',
    file: path.join(ARTIFACT_DIR, 'face_washcloths_pack_of_4_1794411241131.jpg'),
    storagePath: 'products/face-towels-ultra-soft-pack-of-4-v1.webp',
  },
  {
    slug: 'family-luxury-towel-bundle-3-piece',
    file: path.join(ARTIFACT_DIR, 'family_luxury_towel_bundle_navy_1794411241138.jpg'),
    storagePath: 'products/family-luxury-towel-bundle-3-piece-v1.webp',
  },
  {
    slug: 'hajj-and-umrah-pure-cotton-terry-ehram-2-piece',
    file: path.join(ARTIFACT_DIR, 'cotton_terry_ehram_set_1794411278720.jpg'),
    storagePath: 'products/hajj-umrah-cotton-terry-ehram-v1.webp',
  },
  {
    slug: 'deluxe-pilgrim-combo-ehram-belt-pouch',
    file: path.join(ARTIFACT_DIR, 'deluxe_pilgrim_combo_1794411278713.jpg'),
    storagePath: 'products/deluxe-pilgrim-combo-ehram-belt-pouch-v1.webp',
  },
];

async function compressToWebP(inputPath, { width, height, fit = 'inside', targetMaxKb, initialQuality = 82, trimEdges = false }) {
  const rawBuffer = await fs.readFile(inputPath);
  const originalKb = +(rawBuffer.length / 1024).toFixed(1);

  let quality = initialQuality;
  let outputBuffer = null;

  while (quality >= 50) {
    let pipeline = sharp(rawBuffer).rotate();
    if (trimEdges) {
      pipeline = pipeline.trim({ threshold: 28 });
    }
    if (height && fit === 'cover') {
      pipeline = pipeline.resize(width, height, { fit: 'cover', position: 'centre' });
    } else {
      pipeline = pipeline.resize({ width, height, fit: 'inside', withoutEnlargement: true });
    }
    outputBuffer = await pipeline.webp({ quality, effort: 6 }).toBuffer();
    const outKb = outputBuffer.length / 1024;
    if (outKb <= targetMaxKb || quality <= 55) {
      return {
        buffer: outputBuffer,
        originalKb,
        compressedKb: +outKb.toFixed(1),
        quality,
      };
    }
    quality -= 8;
  }

  return {
    buffer: outputBuffer,
    originalKb,
    compressedKb: +(outputBuffer.length / 1024).toFixed(1),
    quality,
  };
}

async function ensureBucket(bucketName) {
  const { data: buckets } = await supabaseAdmin.storage.listBuckets();
  const exists = buckets?.some((b) => b.name === bucketName);
  if (!exists) {
    const { error } = await supabaseAdmin.storage.createBucket(bucketName, { public: true });
    if (error) throw new Error(`Failed creating bucket ${bucketName}: ${error.message}`);
  }
}

async function uploadWebP(bucket, storagePath, buffer) {
  const { error } = await supabaseAdmin.storage.from(bucket).upload(storagePath, buffer, {
    contentType: 'image/webp',
    cacheControl: '31536000',
    upsert: true,
  });
  if (error) {
    throw new Error(`Storage upload failed [${bucket}/${storagePath}]: ${error.message}`);
  }
  const { data } = supabaseAdmin.storage.from(bucket).getPublicUrl(storagePath);
  return data.publicUrl;
}

async function processLogo() {
  const publicDir = path.resolve(process.cwd(), 'public');
  const imagesDir = path.join(publicDir, 'images');
  await fs.mkdir(imagesDir, { recursive: true });

  const rawBuffer = await fs.readFile(LOGO_SRC);
  const originalKb = +(rawBuffer.length / 1024).toFixed(1);

  // WebP primary logo <= 25 KB
  const logoWebp = await compressToWebP(LOGO_SRC, {
    width: 420,
    targetMaxKb: 25,
    initialQuality: 85,
  });
  const webpDest = path.join(imagesDir, 'zandstextiles-luxury-home-bedding-and-linens-logo.webp');
  await fs.writeFile(webpDest, logoWebp.buffer);

  // PNG fallback copies so no existing path ever 404s
  const pngBuffer = await sharp(rawBuffer)
    .resize({ width: 420, fit: 'inside', withoutEnlargement: true })
    .png({ compressionLevel: 9, palette: true, quality: 85 })
    .toBuffer();
  const pngKb = +(pngBuffer.length / 1024).toFixed(1);

  await fs.writeFile(path.join(imagesDir, 'zandstextiles-luxury-home-bedding-and-linens-logo.png'), pngBuffer);
  await fs.writeFile(path.join(imagesDir, 'logo.png'), pngBuffer);
  await fs.writeFile(path.join(publicDir, 'logo.png'), pngBuffer);

  // Square contained icon for browser tabs
  const iconBuffer = await sharp(rawBuffer)
    .resize({
      width: 192,
      height: 192,
      fit: 'contain',
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    })
    .png({ compressionLevel: 9, palette: true })
    .toBuffer();
  await fs.writeFile(path.join(publicDir, 'icon.png'), iconBuffer);

  console.log(
    `[LOGO] Source: ${originalKb} KB -> WebP: ${logoWebp.compressedKb} KB (q=${logoWebp.quality}) | Fallback PNG: ${pngKb} KB | Icon PNG: ${(iconBuffer.length / 1024).toFixed(1)} KB`
  );
}

async function main() {
  console.log('=== Step 1: Optimizing Logo + 13 AI Images & Syncing DB ===');
  await processLogo();

  await ensureBucket('banners');
  await ensureBucket('products');
  await pgClient.connect();

  // Banners
  console.log('\n--- Processing 3 Hero Banners ---');
  await pgClient.query('DELETE FROM public.banners;');
  for (const b of BANNERS) {
    const res = await compressToWebP(b.file, {
      width: 1600,
      targetMaxKb: 120,
      initialQuality: 82,
      trimEdges: !!b.trimEdges,
    });
    const url = await uploadWebP('banners', b.storagePath, res.buffer);
    await pgClient.query(
      `INSERT INTO public.banners (title, image_url, link_url, sort_order, is_active)
       VALUES ($1, $2, $3, $4, true);`,
      [b.title, url, b.link_url, b.sort_order]
    );
    console.log(
      `[BANNER ${b.sort_order}] ${b.originalName || path.basename(b.file)}: ${res.originalKb} KB -> ${res.compressedKb} KB (q=${res.quality}) => ${url}`
    );
  }

  // Categories
  console.log('\n--- Processing 4 Category Images ---');
  for (const c of CATEGORIES) {
    const res = await compressToWebP(c.file, {
      width: 600,
      height: 600,
      fit: 'cover',
      targetMaxKb: 50,
      initialQuality: 82,
    });
    const url = await uploadWebP('products', c.storagePath, res.buffer);
    const upd = await pgClient.query(
      `UPDATE public.categories SET image_url = $1 WHERE slug = $2 RETURNING id, name;`,
      [url, c.slug]
    );
    console.log(
      `[CATEGORY: ${c.slug}] updated rows=${upd.rowCount}: ${res.originalKb} KB -> ${res.compressedKb} KB (q=${res.quality}) => ${url}`
    );
  }

  // Products
  console.log('\n--- Processing 6 Product Images ---');
  for (const p of PRODUCTS) {
    const res = await compressToWebP(p.file, {
      width: 900,
      height: 900,
      fit: 'cover',
      targetMaxKb: 80,
      initialQuality: 82,
    });
    const url = await uploadWebP('products', p.storagePath, res.buffer);
    const upd = await pgClient.query(
      `UPDATE public.products
       SET cover_image = $1, gallery_images = $2::jsonb
       WHERE slug = $3
       RETURNING id, title;`,
      [url, JSON.stringify([url]), p.slug]
    );
    console.log(
      `[PRODUCT: ${p.slug}] updated rows=${upd.rowCount}: ${res.originalKb} KB -> ${res.compressedKb} KB (q=${res.quality}) => ${url}`
    );
  }

  await pgClient.end();
  console.log('\n=== Asset optimization, cloud upload, and PostgreSQL sync complete! ===');
}

main().catch(async (err) => {
  console.error('ASSET SCRIPT ERROR:', err);
  try {
    await pgClient.end();
  } catch {}
  process.exit(1);
});
