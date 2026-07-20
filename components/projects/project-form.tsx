"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Project, ProjectStatus, User } from "@/lib/types";
import type { UpdateProjectInput } from "@/lib/project-store";
import { Plus, X, Loader2 } from "lucide-react";

// ─── Shared field primitives ──────────────────────────────────────────────────

function Label({ htmlFor, children, required }: { htmlFor: string; children: React.ReactNode; required?: boolean }) {
  return (
    <label htmlFor={htmlFor} className="block text-xs font-medium text-stone-600 mb-1">
      {children}{required && <span className="ml-0.5 text-red-500">*</span>}
    </label>
  );
}

function Input({
  id, value, onChange, type = "text", placeholder, error, ...rest
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
  id, value, onChange, children, error,
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
  id, value, onChange, placeholder, rows = 3,
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      id={id}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={rows}
      className="w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-walnut-500 resize-none"
    />
  );
}

// ─── Status options ───────────────────────────────────────────────────────────

const STATUS_OPTIONS: { value: ProjectStatus; label: string }[] = [
  { value: "enquiry",       label: "Enquiry" },
  { value: "design",        label: "Design" },
  { value: "approved",      label: "Approved" },
  { value: "in_production", label: "In Production" },
  { value: "ready",         label: "Ready" },
  { value: "dispatched",    label: "Dispatched" },
  { value: "installed",     label: "Installed" },
  { value: "closed",        label: "Closed" },
];

// ─── Form component ───────────────────────────────────────────────────────────

interface ProjectFormProps {
  project: Project;
  designers: User[];
  productionManagers: User[];
}

