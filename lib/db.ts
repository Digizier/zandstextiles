import { supabase } from "./supabase";
import { Product, Category, Subcategory, Banner, Order, SiteSettings, Coupon } from "./types";

// Default Site Settings fallback for resilience
export const DEFAULT_SETTINGS: SiteSettings = {
  id: "general",
  store_name: "Z&S TEXTILES",
  tagline: "Feel the Softness",
  phone: "0325-4622375",
  whatsapp: "0325-4622375",
  whatsapp_channel: "https://whatsapp.com/channel/0029VbDT4sqId7nGeCKOoz43",
  email: "zandstextiles7@gmail.com",
  address: "Motorway Valley P-199, Sargodha Road, Faisalabad, Punjab, Pakistan",
  delivery_charge: 250,
  free_shipping_threshold: 3000,
  cod_enabled: true,
  jazzcash_title: "Z&S Textiles",
  jazzcash_number: "0325-4622375",
  easypaisa_title: "Z&S Textiles",
  easypaisa_number: "0325-4622375",
  bank_name: "Meezan Bank",
  bank_title: "Z&S Textiles",
  bank_account_iban: "PK00MEZN0000000000000000",
};

/**
 * 1. Fetch Categories
 */
export async function getCategories(): Promise<Category[]> {
  try {
    const { data, error } = await supabase
      .from("categories")
      .select("id, name, slug, description, image_url, show_in_top_categories, sort_order, is_active")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    if (error) {
      console.error("Error fetching categories:", error);
      return [];
    }
    return data || [];
  } catch (err) {
    console.error("Exception in getCategories:", err);
    return [];
  }
}

/**
 * 2. Fetch Subcategories
 */
export async function getSubcategories(categoryId?: string): Promise<Subcategory[]> {
  try {
    let query = supabase
      .from("subcategories")
      .select("id, category_id, parent_subcategory_id, name, slug, description, sort_order, is_active")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    if (categoryId) {
      query = query.eq("category_id", categoryId);
    }

    const { data, error } = await query;
    if (error) {
      console.error("Error fetching subcategories:", error);
      return [];
    }
    return data || [];
  } catch (err) {
    console.error("Exception in getSubcategories:", err);
    return [];
  }
}

/**
 * 3. Fetch Products with strict pagination & lean field projection
 * (Never SELECT * to keep database egress < 5GB)
 */
export async function getProducts(options: {
  categorySlug?: string;
  subcategorySlug?: string;
  limit?: number;
  offset?: number;
  isFlashDeal?: boolean;
  isFeatured?: boolean;
  searchQuery?: string;
} = {}): Promise<{ products: Product[]; totalCount: number }> {
  try {
    const {
      categorySlug,
      subcategorySlug,
      limit = 8,
      offset = 0,
      isFlashDeal,
      isFeatured,
      searchQuery,
    } = options;

    let query = supabase
      .from("products")
      .select(
        "id, title, slug, sku, price, sale_price, stock, fabric_material, gsm, size_dimensions, colors, short_description, cover_image, is_featured, is_flash_deal, is_active, rating, reviews_count, category_id, subcategory_id",
        { count: "exact" }
      )
      .eq("is_active", true);

    // Filter by Category
    if (categorySlug) {
      const { data: cat } = await supabase
        .from("categories")
        .select("id")
        .eq("slug", categorySlug)
        .single();
      if (cat) {
        query = query.eq("category_id", cat.id);
      }
    }

    // Filter by Subcategory
    if (subcategorySlug) {
      const { data: sub } = await supabase
        .from("subcategories")
        .select("id")
        .eq("slug", subcategorySlug)
        .single();
      if (sub) {
        query = query.eq("subcategory_id", sub.id);
      }
    }

    if (isFlashDeal !== undefined) {
      query = query.eq("is_flash_deal", isFlashDeal);
    }

    if (isFeatured !== undefined) {
      query = query.eq("is_featured", isFeatured);
    }

    // Smart Hinglish Pakistani Search Filter
    if (searchQuery && searchQuery.trim()) {
      const cleanQ = searchQuery.trim().toLowerCase();
      // Expanded mapping for Hinglish Pakistani queries
      let searchTerms = [cleanQ];
      if (cleanQ.includes("chaddar") || cleanQ.includes("bistar") || cleanQ.includes("sheet")) {
        searchTerms.push("bedsheet", "bedding", "cotton");
      }
      if (cleanQ.includes("toliya") || cleanQ.includes("tawliya")) {
        searchTerms.push("towel", "bath");
      }
      if (cleanQ.includes("ihram") || cleanQ.includes("ahram")) {
        searchTerms.push("ehram", "hajj", "umrah");
      }

      const orClause = searchTerms
        .map((t) => `title.ilike.%${t}%,short_description.ilike.%${t}%,fabric_material.ilike.%${t}%`)
        .join(",");
      query = query.or(orClause);
    }

    query = query
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    const { data, count, error } = await query;

    if (error) {
      console.error("Error fetching products:", error);
      return { products: [], totalCount: 0 };
    }

    return {
      products: (data as Product[]) || [],
      totalCount: count || 0,
    };
  } catch (err) {
    console.error("Exception in getProducts:", err);
    return { products: [], totalCount: 0 };
  }
}

