"use client";

import { useState, useTransition } from "react";
import {
  Scissors,
  Layers,
  Settings,
  PuzzleIcon,
  Paintbrush,
  CheckCircle2,
  Truck,
  ChevronDown,
  ChevronUp,
  Check,
} from "lucide-react";
import type { ProductionStage, ProductionStageName, StageStatus } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

// ─── Stage config ──────────────────────────────────────────────────────────────

type StageColor = "blue" | "purple" | "orange" | "teal" | "pink" | "emerald" | "stone";

interface StageConfig {
  label: string;
  icon: React.ElementType;
  color: StageColor;
}

const STAGE_CONFIG: Record<ProductionStageName, StageConfig> = {
  cutting:       { label: "Cutting",        icon: Scissors,      color: "blue"    },
  edge_banding:  { label: "Edge Banding",   icon: Layers,        color: "purple"  },
  drilling_cnc:  { label: "Drilling / CNC", icon: Settings,      color: "orange"  },
  assembly:      { label: "Assembly",       icon: PuzzleIcon,    color: "teal"    },
  finishing:     { label: "Finishing",      icon: Paintbrush,    color: "pink"    },
  quality_check: { label: "QC",             icon: CheckCircle2,  color: "emerald" },
  dispatch:      { label: "Dispatch",       icon: Truck,         color: "stone"   },
};

// Dot + icon color classes per stage color
const COLOR_CLASSES: Record<StageColor, { dot: string; icon: string; ring: string }> = {
  blue:    { dot: "bg-blue-500",    icon: "text-blue-500",    ring: "ring-blue-200"    },
  purple:  { dot: "bg-purple-500",  icon: "text-purple-500",  ring: "ring-purple-200"  },
  orange:  { dot: "bg-orange-500",  icon: "text-orange-500",  ring: "ring-orange-200"  },
  teal:    { dot: "bg-teal-500",    icon: "text-teal-500",    ring: "ring-teal-200"    },
  pink:    { dot: "bg-pink-500",    icon: "text-pink-500",    ring: "ring-pink-200"    },
  emerald: { dot: "bg-emerald-500", icon: "text-emerald-500", ring: "ring-emerald-200" },
  stone:   { dot: "bg-stone-500",   icon: "text-stone-500",   ring: "ring-stone-200"   },
};

// ─── Status badge ──────────────────────────────────────────────────────────────

const STATUS_BADGE: Record<StageStatus, { label: string; className: string }> = {
  pending:     { label: "Pending",     className: "bg-stone-100 text-stone-600"    },
  in_progress: { label: "In Progress", className: "bg-amber-50 text-amber-700"     },
  completed:   { label: "Completed",   className: "bg-emerald-50 text-emerald-700" },
  blocked:     { label: "Blocked",     className: "bg-red-50 text-red-700"         },
};

function StageBadge({ status }: { status: StageStatus }) {
  const { label, className } = STATUS_BADGE[status];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        className,
      )}
    >
      {label}
    </span>
  );
}

// ─── Utility ───────────────────────────────────────────────────────────────────

function formatCompletedAt(iso?: string) {
  if (!iso) return null;
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
}

// ─── Main component ────────────────────────────────────────────────────────────

interface Props {
  stages: ProductionStage[];
  projectId: string;
}

