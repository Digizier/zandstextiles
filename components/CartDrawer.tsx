"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/lib/cart-context";
import { validateCoupon } from "@/lib/db";
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, Tag, Truck } from "lucide-react";

export default function CartDrawer() {
  const {
    cart,
    isCartDrawerOpen,
    setIsCartDrawerOpen,
    removeFromCart,
    updateQuantity,
    cartTotal,
    clearCart,
  } = useCart();

  const [couponInput, setCouponInput] = useState("");
  const [couponError, setCouponError] = useState("");
  const [couponSuccess, setCouponSuccess] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState(0);

  const FREE_SHIPPING_THRESHOLD = 3000;
  const progressPercent = Math.min(100, Math.round((cartTotal / FREE_SHIPPING_THRESHOLD) * 100));
  const remainingForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - cartTotal);

  if (!isCartDrawerOpen) return null;

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError("");
    setCouponSuccess("");

    if (!couponInput.trim()) return;

    const res = await validateCoupon(couponInput, cartTotal);
    if (res.valid) {
      setAppliedDiscount(res.discount);
      setCouponSuccess(res.message);
    } else {
      setAppliedDiscount(0);
      setCouponError(res.message);
    }
  };

  const deliveryFee = cartTotal >= FREE_SHIPPING_THRESHOLD || appliedDiscount >= cartTotal ? 0 : 250;
  const grandTotal = Math.max(0, cartTotal - appliedDiscount + deliveryFee);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        onClick={() => setIsCartDrawerOpen(false)}
        className="fixed inset-0 bg-brand-navy-dark/60 backdrop-blur-sm transition-opacity"
      />

      {/* Slide-in Drawer */}
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col z-10 overflow-hidden animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="p-4 bg-brand-navy text-white flex items-center justify-between border-b border-brand-gold/30">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-brand-gold" />
            <h2 className="font-bold text-base tracking-wide">Your Shopping Bag ({cart.length})</h2>
          </div>
          <button
            onClick={() => setIsCartDrawerOpen(false)}
            className="p-1 rounded-full hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Shipping Progress Bar */}
        <div className="p-3 bg-amber-50 border-b border-amber-200/80">
          <div className="flex items-center justify-between text-xs font-semibold text-amber-900 mb-1.5">
            <span className="flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-brand-gold" />
              {remainingForFreeShipping === 0
                ? "🎉 You unlocked FREE Nationwide Delivery!"
                : `Add Rs. ${remainingForFreeShipping.toLocaleString()} more for FREE Delivery`}
            </span>
            <span>{progressPercent}%</span>
          </div>
          <div className="w-full h-2 bg-amber-200/60 rounded-full overflow-hidden">
            <div
              className="h-full bg-brand-gold transition-all duration-500 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12 space-y-4">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <div>
                <p className="font-semibold text-slate-700 text-sm">Your bag is empty</p>
                <p className="text-xs text-slate-500 mt-1">Explore our pure combed cotton towels & luxury linens.</p>
              </div>
              <button
                onClick={() => setIsCartDrawerOpen(false)}
                className="bg-brand-navy hover:bg-brand-navy-light text-white text-xs font-bold py-2.5 px-6 rounded-lg transition-colors"
              >
                Start Shopping
              </button>
            </div>
          ) : (
            cart.map((item, index) => (
              <div
                key={`${item.product_id}-${item.size}-${item.color}-${index}`}
                className="flex gap-3 p-3 bg-slate-50/80 rounded-xl border border-slate-200 relative group"
              >
                {/* Thumbnail */}
                <div className="w-20 h-24 rounded-lg bg-white border border-slate-200 overflow-hidden flex-shrink-0">
                  <img
                    src={item.image_url}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Details */}
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs font-semibold text-slate-800 line-clamp-1">
                      {item.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {item.size} • {item.color}
                    </p>
                    <p className="text-xs font-bold text-brand-navy mt-1">
                      Rs. {item.price.toLocaleString()}
                    </p>
                  </div>

                  {/* Quantity Stepper */}
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center border border-slate-300 rounded-lg bg-white">
                      <button
                        onClick={() => updateQuantity(item.product_id, item.quantity - 1, item.size, item.color)}
                        className="p-1 hover:bg-slate-100 text-slate-600 rounded-l-lg"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-7 text-center text-xs font-semibold text-slate-800">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.product_id, item.quantity + 1, item.size, item.color)}
                        className="p-1 hover:bg-slate-100 text-slate-600 rounded-r-lg"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.product_id, item.size, item.color)}
                      className="text-slate-400 hover:text-red-500 p-1"
                      title="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Checkout Summary */}
        {cart.length > 0 && (
          <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-3">
            {/* Promo Code Input */}
            <form onSubmit={handleApplyCoupon} className="flex gap-2">
              <div className="relative flex-1">
                <Tag className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Coupon (e.g. WELCOME10)"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-brand-navy uppercase"
                />
              </div>
              <button
                type="submit"
                className="bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold px-3 py-2 rounded-lg transition-colors"
              >
                Apply
              </button>
            </form>
            {couponError && <p className="text-[11px] text-red-600 font-medium">{couponError}</p>}
            {couponSuccess && <p className="text-[11px] text-emerald-600 font-medium">{couponSuccess}</p>}

            {/* Price Calculations */}
            <div className="space-y-1 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>Rs. {cartTotal.toLocaleString()}</span>
              </div>
              {appliedDiscount > 0 && (
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>Discount Applied</span>
                  <span>- Rs. {appliedDiscount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Nationwide Shipping</span>
                <span>{deliveryFee === 0 ? "FREE" : `Rs. ${deliveryFee}`}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-slate-900 pt-1 border-t border-slate-200">
                <span>Total Amount (COD)</span>
                <span className="text-brand-navy">Rs. {grandTotal.toLocaleString()}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-1">
              <Link
                href="/checkout/"
                onClick={() => setIsCartDrawerOpen(false)}
                className="w-full bg-brand-navy hover:bg-brand-navy-light text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 text-sm shadow-md transition-all active:scale-[0.99]"
              >
                <span>Proceed to 1-Page Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
