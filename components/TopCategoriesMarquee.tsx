"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { Category } from "@/lib/types";
import { getCategories } from "@/lib/db";
import { CategoryCardSkeleton } from "./SkeletonCard";
import { ChevronRight } from "lucide-react";

interface TopCategoriesMarqueeProps {
  categories?: Category[];
  externalLoading?: boolean;
}

export default function TopCategoriesMarquee({
  categories: propCategories,
  externalLoading,
}: TopCategoriesMarqueeProps = {}) {
  const [internalCategories, setInternalCategories] = useState<Category[]>([]);
  const [internalLoading, setInternalLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (propCategories !== undefined) {
      setInternalLoading(false);
      return;
    }
    async function load() {
      const data = await getCategories();
      const topOnly = data.filter((c) => c.show_in_top_categories);
      setInternalCategories(topOnly);
      setInternalLoading(false);
    }
    load();
  }, [propCategories]);

  const categories =
    propCategories !== undefined
      ? propCategories.filter((c) => c.show_in_top_categories)
      : internalCategories;
  const loading = externalLoading !== undefined ? externalLoading : internalLoading;

  if (loading) {
    return (
      <div className="py-6 sm:py-8 bg-slate-50/70 border-y border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4">
          <div className="h-6 w-48 bg-slate-200 rounded mb-4 animate-pulse" />
          <div className="flex gap-3 overflow-x-hidden">
            {[1, 2, 3, 4].map((i) => (
              <CategoryCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (categories.length === 0) return null;

  const isMoreThanFour = categories.length > 4;
  const desktopGridCols =
    categories.length === 1
      ? "grid-cols-1 max-w-xs mx-auto"
      : categories.length === 2
      ? "grid-cols-2 max-w-2xl mx-auto"
      : categories.length === 3
      ? "grid-cols-3 max-w-4xl mx-auto"
      : "grid-cols-4";

  const fallbackLogo = "/images/zandstextiles-luxury-home-bedding-and-linens-logo.webp";

  return (
    <section className="py-5 sm:py-8 bg-slate-50/80 border-y border-slate-200/70 overflow-hidden">
      <div className="max-w-7xl mx-auto px-3 sm:px-6">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-3 sm:mb-5">
          <div>
            <span className="text-brand-gold text-[11px] sm:text-xs font-bold uppercase tracking-wider block">
              Explore Collections
            </span>
            <h2 className="text-lg sm:text-2xl font-bold text-brand-navy">
              Top Categories
            </h2>
          </div>
          <Link
            href="/shop/"
            className="text-xs sm:text-sm font-semibold text-brand-navy hover:text-brand-gold flex items-center gap-1 transition-colors"
          >
            <span>View All</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Mobile View: ~2.5 cards visible per screen with smooth touch scroll */}
        <div className="block md:hidden">
          <div
            ref={scrollRef}
            className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-none snap-x snap-mandatory -mx-3 px-3"
          >
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/shop/${cat.slug}/`}
                className="snap-start flex-shrink-0 w-[39vw] max-w-[155px] bg-white rounded-xl border border-slate-200 p-2.5 flex flex-col items-center text-center shadow-sm hover:border-brand-gold transition-all duration-300 group"
              >
                <div className="w-16 h-16 rounded-full overflow-hidden mb-2 bg-slate-100 border border-slate-100 group-hover:scale-105 transition-transform duration-300">
                  <img
                    src={cat.image_url || fallbackLogo}
                    alt={cat.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <h3 className="text-xs font-semibold text-slate-800 line-clamp-2 group-hover:text-brand-navy transition-colors">
                  {cat.name}
                </h3>
              </Link>
            ))}
          </div>
        </div>

        {/* Desktop View: Centered if <= 4, Auto-scrolling marquee if > 4 */}
        <div className="hidden md:block">
          {!isMoreThanFour ? (
            <div className={`grid gap-4 ${desktopGridCols}`}>
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/shop/${cat.slug}/`}
                  className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col items-center text-center shadow-sm hover:shadow-md hover:border-brand-gold transition-all duration-300 group"
                >
                  <div className="w-24 h-24 rounded-full overflow-hidden mb-3 bg-slate-100 border border-slate-100 group-hover:scale-105 transition-transform duration-300">
                    <img
                      src={cat.image_url || fallbackLogo}
                      alt={cat.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <h3 className="text-sm font-semibold text-slate-800 group-hover:text-brand-navy transition-colors">
                    {cat.name}
                  </h3>
                  {cat.description && (
                    <p className="text-xs text-slate-500 line-clamp-1 mt-1">
                      {cat.description}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          ) : (
            <div className="relative w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,white_10%,white_90%,transparent)]">
              <div className="flex gap-4 animate-marquee hover:[animation-play-state:paused] py-2">
                {[...categories, ...categories].map((cat, idx) => (
                  <Link
                    key={`${cat.id}-${idx}`}
                    href={`/shop/${cat.slug}/`}
                    className="flex-shrink-0 w-44 bg-white rounded-xl border border-slate-200 p-4 flex flex-col items-center text-center shadow-sm hover:border-brand-gold hover:shadow-md transition-all duration-300 group"
                  >
                    <div className="w-20 h-20 rounded-full overflow-hidden mb-2 bg-slate-100 group-hover:scale-105 transition-transform">
                      <img
                        src={cat.image_url || fallbackLogo}
                        alt={cat.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                    <h3 className="text-xs font-semibold text-slate-800 line-clamp-1 group-hover:text-brand-navy">
                      {cat.name}
                    </h3>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
