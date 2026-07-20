import type { CutListVersion, CutListSummary } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Layers, Package, LayoutGrid, CheckCircle2 } from "lucide-react";

const STATUS_STYLE: Record<string, string> = {
  approved:   "bg-emerald-50 text-emerald-700 border-emerald-200",
  draft:      "bg-yellow-50 text-yellow-700 border-yellow-200",
  superseded: "bg-stone-100 text-stone-500 border-stone-200",
};

const GRAIN_LABEL: Record<string, string> = {
  none: "—", length: "→ Length", width: "↓ Width",
};

function SummaryTile({ label, value, icon: Icon }: { label: string; value: string; icon: React.ElementType }) {
  return (
    <Card>
      <CardContent className="pt-4 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-stone-100 text-stone-600 shrink-0">
            <Icon className="h-4 w-4" />
          </div>
          <div>
            <p className="text-xs text-stone-500">{label}</p>
            <p className="text-lg font-semibold text-stone-900">{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function CutListViewer({ version, summary }: { version: CutListVersion; summary: CutListSummary }) {
  const cabinetGroups = version.items.reduce<Record<string, typeof version.items>>((acc, item) => {
    const key = item.cabinetRef ?? "Uncategorised";
    acc[key] = acc[key] ?? [];
    acc[key].push(item);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Header meta */}
      <div className="flex flex-wrap items-center gap-3 text-sm text-stone-500">
        <span className="font-medium text-stone-700">Version {version.versionNo}</span>
        <span className={cn("rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize", STATUS_STYLE[version.status])}>
          {version.status}
        </span>
        <span>Generated {new Date(version.generatedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })} by {version.generatorName}</span>
      </div>

      {/* Summary tiles */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <SummaryTile label="Total Parts"       value={String(summary.totalParts)}      icon={Layers} />
        <SummaryTile label="Total Qty"         value={String(summary.totalQty)}         icon={CheckCircle2} />
        <SummaryTile label="Unique Materials"  value={String(summary.uniqueMaterials)}  icon={Package} />
        <SummaryTile label="Est. Sheets"       value={String(summary.estimatedSheets)}  icon={LayoutGrid} />
      </div>

      {/* Parts table grouped by cabinet */}
      {Object.entries(cabinetGroups).map(([cabinet, items]) => (
        <div key={cabinet} className="space-y-1">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-400 px-1">
            {cabinet}
          </h3>
          <div className="overflow-hidden rounded-lg border border-stone-200 bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-200 bg-stone-50 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                  <th className="px-4 py-2.5 w-48">Part Code</th>
                  <th className="px-4 py-2.5">Description</th>
                  <th className="px-4 py-2.5 hidden sm:table-cell w-16 text-right">L (mm)</th>
                  <th className="px-4 py-2.5 hidden sm:table-cell w-16 text-right">W (mm)</th>
                  <th className="px-4 py-2.5 hidden md:table-cell w-16 text-right">T (mm)</th>
                  <th className="px-4 py-2.5 w-12 text-right">Qty</th>
                  <th className="px-4 py-2.5 hidden md:table-cell">Material</th>
                  <th className="px-4 py-2.5 hidden lg:table-cell w-20">Grain</th>
                  <th className="px-4 py-2.5 hidden lg:table-cell w-16">Edge</th>
                  <th className="px-4 py-2.5 hidden xl:table-cell">Finish</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-stone-50 transition-colors">
                    <td className="px-4 py-2.5">
                      <span className="font-mono-data text-[11px] text-walnut-500 tracking-tight">
                        {item.partCode}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-stone-800">{item.description}</td>
                    <td className="px-4 py-2.5 hidden sm:table-cell text-right font-mono-data text-xs text-stone-600">{item.lengthMm}</td>
                    <td className="px-4 py-2.5 hidden sm:table-cell text-right font-mono-data text-xs text-stone-600">{item.widthMm}</td>
                    <td className="px-4 py-2.5 hidden md:table-cell text-right font-mono-data text-xs text-stone-600">{item.thicknessMm}</td>
                    <td className="px-4 py-2.5 text-right font-semibold text-stone-900">{item.qty}</td>
                    <td className="px-4 py-2.5 hidden md:table-cell text-xs text-stone-500">
                      <span className="font-medium text-stone-700">{item.materialCode}</span>
                      <span className="ml-1 text-stone-400">{item.materialName}</span>
                    </td>
                    <td className="px-4 py-2.5 hidden lg:table-cell text-xs text-stone-500">{GRAIN_LABEL[item.grainDir] ?? "—"}</td>
                    <td className="px-4 py-2.5 hidden lg:table-cell text-xs">
                      {item.edgeBanding ? (
                        <span className="rounded bg-amber-50 border border-amber-200 px-1.5 py-0.5 font-mono-data text-amber-700">{item.edgeBanding}</span>
                      ) : <span className="text-stone-300">—</span>}
                    </td>
                    <td className="px-4 py-2.5 hidden xl:table-cell text-xs text-stone-500">{item.finish ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}
