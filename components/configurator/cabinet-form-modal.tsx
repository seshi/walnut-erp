"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import type {
  Cabinet,
  CabinetType,
  MaterialListItem,
  HardwareListItem,
} from "@/lib/types";
import { X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

// ─── Shared field primitives (mirrors project-form.tsx) ───────────────────────

function Label({
  htmlFor,
  children,
  required,
}: {
  htmlFor: string;
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="block text-xs font-medium text-stone-600 mb-1"
    >
      {children}
      {required && <span className="ml-0.5 text-red-500">*</span>}
    </label>
  );
}

function Input({
  id,
  value,
  onChange,
  type = "text",
  placeholder,
  error,
  ...rest
}: React.InputHTMLAttributes<HTMLInputElement> & { error?: string }) {
  return (
    <div>
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={cn(
          "w-full rounded-md border bg-white px-3 py-2 text-sm text-stone-900 placeholder:text-stone-400",
          "focus:outline-none focus:ring-2 focus:ring-walnut-500",
          error ? "border-red-400" : "border-stone-300"
        )}
        {...rest}
      />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

function Select({
  id,
  value,
  onChange,
  children,
  error,
}: React.SelectHTMLAttributes<HTMLSelectElement> & { error?: string }) {
  return (
    <div>
      <select
        id={id}
        value={value}
        onChange={onChange}
        className={cn(
          "w-full rounded-md border bg-white px-3 py-2 text-sm text-stone-900",
          "focus:outline-none focus:ring-2 focus:ring-walnut-500",
          error ? "border-red-400" : "border-stone-300"
        )}
      >
        {children}
      </select>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

function Textarea({
  id,
  value,
  onChange,
  placeholder,
  rows = 3,
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      id={id}
      value={value as string}
      onChange={onChange}
      placeholder={placeholder}
      rows={rows}
      className="w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-walnut-500 resize-none"
    />
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="col-span-full border-b border-stone-100 pb-1 mb-1">
      <h3 className="text-xs font-semibold uppercase tracking-widest text-stone-400">
        {children}
      </h3>
    </div>
  );
}

// ─── Type options ─────────────────────────────────────────────────────────────

const CABINET_TYPES: { value: CabinetType; label: string }[] = [
  { value: "base_cabinet", label: "Base Cabinet" },
  { value: "wall_cabinet", label: "Wall Cabinet" },
  { value: "tall_unit",    label: "Tall Unit" },
  { value: "drawer_unit",  label: "Drawer Unit" },
  { value: "open_shelf",   label: "Open Shelf" },
];

const CODE_PREFIXES: Record<CabinetType, string> = {
  base_cabinet: "BC-",
  wall_cabinet: "WC-",
  tall_unit:    "TC-",
  drawer_unit:  "DC-",
  open_shelf:   "OS-",
};

// Categories that make sense for carcass / panel materials
const CARCASS_CATEGORIES = new Set(["board", "veneer", "laminate"]);

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  projectId: string;
  rooms: { id: string; name: string }[];
  materials: MaterialListItem[];
  hardware: HardwareListItem[];
  cabinet: Cabinet | null;
  existingCabinets: Cabinet[];
  onSave: (cabinet: Cabinet) => void;
  onClose: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function CabinetFormModal({
  projectId,
  rooms,
  materials,
  hardware,
  cabinet,
  existingCabinets,
  onSave,
  onClose,
}: Props) {
  const isEdit = !!cabinet;

  // ── Identity
  const [cabinetCode,  setCabinetCode]  = useState(cabinet?.cabinetCode ?? "");
  const [description,  setDescription]  = useState(cabinet?.description ?? "");
  const [type,         setType]         = useState<CabinetType>(cabinet?.type ?? "base_cabinet");
  const [roomId,       setRoomId]       = useState(cabinet?.roomId ?? "");

  // ── Dimensions
  const [widthMm,   setWidthMm]   = useState(String(cabinet?.widthMm  ?? ""));
  const [heightMm,  setHeightMm]  = useState(String(cabinet?.heightMm ?? ""));
  const [depthMm,   setDepthMm]   = useState(String(cabinet?.depthMm  ?? ""));
  const [qty,       setQty]       = useState(String(cabinet?.qty      ?? "1"));

  // ── Door/Drawer config
  const [doorCount,    setDoorCount]    = useState(String(cabinet?.doorCount    ?? "0"));
  const [drawerCount,  setDrawerCount]  = useState(String(cabinet?.drawerCount  ?? "0"));
  const [shelfCount,   setShelfCount]   = useState(String(cabinet?.shelfCount   ?? "0"));
  const [finishSpec,   setFinishSpec]   = useState(cabinet?.finishSpec ?? "");

  // ── Materials
  const [carcassMaterialId,    setCarcassMaterialId]    = useState(cabinet?.carcassMaterialId      ?? "");
  const [backMaterialId,       setBackMaterialId]       = useState(cabinet?.backMaterialId         ?? "");
  const [doorMaterialId,       setDoorMaterialId]       = useState(cabinet?.doorMaterialId         ?? "");
  const [drawerFrontMaterialId,setDrawerFrontMaterialId]= useState(cabinet?.drawerFrontMaterialId  ?? "");

  // ── Hardware
  const [hingeHardwareId,   setHingeHardwareId]   = useState(cabinet?.hingeHardwareId  ?? "");
  const [runnerHardwareId,  setRunnerHardwareId]  = useState(cabinet?.runnerHardwareId ?? "");
  const [handleHardwareId,  setHandleHardwareId]  = useState(cabinet?.handleHardwareId ?? "");

  // ── Notes
  const [notes, setNotes] = useState(cabinet?.notes ?? "");

  // ── Form state
  const [errors,   setErrors]   = useState<Record<string, string>>({});
  const [saving,   setSaving]   = useState(false);
  const [apiError, setApiError] = useState("");

  // Auto-suggest code when type changes on new cabinets
  useEffect(() => {
    if (isEdit) return;
    const prefix = CODE_PREFIXES[type];
    const count = existingCabinets.filter((c) => c.type === type).length;
    const suggested = `${prefix}${String(count + 1).padStart(2, "0")}`;
    setCabinetCode(suggested);
  }, [type]); // eslint-disable-line react-hooks/exhaustive-deps

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  // ── Derived ───────────────────────────────────────────────────────────────────

  const carcassMaterials = materials.filter((m) => CARCASS_CATEGORIES.has(m.category));
  const allPanelMaterials = materials; // back/door/drawer fronts can be any material

  const hinges         = hardware.filter((h) => h.category === "hinges");
  const drawerRunners  = hardware.filter((h) => h.category === "drawer_runners");
  const handles        = hardware.filter((h) => h.category === "handles_knobs");

  const showDoorMaterial =
    Number(doorCount) > 0 || type === "drawer_unit";

  // ── Validation ────────────────────────────────────────────────────────────────

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!cabinetCode.trim()) e.cabinetCode = "Cabinet code is required.";
    if (!type)               e.type = "Type is required.";
    if (!widthMm || isNaN(Number(widthMm))  || Number(widthMm)  <= 0) e.widthMm  = "Enter a valid width.";
    if (!heightMm || isNaN(Number(heightMm)) || Number(heightMm) <= 0) e.heightMm = "Enter a valid height.";
    if (!depthMm || isNaN(Number(depthMm))  || Number(depthMm)  <= 0) e.depthMm  = "Enter a valid depth.";
    if (!qty || isNaN(Number(qty)) || Number(qty) < 1)                 e.qty      = "Qty must be ≥ 1.";
    if (!carcassMaterialId)  e.carcassMaterialId = "Carcass material is required.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  // ── Submit ────────────────────────────────────────────────────────────────────

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    setApiError("");

    const payload = {
      cabinetCode: cabinetCode.trim(),
      description: description.trim() || undefined,
      type,
      widthMm:      Number(widthMm),
      heightMm:     Number(heightMm),
      depthMm:      Number(depthMm),
      qty:          Number(qty),
      doorCount:    Number(doorCount)   || 0,
      drawerCount:  Number(drawerCount) || 0,
      shelfCount:   Number(shelfCount)  || 0,
      finishSpec:   finishSpec.trim() || undefined,
      notes:        notes.trim() || undefined,
      roomId:       roomId || undefined,
      carcassMaterialId,
      backMaterialId:        backMaterialId        || undefined,
      doorMaterialId:        doorMaterialId        || undefined,
      drawerFrontMaterialId: drawerFrontMaterialId || undefined,
      hingeHardwareId:       hingeHardwareId       || undefined,
      runnerHardwareId:      runnerHardwareId      || undefined,
      handleHardwareId:      handleHardwareId      || undefined,
    };

    try {
      const url = isEdit
        ? `/api/v1/projects/${projectId}/cabinets/${cabinet!.id}`
        : `/api/v1/projects/${projectId}/cabinets`;
      const method = isEdit ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (!res.ok) {
        if (json?.error?.code === "VALIDATION") {
          setErrors(json.error.fields ?? {});
        } else {
          setApiError(json?.error?.message ?? "An unexpected error occurred.");
        }
        return;
      }

      onSave(json.data as Cabinet);
    } catch {
      setApiError("Network error — please check your connection and try again.");
    } finally {
      setSaving(false);
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    /* Overlay */
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 px-4 py-8"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="relative w-full max-w-2xl rounded-xl border border-stone-200 bg-white shadow-xl">

        {/* Modal header */}
        <div className="flex items-center justify-between border-b border-stone-200 px-6 py-4">
          <div>
            <h2 className="text-base font-semibold text-stone-900">
              {isEdit ? `Edit ${cabinet!.cabinetCode}` : "Add Cabinet"}
            </h2>
            <p className="text-xs text-stone-500">
              {isEdit ? "Update cabinet configuration." : "Configure a new cabinet or joinery unit."}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-md text-stone-400 hover:bg-stone-100 hover:text-stone-700 transition-colors"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable form body */}
        <form onSubmit={handleSubmit} noValidate>
          <div className="max-h-[70vh] overflow-y-auto px-6 py-5">

            {apiError && (
              <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {apiError}
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

              {/* ── Section: Identity ─────────────────────────────────────────── */}
              <SectionTitle>Identity</SectionTitle>

              <div>
                <Label htmlFor="cabinetCode" required>Cabinet Code</Label>
                <Input
                  id="cabinetCode"
                  value={cabinetCode}
                  onChange={(e) => setCabinetCode(e.target.value)}
                  placeholder="BC-01"
                  error={errors.cabinetCode}
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Sink base unit"
                />
              </div>

              <div>
                <Label htmlFor="type" required>Type</Label>
                <Select
                  id="type"
                  value={type}
                  onChange={(e) => setType(e.target.value as CabinetType)}
                  error={errors.type}
                >
                  {CABINET_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </Select>
              </div>

              <div>
                <Label htmlFor="roomId">Room</Label>
                <Select
                  id="roomId"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                >
                  <option value="">— Unassigned —</option>
                  {rooms.map((r) => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </Select>
              </div>

              {/* ── Section: Dimensions ───────────────────────────────────────── */}
              <SectionTitle>Dimensions</SectionTitle>

              <div>
                <Label htmlFor="widthMm" required>Width (mm)</Label>
                <Input
                  id="widthMm"
                  type="number"
                  min="1"
                  step="1"
                  value={widthMm}
                  onChange={(e) => setWidthMm(e.target.value)}
                  placeholder="600"
                  error={errors.widthMm}
                />
              </div>

              <div>
                <Label htmlFor="heightMm" required>Height (mm)</Label>
                <Input
                  id="heightMm"
                  type="number"
                  min="1"
                  step="1"
                  value={heightMm}
                  onChange={(e) => setHeightMm(e.target.value)}
                  placeholder="720"
                  error={errors.heightMm}
                />
              </div>

              <div>
                <Label htmlFor="depthMm" required>Depth (mm)</Label>
                <Input
                  id="depthMm"
                  type="number"
                  min="1"
                  step="1"
                  value={depthMm}
                  onChange={(e) => setDepthMm(e.target.value)}
                  placeholder="560"
                  error={errors.depthMm}
                />
              </div>

              <div>
                <Label htmlFor="qty" required>Quantity</Label>
                <Input
                  id="qty"
                  type="number"
                  min="1"
                  step="1"
                  value={qty}
                  onChange={(e) => setQty(e.target.value)}
                  placeholder="1"
                  error={errors.qty}
                />
              </div>

              {/* ── Section: Door / Drawer Config ─────────────────────────────── */}
              <SectionTitle>Door / Drawer Config</SectionTitle>

              <div>
                <Label htmlFor="doorCount">Door Count</Label>
                <Input
                  id="doorCount"
                  type="number"
                  min="0"
                  step="1"
                  value={doorCount}
                  onChange={(e) => setDoorCount(e.target.value)}
                  placeholder="0"
                />
              </div>

              <div>
                <Label htmlFor="drawerCount">Drawer Count</Label>
                <Input
                  id="drawerCount"
                  type="number"
                  min="0"
                  step="1"
                  value={drawerCount}
                  onChange={(e) => setDrawerCount(e.target.value)}
                  placeholder="0"
                />
              </div>

              <div>
                <Label htmlFor="shelfCount">Shelf Count</Label>
                <Input
                  id="shelfCount"
                  type="number"
                  min="0"
                  step="1"
                  value={shelfCount}
                  onChange={(e) => setShelfCount(e.target.value)}
                  placeholder="1"
                />
              </div>

              <div>
                <Label htmlFor="finishSpec">Finish / Paint Spec</Label>
                <Input
                  id="finishSpec"
                  value={finishSpec}
                  onChange={(e) => setFinishSpec(e.target.value)}
                  placeholder="e.g. RAL 9010 Satin or Teak Veneer"
                />
              </div>

              {/* ── Section: Materials ────────────────────────────────────────── */}
              <SectionTitle>Materials</SectionTitle>

              <div className="sm:col-span-2">
                <Label htmlFor="carcassMaterialId" required>Carcass Material</Label>
                <Select
                  id="carcassMaterialId"
                  value={carcassMaterialId}
                  onChange={(e) => setCarcassMaterialId(e.target.value)}
                  error={errors.carcassMaterialId}
                >
                  <option value="">— Select carcass material —</option>
                  {carcassMaterials.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.code} — {m.name} ({m.thicknessMm}mm)
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <Label htmlFor="backMaterialId">Back Material</Label>
                <Select
                  id="backMaterialId"
                  value={backMaterialId}
                  onChange={(e) => setBackMaterialId(e.target.value)}
                >
                  <option value="">— None / same as carcass —</option>
                  {allPanelMaterials.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.code} — {m.name} ({m.thicknessMm}mm)
                    </option>
                  ))}
                </Select>
              </div>

              {showDoorMaterial && (
                <div>
                  <Label htmlFor="doorMaterialId">Door Material</Label>
                  <Select
                    id="doorMaterialId"
                    value={doorMaterialId}
                    onChange={(e) => setDoorMaterialId(e.target.value)}
                  >
                    <option value="">— None —</option>
                    {allPanelMaterials.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.code} — {m.name} ({m.thicknessMm}mm)
                      </option>
                    ))}
                  </Select>
                </div>
              )}

              <div>
                <Label htmlFor="drawerFrontMaterialId">Drawer Front Material</Label>
                <Select
                  id="drawerFrontMaterialId"
                  value={drawerFrontMaterialId}
                  onChange={(e) => setDrawerFrontMaterialId(e.target.value)}
                >
                  <option value="">— None —</option>
                  {allPanelMaterials.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.code} — {m.name} ({m.thicknessMm}mm)
                    </option>
                  ))}
                </Select>
              </div>

              {/* ── Section: Hardware ─────────────────────────────────────────── */}
              <SectionTitle>Hardware</SectionTitle>

              <div>
                <Label htmlFor="hingeHardwareId">Hinge</Label>
                <Select
                  id="hingeHardwareId"
                  value={hingeHardwareId}
                  onChange={(e) => setHingeHardwareId(e.target.value)}
                >
                  <option value="">— None —</option>
                  {hinges.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.code} — {h.name}
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <Label htmlFor="runnerHardwareId">Drawer Runner</Label>
                <Select
                  id="runnerHardwareId"
                  value={runnerHardwareId}
                  onChange={(e) => setRunnerHardwareId(e.target.value)}
                >
                  <option value="">— None —</option>
                  {drawerRunners.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.code} — {h.name}
                      {h.loadRating ? ` (${h.loadRating})` : ""}
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <Label htmlFor="handleHardwareId">Handle / Knob</Label>
                <Select
                  id="handleHardwareId"
                  value={handleHardwareId}
                  onChange={(e) => setHandleHardwareId(e.target.value)}
                >
                  <option value="">— None —</option>
                  {handles.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.code} — {h.name}
                      {h.finish ? ` (${h.finish})` : ""}
                    </option>
                  ))}
                </Select>
              </div>

              {/* ── Notes ─────────────────────────────────────────────────────── */}
              <div className="col-span-full">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any special requirements, CNC notes, site constraints…"
                  rows={3}
                />
              </div>

            </div>
          </div>

          {/* Modal footer */}
          <div className="flex items-center justify-end gap-3 border-t border-stone-100 px-6 py-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={saving} className="gap-2">
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {saving ? "Saving…" : isEdit ? "Save Changes" : "Add Cabinet"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
