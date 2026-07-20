"use client";

import Link from "next/link";
import { useState } from "react";
import { StatusBadge } from "./status-badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import type { ProjectListItem, ProjectStatus } from "@/lib/types";
import {
  ChevronRight,
  Search,
  SlidersHorizontal,
  AlertTriangle,
} from "lucide-react";

const STATUS_OPTIONS: { value: ProjectStatus | "all"; label: string }[] = [
  { value: "all",          label: "All" },
  { value: "enquiry",      label: "Enquiry" },
  { value: "design",       label: "Design" },
  { value: "approved",     label: "Approved" },
  { value: "in_production",label: "In Production" },
  { value: "ready",        label: "Ready" },
  { value: "dispatched",   label: "Dispatched" },
  { value: "installed",    label: "Installed" },
  { value: "closed",       label: "Closed" },
];

export function ProjectList({ projects }: { projects: ProjectListItem[] }) {
  const [search, setSearch]   = useState("");
  const [status, setStatus]   = useState<ProjectStatus | "all">("all");

  const filtered = projects.filter((p) => {
    const matchesStatus = status === "all" || p.status === status;
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      p.projectCode.toLowerCase().includes(q) ||
      p.customerName.toLowerCase().includes(q) ||
      p.siteAddress.toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            placeholder="Search projects…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-md border border-stone-300 bg-white pl-9 pr-3 py-2 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-walnut-500"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setStatus(opt.value)}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                status === opt.value
                  ? "bg-walnut-500 text-white"
                  : "bg-stone-100 text-stone-600 hover:bg-stone-200"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <div className="ml-auto text-xs text-stone-400">
          {filtered.length} project{filtered.length !== 1 ? "s" : ""}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-lg border border-stone-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-stone-200 bg-stone-50 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
              <th className="px-4 py-3 w-36">Project</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3 hidden lg:table-cell">Site</th>
              <th className="px-4 py-3 hidden sm:table-cell w-24">Rooms</th>
              <th className="px-4 py-3 w-32">Status</th>
              <th className="px-4 py-3 hidden md:table-cell w-24">Designer</th>
              <th className="px-4 py-3 hidden xl:table-cell w-28">Delivery</th>
              <th className="px-4 py-3 hidden xl:table-cell w-28 text-right">Value</th>
              <th className="px-4 py-3 w-10" />
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-12 text-center text-sm text-stone-400">
                  No projects match your filters.
                </td>
              </tr>
            ) : (
              filtered.map((p) => (
                <tr
                  key={p.id}
                  className="group hover:bg-stone-50 transition-colors"
                >
                  <td className="px-4 py-3">
                    <span className="font-mono-data font-medium text-walnut-500 text-xs tracking-tight">
                      {p.projectCode}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium text-stone-900">
                    {p.customerName}
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell text-stone-500 max-w-[200px] truncate">
                    {p.siteAddress}
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell text-stone-500 text-center">
                    {p.roomCount}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <StatusBadge status={p.status} />
                      {p.isOverdue && (
                        <AlertTriangle className="h-3.5 w-3.5 text-red-500 shrink-0" title="Overdue" />
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-stone-500">
                    {p.designerName.split(" ")[0]}
                  </td>
                  <td className="px-4 py-3 hidden xl:table-cell text-stone-500">
                    <span className={cn(p.isOverdue && "text-red-600 font-medium")}>
                      {formatDate(p.deliveryDate)}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden xl:table-cell text-right font-medium text-stone-700">
                    {formatCurrency(p.estimatedValue)}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/projects/${p.id}`}
                      className="flex h-7 w-7 items-center justify-center rounded text-stone-400 hover:bg-stone-200 hover:text-stone-700 transition-colors"
                    >
                      <ChevronRight className="h-4 w-4" />
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
