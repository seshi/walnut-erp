"use client";

import { useState } from "react";
import { formatCurrency, cn } from "@/lib/utils";
import type { HardwareListItem, HardwareCategory } from "@/lib/types";
import { Search, CheckCircle2, XCircle } from "lucide-react";

const CATEGORY_OPTIONS: { value: HardwareCategory | "all"; label: string }[] = [
  { value: "all",            label: "All" },
  { value: "hinges",         label: "Hinges" },
  { value: "drawer_runners", label: "Drawer Runners" },
  { value: "handles_knobs",  label: "Handles & Knobs" },
  { value: "legs",           label: "Legs" },
  { value: "shelf_pins",     label: "Shelf Pins" },
  { value: "soft_close",     label: "Soft-Close" },
  { value: "lighting",       label: "Lighting" },
  { value: "other",          label: "Other" },
];

export function HardwareList({ items }: { items: HardwareListItem[] }) {
  const [search, setSearch]     = useState("");
  const [category, setCategory] = useState<HardwareCategory | "all">("all");

  const filtered = items.filter((h) => {
    const matchesCat = category === "all" || h.category === category;
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      h.code.toLowerCase().includes(q) ||
      h.name.toLowerCase().includes(q) ||
      h.supplier.toLowerCase().includes(q);
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            placeholder="Search hardware…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-md border border-stone-300 bg-white pl-9 pr-3 py-2 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-walnut-500"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {CATEGORY_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setCategory(opt.value)}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                category === opt.value
                  ? "bg-walnut-500 text-white"
                  : "bg-stone-100 text-stone-600 hover:bg-stone-200"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <div className="ml-auto text-xs text-stone-400">
          {filtered.length} item{filtered.length !== 1 ? "s" : ""}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-lg border border-stone-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-stone-200 bg-stone-50 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
              <th className="px-4 py-3 w-28">Code</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3 hidden sm:table-cell w-36">Category</th>
              <th className="px-4 py-3 hidden md:table-cell">Supplier</th>
              <th className="px-4 py-3 hidden lg:table-cell w-20">UOM</th>
              <th className="px-4 py-3 hidden lg:table-cell w-28">Finish</th>
              <th className="px-4 py-3 hidden xl:table-cell w-28">Load Rating</th>
              <th className="px-4 py-3 hidden xl:table-cell w-24 text-right">Unit Cost</th>
              <th className="px-4 py-3 hidden md:table-cell w-24 text-right">Reorder Qty</th>
              <th className="px-4 py-3 w-16 text-center">Active</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-4 py-12 text-center text-sm text-stone-400">
                  No hardware matches your filters.
                </td>
              </tr>
            ) : (
              filtered.map((h) => (
                <tr key={h.id} className="hover:bg-stone-50 transition-colors">
                  <td className="px-4 py-3">
                    <span className="font-mono-data text-xs font-medium text-walnut-500 tracking-tight">
                      {h.code}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium text-stone-900">{h.name}</td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span className="rounded-full bg-stone-100 px-2 py-0.5 text-xs text-stone-600">
                      {h.category.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-stone-500">{h.supplier}</td>
                  <td className="px-4 py-3 hidden lg:table-cell text-stone-500 text-xs">{h.uom}</td>
                  <td className="px-4 py-3 hidden lg:table-cell text-stone-500 text-xs">{h.finish ?? "—"}</td>
                  <td className="px-4 py-3 hidden xl:table-cell text-stone-500 text-xs">{h.loadRating ?? "—"}</td>
                  <td className="px-4 py-3 hidden xl:table-cell text-right font-medium text-stone-700">
                    {formatCurrency(h.unitCost)}
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-right text-stone-500 text-xs">
                    {h.reorderQty}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {h.active
                      ? <CheckCircle2 className="h-4 w-4 text-emerald-500 mx-auto" />
                      : <XCircle      className="h-4 w-4 text-stone-300 mx-auto" />
                    }
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
