import { getProducts, getProductBySlug } from "@/lib/db";
import ProductDetailClient from "./ProductDetailClient";
import { notFound } from "next/navigation";

export async function generateStaticParams() {
  const res = await getProducts({ limit: 50 });
  if (!res.products || res.products.length === 0) {
    return [
      { slug: "premium-bath-towel-600-gsm" },
      { slug: "luxury-hand-towel-500-gsm" },
      { slug: "face-towels-ultra-soft-pack-of-4" },
      { slug: "family-luxury-towel-bundle-3-piece" },
      { slug: "hajj-and-umrah-pure-cotton-terry-ehram-2-piece" },
      { slug: "deluxe-pilgrim-combo-ehram-belt-pouch" },
    ];
  }
  return res.products.map((p) => ({
    slug: p.slug,
  }));
}

export default async function ProductDetailPage({ params }: { params: { slug: string } }) {
  const product = await getProductBySlug(params.slug);

  if (!product) {
    // Client component can handle fallback or notFound
    return <ProductDetailClient initialProduct={null} slug={params.slug} />;
  }

  return <ProductDetailClient initialProduct={product} slug={params.slug} />;
}