export function StagePipeline({ stages: initialStages, projectId }: Props) {
  const [stages, setStages] = useState<ProductionStage[]>(initialStages);
  const [isPending, startTransition] = useTransition();

  // Track which card has the notes panel open: stage name → boolean
  const [notesOpen, setNotesOpen] = useState<Partial<Record<ProductionStageName, boolean>>>({});
  // Draft note text per stage
  const [notesDraft, setNotesDraft] = useState<Partial<Record<ProductionStageName, string>>>({});
  // Loading state per stage (for button feedback)
  const [loadingStage, setLoadingStage] = useState<ProductionStageName | null>(null);

  const completedCount = stages.filter((s) => s.status === "completed").length;
  const progressPct = Math.round((completedCount / 7) * 100);

  async function patchStage(
    stage: ProductionStageName,
    status: StageStatus,
    notes?: string,
  ) {
    // Optimistic update
    setStages((prev) =>
      prev.map((s) =>
        s.stage === stage
          ? {
              ...s,
              status,
              notes: notes !== undefined ? notes : s.notes,
              completedAt: status === "completed" ? new Date().toISOString() : s.completedAt,
              startedAt:
                status === "in_progress" && !s.startedAt
                  ? new Date().toISOString()
                  : s.startedAt,
            }
          : s,
      ),
    );

    setLoadingStage(stage);

    try {
      const res = await fetch(
        `/api/v1/projects/${projectId}/production/${stage}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status, ...(notes !== undefined && { notes }) }),
        },
      );
      if (!res.ok) throw new Error("PATCH failed");
      const { data } = (await res.json()) as { data: ProductionStage };
      // Reconcile with server response
      setStages((prev) => prev.map((s) => (s.stage === stage ? data : s)));
    } catch {
      // Revert optimistic update on error
      setStages(initialStages);
    } finally {
      setLoadingStage(null);
    }
  }

  function handleStatusAction(stage: ProductionStageName, newStatus: StageStatus) {
    startTransition(() => {
      patchStage(stage, newStatus);
    });
  }

  function handleNoteSubmit(stage: ProductionStageName, currentStatus: StageStatus) {
    const notes = notesDraft[stage] ?? "";
    startTransition(() => {
      patchStage(stage, currentStatus, notes);
    });
    // Collapse notes panel after submit
    setNotesOpen((prev) => ({ ...prev, [stage]: false }));
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Progress bar */}
      <div>
        <div className="mb-1.5 flex items-center justify-between text-sm">
          <span className="text-stone-500">
            {completedCount} of 7 stages completed
          </span>
          <span className="font-semibold text-stone-700">{progressPct}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-stone-200">
          <div
            className="h-full rounded-full bg-walnut-500 transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Stage cards */}
      <div className="flex flex-col gap-3">
        {stages.map((stage, idx) => {
          const config = STAGE_CONFIG[stage.stage];
          const colors = COLOR_CLASSES[config.color];
          const Icon = config.icon;
          const isLoading = loadingStage === stage.stage;
          const isNoteOpen = notesOpen[stage.stage] ?? false;
          const draft = notesDraft[stage.stage] ?? stage.notes ?? "";

          return (
            <Card
              key={stage.stage}
              className={cn(
                "transition-shadow",
                stage.status === "in_progress" && "ring-1 ring-amber-300 shadow-sm",
                stage.status === "blocked" && "ring-1 ring-red-300",
              )}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  {/* Left: stage number + colored dot */}
                  <div className="flex flex-col items-center gap-1.5 pt-0.5 shrink-0">
                    <div
                      className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-full ring-2",
                        colors.ring,
                        stage.status === "completed"
                          ? "bg-emerald-50"
                          : "bg-stone-50",
                      )}
                    >
                      {stage.status === "completed" ? (
                        <Check className="h-4 w-4 text-emerald-600" />
                      ) : (
                        <Icon className={cn("h-4 w-4", colors.icon)} />
                      )}
                    </div>
                    {/* Stage number */}
                    <span className="text-[10px] text-stone-400 font-mono-data">
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                  </div>

                  {/* Center: label + completedAt */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-stone-800 text-sm">
                        {config.label}
                      </span>
                      <StageBadge status={stage.status} />
                    </div>
                    {stage.status === "completed" && stage.completedAt && (
                      <p className="mt-0.5 text-xs text-stone-400">
                        Completed {formatCompletedAt(stage.completedAt)}
                      </p>
                    )}
                    {stage.status === "in_progress" && stage.startedAt && (
                      <p className="mt-0.5 text-xs text-stone-400">
                        Started {formatCompletedAt(stage.startedAt)}
                      </p>
                    )}
                    {stage.notes && !isNoteOpen && (
                      <p className="mt-1 text-xs text-stone-500 italic line-clamp-1">
                        {stage.notes}
                      </p>
                    )}

                    {/* Notes panel */}
                    {isNoteOpen && (
                      <div className="mt-2 flex flex-col gap-2">
                        <textarea
                          className="w-full resize-none rounded-md border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-walnut-500 focus:ring-offset-1"
                          rows={3}
                          placeholder="Add a note for this stage…"
                          value={draft}
                          onChange={(e) =>
                            setNotesDraft((prev) => ({
                              ...prev,
                              [stage.stage]: e.target.value,
                            }))
                          }
                        />
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs"
                            disabled={isLoading}
                            onClick={() =>
                              handleNoteSubmit(stage.stage, stage.status)
                            }
                          >
                            Save Note
                          </Button>
                          <button
                            className="text-xs text-stone-400 hover:text-stone-600"
                            onClick={() =>
                              setNotesOpen((prev) => ({
                                ...prev,
                                [stage.stage]: false,
                              }))
                            }
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right: action buttons + note toggle */}
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    {/* Status action buttons */}
                    <div className="flex flex-wrap items-center gap-1.5 justify-end">
                      {stage.status === "pending" && (
                        <Button
                          size="sm"
                          className="h-7 bg-walnut-500 text-stone-100 hover:bg-walnut-600 text-xs"
                          disabled={isLoading}
                          onClick={() =>
                            handleStatusAction(stage.stage, "in_progress")
                          }
                        >
                          Start
                        </Button>
                      )}
                      {stage.status === "in_progress" && (
                        <>
                          <Button
                            size="sm"
                            className="h-7 bg-emerald-600 text-white hover:bg-emerald-700 text-xs"
                            disabled={isLoading}
                            onClick={() =>
                              handleStatusAction(stage.stage, "completed")
                            }
                          >
                            Complete
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 border-red-200 text-red-600 hover:bg-red-50 text-xs"
                            disabled={isLoading}
                            onClick={() =>
                              handleStatusAction(stage.stage, "blocked")
                            }
                          >
                            Block
                          </Button>
                        </>
                      )}
                      {stage.status === "blocked" && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 border-amber-300 text-amber-700 hover:bg-amber-50 text-xs"
                          disabled={isLoading}
                          onClick={() =>
                            handleStatusAction(stage.stage, "in_progress")
                          }
                        >
                          Unblock
                        </Button>
                      )}
                      {stage.status === "completed" && (
                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100">
                          <Check className="h-3.5 w-3.5 text-emerald-600" />
                        </span>
                      )}
                    </div>

                    {/* Note toggle */}
                    <button
                      className="flex items-center gap-1 text-[11px] text-stone-400 hover:text-walnut-500 transition-colors"
                      onClick={() =>
                        setNotesOpen((prev) => ({
                          ...prev,
                          [stage.stage]: !prev[stage.stage],
                        }))
                      }
                    >
                      {isNoteOpen ? (
                        <>
                          <ChevronUp className="h-3 w-3" />
                          Hide note
                        </>
                      ) : (
                        <>
                          <ChevronDown className="h-3 w-3" />
                          {stage.notes ? "Edit note" : "Add note"}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
