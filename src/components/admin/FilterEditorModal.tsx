"use client";

import { useState } from "react";
import { Filter, Plus, Trash2, X } from "lucide-react";
import type { CategoryFilter } from "@/lib/adminTypes";
import { useAdmin } from "@/context/AdminContext";

interface FilterEditorModalProps {
  filter: CategoryFilter | null;
  onClose: () => void;
}

export function FilterEditorModal({ filter, onClose }: FilterEditorModalProps) {
  const { categories, saveFilter } = useAdmin();

  const [name, setName] = useState(filter?.name || "");
  const [key, setKey] = useState(filter?.key || "");
  const [type, setType] = useState<"multiselect" | "range" | "single">(
    filter?.type || "multiselect"
  );
  const [targetCategories, setTargetCategories] = useState<string[]>(
    filter?.targetCategories || ["men", "women"]
  );
  const [options, setOptions] = useState<string[]>(
    filter?.options || ["Option 1", "Option 2"]
  );
  const [newOption, setNewOption] = useState("");

  const handleAddOption = () => {
    if (!newOption.trim()) return;
    if (!options.includes(newOption.trim())) {
      setOptions([...options, newOption.trim()]);
    }
    setNewOption("");
  };

  const handleRemoveOption = (val: string) => {
    setOptions(options.filter((o) => o !== val));
  };

  const toggleCategory = (catId: string) => {
    if (targetCategories.includes(catId)) {
      setTargetCategories(targetCategories.filter((c) => c !== catId));
    } else {
      setTargetCategories([...targetCategories, catId]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert("Filter name is required");
      return;
    }
    if (options.length === 0) {
      alert("Please add at least one allowed value option");
      return;
    }

    saveFilter({
      ...(filter ? { id: filter.id } : {}),
      name: name.trim(),
      key: key.trim() || name.toLowerCase().replace(/[^a-z0-9]/g, "_"),
      type,
      targetCategories,
      options,
      active: true,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 sm:p-4 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-lg rounded-2xl border border-neutral-200 bg-white shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-100 bg-neutral-50 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-black text-white shadow-xs">
              <Filter className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-black">
                {filter ? "Edit Filter Attribute" : "Filter Attribute Builder"}
              </h2>
              <p className="text-xs text-neutral-500">Dynamic Storefront Facet & Category Filtering</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-neutral-500 hover:bg-neutral-100 hover:text-black transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs overflow-y-auto">
          <div className="space-y-1">
            <label className="font-semibold text-neutral-700">Filter Display Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (!filter) {
                  setKey(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, "_"));
                }
              }}
              placeholder="e.g. Fabric Material, Sleeve Type, Heel Height"
              className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-black focus:border-black focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-neutral-700">Internal Key</label>
              <input
                type="text"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder="attribute_key"
                className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-black font-mono focus:border-black focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-neutral-700">Selection Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as "multiselect" | "range" | "single")}
                className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-black focus:border-black focus:outline-none"
              >
                <option value="multiselect">Multi-select Checkboxes</option>
                <option value="single">Single Select Radio</option>
                <option value="range">Numeric Range Slider</option>
              </select>
            </div>
          </div>

          {/* Target Categories */}
          <div className="space-y-1.5">
            <label className="font-semibold text-neutral-700">
              Target Categories (Where this filter appears)
            </label>
            <div className="flex flex-wrap gap-2 pt-1">
              {categories.map((c) => {
                const active = targetCategories.includes(c.id);
                return (
                  <button
                    type="button"
                    key={c.id}
                    onClick={() => toggleCategory(c.id)}
                    className={`rounded-md px-3 py-1.5 text-xs font-semibold border transition ${
                      active
                        ? "bg-black text-white border-black shadow-xs"
                        : "bg-white border-neutral-300 text-neutral-700 hover:border-black hover:text-black"
                    }`}
                  >
                    {active ? `✓ ${c.name}` : `+ ${c.name}`}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Filter Values / Options */}
          <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4 space-y-3">
            <label className="font-bold text-neutral-700 block">
              Allowed Values & Swatches ({options.length} options)
            </label>

            <div className="flex flex-wrap gap-2">
              {options.map((opt) => (
                <span
                  key={opt}
                  className="inline-flex items-center gap-1.5 rounded-md bg-white border border-neutral-300 px-2.5 py-1 text-xs text-black shadow-xs"
                >
                  <span>{opt}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveOption(opt)}
                    className="text-neutral-400 hover:text-red-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>

            <div className="flex gap-2 pt-1">
              <input
                type="text"
                value={newOption}
                onChange={(e) => setNewOption(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddOption();
                  }
                }}
                placeholder="Type value (e.g. 'Pure Silk') and press Add..."
                className="flex-1 rounded-md border border-neutral-300 bg-white px-3 py-2 text-black text-xs focus:border-black focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddOption}
                className="flex items-center gap-1 rounded-md bg-black px-3 py-2 font-semibold text-white hover:bg-neutral-800 transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add</span>
              </button>
            </div>
          </div>

          {/* Footer Submit */}
          <div className="flex items-center justify-end gap-2 border-t border-neutral-100 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-neutral-300 bg-white px-4 py-2 text-xs font-semibold text-black hover:bg-neutral-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-md bg-black hover:bg-neutral-800 px-5 py-2 text-xs font-semibold text-white shadow-sm transition-colors"
            >
              Save Filter Attribute
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
