"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCart } from "@/lib/cart-context";
import { getProducts } from "@/lib/db";
import { Product } from "@/lib/types";
import { Menu, Search, ShoppingBag, X, MessageCircle, Truck, Sparkles, ChevronRight } from "lucide-react";

interface HeaderProps {
  onOpenCategoryDrawer: () => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
}

export default function Header({ onOpenCategoryDrawer, isSearchOpen, setIsSearchOpen }: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { itemCount, setIsCartDrawerOpen } = useCart();

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Announcement bar messages
  const announcements = [
    "🇵🇰 Cash on Delivery (COD) Available Nationwide Across Pakistan",
    "🚚 FREE Nationwide Shipping on All Orders Above Rs. 3,000",
    "✨ 100% Combed Faisalabad Cotton • 550-600 GSM Ultra-Soft & Thirsty",
    "🕋 Premium Terry Cotton Hajj & Umrah Ehrams In Stock",
  ];
  const [announcementIndex, setAnnouncementIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setAnnouncementIndex((prev) => (prev + 1) % announcements.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [announcements.length]);

  // Handle Search Input with Debounce
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      const res = await getProducts({ searchQuery, limit: 5 });
      setSearchResults(res.products);
      setIsSearching(false);
    }, 280);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsSearchOpen(false);
      router.push(`/shop/?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // Don't render storefront header in admin panel
  if (pathname.startsWith("/admin")) return null;

  return (
    <header className="sticky top-0 z-40 w-full bg-white shadow-sm border-b border-slate-200">
      {/* 1. Top Announcement Bar */}
      <div className="bg-brand-navy-dark text-white text-[11px] sm:text-xs py-1.5 px-3 border-b border-brand-gold/30">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex-1 text-center font-medium tracking-wide transition-all duration-500 overflow-hidden text-ellipsis whitespace-nowrap">
            {announcements[announcementIndex]}
          </div>

          <div className="hidden lg:flex items-center gap-4 text-slate-300">
            <Link href="/track-order/" className="hover:text-brand-gold transition-colors">
              Track Order
            </Link>
            <span className="text-slate-600">•</span>
            <a
              href="https://whatsapp.com/channel/0029VbDT4sqId7nGeCKOoz43"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-brand-gold flex items-center gap-1 font-semibold text-brand-gold transition-colors"
            >
              <Sparkles className="w-3 h-3" /> VIP Deals Channel
            </a>
          </div>
        </div>
      </div>

      {/* 2. Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2 sm:py-3 flex items-center justify-between gap-3">
        {/* Left: Mobile Hamburger & Desktop Categories Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenCategoryDrawer}
            className="p-1.5 sm:p-2 rounded-lg text-slate-700 hover:text-brand-navy hover:bg-slate-100 transition-colors flex items-center gap-1.5"
            aria-label="Open Categories Menu"
          >
            <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
            <span className="hidden md:inline text-xs font-bold uppercase tracking-wider text-slate-700">
              Collections
            </span>
          </button>
        </div>

        {/* Center: Brand Logo */}
        <Link href="/" className="flex items-center justify-center group">
          <img
            src="/images/zandstextiles-luxury-home-bedding-and-linens-logo.webp"
            alt="Z&S Textiles - Feel the Softness"
            className="h-9 sm:h-12 w-auto max-w-[150px] sm:max-w-[200px] object-contain transition-transform group-hover:scale-[1.02]"
          />
        </Link>

        {/* Right: Search, VIP WhatsApp, and Cart Drawer */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Search Trigger Button */}
          <button
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className="p-2 rounded-lg text-slate-700 hover:text-brand-navy hover:bg-slate-100 transition-colors"
            aria-label="Search Catalog"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* WhatsApp VIP / Helpline (Desktop) */}
          <a
            href="https://wa.me/923254622375"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1.5 rounded-full border border-emerald-200 transition-colors"
          >
            <MessageCircle className="w-3.5 h-3.5 fill-emerald-600 text-white" />
            <span>0325-4622375</span>
          </a>

          {/* Cart Drawer Trigger Button */}
          <button
            onClick={() => setIsCartDrawerOpen(true)}
            className="p-2 rounded-lg bg-brand-navy hover:bg-brand-navy-light text-white transition-colors relative flex items-center gap-1.5 shadow-sm active:scale-95"
            aria-label="Open Shopping Bag"
          >
            <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-brand-gold" />
            <span className="hidden sm:inline text-xs font-bold">Bag</span>
            {itemCount > 0 && (
              <span className="bg-brand-gold text-brand-navy-dark text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* 3. Expandable Live Search Bar with Hinglish Autocomplete */}
      {isSearchOpen && (
        <div className="border-t border-slate-200 bg-slate-50/95 backdrop-blur-md px-4 py-3 animate-in slide-in-from-top-2 duration-200 relative">
          <div className="max-w-3xl mx-auto">
            <form onSubmit={handleSearchSubmit} className="relative flex items-center">
              <Search className="w-4 h-4 absolute left-3 text-slate-400" />
              <input
                ref={searchInputRef}
                type="text"
                autoFocus
                placeholder="Search towels, ehram, bedsheets, chaddar, cotton..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-10 py-2.5 text-xs sm:text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-brand-navy shadow-inner"
              />
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setIsSearchOpen(false);
                }}
                className="absolute right-3 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </form>

            {/* Live Product Dropdown Results */}
            {searchQuery.trim().length > 0 && (
              <div className="mt-2 bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden divide-y divide-slate-100 max-h-80 overflow-y-auto">
                {isSearching ? (
                  <div className="p-4 text-center text-xs text-slate-500">
                    Searching catalog...
                  </div>
                ) : searchResults.length > 0 ? (
                  searchResults.map((p) => (
                    <Link
                      key={p.id}
                      href={`/product/${p.slug}/`}
                      onClick={() => setIsSearchOpen(false)}
                      className="p-2.5 flex items-center gap-3 hover:bg-slate-50 transition-colors"
                    >
                      <img
                        src={p.cover_image}
                        alt={p.title}
                        className="w-10 h-12 object-cover rounded bg-slate-100"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-slate-800 truncate">
                          {p.title}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          {p.gsm} • {p.fabric_material}
                        </p>
                      </div>
                      <span className="text-xs font-bold text-brand-navy">
                        Rs. {(p.sale_price || p.price).toLocaleString()}
                      </span>
                    </Link>
                  ))
                ) : (
                  <div className="p-4 text-center text-xs text-slate-500">
                    No matching products found for "{searchQuery}".
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
