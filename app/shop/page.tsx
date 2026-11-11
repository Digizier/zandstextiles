"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import { ProductCardSkeleton } from "@/components/SkeletonCard";
import { getProducts, getCategories } from "@/lib/db";
import { Product, Category } from "@/lib/types";
import { Filter, ChevronLeft, ChevronRight, X } from "lucide-react";

function ShopContent() {
  const searchParams = useSearchParams();
  const searchQ = searchParams.get("search") || "";
  const isFlash = searchParams.get("flash") === "true";

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCat, setSelectedCat] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const PRODUCTS_PER_PAGE = 8;

  // Load categories once
  useEffect(() => {
    async function loadCats() {
      const data = await getCategories();
      setCategories(data);
    }
    loadCats();
  }, []);

  // Fetch paginated products (strictly 8 per page)
  useEffect(() => {
    async function load() {
      setLoading(true);
      const offset = (currentPage - 1) * PRODUCTS_PER_PAGE;
      const res = await getProducts({
        categorySlug: selectedCat !== "all" ? selectedCat : undefined,
        limit: PRODUCTS_PER_PAGE,
        offset,
        isFlashDeal: isFlash ? true : undefined,
        searchQuery: searchQ || undefined,
      });
      setProducts(res.products);
      setTotalProducts(res.totalCount);
      setLoading(false);
    }
    load();
  }, [selectedCat, currentPage, searchQ, isFlash]);

  const totalPages = Math.ceil(totalProducts / PRODUCTS_PER_PAGE) || 1;

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-8 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-brand-navy">
            {isFlash
              ? "⚡ Flash Deals & Clearance Offers"
              : searchQ
              ? `Search Results for "${searchQ}"`
              : "All Textile Collections"}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Showing {products.length} of {totalProducts} export-quality cotton products (Page {currentPage} of {totalPages})
          </p>
        </div>

        {/* Mobile Filter Button */}
        <button
          onClick={() => setIsFilterOpen(true)}
          className="sm:hidden flex items-center justify-center gap-2 bg-white border border-slate-300 py-2 px-4 rounded-xl text-xs font-bold text-slate-700 shadow-sm active:bg-slate-50"
        >
          <Filter className="w-4 h-4 text-brand-navy" />
          <span>Filter Categories</span>
        </button>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
        {/* Desktop Sidebar Filter */}
        <aside className="hidden sm:block space-y-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Categories
            </h3>
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => {
                  setSelectedCat("all");
                  setCurrentPage(1);
                }}
                className={`w-full text-left py-2 px-3 rounded-lg text-xs font-semibold transition-colors ${
                  selectedCat === "all"
                    ? "bg-brand-navy text-white"
                    : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                All Collections
              </button>
              {categories.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => {
                    setSelectedCat(c.slug);
                    setCurrentPage(1);
                  }}
                  className={`w-full text-left py-2 px-3 rounded-lg text-xs font-semibold transition-colors ${
                    selectedCat === c.slug
                      ? "bg-brand-navy text-white"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Products Grid (Strictly 2 Columns on Mobile, 3 on Desktop) */}
        <div className="sm:col-span-3 space-y-6">
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5 sm:gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-3">
              <p className="text-slate-600 text-sm font-semibold">
                No products found matching your criteria.
              </p>
              <button
                onClick={() => {
                  setSelectedCat("all");
                  setCurrentPage(1);
                }}
                className="bg-brand-navy text-white text-xs font-bold py-2 px-4 rounded-lg"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5 sm:gap-4">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}

          {/* Strict 8-Products Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-1.5 pt-6 border-t border-slate-200">
              <button
                disabled={currentPage <= 1}
                onClick={() => handlePageChange(currentPage - 1)}
                className="p-2 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none"
                aria-label="Previous Page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`w-8 h-8 rounded-lg text-xs font-bold transition-colors ${
                    currentPage === page
                      ? "bg-brand-navy text-white"
                      : "border border-slate-300 text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                disabled={currentPage >= totalPages}
                onClick={() => handlePageChange(currentPage + 1)}
                className="p-2 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none"
                aria-label="Next Page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filter Modal */}
      {isFilterOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:hidden">
          <div
            onClick={() => setIsFilterOpen(false)}
            className="fixed inset-0 bg-brand-navy-dark/60 backdrop-blur-sm"
          />
          <div className="relative w-full bg-white rounded-t-2xl p-5 z-10 space-y-4 max-h-[75vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="font-bold text-sm text-slate-800">Filter by Category</h3>
              <button onClick={() => setIsFilterOpen(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="space-y-1.5">
              <button
                type="button"
                onClick={() => {
                  setSelectedCat("all");
                  setCurrentPage(1);
                }}
                className={`w-full text-left py-2.5 px-3 rounded-lg text-xs font-semibold ${
                  selectedCat === "all" ? "bg-brand-navy text-white" : "bg-slate-50 text-slate-800"
                }`}
              >
                All Collections
              </button>
              {categories.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => {
                    setSelectedCat(c.slug);
                    setCurrentPage(1);
                  }}
                  className={`w-full text-left py-2.5 px-3 rounded-lg text-xs font-semibold ${
                    selectedCat === c.slug ? "bg-brand-navy text-white" : "bg-slate-50 text-slate-800"
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setIsFilterOpen(false)}
              className="w-full bg-brand-navy text-white py-3 rounded-xl font-bold text-xs"
            >
              Done (View Products)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        </div>
      }
    >
      <ShopContent />
    </Suspense>
  );
}
