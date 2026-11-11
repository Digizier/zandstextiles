"use client";

import Link from "next/link";
import { Product } from "@/lib/types";
import { useCart } from "@/lib/cart-context";
import { ShoppingBag, Star, MessageCircle, Sparkles } from "lucide-react";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();

  const discountPercentage = product.sale_price
    ? Math.round(((product.price - product.sale_price) / product.price) * 100)
    : 0;

  const activePrice = product.sale_price || product.price;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({
      product_id: product.id,
      title: product.title,
      slug: product.slug,
      price: activePrice,
      quantity: 1,
      size: product.size_dimensions || "Standard",
      color: product.colors?.[0] || "Standard",
      image_url: product.cover_image,
    });
  };

  const handleWhatsAppOrder = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const phone = "923254622375";
    const text = encodeURIComponent(
      `Assalamu Alaikum Z&S Textiles, I would like to order:\n\n*${product.title}*\nPrice: Rs. ${activePrice}\nSKU: ${product.sku || 'N/A'}\nLink: https://zandstextiles.com/product/${product.slug}/`
    );
    window.open(`https://wa.me/${phone}?text=${text}`, "_blank");
  };

  return (
    <div className="group bg-white rounded-xl border border-slate-200/90 hover:border-brand-gold/60 transition-all duration-300 hover:shadow-md flex flex-col h-full overflow-hidden relative">
      {/* Discount / Flash Tag */}
      <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
        {discountPercentage > 0 && (
          <span className="bg-red-600 text-white text-[10px] sm:text-xs font-bold px-1.5 py-0.5 rounded shadow-sm">
            {discountPercentage}% OFF
          </span>
        )}
        {product.is_flash_deal && (
          <span className="bg-brand-gold text-brand-navy-dark text-[10px] sm:text-xs font-bold px-1.5 py-0.5 rounded shadow-sm flex items-center gap-0.5">
            <Sparkles className="w-2.5 h-2.5" /> FLASH
          </span>
        )}
      </div>

      {/* Product Image Link */}
      <Link href={`/product/${product.slug}/`} className="block relative aspect-square sm:aspect-[4/5] bg-slate-50 overflow-hidden">
        <img
          src={product.cover_image}
          alt={product.title}
          loading="lazy"
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
        />
        {/* Fabric / GSM Pill Badge */}
        {product.gsm && (
          <span className="absolute bottom-2 left-2 max-w-[calc(100%-16px)] truncate bg-brand-navy/90 text-white backdrop-blur-sm text-[10px] font-medium px-2 py-0.5 rounded-full">
            {product.gsm.split("-")[0].split("+")[0].trim()}
          </span>
        )}
      </Link>

      {/* Product Content Details */}
      <div className="p-2 sm:p-3.5 flex flex-col flex-grow justify-between space-y-1.5 sm:space-y-2">
        <div>
          {/* Rating & Fabric */}
          <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-slate-500 mb-0.5 sm:mb-1 gap-1">
            <span className="line-clamp-1">{product.fabric_material || "100% Cotton"}</span>
            <span className="flex items-center text-amber-500 font-semibold gap-0.5 flex-shrink-0">
              <Star className="w-3 h-3 fill-amber-500" />
              {product.rating || "4.9"}
            </span>
          </div>

          {/* Title */}
          <Link href={`/product/${product.slug}/`} className="block">
            <h3 className="text-xs sm:text-sm font-semibold text-slate-800 line-clamp-2 leading-snug hover:text-brand-navy transition-colors">
              {product.title}
            </h3>
          </Link>
        </div>

        {/* Pricing & Actions */}
        <div className="pt-1.5 border-t border-slate-100 flex flex-col space-y-1.5 sm:space-y-2">
          {/* Price Row */}
          <div className="flex items-baseline gap-1.5 flex-wrap">
            <span className="text-xs sm:text-base font-bold text-brand-navy">
              Rs. {activePrice.toLocaleString()}
            </span>
            {product.sale_price && (
              <span className="text-[10px] sm:text-xs text-slate-400 line-through">
                Rs. {product.price.toLocaleString()}
              </span>
            )}
          </div>

          {/* Action Buttons (Dual Conversion CTA) */}
          <div className="grid grid-cols-5 gap-1 sm:gap-1.5">
            {/* Add to Cart Button */}
            <button
              onClick={handleQuickAdd}
              type="button"
              className="col-span-4 bg-brand-navy hover:bg-brand-navy-light text-white text-[11px] sm:text-xs font-semibold py-1.5 px-1 sm:px-2 rounded-lg flex items-center justify-center gap-1 transition-colors shadow-sm active:scale-95 whitespace-nowrap"
              title="Add to Cart"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Add to Cart</span>
            </button>

            {/* Quick WhatsApp Order Button */}
            <button
              onClick={handleWhatsAppOrder}
              type="button"
              className="col-span-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg flex items-center justify-center transition-colors shadow-sm active:scale-95"
              title="Order on WhatsApp"
            >
              <MessageCircle className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
