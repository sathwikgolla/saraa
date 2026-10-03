"use client";

import { useState } from "react";
import {
  Edit2,
  Filter,
  Layers,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { useAdmin } from "@/context/AdminContext";
import type { AdminCategory, CategoryFilter } from "@/lib/adminTypes";
import { FilterEditorModal } from "@/components/admin/FilterEditorModal";
import { handleImageError } from "@/lib/utils";

export default function AdminCategoriesPage() {
  const {
    categories,
    filters,
    saveCategory,
    deleteCategory,
    deleteFilter,
  } = useAdmin();

  const [editingFilter, setEditingFilter] = useState<CategoryFilter | null>(null);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  // Category form state
  const [editingCat, setEditingCat] = useState<AdminCategory | null>(null);
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [catName, setCatName] = useState("");
  const [catSlug, setCatSlug] = useState("");
  const [catImage, setCatImage] = useState("");
  const [catDesc, setCatDesc] = useState("");
  const [catSubcats, setCatSubcats] = useState("");

  const handleOpenCatModal = (cat?: AdminCategory) => {
    if (cat) {
      setEditingCat(cat);
      setCatName(cat.name);
      setCatSlug(cat.slug);
      setCatImage(cat.image);
      setCatDesc(cat.description);
      setCatSubcats(cat.subcategories.join(", "));
    } else {
      setEditingCat(null);
      setCatName("");
      setCatSlug("");
      setCatImage("https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=600&q=80");
      setCatDesc("");
      setCatSubcats("");
    }
    setIsCatModalOpen(true);
  };

  const handleSaveCat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) return;

    saveCategory({
      ...(editingCat ? { id: editingCat.id } : {}),
      name: catName.trim(),
      slug: catSlug.trim() || catName.toLowerCase().replace(/[^a-z0-9]/g, "-"),
      image: catImage.trim(),
      description: catDesc.trim(),
      subcategories: catSubcats
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    });

    setIsCatModalOpen(false);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black text-white shadow-sm">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-black">
                Categories & Filter Attributes
              </h1>
              <p className="text-xs text-neutral-500">
                Full catalog hierarchy and storefront filter rules builder
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => handleOpenCatModal()}
            className="flex items-center gap-1.5 rounded-lg border border-neutral-300 bg-white px-3.5 py-2 text-xs font-semibold text-black hover:bg-neutral-100 transition shadow-sm"
          >
            <Plus className="h-4 w-4" />
            <span>Add Category</span>
          </button>
          <button
            onClick={() => {
              setEditingFilter(null);
              setIsFilterModalOpen(true);
            }}
            className="flex items-center gap-1.5 rounded-lg bg-black px-3.5 py-2 text-xs font-semibold text-white hover:bg-neutral-800 transition shadow-sm"
          >
            <Filter className="h-4 w-4" />
            <span>Create Filter Attribute</span>
          </button>
        </div>
      </div>

      {/* Section 1: Categories Cards Grid */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-black uppercase tracking-wider">
          Store Categories ({categories.length})
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {categories.map((c) => (
            <div
              key={c.id}
              className="rounded-xl border border-neutral-200 bg-white overflow-hidden shadow-sm group hover:border-neutral-400 transition flex flex-col justify-between"
            >
              <div className="h-32 relative bg-neutral-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={c.image}
                  alt={c.name}
                  onError={handleImageError}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-2 left-3">
                  <h3 className="text-base font-bold text-white">{c.name}</h3>
                  <span className="text-[10px] text-neutral-300 font-mono">/{c.slug}</span>
                </div>
              </div>

              <div className="p-4 space-y-3 flex-1 flex flex-col justify-between text-xs">
                <div>
                  <p className="text-neutral-500 text-[11px] line-clamp-2">{c.description}</p>

                  <div className="mt-2.5 space-y-1">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
                      Sub-categories:
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {c.subcategories.map((sc, i) => (
                        <span
                          key={i}
                          className="rounded bg-neutral-100 px-1.5 py-0.5 text-[10px] text-neutral-700 font-medium"
                        >
                          {sc}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-neutral-100 flex items-center justify-between text-xs">
                  <button
                    onClick={() => handleOpenCatModal(c)}
                    className="text-black font-semibold hover:underline"
                  >
                    Edit Category
                  </button>
                  {categories.length > 1 && (
                    <button
                      onClick={() => {
                        if (confirm(`Delete category '${c.name}'?`)) {
                          deleteCategory(c.id);
                        }
                      }}
                      className="text-neutral-400 hover:text-rose-600 transition"
                      title="Delete category"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section 2: No-Code Filter Attributes */}
      <div className="space-y-4">
        <div>
          <h2 className="text-sm font-bold text-black uppercase tracking-wider">
            Dynamic Storefront Filters
          </h2>
          <p className="text-xs text-neutral-500">
            Create or edit filters and allowed values with no code. Saved filters appear dynamically on the storefront.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filters.map((f) => (
            <div
              key={f.id}
              className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm space-y-3 flex flex-col justify-between hover:border-neutral-300 transition"
            >
              <div>
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-bold text-black text-sm">{f.name}</span>
                    <p className="font-mono text-[10px] text-neutral-400">Key: {f.key}</p>
                  </div>
                  <span className="rounded bg-neutral-100 px-2 py-0.5 text-[10px] font-mono text-neutral-700 font-semibold capitalize">
                    {f.type}
                  </span>
                </div>

                <div className="mt-2 text-[11px] text-neutral-500">
                  <span>Categories: </span>
                  <span className="font-semibold text-black capitalize">
                    {f.targetCategories.join(", ")}
                  </span>
                </div>

                <div className="mt-3">
                  <p className="text-[10px] uppercase font-semibold text-neutral-400 mb-1">
                    Allowed Values ({f.options.length}):
                  </p>
                  <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto">
                    {f.options.map((opt, i) => (
                      <span
                        key={i}
                        className="rounded bg-neutral-50 border border-neutral-200 px-2 py-0.5 text-[11px] text-neutral-700 font-medium"
                      >
                        {opt}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-neutral-100 flex justify-between items-center text-xs">
                <button
                  onClick={() => {
                    setEditingFilter(f);
                    setIsFilterModalOpen(true);
                  }}
                  className="text-black font-semibold hover:underline"
                >
                  Edit Options & Rule
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Delete filter attribute '${f.name}'?`)) {
                      deleteFilter(f.id);
                    }
                  }}
                  className="text-neutral-400 hover:text-rose-600 transition p-1"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Category Create/Edit Modal */}
      {isCatModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 sm:p-4 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md rounded-2xl border border-neutral-200 bg-white shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-neutral-200 bg-neutral-50 px-6 py-4">
              <h2 className="text-base font-bold text-black">
                {editingCat ? "Edit Category" : "Add Store Category"}
              </h2>
              <button
                onClick={() => setIsCatModalOpen(false)}
                className="rounded-lg p-1.5 text-neutral-500 hover:bg-neutral-200 hover:text-black transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCat} className="p-6 space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-neutral-700">Category Name *</label>
                <input
                  type="text"
                  required
                  value={catName}
                  onChange={(e) => {
                    setCatName(e.target.value);
                    if (!editingCat) {
                      setCatSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, "-"));
                    }
                  }}
                  placeholder="e.g. Women, Footwear, Accessories"
                  className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-black placeholder-neutral-400 focus:border-black focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-neutral-700">URL Slug</label>
                <input
                  type="text"
                  value={catSlug}
                  onChange={(e) => setCatSlug(e.target.value)}
                  className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-black font-mono focus:border-black focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-neutral-700">Banner / Tile Image URL</label>
                <input
                  type="url"
                  value={catImage}
                  onChange={(e) => setCatImage(e.target.value)}
                  placeholder="https://..."
                  className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-black placeholder-neutral-400 focus:border-black focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-neutral-700">Description</label>
                <textarea
                  rows={2}
                  value={catDesc}
                  onChange={(e) => setCatDesc(e.target.value)}
                  placeholder="Brief tagline for category..."
                  className="w-full rounded-lg border border-neutral-300 bg-white p-2.5 text-black placeholder-neutral-400 focus:border-black focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-neutral-700">
                  Sub-categories (comma separated)
                </label>
                <input
                  type="text"
                  value={catSubcats}
                  onChange={(e) => setCatSubcats(e.target.value)}
                  placeholder="e.g. Kurtas, Sarees, Dresses, Loungewear"
                  className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-black placeholder-neutral-400 focus:border-black focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-neutral-200 pt-4">
                <button
                  type="button"
                  onClick={() => setIsCatModalOpen(false)}
                  className="rounded-lg px-4 py-2 text-xs font-semibold text-neutral-600 hover:text-black transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-black hover:bg-neutral-800 px-5 py-2 text-xs font-semibold text-white transition shadow-sm"
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Filter Editor Modal */}
      {isFilterModalOpen && (
        <FilterEditorModal
          filter={editingFilter}
          onClose={() => {
            setEditingFilter(null);
            setIsFilterModalOpen(false);
          }}
        />
      )}
    </div>
  );
}