export function ProjectForm({ project, designers, productionManagers }: ProjectFormProps) {
  const router = useRouter();

  // ── Form state
  const [customerCompanyName,  setCustomerCompanyName]  = useState(project.customer.companyName);
  const [customerContactName,  setCustomerContactName]  = useState(project.customer.contactName);
  const [customerEmail,        setCustomerEmail]        = useState(project.customer.email);
  const [customerPhone,        setCustomerPhone]        = useState(project.customer.phone ?? "");
  const [siteAddress,          setSiteAddress]          = useState(project.siteAddress);
  const [designerId,           setDesignerId]           = useState(project.designer.id);
  const [productionManagerId,  setProductionManagerId]  = useState(project.productionManager?.id ?? "");
  const [status,               setStatus]               = useState<ProjectStatus>(project.status);
  const [enquiryDate,          setEnquiryDate]          = useState(project.enquiryDate);
  const [startDate,            setStartDate]            = useState(project.startDate);
  const [deliveryDate,         setDeliveryDate]         = useState(project.deliveryDate);
  const [estimatedValue,       setEstimatedValue]       = useState(String(project.estimatedValue));
  const [internalNotes,        setInternalNotes]        = useState(project.internalNotes ?? "");
  const [rooms,                setRooms]                = useState<string[]>(project.rooms.map((r) => r.name));
  const [newRoom,              setNewRoom]              = useState("");

  const [errors,   setErrors]   = useState<Record<string, string>>({});
  const [saving,   setSaving]   = useState(false);
  const [apiError, setApiError] = useState("");

  // ── Rooms helpers
  function addRoom() {
    const name = newRoom.trim();
    if (!name) return;
    setRooms((prev) => [...prev, name]);
    setNewRoom("");
    if (errors.rooms) setErrors((e) => { const n = { ...e }; delete n.rooms; return n; });
  }

  function removeRoom(idx: number) {
    setRooms((prev) => prev.filter((_, i) => i !== idx));
  }

  // ── Submit
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setApiError("");
    setErrors({});

    const payload: UpdateProjectInput = {
      customerCompanyName,
      customerContactName,
      customerEmail,
      customerPhone,
      siteAddress,
      designerId,
      productionManagerId,
      status,
      enquiryDate,
      startDate,
      deliveryDate,
      estimatedValue: Number(estimatedValue),
      internalNotes,
      rooms,
    };

    try {
      const res = await fetch(`/api/v1/projects/${project.id}`, {
        method: "PATCH",
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

      router.push(`/projects/${project.id}`);
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

      {/* ── Customer ──────────────────────────────────────────────────────── */}
      <Card>
        <CardHeader><CardTitle>Customer</CardTitle></CardHeader>
        <CardContent className="pt-0 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="customerCompanyName" required>Company / Family Name</Label>
            <Input
              id="customerCompanyName"
              value={customerCompanyName}
              onChange={(e) => setCustomerCompanyName(e.target.value)}
              placeholder="The Morrison Family"
              error={errors.customerCompanyName}
            />
          </div>
          <div>
            <Label htmlFor="customerContactName" required>Contact Name</Label>
            <Input
              id="customerContactName"
              value={customerContactName}
              onChange={(e) => setCustomerContactName(e.target.value)}
              placeholder="James Morrison"
              error={errors.customerContactName}
            />
          </div>
          <div>
            <Label htmlFor="customerEmail" required>Email</Label>
            <Input
              id="customerEmail"
              type="email"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              placeholder="james@example.com"
              error={errors.customerEmail}
            />
          </div>
          <div>
            <Label htmlFor="customerPhone">Phone</Label>
            <Input
              id="customerPhone"
              type="tel"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              placeholder="07700 900000"
            />
          </div>
        </CardContent>
      </Card>

      {/* ── Project Details ────────────────────────────────────────────────── */}
      <Card>
        <CardHeader><CardTitle>Project Details</CardTitle></CardHeader>
        <CardContent className="pt-0 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label htmlFor="siteAddress" required>Site / Installation Address</Label>
            <Input
              id="siteAddress"
              value={siteAddress}
              onChange={(e) => setSiteAddress(e.target.value)}
              placeholder="14 Birchwood Lane, Guildford, Surrey, GU3 4PQ"
              error={errors.siteAddress}
            />
          </div>

          <div>
            <Label htmlFor="designerId" required>Lead Designer</Label>
            <Select
              id="designerId"
              value={designerId}
              onChange={(e) => setDesignerId(e.target.value)}
              error={errors.designerId}
            >
              <option value="">— Select designer —</option>
              {designers.map((u) => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </Select>
          </div>

          <div>
            <Label htmlFor="productionManagerId">Production Manager</Label>
            <Select
              id="productionManagerId"
              value={productionManagerId}
              onChange={(e) => setProductionManagerId(e.target.value)}
            >
              <option value="">— Unassigned —</option>
              {productionManagers.map((u) => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </Select>
          </div>

          <div>
            <Label htmlFor="status" required>Status</Label>
            <Select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value as ProjectStatus)}
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </Select>
          </div>

          <div>
            <Label htmlFor="estimatedValue" required>Estimated Value (£)</Label>
            <Input
              id="estimatedValue"
              type="number"
              min="0"
              step="50"
              value={estimatedValue}
              onChange={(e) => setEstimatedValue(e.target.value)}
              placeholder="0"
              error={errors.estimatedValue}
            />
          </div>

          <div>
            <Label htmlFor="enquiryDate" required>Enquiry Date</Label>
            <Input
              id="enquiryDate"
              type="date"
              value={enquiryDate}
              onChange={(e) => setEnquiryDate(e.target.value)}
              error={errors.enquiryDate}
            />
          </div>

          <div>
            <Label htmlFor="startDate" required>Production Start</Label>
            <Input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              error={errors.startDate}
            />
          </div>

          <div>
            <Label htmlFor="deliveryDate" required>Delivery Date</Label>
            <Input
              id="deliveryDate"
              type="date"
              value={deliveryDate}
              onChange={(e) => setDeliveryDate(e.target.value)}
              error={errors.deliveryDate}
            />
          </div>
        </CardContent>
      </Card>

      {/* ── Rooms ─────────────────────────────────────────────────────────── */}
      <Card>
        <CardHeader><CardTitle>Rooms</CardTitle></CardHeader>
        <CardContent className="pt-0 space-y-3">
          <div className="flex flex-wrap gap-2 min-h-[2rem]">
            {rooms.map((name, idx) => (
              <span
                key={idx}
                className="flex items-center gap-1.5 rounded-md border border-stone-200 bg-stone-50 px-3 py-1.5 text-sm font-medium text-stone-700"
              >
                {name}
                <button
                  type="button"
                  onClick={() => removeRoom(idx)}
                  className="text-stone-400 hover:text-red-500 transition-colors"
                  aria-label={`Remove ${name}`}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </span>
            ))}
            {rooms.length === 0 && (
              <p className="text-sm text-stone-400 italic">No rooms added yet.</p>
            )}
          </div>
          {errors.rooms && <p className="text-xs text-red-600">{errors.rooms}</p>}
          <div className="flex gap-2">
            <Input
              id="newRoom"
              value={newRoom}
              onChange={(e) => setNewRoom(e.target.value)}
              placeholder="e.g. Kitchen, Master Bedroom…"
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addRoom(); } }}
            />
            <Button type="button" variant="outline" size="md" onClick={addRoom} className="shrink-0">
              <Plus className="h-4 w-4" />
              Add
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ── Internal Notes ────────────────────────────────────────────────── */}
      <Card>
        <CardHeader><CardTitle>Internal Notes</CardTitle></CardHeader>
        <CardContent className="pt-0">
          <Textarea
            id="internalNotes"
            value={internalNotes}
            onChange={(e) => setInternalNotes(e.target.value)}
            placeholder="Notes visible to the team only — not shown on client documents."
            rows={4}
          />
        </CardContent>
      </Card>

      {/* ── Actions ───────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-end gap-3 pb-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push(`/projects/${project.id}`)}
          disabled={saving}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={saving}>
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          {saving ? "Saving…" : "Save Changes"}
        </Button>
      </div>

    </form>
  );
}
