"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Hardware } from "@/lib/types";
import type { UpdateHardwareInput } from "@/lib/hardware-store";
import { Loader2 } from "lucide-react";

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

export function HardwareForm({ item }: { item: Hardware }) {
  const router = useRouter();

  const [name,          setName]          = useState(item.name);
  const [supplier,      setSupplier]      = useState(item.supplier);
  const [unitCost,      setUnitCost]      = useState(String(item.unitCost));
  const [uom,           setUom]           = useState(item.uom);
  const [finish,        setFinish]        = useState(item.finish ?? "");
  const [loadRating,    setLoadRating]    = useState(item.loadRating ?? "");
  const [minStockLevel, setMinStockLevel] = useState(String(item.minStockLevel));
  const [reorderQty,    setReorderQty]    = useState(String(item.reorderQty));
  const [active,        setActive]        = useState(item.active);

  const [saving,   setSaving]   = useState(false);
  const [apiError, setApiError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setApiError("");

    const payload: UpdateHardwareInput = {
      name, supplier,
      unitCost:      Number(unitCost),
      uom, finish, loadRating,
      minStockLevel: Number(minStockLevel),
      reorderQty:    Number(reorderQty),
      active,
    };

    try {
      const res  = await fetch(`/api/v1/hardware/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) {
        setApiError(json?.error?.message ?? "An unexpected error occurred.");
        return;
      }
      router.push("/hardware");
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
        <CardHeader><CardTitle>Hardware Identity</CardTitle></CardHeader>
        <CardContent className="pt-0 grid grid-cols-2 gap-4 sm:grid-cols-3">
          {[
            { label: "Code",     value: item.code },
            { label: "Category", value: item.category.replace(/_/g, " ") },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-xs text-stone-400 mb-0.5">{label}</p>
              <p className="text-sm font-medium text-stone-600 capitalize">{value}</p>
            </div>
          ))}
          <p className="sm:col-span-3 text-xs text-stone-400 italic">Code and category are fixed — contact admin to reclassify.</p>
        </CardContent>
      </Card>

      {/* Editable fields */}
      <Card>
        <CardHeader><CardTitle>Details</CardTitle></CardHeader>
        <CardContent className="pt-0 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label htmlFor="name" required>Item Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Blum 110° Clip-Top Hinge" />
          </div>
          <div>
            <Label htmlFor="supplier" required>Supplier</Label>
            <Input id="supplier" value={supplier} onChange={(e) => setSupplier(e.target.value)} placeholder="Häfele India" />
          </div>
          <div>
            <Label htmlFor="uom" required>Unit of Measure</Label>
            <Input id="uom" value={uom} onChange={(e) => setUom(e.target.value)} placeholder="pair / each / pack / m" />
          </div>
          <div>
            <Label htmlFor="unitCost" required>Unit Cost (₹)</Label>
            <Input id="unitCost" type="number" min="0" step="5" value={unitCost} onChange={(e) => setUnitCost(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="finish">Finish</Label>
            <Input id="finish" value={finish} onChange={(e) => setFinish(e.target.value)} placeholder="Nickel, Matt Black…" />
          </div>
          <div>
            <Label htmlFor="loadRating">Load Rating</Label>
            <Input id="loadRating" value={loadRating} onChange={(e) => setLoadRating(e.target.value)} placeholder="30kg" />
          </div>
          <div>
            <Label htmlFor="minStockLevel" required>Min Stock Level</Label>
            <Input id="minStockLevel" type="number" min="0" step="1" value={minStockLevel} onChange={(e) => setMinStockLevel(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="reorderQty" required>Reorder Qty</Label>
            <Input id="reorderQty" type="number" min="1" step="1" value={reorderQty} onChange={(e) => setReorderQty(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      {/* Active toggle */}
      <Card>
        <CardContent className="pt-4 pb-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-stone-800">Active</p>
            <p className="text-xs text-stone-500">Inactive items are hidden from production selectors.</p>
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
        <Button type="button" variant="outline" onClick={() => router.push("/hardware")} disabled={saving}>Cancel</Button>
        <Button type="submit" disabled={saving}>
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          {saving ? "Saving…" : "Save Changes"}
        </Button>
      </div>

    </form>
  );
}
