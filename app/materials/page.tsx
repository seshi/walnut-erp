import { MaterialKpiTiles } from "@/components/materials/material-kpi-tiles";
import { MaterialList } from "@/components/materials/material-list";
import { getMaterialListItems, getMaterialKpis } from "@/lib/material-store";

export const dynamic = "force-dynamic";
export const metadata = { title: "Materials Library – Walnut Studios ERP" };

export default async function MaterialsPage() {
  const [kpis, materials] = await Promise.all([
    getMaterialKpis(),
    getMaterialListItems(),
  ]);

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-xl font-semibold text-stone-900">Materials Library</h1>
        <p className="mt-0.5 text-sm text-stone-500">
          Sheet goods, veneers, edge banding, timber and glass used in production.
        </p>
      </div>
      <MaterialKpiTiles kpis={kpis} />
      <MaterialList materials={materials} />
    </div>
  );
}
