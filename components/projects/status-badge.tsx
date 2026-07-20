import { Badge } from "@/components/ui/badge";
import type { ProjectStatus } from "@/lib/types";
import type { VariantProps } from "class-variance-authority";

const STATUS_CONFIG: Record<
  ProjectStatus,
  { label: string; variant: "default" | "warning" | "gold" | "blue" | "sky" | "purple" | "indigo" | "success" | "walnut" | "danger" | "outline" }
> = {
  enquiry:       { label: "Enquiry",      variant: "default"  },
  design:        { label: "Design",       variant: "blue"     },
  approved:      { label: "Approved",     variant: "gold"     },
  in_production: { label: "In Production",variant: "indigo"   },
  ready:         { label: "Ready",        variant: "sky"      },
  dispatched:    { label: "Dispatched",   variant: "purple"   },
  installed:     { label: "Installed",    variant: "success"  },
  closed:        { label: "Closed",       variant: "walnut"   },
};

export function StatusBadge({ status }: { status: ProjectStatus }) {
  const { label, variant } = STATUS_CONFIG[status];
  return <Badge variant={variant}>{label}</Badge>;
}

export function statusLabel(status: ProjectStatus): string {
  return STATUS_CONFIG[status]?.label ?? status;
}
