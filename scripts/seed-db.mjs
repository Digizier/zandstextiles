import pg from 'pg';
import { getPgConfig } from './load-env.mjs';
const { Client } = pg;

const client = new Client(getPgConfig());

async function seed() {
  await client.connect();
  console.log("Connected to PostgreSQL for seeding...");

  // 1. Categories
  const catQueries = [
    {
      name: "Towels & Bath Linens",
      slug: "towels",
      description: "100% Combed Cotton luxury bath, hand, and face towels crafted in Faisalabad.",
      image_url: "https://images.unsplash.com/photo-1616627547584-bf28cee262db?q=80&w=600&auto=format&fit=crop",
      show_in_top_categories: true,
      sort_order: 1
    },
    {
      name: "Hajj & Umrah Ehram",
      slug: "ehram",
      description: "100% Pure cotton terry Shariah-compliant Ehram sets and pilgrimage accessories.",
      image_url: "https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?q=80&w=600&auto=format&fit=crop",
      show_in_top_categories: true,
      sort_order: 2
    },
    {
      name: "Luxury Bedding",
      slug: "bedding",
      description: "Export-quality combed cotton bedsheets, duvet sets, and comforter covers.",
      image_url: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?q=80&w=600&auto=format&fit=crop",
      show_in_top_categories: true,
      sort_order: 3
    },
    {
      name: "Winter & Seasonal Linens",
      slug: "winter-collection",
      description: "Plush warm fleece blankets, luxury shawls, and cozy sofa throws.",
      image_url: "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?q=80&w=600&auto=format&fit=crop",
      show_in_top_categories: true,
      sort_order: 4
    }
  ];

  const catMap = {};
  for (const cat of catQueries) {
    const res = await client.query(`
      INSERT INTO public.categories (name, slug, description, image_url, show_in_top_categories, sort_order)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (slug) DO UPDATE SET 
        name = EXCLUDED.name, 
        description = EXCLUDED.description,
        image_url = EXCLUDED.image_url,
        show_in_top_categories = EXCLUDED.show_in_top_categories
      RETURNING id, slug;
    `, [cat.name, cat.slug, cat.description, cat.image_url, cat.show_in_top_categories, cat.sort_order]);
    catMap[cat.slug] = res.rows[0].id;
  }

  // 2. Subcategories
  const subcats = [
    { cat: "towels", name: "Bath Towels", slug: "bath-towels" },
    { cat: "towels", name: "Hand Towels", slug: "hand-towels" },
    { cat: "towels", name: "Face Towels & Washcloths", slug: "face-towels" },
    { cat: "towels", name: "Towel Bundles & Sets", slug: "towel-bundles" },
    { cat: "towels", name: "Hotel & Luxury Jacquard", slug: "hotel-luxury" },
    { cat: "ehram", name: "Towel Ehram 2-Piece", slug: "towel-ehram" },
    { cat: "ehram", name: "Pilgrim Combos & Packs", slug: "pilgrim-combos" },
    { cat: "ehram", name: "Ehram Belts & Pouches", slug: "ehram-accessories" },
    { cat: "bedding", name: "King & Single Bedsheets", slug: "bedsheets" },
    { cat: "bedding", name: "Fitted Sheets", slug: "fitted-sheets" },
    { cat: "bedding", name: "Duvet Cover Sets", slug: "duvet-covers" },
    { cat: "winter-collection", name: "Fleece & Cotton Blankets", slug: "blankets" },
    { cat: "winter-collection", name: "Luxury Shawls", slug: "shawls" },
  ];

  const subMap = {};
  for (const sub of subcats) {
    const catId = catMap[sub.cat];
    if (catId) {
      const res = await client.query(`
        INSERT INTO public.subcategories (category_id, name, slug)
        VALUES ($1, $2, $3)
        ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
        RETURNING id, slug;
      `, [catId, sub.name, sub.slug]);
      subMap[sub.slug] = res.rows[0].id;
    }
  }

  // 3. Products
  const products = [
    {
      title: "Premium Bath Towel (600 GSM 100% Combed Cotton)",
      slug: "premium-bath-towel-600-gsm",
      sku: "ZS-BT-001",
      catSlug: "towels",
      subSlug: "bath-towels",
      price: 1799,
      sale_price: 1499,
      stock: 35,
      fabric_material: "100% Combed Pakistani Cotton",
      gsm: "600 GSM - Super Plush & Thirsty",
      size_dimensions: "70x140 cm (Luxury Bath)",
      colors: JSON.stringify(["Royal Navy Blue", "Crisp Pure White", "Pearl Grey", "Warm Sand"]),
      short_description: "Direct-from-Faisalabad export-grade bath towel. Ultra-absorbent zero-twist combed cotton loops provide hotel-level softness and fast drying.",
      description: "Indulge in everyday luxury with Z&S Textiles' flagship 600 GSM Bath Towel. Spun from 100% pure combed Pakistani cotton in Faisalabad, this towel features high-density ring-spun loops that absorb water 3x faster than synthetic blends. Color-fast dyed with OEKO-TEX certified processes to guarantee skin-friendly, long-lasting vibrancy wash after wash.",
      cover_image: "https://images.unsplash.com/photo-1616627547584-bf28cee262db?q=80&w=800&auto=format&fit=crop",
      gallery_images: JSON.stringify([
        "https://images.unsplash.com/photo-1616627547584-bf28cee262db?q=80&w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?q=80&w=800&auto=format&fit=crop"
      ]),
      is_featured: true,
      is_flash_deal: true,
      rating: 4.9,
      reviews_count: 38
    },
    {
      title: "Luxury Hand Towel (500 GSM Everyday Softness)",
      slug: "luxury-hand-towel-500-gsm",
      sku: "ZS-HT-002",
      catSlug: "towels",
      subSlug: "hand-towels",
      price: 799,
      sale_price: 599,
      stock: 50,
      fabric_material: "100% Combed Cotton",
      gsm: "500 GSM High Durability",
      size_dimensions: "50x90 cm",
      colors: JSON.stringify(["Royal Navy", "Pure White", "Charcoal Grey"]),
      short_description: "Gentle and ultra-absorbent hand towel engineered for daily family bathroom and guest vanity use.",
      description: "Upgrade your bathroom sinks and guest areas with our 500 GSM luxury hand towel. Perfect size (50x90cm) with reinforced double-stitched hems for heavy daily use and repeated machine washing without fraying.",
      cover_image: "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?q=80&w=800&auto=format&fit=crop",
      gallery_images: JSON.stringify([
        "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?q=80&w=800&auto=format&fit=crop"
      ]),
      is_featured: true,
      is_flash_deal: false,
      rating: 4.8,
      reviews_count: 22
    },
    {
      title: "Face Washcloths & Towels (Ultra-Soft Pack of 4)",
      slug: "face-towels-ultra-soft-pack-of-4",
      sku: "ZS-FT-003",
      catSlug: "towels",
      subSlug: "face-towels",
      price: 1199,
      sale_price: 899,
      stock: 45,
      fabric_material: "100% Combed Cotton Terry",
      gsm: "550 GSM Hypoallergenic",
      size_dimensions: "30x30 cm (Set of 4)",
      colors: JSON.stringify(["Assorted Luxury Pack", "Pure White Spa Pack"]),
      short_description: "Extra-delicate washcloths designed for sensitive facial skin, baby care, and makeup removal.",
      description: "Pamper your skin with our ultra-soft 4-pack of face washcloths. Hypoallergenic, chemical-free cotton provides gentle touch without irritating delicate skin. Machine washable and highly absorbent.",
      cover_image: "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?q=80&w=800&auto=format&fit=crop",
      gallery_images: JSON.stringify([
        "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?q=80&w=800&auto=format&fit=crop"
      ]),
      is_featured: true,
      is_flash_deal: true,
      rating: 5.0,
      reviews_count: 29
    },
    {
      title: "Family Luxury Towel Bundle (3-Piece Complete Set)",
      slug: "family-luxury-towel-bundle-3-piece",
      sku: "ZS-BND-004",
      catSlug: "towels",
      subSlug: "towel-bundles",
      price: 2899,
      sale_price: 2599,
      stock: 25,
      fabric_material: "100% Combed Pakistani Cotton",
      gsm: "600 GSM Bath + 500 GSM Hand + 550 GSM Face",
      size_dimensions: "1 Bath (70x140) + 1 Hand (50x90) + 1 Face (30x30)",
      colors: JSON.stringify(["Navy Blue Suite", "Pure White Hotel Suite", "Slate Grey Suite"]),
      short_description: "Best Value Pack! Save Rs. 800 with our coordinated 3-piece bathroom linen suite.",
      description: "The complete bathroom experience in one coordinated set. Includes 1 full-size luxury bath towel, 1 matching hand towel, and 1 face towel. Perfect for housewarming gifts or family bedroom upgrades.",
      cover_image: "https://images.unsplash.com/photo-1616627547584-bf28cee262db?q=80&w=800&auto=format&fit=crop",
      gallery_images: JSON.stringify([
        "https://images.unsplash.com/photo-1616627547584-bf28cee262db?q=80&w=800&auto=format&fit=crop"
      ]),
      is_featured: true,
      is_flash_deal: true,
      rating: 4.9,
      reviews_count: 51
    },
    {
      title: "Hajj & Umrah Pure Cotton Terry Ehram (2-Piece Set)",
      slug: "hajj-and-umrah-pure-cotton-terry-ehram-2-piece",
      sku: "ZS-EHR-005",
      catSlug: "ehram",
      subSlug: "towel-ehram",
      price: 2999,
      sale_price: 2499,
      stock: 60,
      fabric_material: "100% Pure Combed Cotton Terry",
      gsm: "550 GSM High Sweat Absorption",
      size_dimensions: "45x90 Inches (115x230 cm) Standard Shariah Size",
      colors: JSON.stringify(["Pure Unstitched White"]),
      short_description: "Non-transparent, lightweight, and highly breathable. Engineered for the extreme heat of Makkah & Madinah.",
      description: "Perform your sacred pilgrimage in complete comfort. Crafted in accordance with Shariah specifications, this 2-piece unstitched towel Ehram provides maximum sweat absorption during Tawaf and Sa'i while preventing chafing and staying non-see-through under desert sunlight.",
      cover_image: "https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?q=80&w=800&auto=format&fit=crop",
      gallery_images: JSON.stringify([
        "https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?q=80&w=800&auto=format&fit=crop"
      ]),
      is_featured: true,
      is_flash_deal: true,
      rating: 5.0,
      reviews_count: 67
    },
    {
      title: "Deluxe Pilgrim Combo (Ehram + Anti-Theft Belt + Pouch)",
      slug: "deluxe-pilgrim-combo-ehram-belt-pouch",
      sku: "ZS-EHR-006",
      catSlug: "ehram",
      subSlug: "pilgrim-combos",
      price: 3799,
      sale_price: 3499,
      stock: 30,
      fabric_material: "100% Cotton Terry Ehram + Reinforced Nylon Accessories",
      gsm: "550 GSM Ehram + Heavy Duty Security Buckle Belt",
      size_dimensions: "Complete Shariah Pilgrim Pack",
      colors: JSON.stringify(["White Ehram + Dark Green Belt", "White Ehram + Black Belt"]),
      short_description: "Complete pilgrim peace of mind: 2-piece Terry Towel Ehram, anti-theft zipper money belt, and waterproof neck pouch.",
      description: "The ultimate all-in-one Hajj & Umrah package. Includes our premium 2-piece towel Ehram plus an adjustable anti-theft waist belt with secret zipper pockets for passport, cash, and smartphone, plus a waterproof travel pouch.",
      cover_image: "https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?q=80&w=800&auto=format&fit=crop",
      gallery_images: JSON.stringify([
        "https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?q=80&w=800&auto=format&fit=crop"
      ]),
      is_featured: true,
      is_flash_deal: false,
      rating: 5.0,
      reviews_count: 43
    }
  ];

  for (const p of products) {
    const catId = catMap[p.catSlug];
    const subId = subMap[p.subSlug] || null;
    await client.query(`
      INSERT INTO public.products (
        title, slug, sku, category_id, subcategory_id, price, sale_price, stock,
        fabric_material, gsm, size_dimensions, colors, short_description, description,
        cover_image, gallery_images, is_featured, is_flash_deal, rating, reviews_count
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
      ON CONFLICT (slug) DO UPDATE SET
        price = EXCLUDED.price,
        sale_price = EXCLUDED.sale_price,
        stock = EXCLUDED.stock,
        cover_image = EXCLUDED.cover_image,
        is_flash_deal = EXCLUDED.is_flash_deal;
    `, [
      p.title, p.slug, p.sku, catId, subId, p.price, p.sale_price, p.stock,
      p.fabric_material, p.gsm, p.size_dimensions, p.colors, p.short_description, p.description,
      p.cover_image, p.gallery_images, p.is_featured, p.is_flash_deal, p.rating, p.reviews_count
    ]);
  }

  // 4. Initial Banners (Clean image banners as requested!)
  const banners = [
    {
      title: "Faisalabad Luxury Combed Cotton Bath Towels",
      image_url: "https://images.unsplash.com/photo-1616627547584-bf28cee262db?q=80&w=1600&auto=format&fit=crop",
      link_url: "/shop/towels/",
      sort_order: 1
    },
    {
      title: "Sacred Pilgrimage Comfort - 100% Terry Cotton Ehram Sets",
      image_url: "https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?q=80&w=1600&auto=format&fit=crop",
      link_url: "/shop/ehram/",
      sort_order: 2
    },
    {
      title: "Family Luxury Bundles - Factory Direct Prices Nationwide",
      image_url: "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?q=80&w=1600&auto=format&fit=crop",
      link_url: "/shop/",
      sort_order: 3
    }
  ];

  for (const b of banners) {
    await client.query(`
      INSERT INTO public.banners (title, image_url, link_url, sort_order)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT DO NOTHING;
    `, [b.title, b.image_url, b.link_url, b.sort_order]);
  }

  // 5. Initial Coupons
  await client.query(`
    INSERT INTO public.coupons (code, discount_type, discount_value, min_spend, free_shipping, is_active)
    VALUES 
      ('WELCOME10', 'percentage', 10, 2000, false, true),
      ('FREESHIP', 'fixed', 250, 2500, true, true),
      ('SAVE500', 'fixed', 500, 5000, false, true)
    ON CONFLICT (code) DO NOTHING;
  `);

  console.log("Seeding completed successfully! Categories, Subcategories, Products, Banners, and Coupons are ready.");
  await client.end();
}

seed().catch(err => {
  console.error("Seed error:", err);
  process.exit(1);
});
