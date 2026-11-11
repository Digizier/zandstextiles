import pg from 'pg';
import { getPgConfig } from './load-env.mjs';
const { Client } = pg;

const pgConfig = getPgConfig();
console.log("Connecting to PostgreSQL database at", pgConfig.host);

const client = new Client(pgConfig);

const migrationSQL = `
-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Categories Table
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  image_url TEXT,
  show_in_top_categories BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Subcategories Table (Supports Daraz-style Multi-tier nesting)
CREATE TABLE IF NOT EXISTS public.subcategories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
  parent_subcategory_id UUID REFERENCES public.subcategories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Products Table
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  sku TEXT,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  subcategory_id UUID REFERENCES public.subcategories(id) ON DELETE SET NULL,
  price NUMERIC NOT NULL,
  sale_price NUMERIC,
  stock INTEGER DEFAULT 15,
  fabric_material TEXT DEFAULT '100% Combed Pakistani Cotton',
  gsm TEXT DEFAULT '550-600 GSM',
  size_dimensions TEXT DEFAULT '70x140 cm',
  colors JSONB DEFAULT '[]'::JSONB,
  short_description TEXT,
  description TEXT,
  cover_image TEXT,
  gallery_images JSONB DEFAULT '[]'::JSONB,
  is_featured BOOLEAN DEFAULT true,
  is_flash_deal BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  rating NUMERIC DEFAULT 4.9,
  reviews_count INTEGER DEFAULT 18,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Banners Table (Pure image banners, responsive)
CREATE TABLE IF NOT EXISTS public.banners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  image_url TEXT NOT NULL,
  link_url TEXT DEFAULT '/shop',
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Orders Table (With payment proof screenshot URL for eye icon viewer)
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,
  province TEXT NOT NULL,
  city TEXT NOT NULL,
  address TEXT NOT NULL,
  delivery_instructions TEXT,
  delivery_type TEXT DEFAULT 'home',
  payment_method TEXT DEFAULT 'cod',
  payment_proof_url TEXT,
  payment_status TEXT DEFAULT 'pending',
  order_status TEXT DEFAULT 'pending',
  items JSONB NOT NULL,
  subtotal NUMERIC NOT NULL,
  delivery_charge NUMERIC DEFAULT 0,
  discount NUMERIC DEFAULT 0,
  coupon_code TEXT,
  total_amount NUMERIC NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Site Settings Table (Global store identity, shipping rules, payment accounts)
CREATE TABLE IF NOT EXISTS public.site_settings (
  id TEXT PRIMARY KEY DEFAULT 'general',
  store_name TEXT DEFAULT 'Z&S TEXTILES',
  tagline TEXT DEFAULT 'Feel the Softness',
  phone TEXT DEFAULT '0325-4622375',
  whatsapp TEXT DEFAULT '0325-4622375',
  whatsapp_channel TEXT DEFAULT 'https://whatsapp.com/channel/0029VbDT4sqId7nGeCKOoz43',
  email TEXT DEFAULT 'zandstextiles7@gmail.com',
  address TEXT DEFAULT 'Motorway Valley P-199, Sargodha Road, Faisalabad, Punjab, Pakistan',
  delivery_charge NUMERIC DEFAULT 250,
  free_shipping_threshold NUMERIC DEFAULT 3000,
  cod_enabled BOOLEAN DEFAULT true,
  jazzcash_title TEXT DEFAULT 'Z&S Textiles',
  jazzcash_number TEXT DEFAULT '0325-4622375',
  easypaisa_title TEXT DEFAULT 'Z&S Textiles',
  easypaisa_number TEXT DEFAULT '0325-4622375',
  bank_name TEXT DEFAULT 'Meezan Bank',
  bank_title TEXT DEFAULT 'Z&S Textiles',
  bank_account_iban TEXT DEFAULT 'PK00MEZN0000000000000000',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Coupons Table
CREATE TABLE IF NOT EXISTS public.coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  discount_type TEXT DEFAULT 'percentage',
  discount_value NUMERIC NOT NULL,
  min_spend NUMERIC DEFAULT 0,
  free_shipping BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Create Performance Indexes for Lean Zero-Load Queries
CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);
CREATE INDEX IF NOT EXISTS idx_products_cat ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_featured ON public.products(is_featured);
CREATE INDEX IF NOT EXISTS idx_products_flash ON public.products(is_flash_deal);
CREATE INDEX IF NOT EXISTS idx_products_active ON public.products(is_active);
CREATE INDEX IF NOT EXISTS idx_orders_number ON public.orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_phone ON public.orders(customer_phone);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON public.categories(slug);
CREATE INDEX IF NOT EXISTS idx_subcategories_cat ON public.subcategories(category_id);

-- 10. Post-October 30 Permission Grants
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;

-- 11. Enable Row Level Security (RLS)
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subcategories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

-- 12. Create Permissive & Clean RLS Policies
DROP POLICY IF EXISTS "Allow public read categories" ON public.categories;
CREATE POLICY "Allow public read categories" ON public.categories FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow all categories" ON public.categories;
CREATE POLICY "Allow all categories" ON public.categories FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public read subcategories" ON public.subcategories;
CREATE POLICY "Allow public read subcategories" ON public.subcategories FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow all subcategories" ON public.subcategories;
CREATE POLICY "Allow all subcategories" ON public.subcategories FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public read products" ON public.products;
CREATE POLICY "Allow public read products" ON public.products FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow all products" ON public.products;
CREATE POLICY "Allow all products" ON public.products FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public read banners" ON public.banners;
CREATE POLICY "Allow public read banners" ON public.banners FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow all banners" ON public.banners;
CREATE POLICY "Allow all banners" ON public.banners FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public insert orders" ON public.orders;
CREATE POLICY "Allow public insert orders" ON public.orders FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow public read own order" ON public.orders;
CREATE POLICY "Allow public read own order" ON public.orders FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow all orders" ON public.orders;
CREATE POLICY "Allow all orders" ON public.orders FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public read site_settings" ON public.site_settings;
CREATE POLICY "Allow public read site_settings" ON public.site_settings FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow all site_settings" ON public.site_settings;
CREATE POLICY "Allow all site_settings" ON public.site_settings FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public read coupons" ON public.coupons;
CREATE POLICY "Allow public read coupons" ON public.coupons FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow all coupons" ON public.coupons;
CREATE POLICY "Allow all coupons" ON public.coupons FOR ALL USING (true) WITH CHECK (true);

-- 13. Initialize Site Settings if empty
INSERT INTO public.site_settings (id, store_name, tagline, phone, whatsapp, email, address, delivery_charge, free_shipping_threshold)
VALUES ('general', 'Z&S TEXTILES', 'Feel the Softness', '0325-4622375', '0325-4622375', 'zandstextiles7@gmail.com', 'Motorway Valley P-199, Sargodha Road, Faisalabad, Punjab, Pakistan', 250, 3000)
ON CONFLICT (id) DO NOTHING;

-- 14. Setup Storage Buckets (public)
INSERT INTO storage.buckets (id, name, public)
VALUES ('products', 'products', true),
       ('banners', 'banners', true),
       ('proofs', 'proofs', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Storage policies
DROP POLICY IF EXISTS "Public can view products bucket" ON storage.objects;
CREATE POLICY "Public can view products bucket" ON storage.objects FOR SELECT USING (bucket_id IN ('products', 'banners', 'proofs'));
DROP POLICY IF EXISTS "Public can upload to buckets" ON storage.objects;
CREATE POLICY "Public can upload to buckets" ON storage.objects FOR INSERT WITH CHECK (bucket_id IN ('products', 'banners', 'proofs'));
DROP POLICY IF EXISTS "Public can update buckets" ON storage.objects;
CREATE POLICY "Public can update buckets" ON storage.objects FOR UPDATE USING (bucket_id IN ('products', 'banners', 'proofs'));
DROP POLICY IF EXISTS "Public can delete from buckets" ON storage.objects;
CREATE POLICY "Public can delete from buckets" ON storage.objects FOR DELETE USING (bucket_id IN ('products', 'banners', 'proofs'));
`;

async function run() {
  try {
    await client.connect();
    console.log("Connected successfully to PostgreSQL!");
    await client.query(migrationSQL);
    console.log("Database schema, tables, RLS policies, and storage buckets created successfully!");
    await client.end();
  } catch (err) {
    console.error("Migration error:", err);
    process.exit(1);
  }
}

run();
