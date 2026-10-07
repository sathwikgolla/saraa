import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProduct } from "@/data/products";
import { getProductBySlug } from "@/lib/supabase/products-server";
import { ProductDetailClient } from "@/components/product/ProductDetailClient";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = (await getProductBySlug(slug)) ?? getProduct(slug);
  if (!product) return { title: "Product not found" };
  return {
    title: product.name,
    description: product.description,
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = (await getProductBySlug(slug)) ?? getProduct(slug);
  if (!product) notFound();
  return <ProductDetailClient product={product} />;
}
