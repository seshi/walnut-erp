import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn, formatCurrency } from "@/lib/utils";
import type { MaterialKpis, MaterialCategory } from "@/lib/types";
import { Package, Layers, XCircle, Tag } from "lucide-react";

const CATEGORY_LABELS: Record<MaterialCategory, string> = {
  board:        "Board",
  veneer:       "Veneer",
  solid_timber: "Solid Timber",
  laminate:     "Laminate",
  glass:        "Glass",
  edge_banding: "Edge Banding",
};

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
          <div className={cn(
            "flex h-8 w-8 items-center justify-center rounded-md",
            accent === "gold"    && "bg-yellow-50 text-yellow-700",
            accent === "danger"  && "bg-red-50 text-red-600",
            accent === "success" && "bg-emerald-50 text-emerald-700",
            accent === "default" && "bg-stone-100 text-stone-600",
          )}>
            <Icon className="h-4 w-4" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className={cn(
          "text-2xl font-semibold tracking-tight",
          accent === "gold"    && "text-yellow-800",
          accent === "danger"  && "text-red-700",
          (accent === "default" || accent === "success") && "text-stone-900",
        )}>{value}</p>
        {sub && <p className="mt-1 text-xs text-stone-500">{sub}</p>}
      </CardContent>
    </Card>
  );
}

export function MaterialKpiTiles({ kpis }: { kpis: MaterialKpis }) {
  const topCategory = Object.entries(kpis.byCategory).sort(([, a], [, b]) => b - a)[0];

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      <KpiTile title="Total Materials"  value={String(kpis.total)}  sub="All records"           icon={Package} accent="default" />
      <KpiTile title="Active"           value={String(kpis.active)} sub="In current use"        icon={Layers}  accent="success" />
      <KpiTile title="Discontinued"     value={String(kpis.discontinued)} sub="Inactive / end-of-life" icon={XCircle} accent={kpis.discontinued > 0 ? "danger" : "default"} />
      <KpiTile title="Avg Cost / Sheet" value={formatCurrency(kpis.avgCostPerSheet)} sub={topCategory ? `Top category: ${CATEGORY_LABELS[topCategory[0] as MaterialCategory]}` : undefined} icon={Tag} accent="gold" />
    </div>
  );
}
