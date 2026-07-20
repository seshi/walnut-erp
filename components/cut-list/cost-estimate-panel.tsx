import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import type { CostEstimate } from "@/lib/types";
import { Layers, Wrench, HardHat, IndianRupee } from "lucide-react";

export function CostEstimatePanel({ estimate }: { estimate: CostEstimate }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <IndianRupee className="h-5 w-5 text-stone-400" />
        <h2 className="text-lg font-semibold text-stone-900">Cost Estimate</h2>
        <span className="text-xs text-stone-400">— v{estimate.versionNo}, auto-calculated</span>
      </div>

      {/* Summary tiles */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Materials",  value: formatCurrency(estimate.materialTotal), icon: Layers,     accent: "stone"   },
          { label: "Hardware",   value: formatCurrency(estimate.hardwareTotal), icon: Wrench,     accent: "stone"   },
          { label: "Labour",     value: formatCurrency(estimate.labourEstimate),icon: HardHat,    accent: "amber"   },
          { label: "Grand Total",value: formatCurrency(estimate.grandTotal),    icon: IndianRupee,accent: "walnut"  },
        ].map(({ label, value, icon: Icon, accent }) => (
          <Card key={label} className={accent === "walnut" ? "border-walnut-200 bg-walnut-50" : ""}>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-2 mb-1">
                <Icon className={`h-4 w-4 ${accent === "walnut" ? "text-walnut-500" : "text-stone-400"}`} />
                <p className="text-xs text-stone-500">{label}</p>
              </div>
              <p className={`text-lg font-semibold ${accent === "walnut" ? "text-walnut-700" : "text-stone-900"}`}>{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Material breakdown */}
      {estimate.materialLines.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Material Breakdown</CardTitle></CardHeader>
          <CardContent className="pt-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-200 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                  <th className="pb-2 pr-4">Material</th>
                  <th className="pb-2 pr-4 hidden sm:table-cell text-right">Sheets</th>
                  <th className="pb-2 pr-4 hidden md:table-cell text-right">Cost/Sheet</th>
                  <th className="pb-2 pr-4 hidden md:table-cell text-right">Wastage</th>
                  <th className="pb-2 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {estimate.materialLines.map((line) => (
                  <tr key={line.materialId} className="hover:bg-stone-50">
                    <td className="py-2 pr-4">
                      <span className="font-mono-data text-xs text-walnut-500 mr-2">{line.materialCode}</span>
                      <span className="text-stone-700">{line.materialName}</span>
                    </td>
                    <td className="py-2 pr-4 hidden sm:table-cell text-right text-stone-600">{line.sheetsRequired}</td>
                    <td className="py-2 pr-4 hidden md:table-cell text-right text-stone-600">{formatCurrency(line.costPerSheet)}</td>
                    <td className="py-2 pr-4 hidden md:table-cell text-right text-stone-500 text-xs">{line.wastagePct}%</td>
                    <td className="py-2 text-right font-medium text-stone-800">{formatCurrency(line.subtotal)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-stone-300">
                  <td colSpan={4} className="pt-2 text-sm font-medium text-stone-600">Materials Total</td>
                  <td className="pt-2 text-right font-semibold text-stone-900">{formatCurrency(estimate.materialTotal)}</td>
                </tr>
              </tfoot>
            </table>
          </CardContent>
        </Card>
      )}

      {/* Hardware breakdown */}
      {estimate.hardwareLines.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Hardware Bill of Materials</CardTitle></CardHeader>
          <CardContent className="pt-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-200 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                  <th className="pb-2 pr-4">Item</th>
                  <th className="pb-2 pr-4 text-right">Qty</th>
                  <th className="pb-2 pr-4 hidden sm:table-cell text-right">Unit Cost</th>
                  <th className="pb-2 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {estimate.hardwareLines.map((line) => (
                  <tr key={line.hardwareId} className="hover:bg-stone-50">
                    <td className="py-2 pr-4">
                      <span className="font-mono-data text-xs text-walnut-500 mr-2">{line.hardwareCode}</span>
                      <span className="text-stone-700">{line.hardwareName}</span>
                    </td>
                    <td className="py-2 pr-4 text-right text-stone-600">{line.qty}</td>
                    <td className="py-2 pr-4 hidden sm:table-cell text-right text-stone-600">{formatCurrency(line.unitCost)}</td>
                    <td className="py-2 text-right font-medium text-stone-800">{formatCurrency(line.subtotal)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-stone-300">
                  <td colSpan={3} className="pt-2 text-sm font-medium text-stone-600">Hardware Total</td>
                  <td className="pt-2 text-right font-semibold text-stone-900">{formatCurrency(estimate.hardwareTotal)}</td>
                </tr>
              </tfoot>
            </table>
          </CardContent>
        </Card>
      )}

      {/* Labour note */}
      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="pt-4 pb-4 flex items-start gap-3">
          <HardHat className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium text-amber-800">Labour Estimate</p>
            <p className="text-xs text-amber-700 mt-0.5">
              {formatCurrency(estimate.labourEstimate)} — calculated at ₹3,500 per cabinet unit.
              Adjust in the project costing sheet for complex joinery or site conditions.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
