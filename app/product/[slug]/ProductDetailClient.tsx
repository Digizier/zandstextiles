"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Product } from "@/lib/types";
import { useCart } from "@/lib/cart-context";
import { getProductBySlug, getProducts } from "@/lib/db";
import ProductCard from "@/components/ProductCard";
import {
  Star,
  ShoppingBag,
  MessageCircle,
  Truck,
  ShieldCheck,
  RefreshCw,
  Droplets,
  Award,
  ChevronRight,
  Minus,
  Plus,
} from "lucide-react";

interface Props {
  initialProduct: Product | null;
  slug: string;
}

export default function ProductDetailClient({ initialProduct, slug }: Props) {
  const router = useRouter();
  const { addToCart } = useCart();

  const [product, setProduct] = useState<Product | null>(initialProduct);
  const [selectedImage, setSelectedImage] = useState<string>(initialProduct?.cover_image || "");
  const [selectedSize, setSelectedSize] = useState<string>(initialProduct?.size_dimensions || "Standard");
  const [selectedColor, setSelectedColor] = useState<string>(initialProduct?.colors?.[0] || "Standard");
  const [quantity, setQuantity] = useState(1);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [activeTab, setActiveTab] = useState<"specs" | "care" | "shipping">("specs");

  useEffect(() => {
    async function load() {
      if (!product) {
        const p = await getProductBySlug(slug);
        if (p) {
          setProduct(p);
          setSelectedImage(p.cover_image);
          setSelectedSize(p.size_dimensions || "Standard");
          setSelectedColor(p.colors?.[0] || "Standard");
        }
      }
      const rel = await getProducts({ limit: 4 });
      setRelatedProducts(rel.products.filter((i) => i.slug !== slug));
    }
    load();
  }, [slug, product]);

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-4">
        <h1 className="text-xl font-bold text-slate-800">Product Not Found</h1>
        <p className="text-xs text-slate-500">The product you are looking for is currently unavailable or out of stock.</p>
        <Link href="/shop/" className="inline-block bg-brand-navy text-white text-xs font-bold py-2.5 px-6 rounded-lg">
          Browse Collections
        </Link>
      </div>
    );
  }

  const activePrice = product.sale_price || product.price;
  const gallery = [product.cover_image, ...(product.gallery_images || [])].filter(Boolean);

  const handleAddToCart = () => {
    addToCart({
      product_id: product.id,
      title: product.title,
      slug: product.slug,
      price: activePrice,
      quantity,
      size: selectedSize,
      color: selectedColor,
      image_url: selectedImage || product.cover_image,
    });
  };

  const handleBuyNow = () => {
    addToCart(
      {
        product_id: product.id,
        title: product.title,
        slug: product.slug,
        price: activePrice,
        quantity,
        size: selectedSize,
        color: selectedColor,
        image_url: selectedImage || product.cover_image,
      },
      false
    );
    router.push("/checkout/");
  };

  const handleWhatsAppOrder = () => {
    const phone = "923254622375";
    const text = encodeURIComponent(
      `Assalamu Alaikum Z&S Textiles, I want to order this item:\n\n*${product.title}*\nPrice: Rs. ${activePrice}\nSize: ${selectedSize}\nColor: ${selectedColor}\nQuantity: ${quantity}\nLink: https://zandstextiles.com/product/${product.slug}/`
    );
    window.open(`https://wa.me/${phone}?text=${text}`, "_blank");
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-8 space-y-8 pb-24 md:pb-12">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-slate-500 overflow-x-auto whitespace-nowrap">
        <Link href="/" className="hover:text-brand-navy">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link href="/shop/" className="hover:text-brand-navy">Shop</Link>
        {product.category && (
          <>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href={`/shop/${product.category.slug}/`} className="hover:text-brand-navy">
              {product.category.name}
            </Link>
          </>
        )}
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-800 font-semibold truncate max-w-xs">{product.title}</span>
      </nav>

      {/* Main Product Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-10">
        {/* Left: Gallery */}
        <div className="space-y-3">
          {/* Main Large Image */}
          <div className="aspect-[4/5] rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-sm relative group">
            <img
              src={selectedImage || product.cover_image}
              alt={product.title}
              className="w-full h-full object-cover object-center"
            />
            {product.gsm && (
              <span className="absolute top-3 left-3 bg-brand-navy/90 text-brand-gold text-xs font-bold px-3 py-1 rounded-full backdrop-blur-sm shadow-md">
                {product.gsm}
              </span>
            )}
          </div>

          {/* Thumbnails */}
          {gallery.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              {gallery.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className={`w-16 h-20 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all ${
                    selectedImage === img ? "border-brand-navy shadow-sm" : "border-slate-200 opacity-70"
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Info & Buy Actions */}
        <div className="flex flex-col justify-between space-y-5">
          <div className="space-y-3">
            {/* Fabric Material Badge */}
            <div className="flex items-center gap-2">
              <span className="bg-amber-100 text-amber-900 text-xs font-bold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                <Award className="w-3 h-3 text-amber-700" />
                {product.fabric_material || "100% Combed Cotton"}
              </span>
              <span className="text-xs text-slate-400 font-medium">SKU: {product.sku || "ZS-TEXTILE"}</span>
            </div>

            {/* Title */}
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug">
              {product.title}
            </h1>

            {/* Rating & Reviews */}
            <div className="flex items-center gap-2 text-xs">
              <div className="flex items-center text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-amber-400 stroke-amber-400" />
                ))}
              </div>
              <span className="font-bold text-slate-700">{product.rating}</span>
              <span className="text-slate-400">• {product.reviews_count} Verified Customer Reviews</span>
            </div>

            {/* Price Row */}
            <div className="flex items-baseline gap-3 pt-1">
              <span className="text-2xl sm:text-3xl font-black text-brand-navy">
                Rs. {activePrice.toLocaleString()}
              </span>
              {product.sale_price && (
                <span className="text-base text-slate-400 line-through">
                  Rs. {product.price.toLocaleString()}
                </span>
              )}
              {product.sale_price && (
                <span className="bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded">
                  SAVE Rs. {(product.price - product.sale_price).toLocaleString()}
                </span>
              )}
            </div>

            {/* Short Description */}
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pt-1">
              {product.short_description}
            </p>

            {/* Color Swatches */}
            {product.colors && product.colors.length > 0 && (
              <div className="space-y-1.5 pt-2">
                <span className="text-xs font-bold text-slate-700 block">
                  Color: <span className="font-normal text-slate-500">{selectedColor}</span>
                </span>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((c) => (
                    <button
                      key={c}
                      onClick={() => setSelectedColor(c)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                        selectedColor === c
                          ? "border-brand-navy bg-brand-navy text-white shadow-sm"
                          : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Size / Dimensions */}
            <div className="space-y-1.5 pt-1">
              <span className="text-xs font-bold text-slate-700 block">
                Standard Dimensions: <span className="font-normal text-slate-500">{product.size_dimensions}</span>
              </span>
            </div>

            {/* Quantity Stepper */}
            <div className="pt-2 flex items-center gap-3">
              <span className="text-xs font-bold text-slate-700">Quantity:</span>
              <div className="flex items-center border border-slate-300 rounded-lg bg-white">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-l-lg"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-10 text-center text-xs font-bold text-slate-800">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-r-lg"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="space-y-2.5 pt-4 border-t border-slate-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Primary: Buy Now (Direct to 1-Page COD Checkout) */}
              <button
                onClick={handleBuyNow}
                className="w-full bg-brand-gold hover:bg-brand-gold-dark text-brand-navy-dark font-black py-3 px-4 rounded-xl text-sm shadow-md transition-all active:scale-[0.99] flex items-center justify-center gap-2"
              >
                <span>Buy Now (Cash on Delivery)</span>
              </button>

              {/* Secondary: Add to Cart */}
              <button
                onClick={handleAddToCart}
                className="w-full bg-brand-navy hover:bg-brand-navy-light text-white font-bold py-3 px-4 rounded-xl text-sm shadow-md transition-all active:scale-[0.99] flex items-center justify-center gap-2"
              >
                <ShoppingBag className="w-4 h-4 text-brand-gold" />
                <span>Add to Shopping Bag</span>
              </button>
            </div>

            {/* Order via WhatsApp */}
            <button
              onClick={handleWhatsAppOrder}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs sm:text-sm shadow-sm transition-all flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-4 h-4 fill-white" />
              <span>Order via WhatsApp (+92 325 4622375)</span>
            </button>
          </div>

          {/* Trust Guarantees */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-brand-navy flex-shrink-0" />
              <span>Nationwide 2-4 Days Delivery via TCS / Leopards</span>
            </div>
            <div className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-brand-navy flex-shrink-0" />
              <span>7-Day Hassle-Free Exchange Policy</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-brand-navy flex-shrink-0" />
              <span>100% Cotton Authenticity Guarantee • Faisalabad Factory Direct</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabbed Specifications */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="flex border-b border-slate-200 bg-slate-50 text-xs sm:text-sm font-bold">
          <button
            onClick={() => setActiveTab("specs")}
            className={`py-3 px-5 border-b-2 transition-colors ${
              activeTab === "specs"
                ? "border-brand-navy text-brand-navy bg-white"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            Material & GSM Specs
          </button>
          <button
            onClick={() => setActiveTab("care")}
            className={`py-3 px-5 border-b-2 transition-colors ${
              activeTab === "care"
                ? "border-brand-navy text-brand-navy bg-white"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            Washing & Care Guide
          </button>
          <button
            onClick={() => setActiveTab("shipping")}
            className={`py-3 px-5 border-b-2 transition-colors ${
              activeTab === "shipping"
                ? "border-brand-navy text-brand-navy bg-white"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            Shipping & Returns
          </button>
        </div>

        <div className="p-4 sm:p-6 text-xs sm:text-sm text-slate-700 leading-relaxed">
          {activeTab === "specs" && (
            <div className="space-y-3">
              <p>{product.description}</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                <div className="p-3 bg-slate-50 rounded-lg">
                  <span className="text-[11px] text-slate-400 block">GSM Density</span>
                  <span className="font-bold text-slate-800">{product.gsm}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <span className="text-[11px] text-slate-400 block">Composition</span>
                  <span className="font-bold text-slate-800">{product.fabric_material}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <span className="text-[11px] text-slate-400 block">Dimensions</span>
                  <span className="font-bold text-slate-800">{product.size_dimensions}</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === "care" && (
            <div className="space-y-2">
              <h4 className="font-bold text-slate-900">How to Maintain Cloud-Like Softness:</h4>
              <ul className="list-disc pl-5 space-y-1 text-slate-600">
                <li>Wash before first use in cold or warm water with mild detergent.</li>
                <li>Avoid chlorine bleach as it breaks down cotton fibers over time.</li>
                <li>Tumble dry on low heat or line dry under gentle shade to maintain terry loops.</li>
                <li>Do not iron terry towel loops directly to preserve fluffiness.</li>
              </ul>
            </div>
          )}

          {activeTab === "shipping" && (
            <div className="space-y-2">
              <h4 className="font-bold text-slate-900">Nationwide Delivery Timelines:</h4>
              <ul className="list-disc pl-5 space-y-1 text-slate-600">
                <li><strong>Punjab (Lahore, Faisalabad, Rawalpindi, Multan):</strong> 1–2 Business Days.</li>
                <li><strong>Sindh (Karachi, Hyderabad, Sukkur):</strong> 2–3 Business Days.</li>
                <li><strong>KPK & Islamabad:</strong> 2–3 Business Days.</li>
                <li><strong>Balochistan & Remote Regions:</strong> 3–5 Business Days.</li>
                <li>Orders above Rs. 3,000 receive automatic <strong>FREE Nationwide Delivery</strong>.</li>
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Frequently Bought Together / Related */}
      {relatedProducts.length > 0 && (
        <div className="space-y-4 pt-4 border-t border-slate-200">
          <h3 className="text-lg sm:text-xl font-bold text-brand-navy">
            Frequently Bought Together
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-4">
            {relatedProducts.slice(0, 3).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}

      {/* Sticky Mobile Buy Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-30 md:hidden bg-white/95 backdrop-blur-md border-t border-slate-200 p-2.5 shadow-[0_-4px_16px_rgba(0,0,0,0.08)] flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <img src={product.cover_image} alt="" className="w-10 h-10 object-cover rounded-lg bg-slate-100 flex-shrink-0" />
          <div className="truncate">
            <p className="text-xs font-bold text-slate-800 truncate">{product.title}</p>
            <p className="text-xs font-black text-brand-navy">Rs. {activePrice.toLocaleString()}</p>
          </div>
        </div>
        <button
          onClick={handleBuyNow}
          className="bg-brand-navy text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow-md flex-shrink-0 active:scale-95"
        >
          Buy Now (COD)
        </button>
      </div>
    </div>
  );
}
