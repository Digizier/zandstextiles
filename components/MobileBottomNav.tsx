"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/lib/cart-context";
import { Home, Grid, Search, ShoppingBag, MessageCircle } from "lucide-react";

interface MobileBottomNavProps {
  onOpenCategoryDrawer: () => void;
  onOpenSearch: () => void;
}

export default function MobileBottomNav({ onOpenCategoryDrawer, onOpenSearch }: MobileBottomNavProps) {
  const pathname = usePathname();
  const { itemCount, setIsCartDrawerOpen, isCartDrawerOpen } = useCart();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Hide bottom nav when admin panel is active or drawer/cart is open
  const isAdmin = pathname.startsWith("/admin");

  useEffect(() => {
    const handleDrawerState = (e: any) => {
      setIsDrawerOpen(e.detail?.open || false);
    };
    window.addEventListener("zs_drawer_state", handleDrawerState);
    return () => window.removeEventListener("zs_drawer_state", handleDrawerState);
  }, []);

  if (isAdmin || isDrawerOpen || isCartDrawerOpen) {
    return null;
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white/85 backdrop-blur-lg border-t border-slate-200/80 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] px-2 py-1.5 transition-all duration-300">
      <div className="flex items-center justify-around">
        {/* Home */}
        <Link
          href="/"
          className={`flex flex-col items-center justify-center p-1.5 text-[10px] font-medium transition-colors ${
            pathname === "/" ? "text-brand-navy font-bold" : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <Home className={`w-5 h-5 mb-0.5 ${pathname === "/" ? "stroke-[2.5]" : ""}`} />
          <span>Home</span>
        </Link>

        {/* Categories Drawer Trigger */}
        <button
          onClick={onOpenCategoryDrawer}
          type="button"
          className="flex flex-col items-center justify-center p-1.5 text-[10px] font-medium text-slate-500 hover:text-brand-navy"
        >
          <Grid className="w-5 h-5 mb-0.5" />
          <span>Categories</span>
        </button>

        {/* Live Search Trigger */}
        <button
          onClick={onOpenSearch}
          type="button"
          className="flex flex-col items-center justify-center p-1.5 text-[10px] font-medium text-slate-500 hover:text-brand-navy"
        >
          <Search className="w-5 h-5 mb-0.5" />
          <span>Search</span>
        </button>

        {/* Cart Drawer Trigger */}
        <button
          onClick={() => setIsCartDrawerOpen(true)}
          type="button"
          className="flex flex-col items-center justify-center p-1.5 text-[10px] font-medium text-slate-500 hover:text-brand-navy relative"
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5 mb-0.5" />
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-2 bg-brand-gold text-brand-navy-dark text-[9px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
                {itemCount}
              </span>
            )}
          </div>
          <span>Cart</span>
        </button>

        {/* Direct WhatsApp Order/Support */}
        <a
          href="https://wa.me/923254622375?text=Assalamu%20Alaikum%20Z%26S%20Textiles%2C%20I%20have%20an%20inquiry%20regarding%20your%20products."
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center justify-center p-1.5 text-[10px] font-medium text-emerald-600 hover:text-emerald-700"
        >
          <MessageCircle className="w-5 h-5 mb-0.5 fill-emerald-600 text-white" />
          <span>WhatsApp</span>
        </a>
      </div>
    </nav>
  );
}
