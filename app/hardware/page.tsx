import { HardwareKpiTiles } from "@/components/hardware/hardware-kpi-tiles";
import { HardwareList } from "@/components/hardware/hardware-list";
import { getHardwareListItems, getHardwareKpis } from "@/lib/hardware-store";

export const dynamic = "force-dynamic";
export const metadata = { title: "Hardware Library – Walnut Studios ERP" };

export default async function HardwarePage() {
  const [kpis, items] = await Promise.all([
    getHardwareKpis(),
    getHardwareListItems(),
  ]);

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-xl font-semibold text-stone-900">Hardware Library</h1>
        <p className="mt-0.5 text-sm text-stone-500">
          Hinges, drawer runners, handles, legs and all other hardware components.
        </p>
      </div>
      <HardwareKpiTiles kpis={kpis} />
      <HardwareList items={items} />
    </div>
  );
}
