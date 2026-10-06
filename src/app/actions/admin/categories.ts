"use server";

import { revalidatePath } from "next/cache";
import { ADMIN_MESSAGES, type AdminActionResult } from "@/lib/adminActionResult";
import { requireAdmin } from "@/lib/supabase/require-admin";
import { adminSupabase } from "@/lib/supabase/admin";
import type { AdminCategory, AdminSubcategory } from "@/lib/adminTypes";

/**
 * Server actions for catalog category / subcategory management (admin only).
 *
 * Every action verifies the caller on the server via `requireAdmin()` before
 * touching the database with the service-role client. Deletions are blocked
 * while products still depend on the node, so nothing is orphaned.
 */

/** Invalidate the storefront + admin surfaces that render the category tree. */
function revalidateCatalog() {
  revalidatePath("/");
  revalidatePath("/products");
  revalidatePath("/admin/categories");
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function transformCategory(data: any): AdminCategory {
  return {
    id: data.id,
    name: data.name,
    slug: data.slug,
    image: data.image ?? "",
    description: data.description ?? "",
    subcategories: data.subcategories ?? [],
    productCount: 0,
    active: data.active,
  };
}

// --- Categories ---

export async function adminSaveCategory(
  category: Partial<AdminCategory>
): Promise<AdminActionResult<AdminCategory>> {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.failure;

  try {
    const name = (category.name ?? "").trim();
    if (!name) {
      return { success: false, status: 400, error: "Category name is required." };
    }
    const slug = (category.slug ?? "").trim() || slugify(name);
    const id = (category.id ?? "").trim() || slug;
    const now = new Date().toISOString();

    const { data, error } = await adminSupabase
      .from("categories")
      .upsert(
        {
          id,
          name,
          slug,
          image: category.image ?? null,
          description: category.description ?? null,
          subcategories: category.subcategories ?? [],
          active: category.active ?? true,
          updated_at: now,
        },
        { onConflict: "id" }
      )
      .select()
      .single();

    if (error) throw error;
    revalidateCatalog();
    return { success: true, data: transformCategory(data) };
  } catch (error) {
    console.error("Error saving category:", error);
    return { success: false, status: 500, error: ADMIN_MESSAGES.failed };
  }
}

export async function adminDeleteCategory(
  id: string
): Promise<AdminActionResult<undefined>> {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.failure;

  try {
    // Refuse while products still reference the category (safe, no reassignment UI).
    const { count } = await adminSupabase
      .from("products")
      .select("id", { count: "exact", head: true })
      .eq("category_id", id);

    if ((count ?? 0) > 0) {
      return {
        success: false,
        status: 409,
        error: `Cannot delete: ${count} product(s) are assigned to this category. Reassign them first.`,
      };
    }

    const { error } = await adminSupabase.from("categories").delete().eq("id", id);
    if (error) throw error;

    revalidateCatalog();
    return { success: true, data: undefined };
  } catch (error) {
    console.error("Error deleting category:", error);
    return { success: false, status: 500, error: ADMIN_MESSAGES.failed };
  }
}

// --- Subcategories ---
//
// Subcategories are NOT a database table. They live on the existing
// `categories.subcategories text[]` column, and `products.sub_category` holds
// the chosen name. These actions simply add/remove a name from that array.

export async function adminSaveSubcategory(
  sub: Partial<AdminSubcategory>
): Promise<AdminActionResult<AdminSubcategory>> {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.failure;

  try {
    const categoryId = (sub.categoryId ?? "").trim();
    const name = (sub.name ?? "").trim();
    if (!categoryId || !name) {
      return { success: false, status: 400, error: "Category and name are required." };
    }

    const { data: category, error: readError } = await adminSupabase
      .from("categories")
      .select("id, subcategories")
      .eq("id", categoryId)
      .single();

    if (readError || !category) {
      return { success: false, status: 404, error: "Category not found." };
    }

    const list: string[] = Array.isArray(category.subcategories) ? category.subcategories : [];
    if (!list.some((n) => n.toLowerCase() === name.toLowerCase())) {
      list.push(name);
    }

    const { error } = await adminSupabase
      .from("categories")
      .update({ subcategories: list, updated_at: new Date().toISOString() })
      .eq("id", categoryId);

    if (error) throw error;
    revalidateCatalog();

    const gender = (sub.gender ?? "men") as AdminSubcategory["gender"];
    const slug = slugify(name);
    return {
      success: true,
      data: {
        id: `${categoryId}-${gender}-${slug}`,
        categoryId,
        gender,
        name,
        slug,
        sortOrder: sub.sortOrder ?? 0,
        active: true,
      },
    };
  } catch (error) {
    console.error("Error saving subcategory:", error);
    return { success: false, status: 500, error: ADMIN_MESSAGES.failed };
  }
}

export async function adminDeleteSubcategory(
  input: { categoryId: string; name: string }
): Promise<AdminActionResult<undefined>> {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.failure;

  try {
    const categoryId = (input?.categoryId ?? "").trim();
    const name = (input?.name ?? "").trim();
    if (!categoryId || !name) {
      return { success: false, status: 400, error: "Category and name are required." };
    }

    // Refuse while products still reference this subcategory in that category
    // (slug comparison, so casing/whitespace differences don't slip through).
    const target = slugify(name);
    const { data: dependents } = await adminSupabase
      .from("products")
      .select("sub_category")
      .eq("category_id", categoryId);

    const inUse = (dependents ?? []).filter(
      (p: { sub_category: string | null }) => slugify(p.sub_category ?? "") === target
    ).length;

    if (inUse > 0) {
      return {
        success: false,
        status: 409,
        error: `Cannot delete: ${inUse} product(s) use this subcategory.`,
      };
    }

    const { data: category, error: readError } = await adminSupabase
      .from("categories")
      .select("subcategories")
      .eq("id", categoryId)
      .single();

    if (readError || !category) {
      return { success: false, status: 404, error: "Category not found." };
    }

    const list: string[] = (Array.isArray(category.subcategories) ? category.subcategories : []).filter(
      (n: string) => n.toLowerCase() !== name.toLowerCase()
    );

    const { error } = await adminSupabase
      .from("categories")
      .update({ subcategories: list, updated_at: new Date().toISOString() })
      .eq("id", categoryId);

    if (error) throw error;

    revalidateCatalog();
    return { success: true, data: undefined };
  } catch (error) {
    console.error("Error deleting subcategory:", error);
    return { success: false, status: 500, error: ADMIN_MESSAGES.failed };
  }
}
