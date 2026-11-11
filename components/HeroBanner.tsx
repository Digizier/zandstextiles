"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Banner } from "@/lib/types";
import { getBanners } from "@/lib/db";
import { BannerSkeleton } from "./SkeletonCard";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function HeroBanner() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const data = await getBanners();
      setBanners(data);
      setLoading(false);
    }
    load();
  }, []);

  // Auto-rotate every 5 seconds
  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [banners.length]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-3 sm:pt-4">
        <BannerSkeleton />
      </div>
    );
  }

  if (banners.length === 0) return null;

  const currentBanner = banners[currentIndex];

  const handlePrev = (e: React.MouseEvent) => {
    e.preventDefault();
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault();
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 pt-2 sm:pt-4">
      <div className="relative w-full rounded-xl sm:rounded-2xl overflow-hidden shadow-sm border border-slate-200/80 group aspect-[16/9] sm:aspect-[16/7] lg:aspect-[2.4/1] bg-slate-100">
        {/* Banner Image (Pure Image Banner, Zero Clutter) */}
        <Link href={currentBanner.link_url || "/shop/"} className="block w-full h-full">
          <img
            src={currentBanner.image_url}
            alt={currentBanner.title}
            className="w-full h-full object-cover object-center transition-all duration-700"
          />
        </Link>

        {/* Carousel Navigation Arrows */}
        {banners.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              aria-label="Previous Slide"
              type="button"
              className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-7 h-7 sm:w-10 sm:h-10 rounded-full bg-white/80 hover:bg-white text-brand-navy shadow-md flex items-center justify-center opacity-80 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <button
              onClick={handleNext}
              aria-label="Next Slide"
              type="button"
              className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-7 h-7 sm:w-10 sm:h-10 rounded-full bg-white/80 hover:bg-white text-brand-navy shadow-md flex items-center justify-center opacity-80 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300"
            >
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            {/* Pagination Dots */}
            <div className="absolute bottom-2 sm:bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 sm:gap-2">
              {banners.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  aria-label={`Go to slide ${idx + 1}`}
                  className={`h-1.5 sm:h-2 rounded-full transition-all duration-300 ${
                    idx === currentIndex
                      ? "w-6 sm:w-8 bg-brand-gold"
                      : "w-2 bg-white/60 hover:bg-white"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
