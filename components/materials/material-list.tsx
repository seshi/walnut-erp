"use client";

import { useState } from "react";
import Link from "next/link";
import { formatCurrency, cn } from "@/lib/utils";
import type { MaterialListItem, MaterialCategory } from "@/lib/types";
import { Search, CheckCircle2, XCircle, Pencil } from "lucide-react";

const CATEGORY_OPTIONS: { value: MaterialCategory | "all"; label: string }[] = [
  { value: "all",          label: "All" },
  { value: "board",        label: "Board" },
  { value: "veneer",       label: "Veneer" },
  { value: "solid_timber", label: "Solid Timber" },
  { value: "laminate",     label: "Laminate" },
  { value: "glass",        label: "Glass" },
  { value: "edge_banding", label: "Edge Banding" },
];

const GRAIN_LABELS: Record<string, string> = {
  none: "—",
  length: "Length",
  width: "Width",
};

export function MaterialList({ materials }: { materials: MaterialListItem[] }) {
  const [search, setSearch]     = useState("");
  const [category, setCategory] = useState<MaterialCategory | "all">("all");

  const filtered = materials.filter((m) => {
    const matchesCat = category === "all" || m.category === category;
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      m.code.toLowerCase().includes(q) ||
      m.name.toLowerCase().includes(q) ||
      m.supplier.toLowerCase().includes(q);
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
            placeholder="Search materials…"
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
              <th className="px-4 py-3 hidden sm:table-cell w-28">Category</th>
              <th className="px-4 py-3 hidden md:table-cell">Supplier</th>
              <th className="px-4 py-3 hidden lg:table-cell w-40">Sheet Size</th>
              <th className="px-4 py-3 hidden xl:table-cell w-20 text-right">Thickness</th>
              <th className="px-4 py-3 hidden xl:table-cell w-24 text-right">Cost/Sheet</th>
              <th className="px-4 py-3 hidden lg:table-cell w-20">Grain</th>
              <th className="px-4 py-3 hidden md:table-cell w-20 text-center">Lead</th>
              <th className="px-4 py-3 w-16 text-center">Active</th>
              <th className="px-4 py-3 w-10" />
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-4 py-12 text-center text-sm text-stone-400">
                  No materials match your filters.
                </td>
              </tr>
            ) : (
              filtered.map((m) => (
                <tr key={m.id} className="hover:bg-stone-50 transition-colors">
                  <td className="px-4 py-3">
                    <span className="font-mono-data text-xs font-medium text-walnut-500 tracking-tight">
                      {m.code}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium text-stone-900">{m.name}</td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span className="rounded-full bg-stone-100 px-2 py-0.5 text-xs text-stone-600 capitalize">
                      {m.category.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-stone-500">{m.supplier}</td>
                  <td className="px-4 py-3 hidden lg:table-cell text-stone-500 text-xs">
                    {m.sheetLengthMm > 0 ? `${m.sheetLengthMm} × ${m.sheetWidthMm} mm` : "—"}
                  </td>
                  <td className="px-4 py-3 hidden xl:table-cell text-stone-500 text-right text-xs">
                    {m.thicknessMm > 0 ? `${m.thicknessMm} mm` : "—"}
                  </td>
                  <td className="px-4 py-3 hidden xl:table-cell text-right font-medium text-stone-700">
                    {formatCurrency(m.costPerSheet)}
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell text-stone-500 text-xs">
                    {GRAIN_LABELS[m.grainDirection] ?? "—"}
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-center text-xs text-stone-500">
                    {m.leadTimeDays}d
                  </td>
                  <td className="px-4 py-3 text-center">
                    {m.active
                      ? <CheckCircle2 className="h-4 w-4 text-emerald-500 mx-auto" />
                      : <XCircle      className="h-4 w-4 text-stone-300 mx-auto" />
                    }
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/materials/${m.id}/edit`}
                      className="flex h-7 w-7 items-center justify-center rounded text-stone-400 hover:bg-stone-200 hover:text-stone-700 transition-colors"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Link>
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
