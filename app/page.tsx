"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import HeroBanner from "@/components/HeroBanner";
import BrandsMarquee from "@/components/BrandsMarquee";
import TopCategoriesMarquee from "@/components/TopCategoriesMarquee";
import ProductCard from "@/components/ProductCard";
import { ProductCardSkeleton } from "@/components/SkeletonCard";
import { getHomepageCatalogData } from "@/lib/db";
import { supabase } from "@/lib/supabase";
import { Product, Category } from "@/lib/types";
import { Sparkles, ArrowRight, CheckCircle2, Shield, Droplets, HeartHandshake, MessageCircle } from "lucide-react";

export default function HomePage() {
  const [flashProducts, setFlashProducts] = useState<Product[]>([]);
  const [categoryGroups, setCategoryGroups] = useState<{ category: Category; products: Product[] }[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const { flashDeals, categoriesWithProducts } = await getHomepageCatalogData();
      setFlashProducts(flashDeals);
      setCategoryGroups(categoriesWithProducts);
    } catch (err) {
      console.error("Error loading homepage data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();

    // Real-time live multi-user sync when admin edits products or categories
    const channel = supabase
      .channel("homepage-realtime-sync")
      .on("postgres_changes", { event: "*", schema: "public", table: "products" }, () => {
        loadData();
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "categories" }, () => {
        loadData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadData]);

  // Only categories that actually have products appear in Homepage Top Categories
  const activeTopCategories = categoryGroups.map((g) => g.category);

  return (
    <div className="space-y-6 sm:space-y-9 pb-12">
      {/* 1. Responsive Pure Image Hero Banner */}
      <HeroBanner />

      {/* 2. Trust Badges Continuous Marquee */}
      <BrandsMarquee />

      {/* 3. Top Categories Carousel (Only non-empty categories) */}
      <TopCategoriesMarquee categories={activeTopCategories} externalLoading={loading} />

      {/* 4. Flash Deals Section (Strictly Top 4 newest Flash products in 2-column mobile grid) */}
      {(loading || flashProducts.length > 0) && (
        <section className="max-w-7xl mx-auto px-3 sm:px-6">
          <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent p-3 sm:p-5 rounded-2xl border border-brand-gold/30">
            <div className="flex items-center justify-between mb-3 sm:mb-5 gap-2">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-brand-gold text-brand-navy-dark flex items-center justify-center font-bold shadow-sm flex-shrink-0">
                  ⚡
                </span>
                <div>
                  <h2 className="text-base sm:text-xl font-bold text-brand-navy flex items-center gap-2">
                    <span>Flash Deals</span>
                    <span className="hidden sm:inline-block bg-red-600 text-white text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full animate-pulse">
                      Live Now
                    </span>
                  </h2>
                  <p className="text-[11px] sm:text-xs text-slate-500">
                    Limited-time discounts on newest cotton bundles & Ehrams
                  </p>
                </div>
              </div>

              <Link
                href="/shop/?flash=true"
                className="text-xs sm:text-sm font-bold text-brand-navy hover:text-brand-gold flex items-center gap-1 transition-colors flex-shrink-0"
              >
                <span>View All Deals</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* 2-Column Mobile Grid for Flash Products */}
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-4">
              {loading
                ? [1, 2, 3, 4].map((i) => <ProductCardSkeleton key={i} />)
                : flashProducts.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        </section>
      )}

      {/* 5. Dynamic All Main Categories (Up to 8 Newest Products Each; Empty Categories Hidden) */}
      {loading ? (
        <section className="max-w-7xl mx-auto px-3 sm:px-6 space-y-4">
          <div className="h-6 w-52 bg-slate-200 rounded animate-pulse" />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4">
            {[1, 2, 3, 4].map((i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        </section>
      ) : (
        categoryGroups.map(({ category, products }) => (
          <section key={category.id} className="max-w-7xl mx-auto px-3 sm:px-6">
            <div className="flex items-end justify-between mb-3 sm:mb-5 gap-2 border-b border-slate-200/80 pb-2.5">
              <div>
                <span className="text-brand-gold text-[11px] sm:text-xs font-bold uppercase tracking-wider block">
                  Newest Arrivals
                </span>
                <h2 className="text-lg sm:text-2xl font-bold text-brand-navy">
                  {category.name}
                </h2>
                {category.description && (
                  <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 line-clamp-1">
                    {category.description}
                  </p>
                )}
              </div>
              <Link
                href={`/shop/${category.slug}/`}
                className="text-xs sm:text-sm font-bold text-brand-navy hover:text-brand-gold flex items-center gap-1 transition-colors flex-shrink-0"
              >
                <span>View All</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* 2-Column Mobile Grid, 4-Column Desktop Grid (Max 8 Newest Products) */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        ))
      )}

      {/* 6. Why Z&S Textiles? (Faisalabad Manufacturing Quality) */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6">
        <div className="bg-brand-navy text-white rounded-2xl p-5 sm:p-10 relative overflow-hidden border border-brand-gold/30">
          <div className="relative z-10 max-w-3xl space-y-4">
            <span className="text-brand-gold text-xs font-bold uppercase tracking-wider block">
              Purity in Every Thread
            </span>
            <h2 className="text-xl sm:text-3xl font-bold tracking-tight">
              Why Discerning Homes Across Pakistan Choose Z&S Textiles
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Based in Faisalabad—the world’s foremost textile hub—Z&S Textiles cuts out middlemen to deliver export-grade, 100% combed cotton directly to your doorstep.
            </p>

            {/* 2-Column Mobile Feature Grid */}
            <div className="grid grid-cols-2 gap-2.5 sm:gap-6 pt-2">
              <div className="flex items-start gap-2 sm:gap-3 bg-white/5 p-2.5 sm:p-3 rounded-xl border border-white/10">
                <Droplets className="w-4 h-4 sm:w-5 sm:h-5 text-brand-gold flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-white">Ultra-Thirsty GSM</h4>
                  <p className="text-[10px] sm:text-xs text-slate-400 mt-0.5">
                    Dense ring-spun terry loops that absorb water 3x faster than market blends.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2 sm:gap-3 bg-white/5 p-2.5 sm:p-3 rounded-xl border border-white/10">
                <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-brand-gold flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-white">Pure Shariah Ehram</h4>
                  <p className="text-[10px] sm:text-xs text-slate-400 mt-0.5">
                    Non-see-through, breathable cotton terry tested for Makkah & Madinah heat.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2 sm:gap-3 bg-white/5 p-2.5 sm:p-3 rounded-xl border border-white/10">
                <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-brand-gold flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-white">Direct Factory Prices</h4>
                  <p className="text-[10px] sm:text-xs text-slate-400 mt-0.5">
                    Save up to 40% compared to luxury shopping mall retail markups.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2 sm:gap-3 bg-white/5 p-2.5 sm:p-3 rounded-xl border border-white/10">
                <HeartHandshake className="w-4 h-4 sm:w-5 sm:h-5 text-brand-gold flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-white">7-Day Free Exchange</h4>
                  <p className="text-[10px] sm:text-xs text-slate-400 mt-0.5">
                    Hassle-free replacement if you are not 100% in love with the softness.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. WhatsApp VIP Deals Channel Banner */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6">
        <div className="bg-gradient-to-r from-emerald-600 to-emerald-800 text-white rounded-2xl p-5 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
          <div className="space-y-1.5 text-center sm:text-left">
            <div className="inline-flex items-center gap-1.5 bg-white/20 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full">
              <Sparkles className="w-3 h-3" /> Exclusive VIP Community
            </div>
            <h3 className="text-lg sm:text-2xl font-bold">
              Join Our WhatsApp VIP Deals Channel
            </h3>
            <p className="text-xs sm:text-sm text-emerald-100 max-w-xl">
              Be the first to access unreleased export towel surplus sales, special Hajj/Umrah discounts, and private seasonal coupons.
            </p>
          </div>

          <a
            href="https://whatsapp.com/channel/0029VbDT4sqId7nGeCKOoz43"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-shrink-0 inline-flex items-center gap-2 bg-white text-emerald-800 hover:bg-emerald-50 text-xs sm:text-sm font-bold py-3 px-6 rounded-xl shadow-md transition-all active:scale-95"
          >
            <MessageCircle className="w-4 h-4 fill-emerald-600 text-white" />
            <span>Join VIP Channel Now</span>
          </a>
        </div>
      </section>
    </div>
  );
}
