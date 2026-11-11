export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  image_url?: string | null;
  show_in_top_categories: boolean;
  sort_order: number;
  is_active: boolean;
  created_at?: string;
}

export interface Subcategory {
  id: string;
  category_id: string;
  parent_subcategory_id?: string | null;
  name: string;
  slug: string;
  description?: string | null;
  sort_order: number;
  is_active: boolean;
  created_at?: string;
}

export interface Product {
  id: string;
  title: string;
  slug: string;
  sku: string;
  category_id: string | null;
  subcategory_id: string | null;
  price: number;
  sale_price?: number | null;
  stock: number;
  fabric_material: string;
  gsm: string;
  size_dimensions: string;
  colors: string[];
  short_description: string;
  description: string;
  cover_image: string;
  gallery_images: string[];
  is_featured: boolean;
  is_flash_deal: boolean;
  is_active: boolean;
  rating: number;
  reviews_count: number;
  created_at?: string;
  category?: Category;
}

export interface Banner {
  id: string;
  title: string;
  image_url: string;
  link_url: string;
  sort_order: number;
  is_active: boolean;
  created_at?: string;
}

export interface CartItem {
  product_id: string;
  title: string;
  slug: string;
  price: number;
  quantity: number;
  size: string;
  color: string;
  image_url: string;
}

export interface Order {
  id?: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string | null;
  province: string;
  city: string;
  address: string;
  delivery_instructions?: string | null;
  delivery_type: 'home' | 'office';
  payment_method: 'cod' | 'bank_transfer' | 'jazzcash' | 'easypaisa';
  payment_proof_url?: string | null;
  payment_status: 'pending' | 'paid' | 'failed';
  order_status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  items: CartItem[];
  subtotal: number;
  delivery_charge: number;
  discount: number;
  coupon_code?: string | null;
  total_amount: number;
  created_at?: string;
}

export interface SiteSettings {
  id: string;
  store_name: string;
  tagline: string;
  phone: string;
  whatsapp: string;
  whatsapp_channel: string;
  email: string;
  address: string;
  delivery_charge: number;
  free_shipping_threshold: number;
  cod_enabled: boolean;
  jazzcash_title: string;
  jazzcash_number: string;
  easypaisa_title: string;
  easypaisa_number: string;
  bank_name: string;
  bank_title: string;
  bank_account_iban: string;
  updated_at?: string;
}

export interface Coupon {
  id: string;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_spend: number;
  free_shipping: boolean;
  is_active: boolean;
  created_at?: string;
}
