"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import { ProductCardSkeleton } from "@/components/SkeletonCard";
import { getProducts, getCategories, getSubcategories } from "@/lib/db";
import { Product, Category, Subcategory } from "@/lib/types";
import { ChevronLeft, ChevronRight, ArrowLeft } from "lucide-react";

interface Props {
  categorySlug: string;
}

export default function CategoryProductsClient({ categorySlug }: Props) {
  const searchParams = useSearchParams();
  const subParam = searchParams.get("sub") || "";

  const [category, setCategory] = useState<Category | null>(null);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [selectedSub, setSelectedSub] = useState<string>(subParam);
  const [products, setProducts] = useState<Product[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [loading, setLoading] = useState(true);

  const PRODUCTS_PER_PAGE = 8;

  useEffect(() => {
    async function loadMeta() {
      const cats = await getCategories();
      const match = cats.find((c) => c.slug === categorySlug);
      if (match) {
        setCategory(match);
        const subs = await getSubcategories(match.id);
        setSubcategories(subs);
      }
    }
    loadMeta();
  }, [categorySlug]);

  useEffect(() => {
    async function loadProducts() {
      setLoading(true);
      const offset = (currentPage - 1) * PRODUCTS_PER_PAGE;
      const res = await getProducts({
        categorySlug,
        subcategorySlug: selectedSub || undefined,
        limit: PRODUCTS_PER_PAGE,
        offset,
      });
      setProducts(res.products);
      setTotalProducts(res.totalCount);
      setLoading(false);
    }
    loadProducts();
  }, [categorySlug, selectedSub, currentPage]);

  const totalPages = Math.ceil(totalProducts / PRODUCTS_PER_PAGE) || 1;

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-8 space-y-6">
      {/* Category Header */}
      <div className="pb-4 border-b border-slate-200">
        <Link
          href="/shop/"
          className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-brand-navy mb-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to All Collections</span>
        </Link>
        <h1 className="text-xl sm:text-2xl font-bold text-brand-navy">
          {category ? category.name : "Category"}
        </h1>
        {category?.description && (
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">{category.description}</p>
        )}
      </div>

      {/* Subcategory Pills */}
      {subcategories.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => {
              setSelectedSub("");
              setCurrentPage(1);
            }}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
              !selectedSub
                ? "bg-brand-navy text-white"
                : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
            }`}
          >
            All {category?.name || "Items"}
          </button>
          {subcategories.map((s) => (
            <button
              key={s.id}
              onClick={() => {
                setSelectedSub(s.slug);
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedSub === s.slug
                  ? "bg-brand-navy text-white"
                  : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
              }`}
            >
              {s.name}
            </button>
          ))}
        </div>
      )}

      {/* Products Grid (2 columns on mobile, 4 on desktop) */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-3">
          <p className="text-slate-600 text-sm font-semibold">
            No products found in this category yet.
          </p>
          <Link
            href="/shop/"
            className="inline-block bg-brand-navy text-white text-xs font-bold py-2 px-4 rounded-lg"
          >
            Browse Other Collections
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1.5 pt-6 border-t border-slate-200">
          <button
            disabled={currentPage <= 1}
            onClick={() => handlePageChange(currentPage - 1)}
            className="p-2 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`w-8 h-8 rounded-lg text-xs font-bold ${
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
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
