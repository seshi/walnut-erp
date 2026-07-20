"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Material, GrainDirection } from "@/lib/types";
import type { UpdateMaterialInput } from "@/lib/material-store";
import { Plus, X, Loader2 } from "lucide-react";

function Label({ htmlFor, children, required }: { htmlFor: string; children: React.ReactNode; required?: boolean }) {
  return (
    <label htmlFor={htmlFor} className="block text-xs font-medium text-stone-600 mb-1">
      {children}{required && <span className="ml-0.5 text-red-500">*</span>}
    </label>
  );
}

function Input({ id, value, onChange, type = "text", placeholder, error, ...rest }: React.InputHTMLAttributes<HTMLInputElement> & { error?: string }) {
  return (
    <div>
      <input
        id={id} type={type} value={value} onChange={onChange} placeholder={placeholder}
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

function Select({ id, value, onChange, children, error }: React.SelectHTMLAttributes<HTMLSelectElement> & { error?: string }) {
  return (
    <div>
      <select
        id={id} value={value} onChange={onChange}
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

export function MaterialForm({ material }: { material: Material }) {
  const router = useRouter();

  const [name,             setName]             = useState(material.name);
  const [supplier,         setSupplier]         = useState(material.supplier);
  const [costPerSheet,     setCostPerSheet]     = useState(String(material.costPerSheet));
  const [wastagePct,       setWastagePct]       = useState(String(material.wastagePct));
  const [grainDirection,   setGrainDirection]   = useState<GrainDirection>(material.grainDirection);
  const [edgeBandingCodes, setEdgeBandingCodes] = useState<string[]>(material.edgeBandingCodes);
  const [newEbCode,        setNewEbCode]        = useState("");
  const [minOrderQty,      setMinOrderQty]      = useState(String(material.minOrderQty));
  const [leadTimeDays,     setLeadTimeDays]     = useState(String(material.leadTimeDays));
  const [active,           setActive]           = useState(material.active);

  const [saving,   setSaving]   = useState(false);
  const [apiError, setApiError] = useState("");

  function addEbCode() {
    const code = newEbCode.trim().toUpperCase();
    if (!code || edgeBandingCodes.includes(code)) return;
    setEdgeBandingCodes((prev) => [...prev, code]);
    setNewEbCode("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setApiError("");

    const payload: UpdateMaterialInput = {
      name, supplier,
      costPerSheet: Number(costPerSheet),
      wastagePct:   Number(wastagePct),
      grainDirection,
      edgeBandingCodes,
      minOrderQty:  Number(minOrderQty),
      leadTimeDays: Number(leadTimeDays),
      active,
    };

    try {
      const res  = await fetch(`/api/v1/materials/${material.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) {
        setApiError(json?.error?.message ?? "An unexpected error occurred.");
        return;
      }
      router.push("/materials");
      router.refresh();
    } catch {
      setApiError("Network error — please check your connection and try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">

      {apiError && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {apiError}
        </div>
      )}

      {/* Read-only identity */}
      <Card>
        <CardHeader><CardTitle>Material Identity</CardTitle></CardHeader>
        <CardContent className="pt-0 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label: "Code",      value: material.code },
            { label: "Category",  value: material.category.replace("_", " ") },
            { label: "Sheet Size", value: material.sheetLengthMm > 0 ? `${material.sheetLengthMm} × ${material.sheetWidthMm} mm` : "—" },
            { label: "Thickness", value: material.thicknessMm > 0 ? `${material.thicknessMm} mm` : "—" },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-xs text-stone-400 mb-0.5">{label}</p>
              <p className="text-sm font-medium text-stone-600 capitalize">{value}</p>
            </div>
          ))}
          <p className="sm:col-span-4 text-xs text-stone-400 italic">Code, category and dimensions are fixed — contact admin to correct physical specifications.</p>
        </CardContent>
      </Card>

      {/* Editable fields */}
      <Card>
        <CardHeader><CardTitle>Details</CardTitle></CardHeader>
        <CardContent className="pt-0 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label htmlFor="name" required>Material Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Birch Plywood 18mm" />
          </div>
          <div>
            <Label htmlFor="supplier" required>Supplier</Label>
            <Input id="supplier" value={supplier} onChange={(e) => setSupplier(e.target.value)} placeholder="Greenply Industries" />
          </div>
          <div>
            <Label htmlFor="grainDirection" required>Grain Direction</Label>
            <Select id="grainDirection" value={grainDirection} onChange={(e) => setGrainDirection(e.target.value as GrainDirection)}>
              <option value="none">None</option>
              <option value="length">Length</option>
              <option value="width">Width</option>
            </Select>
          </div>
          <div>
            <Label htmlFor="costPerSheet" required>Cost per Sheet / Unit (₹)</Label>
            <Input id="costPerSheet" type="number" min="0" step="50" value={costPerSheet} onChange={(e) => setCostPerSheet(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="wastagePct" required>Wastage % </Label>
            <Input id="wastagePct" type="number" min="0" max="50" step="1" value={wastagePct} onChange={(e) => setWastagePct(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="minOrderQty" required>Min Order Qty</Label>
            <Input id="minOrderQty" type="number" min="1" step="1" value={minOrderQty} onChange={(e) => setMinOrderQty(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="leadTimeDays" required>Lead Time (days)</Label>
            <Input id="leadTimeDays" type="number" min="0" step="1" value={leadTimeDays} onChange={(e) => setLeadTimeDays(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      {/* Edge banding codes */}
      <Card>
        <CardHeader><CardTitle>Compatible Edge Banding Codes</CardTitle></CardHeader>
        <CardContent className="pt-0 space-y-3">
          <div className="flex flex-wrap gap-2 min-h-[2rem]">
            {edgeBandingCodes.map((code) => (
              <span key={code} className="flex items-center gap-1.5 rounded-md border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-700">
                {code}
                <button type="button" onClick={() => setEdgeBandingCodes((prev) => prev.filter((c) => c !== code))} className="text-amber-400 hover:text-red-500 transition-colors" aria-label={`Remove ${code}`}>
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
            {edgeBandingCodes.length === 0 && <p className="text-sm text-stone-400 italic">No codes linked.</p>}
          </div>
          <div className="flex gap-2">
            <Input id="newEbCode" value={newEbCode} onChange={(e) => setNewEbCode(e.target.value)} placeholder="e.g. EB-WHITE" onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addEbCode(); } }} />
            <Button type="button" variant="outline" size="md" onClick={addEbCode} className="shrink-0"><Plus className="h-4 w-4" /> Add</Button>
          </div>
        </CardContent>
      </Card>

      {/* Active toggle */}
      <Card>
        <CardContent className="pt-4 pb-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-stone-800">Active</p>
            <p className="text-xs text-stone-500">Inactive materials are hidden from cut list selectors and KPI totals.</p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={active}
            onClick={() => setActive((v) => !v)}
            className={cn("relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-walnut-500", active ? "bg-walnut-500" : "bg-stone-300")}
          >
            <span className={cn("pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transition-transform", active ? "translate-x-5" : "translate-x-0")} />
          </button>
        </CardContent>
      </Card>

      <div className="flex items-center justify-end gap-3 pb-4">
        <Button type="button" variant="outline" onClick={() => router.push("/materials")} disabled={saving}>Cancel</Button>
        <Button type="submit" disabled={saving}>
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          {saving ? "Saving…" : "Save Changes"}
        </Button>
      </div>

    </form>
  );
}
