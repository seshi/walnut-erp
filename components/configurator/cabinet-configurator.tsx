"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { Cabinet, MaterialListItem, HardwareListItem } from "@/lib/types";
import { CabinetFormModal } from "./cabinet-form-modal";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Pencil,
  Trash2,
  Layers,
  Loader2,
  AlertCircle,
} from "lucide-react";

// ─── Types ─────────────────────────────────────────────────────────────────────

interface Props {
  projectId: string;
  projectCode: string;
  rooms: { id: string; name: string }[];
  cabinets: Cabinet[];
  materials: MaterialListItem[];
  hardware: HardwareListItem[];
}

// ─── Constants ─────────────────────────────────────────────────────────────────

const CABINET_TYPE_LABELS: Record<Cabinet["type"], string> = {
  base_cabinet: "Base",
  wall_cabinet: "Wall",
  tall_unit:    "Tall",
  drawer_unit:  "Drawer",
  open_shelf:   "Open Shelf",
};

const TYPE_BADGE_COLOURS: Record<Cabinet["type"], string> = {
  base_cabinet: "bg-amber-100 text-amber-700",
  wall_cabinet: "bg-sky-100 text-sky-700",
  tall_unit:    "bg-violet-100 text-violet-700",
  drawer_unit:  "bg-teal-100 text-teal-700",
  open_shelf:   "bg-stone-100 text-stone-600",
};

// ─── Component ─────────────────────────────────────────────────────────────────

