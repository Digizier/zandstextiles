import { supabase } from "./supabase";
import { Product, Category, Subcategory, Banner, Order, SiteSettings, Coupon } from "./types";

/**
 * --- PRODUCTS CRUD ---
 */
export async function adminGetProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*, category:categories(name, slug)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function adminSaveProduct(product: Partial<Product>): Promise<Product> {
  const { category, _colorsText, ...rest } = product as any;
  // Format slug if missing
  const slug =
    rest.slug ||
    rest.title?.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  const payload = {
    ...rest,
    slug,
    category_id: rest.category_id || null,
    subcategory_id: rest.subcategory_id || null,
  };

  if (rest.id) {
    const { data, error } = await supabase
      .from("products")
      .update(payload)
      .eq("id", rest.id)
      .select()
      .single();
    if (error) throw error;
    return data;
  } else {
    const { data, error } = await supabase
      .from("products")
      .insert([payload])
      .select()
      .single();
    if (error) throw error;
    return data;
  }
}

export async function adminDeleteProduct(id: string): Promise<boolean> {
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw error;
  return true;
}

/**
 * --- CATEGORIES CRUD ---
 */
export async function adminGetCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function adminSaveCategory(category: Partial<Category>): Promise<Category> {
  const slug = category.slug || category.name?.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  const payload = {
    ...category,
    slug,
  };

  if (category.id) {
    const { data, error } = await supabase
      .from("categories")
      .update(payload)
      .eq("id", category.id)
      .select()
      .single();
    if (error) throw error;
    return data;
  } else {
    const { data, error } = await supabase
      .from("categories")
      .insert([payload])
      .select()
      .single();
    if (error) throw error;
    return data;
  }
}

export async function adminDeleteCategory(id: string): Promise<boolean> {
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) throw error;
  return true;
}

/**
 * --- SUBCATEGORIES CRUD ---
 */
export async function adminGetSubcategories(): Promise<Subcategory[]> {
  const { data, error } = await supabase
    .from("subcategories")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function adminSaveSubcategory(sub: Partial<Subcategory>): Promise<Subcategory> {
  const slug = sub.slug || sub.name?.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  const payload = {
    ...sub,
    slug,
    category_id: sub.category_id || null,
    parent_subcategory_id: sub.parent_subcategory_id || null,
  };

  if (sub.id) {
    const { data, error } = await supabase
      .from("subcategories")
      .update(payload)
      .eq("id", sub.id)
      .select()
      .single();
    if (error) throw error;
    return data;
  } else {
    const { data, error } = await supabase
      .from("subcategories")
      .insert([payload])
      .select()
      .single();
    if (error) throw error;
    return data;
  }
}

export async function adminDeleteSubcategory(id: string): Promise<boolean> {
  const { error } = await supabase.from("subcategories").delete().eq("id", id);
  if (error) throw error;
  return true;
}

/**
 * --- BANNERS CRUD ---
 */
export async function adminGetBanners(): Promise<Banner[]> {
  const { data, error } = await supabase
    .from("banners")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function adminSaveBanner(banner: Partial<Banner>): Promise<Banner> {
  if (banner.id) {
    const { data, error } = await supabase
      .from("banners")
      .update(banner)
      .eq("id", banner.id)
      .select()
      .single();
    if (error) throw error;
    return data;
  } else {
    const { data, error } = await supabase
      .from("banners")
      .insert([banner])
      .select()
      .single();
    if (error) throw error;
    return data;
  }
}

export async function adminDeleteBanner(id: string): Promise<boolean> {
  const { error } = await supabase.from("banners").delete().eq("id", id);
  if (error) throw error;
  return true;
}

/**
 * --- ORDERS CRUD ---
 */
export async function adminGetOrders(): Promise<Order[]> {
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function adminUpdateOrderStatus(
  orderId: string,
  order_status: Order["order_status"],
  payment_status?: Order["payment_status"]
): Promise<Order> {
  const updateData: any = { order_status };
  if (payment_status) {
    updateData.payment_status = payment_status;
  }

  const { data, error } = await supabase
    .from("orders")
    .update(updateData)
    .eq("id", orderId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function adminDeleteOrder(id: string): Promise<boolean> {
  const { error } = await supabase.from("orders").delete().eq("id", id);
  if (error) throw error;
  return true;
}

/**
 * --- SITE SETTINGS ---
 */
export async function adminSaveSiteSettings(settings: Partial<SiteSettings>): Promise<SiteSettings> {
  const { data, error } = await supabase
    .from("site_settings")
    .upsert({ ...settings, id: "general", updated_at: new Date().toISOString() })
    .select()
    .single();
  if (error) throw error;
  return data;
}

/**
 * --- COUPONS CRUD ---
 */
export async function adminGetCoupons(): Promise<Coupon[]> {
  const { data, error } = await supabase
    .from("coupons")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function adminSaveCoupon(coupon: Partial<Coupon>): Promise<Coupon> {
  const code = coupon.code?.toUpperCase().trim();
  const payload = { ...coupon, code };

  if (coupon.id) {
    const { data, error } = await supabase
      .from("coupons")
      .update(payload)
      .eq("id", coupon.id)
      .select()
      .single();
    if (error) throw error;
    return data;
  } else {
    const { data, error } = await supabase
      .from("coupons")
      .insert([payload])
      .select()
      .single();
    if (error) throw error;
    return data;
  }
}

export async function adminDeleteCoupon(id: string): Promise<boolean> {
  const { error } = await supabase.from("coupons").delete().eq("id", id);
  if (error) throw error;
  return true;
}
