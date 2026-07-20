import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import type { ProjectKpis } from "@/lib/types";
import {
  FolderOpen,
  TrendingUp,
  Hammer,
  AlertTriangle,
  BarChart2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TileProps {
  title: string;
  value: string;
  sub?: string;
  icon: React.ElementType;
  accent?: "default" | "gold" | "danger" | "success";
}

function KpiTile({ title, value, sub, icon: Icon, accent = "default" }: TileProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle>{title}</CardTitle>
          <div
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-md",
              accent === "gold"    && "bg-yellow-50 text-yellow-700",
              accent === "danger"  && "bg-red-50 text-red-600",
              accent === "success" && "bg-emerald-50 text-emerald-700",
              accent === "default" && "bg-stone-100 text-stone-600"
            )}
          >
            <Icon className="h-4 w-4" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p
          className={cn(
            "text-2xl font-semibold tracking-tight",
            accent === "gold"   && "text-yellow-800",
            accent === "danger" && "text-red-700",
            accent === "default" || accent === "success" ? "text-stone-900" : ""
          )}
        >
          {value}
        </p>
        {sub && <p className="mt-1 text-xs text-stone-500">{sub}</p>}
      </CardContent>
    </Card>
  );
}

export function KpiTiles({ kpis }: { kpis: ProjectKpis }) {
  const tiles: TileProps[] = [
    {
      title: "Active Projects",
      value: String(kpis.totalActive),
      sub: "Enquiry → Dispatched",
      icon: FolderOpen,
      accent: "default",
    },
    {
      title: "Pipeline Value",
      value: formatCurrency(kpis.pipelineValue),
      sub: "Active projects only",
      icon: TrendingUp,
      accent: "gold",
    },
    {
      title: "In Production",
      value: String(kpis.inProduction),
      sub: "On the shop floor now",
      icon: Hammer,
      accent: "default",
    },
    {
      title: "Overdue",
      value: String(kpis.overdueCount),
      sub: kpis.overdueCount === 0 ? "All on schedule" : "Past delivery date",
      icon: AlertTriangle,
      accent: kpis.overdueCount > 0 ? "danger" : "success",
    },
    {
      title: "Quote Conversion",
      value: `${kpis.quoteConversionRate}%`,
      sub: "Enquiries → Approved",
      icon: BarChart2,
      accent: "default",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
      {tiles.map((t) => (
        <KpiTile key={t.title} {...t} />
      ))}
    </div>
  );
}