export function CabinetConfigurator({
  projectId,
  projectCode,
  rooms,
  cabinets: initialCabinets,
  materials,
  hardware,
}: Props) {
  const [cabinets, setCabinets]             = useState<Cabinet[]>(initialCabinets);
  const [showForm, setShowForm]             = useState(false);
  const [editingCabinet, setEditingCabinet] = useState<Cabinet | null>(null);
  const [saving, setSaving]                 = useState(false);
  const [error, setError]                   = useState("");
  const [deletingId, setDeletingId]         = useState<string | null>(null);

  // ── Helpers ──────────────────────────────────────────────────────────────────

  function openAdd() {
    setEditingCabinet(null);
    setShowForm(true);
  }

  function openEdit(cabinet: Cabinet) {
    setEditingCabinet(cabinet);
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingCabinet(null);
  }

  function handleSaved(cabinet: Cabinet) {
    setCabinets((prev) => {
      const idx = prev.findIndex((c) => c.id === cabinet.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = cabinet;
        return next;
      }
      return [...prev, cabinet];
    });
    closeForm();
  }

  async function handleDelete(cabinet: Cabinet) {
    if (!confirm(`Delete cabinet ${cabinet.cabinetCode}? This cannot be undone.`)) return;
    setDeletingId(cabinet.id);
    setError("");
    try {
      const res = await fetch(
        `/api/v1/projects/${projectId}/cabinets/${cabinet.id}`,
        { method: "DELETE" }
      );
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        setError(json?.error?.message ?? "Failed to delete cabinet.");
        return;
      }
      setCabinets((prev) => prev.filter((c) => c.id !== cabinet.id));
    } catch {
      setError("Network error — please try again.");
    } finally {
      setDeletingId(null);
    }
  }

  // ── Group by room ─────────────────────────────────────────────────────────────

  // Build ordered room groups: rooms in project order first, then "Unassigned"
  const roomOrder = rooms.map((r) => r.id);
  const grouped: Array<{ roomId: string | null; roomName: string; cabinets: Cabinet[] }> = [];

  for (const room of rooms) {
    const items = cabinets.filter((c) => c.roomId === room.id);
    if (items.length > 0) grouped.push({ roomId: room.id, roomName: room.name, cabinets: items });
  }
  const unassigned = cabinets.filter((c) => !c.roomId || !roomOrder.includes(c.roomId));
  if (unassigned.length > 0) grouped.push({ roomId: null, roomName: "Unassigned", cabinets: unassigned });

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <>
      {error && (
        <div className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {cabinets.length === 0 ? (
        /* ── Empty state ─────────────────────────────────────────────────────── */
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-stone-200 bg-stone-50 py-20 text-center">
          <Layers className="mb-4 h-12 w-12 text-stone-300" />
          <h3 className="text-base font-semibold text-stone-600">No cabinets yet</h3>
          <p className="mt-1 max-w-xs text-sm text-stone-400">
            Start configuring{" "}
            <span className="font-mono-data font-medium text-walnut-500">{projectCode}</span>{" "}
            by adding your first cabinet or joinery unit.
          </p>
          <Button className="mt-6 gap-2" onClick={openAdd}>
            <Plus className="h-4 w-4" />
            Add First Cabinet
          </Button>
        </div>
      ) : (
        /* ── Cabinet table ───────────────────────────────────────────────────── */
        <div className="space-y-5">
          {/* Toolbar */}
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-stone-500">
              {cabinets.length} cabinet{cabinets.length !== 1 ? "s" : ""} &mdash;{" "}
              {cabinets.reduce((s, c) => s + c.qty, 0)} total units
            </p>
            <Button size="sm" onClick={openAdd} className="gap-1.5">
              <Plus className="h-4 w-4" />
              Add Cabinet
            </Button>
          </div>

          {/* Groups */}
          {grouped.map((group) => (
            <div key={group.roomId ?? "__unassigned"} className="space-y-1">
              {/* Room header */}
              <div className="flex items-center gap-2 px-1">
                <span className="text-xs font-semibold uppercase tracking-widest text-stone-400">
                  {group.roomName}
                </span>
                <span className="rounded-full bg-stone-100 px-1.5 py-0.5 text-[10px] text-stone-500">
                  {group.cabinets.length}
                </span>
              </div>

              {/* Table */}
              <div className="overflow-hidden rounded-lg border border-stone-200 bg-white">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-stone-200 bg-stone-50 text-left text-xs font-medium uppercase tracking-wider text-stone-500">
                      <th className="px-4 py-2.5 w-28">Code</th>
                      <th className="px-4 py-2.5 w-24">Type</th>
                      <th className="px-4 py-2.5 hidden sm:table-cell">Dimensions (W×H×D mm)</th>
                      <th className="px-4 py-2.5 w-12 text-center">Qty</th>
                      <th className="px-4 py-2.5 hidden md:table-cell">Carcass Material</th>
                      <th className="px-4 py-2.5 hidden lg:table-cell w-24 text-center">Doors / Drawers</th>
                      <th className="px-4 py-2.5 hidden xl:table-cell">Finish</th>
                      <th className="px-4 py-2.5 w-20 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {group.cabinets.map((cabinet) => (
                      <tr
                        key={cabinet.id}
                        className="group transition-colors hover:bg-stone-50"
                      >
                        {/* Code */}
                        <td className="px-4 py-3">
                          <div>
                            <span className="font-mono-data text-xs font-semibold tracking-tight text-walnut-600">
                              {cabinet.cabinetCode}
                            </span>
                            {cabinet.description && (
                              <p className="mt-0.5 text-[10px] text-stone-400 truncate max-w-[100px]">
                                {cabinet.description}
                              </p>
                            )}
                          </div>
                        </td>

                        {/* Type */}
                        <td className="px-4 py-3">
                          <span
                            className={cn(
                              "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium",
                              TYPE_BADGE_COLOURS[cabinet.type]
                            )}
                          >
                            {CABINET_TYPE_LABELS[cabinet.type]}
                          </span>
                        </td>

                        {/* Dimensions */}
                        <td className="hidden px-4 py-3 sm:table-cell">
                          <span className="font-mono-data text-xs text-stone-600">
                            {cabinet.widthMm} × {cabinet.heightMm} × {cabinet.depthMm}
                          </span>
                        </td>

                        {/* Qty */}
                        <td className="px-4 py-3 text-center">
                          <span className="text-sm font-medium text-stone-700">{cabinet.qty}</span>
                        </td>

                        {/* Carcass */}
                        <td className="hidden px-4 py-3 md:table-cell">
                          <div className="flex flex-col">
                            <span className="font-mono-data text-[10px] text-stone-500">
                              {cabinet.carcassMaterialCode}
                            </span>
                            <span className="text-xs text-stone-600 truncate max-w-[180px]">
                              {cabinet.carcassMaterialName}
                            </span>
                          </div>
                        </td>

                        {/* Doors / Drawers */}
                        <td className="hidden px-4 py-3 lg:table-cell text-center">
                          <span className="text-xs text-stone-600">
                            {cabinet.doorCount}D / {cabinet.drawerCount}Dr
                          </span>
                        </td>

                        {/* Finish */}
                        <td className="hidden px-4 py-3 xl:table-cell">
                          <span className="text-xs text-stone-500">
                            {cabinet.finishSpec ?? <span className="italic text-stone-300">—</span>}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => openEdit(cabinet)}
                              aria-label={`Edit ${cabinet.cabinetCode}`}
                              className="flex h-7 w-7 items-center justify-center rounded text-stone-400 hover:bg-stone-100 hover:text-stone-700 transition-colors"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(cabinet)}
                              disabled={deletingId === cabinet.id}
                              aria-label={`Delete ${cabinet.cabinetCode}`}
                              className="flex h-7 w-7 items-center justify-center rounded text-stone-400 hover:bg-red-50 hover:text-red-600 transition-colors disabled:opacity-40"
                            >
                              {deletingId === cabinet.id ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <Trash2 className="h-3.5 w-3.5" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form modal */}
      {showForm && (
        <CabinetFormModal
          projectId={projectId}
          rooms={rooms}
          materials={materials}
          hardware={hardware}
          cabinet={editingCabinet}
          existingCabinets={cabinets}
          onSave={handleSaved}
          onClose={closeForm}
        />
      )}
    </>
  );
}
