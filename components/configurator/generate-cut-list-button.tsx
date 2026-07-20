"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface Props {
  projectId: string;
  disabled?: boolean;
}

export function GenerateCutListButton({ projectId, disabled }: Props) {
  const router   = useRouter();
  const [busy, setBusy]     = useState(false);
  const [error, setError]   = useState("");

  async function handleGenerate() {
    setBusy(true);
    setError("");
    try {
      const res = await fetch(
        `/api/v1/projects/${projectId}/cut-list/generate`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ generatedBy: "usr_01" }),
        }
      );
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        setError(json?.error?.message ?? "Failed to generate cut list.");
        return;
      }
      router.push(`/projects/${projectId}/cut-list`);
      router.refresh();
    } catch {
      setError("Network error — please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        type="button"
        onClick={handleGenerate}
        disabled={disabled || busy}
        className="gap-2"
      >
        {busy && <Loader2 className="h-4 w-4 animate-spin" />}
        {busy ? "Generating…" : "Generate Cut List"}
      </Button>
      {error && (
        <p className="text-xs text-red-600">{error}</p>
      )}
    </div>
  );
}
