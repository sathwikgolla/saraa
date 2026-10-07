import { redirect } from "next/navigation";

const CATEGORIES = ["clothing", "footwear"];
const GENDERS = ["men", "women", "kids"];

interface Props {
  params: Promise<{ slug: string; gender: string }>;
}

/**
 * Human-friendly entry point for the gender collections, e.g.
 * `/products/clothing/men`. The storefront filtering lives on the existing
 * `/products` listing (driven by search params), so we hand off to it here.
 */
export default async function CategoryGenderPage({ params }: Props) {
  const { slug, gender } = await params;
  const cat = slug.toLowerCase();
  const gen = gender.toLowerCase();

  if (!CATEGORIES.includes(cat) || !GENDERS.includes(gen)) {
    redirect("/products");
  }

  redirect(`/products?category=${cat}&gender=${gen}`);
}
