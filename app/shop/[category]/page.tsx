import { Suspense } from "react";
import { getCategories } from "@/lib/db";
import CategoryProductsClient from "./CategoryProductsClient";
import { ProductCardSkeleton } from "@/components/SkeletonCard";

// Required for Next.js static export: pre-generates category routes at build time
export async function generateStaticParams() {
  const categories = await getCategories();
  if (!categories || categories.length === 0) {
    return [
      { category: "towels" },
      { category: "ehram" },
      { category: "bedding" },
      { category: "winter-collection" },
    ];
  }
  return categories.map((cat) => ({
    category: cat.slug,
  }));
}

export default function CategoryPage({ params }: { params: { category: string } }) {
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
      <CategoryProductsClient categorySlug={params.category} />
    </Suspense>
  );
}