/**
 * 3b. Fetch Homepage Categories & Products (Zero N+1 queries)
 * Returns only categories that actually contain active products (up to 8 newest per category)
 * plus top 4 newest Flash Deals.
 */
export async function getHomepageCatalogData(): Promise<{
  flashDeals: Product[];
  categoriesWithProducts: { category: Category; products: Product[] }[];
}> {
  try {
    const [catsRes, prodsRes] = await Promise.all([
      supabase
        .from("categories")
        .select("id, name, slug, description, image_url, show_in_top_categories, sort_order, is_active")
        .eq("is_active", true)
        .order("sort_order", { ascending: true }),
      supabase
        .from("products")
        .select(
          "id, title, slug, sku, price, sale_price, stock, fabric_material, gsm, size_dimensions, colors, short_description, cover_image, is_featured, is_flash_deal, is_active, rating, reviews_count, category_id, subcategory_id, created_at"
        )
        .eq("is_active", true)
        .order("created_at", { ascending: false }),
    ]);

    const categories: Category[] = (catsRes.data as Category[]) || [];
    const allProducts: Product[] = (prodsRes.data as Product[]) || [];

    // Top 4 newest Flash Deal products
    const flashDeals = allProducts.filter((p) => p.is_flash_deal).slice(0, 4);

    // Group newest products (max 8 per category) and exclude empty categories
    const categoriesWithProducts = categories
      .map((cat) => {
        const catProducts = allProducts
          .filter((p) => p.category_id === cat.id)
          .slice(0, 8);
        return { category: cat, products: catProducts };
      })
      .filter((entry) => entry.products.length > 0);

    return { flashDeals, categoriesWithProducts };
  } catch (err) {
    console.error("Exception in getHomepageCatalogData:", err);
    return { flashDeals: [], categoriesWithProducts: [] };
  }
}

/**
 * 4. Fetch Single Product with full details & gallery
 */
export async function getProductBySlug(slug: string): Promise<Product | null> {
  try {
    const { data, error } = await supabase
      .from("products")
      .select("*, category:categories(*)")
      .eq("slug", slug)
      .eq("is_active", true)
      .single();

    if (error) {
      console.error("Error fetching product by slug:", error);
      return null;
    }
    return data as Product;
  } catch (err) {
    console.error("Exception in getProductBySlug:", err);
    return null;
  }
}

/**
 * 5. Fetch Banners
 */
export async function getBanners(): Promise<Banner[]> {
  try {
    const { data, error } = await supabase
      .from("banners")
      .select("id, title, image_url, link_url, sort_order, is_active")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    if (error) {
      console.error("Error fetching banners:", error);
      return [];
    }
    return data || [];
  } catch (err) {
    console.error("Exception in getBanners:", err);
    return [];
  }
}

/**
 * 6. Fetch Site Settings
 */
export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const { data, error } = await supabase
      .from("site_settings")
      .select("*")
      .eq("id", "general")
      .single();

    if (error || !data) {
      return DEFAULT_SETTINGS;
    }
    return data as SiteSettings;
  } catch (err) {
    console.error("Exception in getSiteSettings:", err);
    return DEFAULT_SETTINGS;
  }
}

/**
 * 7. Validate Coupon Code
 */
export async function validateCoupon(code: string, cartTotal: number): Promise<{ valid: boolean; discount: number; message: string; coupon?: Coupon }> {
  try {
    const { data, error } = await supabase
      .from("coupons")
      .select("*")
      .eq("code", code.toUpperCase().trim())
      .eq("is_active", true)
      .single();

    if (error || !data) {
      return { valid: false, discount: 0, message: "Invalid or expired coupon code." };
    }

    if (cartTotal < Number(data.min_spend)) {
      return {
        valid: false,
        discount: 0,
        message: `This coupon requires a minimum spend of Rs. ${data.min_spend}.`,
      };
    }

    let discount = 0;
    if (data.discount_type === "percentage") {
      discount = Math.round((cartTotal * Number(data.discount_value)) / 100);
    } else {
      discount = Number(data.discount_value);
    }

    return {
      valid: true,
      discount: Math.min(discount, cartTotal),
      message: `Coupon '${data.code}' applied successfully!`,
      coupon: data as Coupon,
    };
  } catch (err) {
    console.error("Exception in validateCoupon:", err);
    return { valid: false, discount: 0, message: "Error validating coupon." };
  }
}

/**
 * 8. Create Customer Order
 */
export async function createOrder(orderData: Omit<Order, "id" | "created_at">): Promise<{ success: boolean; order?: Order; error?: string }> {
  try {
    const { data, error } = await supabase
      .from("orders")
      .insert([orderData])
      .select()
      .single();

    if (error) {
      console.error("Error creating order:", error);
      return { success: false, error: error.message };
    }

    return { success: true, order: data as Order };
  } catch (err: any) {
    console.error("Exception in createOrder:", err);
    return { success: false, error: err?.message || "Order placement failed." };
  }
}

/**
 * 9. Track Order by Order Number or Phone
 */
export async function trackOrder(query: string): Promise<Order[]> {
  try {
    const cleanQ = query.trim();
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .or(`order_number.ilike.%${cleanQ}%,customer_phone.ilike.%${cleanQ}%`)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error tracking order:", error);
      return [];
    }
    return (data as Order[]) || [];
  } catch (err) {
    console.error("Exception in trackOrder:", err);
    return [];
  }
}
