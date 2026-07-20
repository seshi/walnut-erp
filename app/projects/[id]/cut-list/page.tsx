import { notFound } from "next/navigation";
import Link from "next/link";
import { findProject } from "@/lib/project-store";
import { getProjectCutList, summariseCutList } from "@/lib/cut-list-store";
import { getCabinetsForGeneration } from "@/lib/configurator-store";
import { computeCostEstimate } from "@/lib/costing";
import { db } from "@/lib/db";
import { CutListViewer } from "@/components/cut-list/cut-list-viewer";
import { CostEstimatePanel } from "@/components/cut-list/cost-estimate-panel";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, ClipboardList, Settings2 } from "lucide-react";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { id: string } }) {
  const project = await findProject(params.id);
  return { title: project ? `Cut List – ${project.projectCode} – Walnut Studios ERP` : "Cut List" };
}

export default async function CutListPage({ params }: { params: { id: string } }) {
  const [project, version, cabinets] = await Promise.all([
    findProject(params.id),
    getProjectCutList(params.id),
    getCabinetsForGeneration(params.id),
  ]);

  if (!project) notFound();

  const summary = version ? summariseCutList(version) : null;

  // Build cost estimate if we have a cut list and cabinets
  let costEstimate = null;
  if (version && cabinets.length > 0) {
    // Get unique material IDs from cut list items + cabinets
    const matIds = Array.from(new Set([
      ...version.items.map((i) => i.materialId),
      ...cabinets.flatMap((c) => [c.carcassMaterialId, c.backMaterialId, c.doorMaterialId, c.drawerFrontMaterialId].filter(Boolean) as string[]),
    ]));
    const materials = await db.material.findMany({
      where: { id: { in: matIds } },
      select: { id: true, code: true, name: true, sheetLengthMm: true, sheetWidthMm: true, costPerSheet: true, wastagePct: true },
    });

    costEstimate = computeCostEstimate(
      params.id,
      project.projectCode,
      version.versionNo,
      version.items.map((i) => ({ materialId: i.materialId, materialCode: i.materialCode, materialName: i.materialName, lengthMm: i.lengthMm, widthMm: i.widthMm, qty: i.qty })),
      materials,
      cabinets.map((c) => ({
        doorCount: c.doorCount,
        drawerCount: c.drawerCount,
        qty: c.qty,
        hingeHardware:  c.hingeHardware  ? { id: c.hingeHardware.id,  code: c.hingeHardware.code,  name: c.hingeHardware.name,  unitCost: c.hingeHardware.unitCost  } : null,
        runnerHardware: c.runnerHardware ? { id: c.runnerHardware.id, code: c.runnerHardware.code, name: c.runnerHardware.name, unitCost: c.runnerHardware.unitCost } : null,
        handleHardware: c.handleHardware ? { id: c.handleHardware.id, code: c.handleHardware.code, name: c.handleHardware.name, unitCost: c.handleHardware.unitCost } : null,
      }))
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Back */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" asChild className="-ml-1">
          <Link href={`/projects/${params.id}`}>
            <ArrowLeft className="h-4 w-4" />
            {project.projectCode}
          </Link>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link href={`/projects/${params.id}/configurator`}>
            <Settings2 className="h-4 w-4" />
            Edit Configurator
          </Link>
        </Button>
      </div>

      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <ClipboardList className="h-5 w-5 text-stone-400" />
          <h1 className="text-xl font-semibold text-stone-900">Cut List</h1>
        </div>
        <p className="mt-0.5 text-sm text-stone-500">
          {project.customer.companyName} — {project.siteAddress}
        </p>
      </div>

      {version && summary ? (
        <>
          <CutListViewer version={version} summary={summary} />
          {costEstimate && <CostEstimatePanel estimate={costEstimate} />}
        </>
      ) : (
        <Card>
          <CardContent className="py-16 text-center text-stone-400">
            <ClipboardList className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm font-medium">No cut list generated yet</p>
            <p className="mt-1 text-xs">
              Configure cabinets in the Configurator then click Generate Cut List.
            </p>
            <div className="mt-4">
              <Button size="sm" asChild>
                <Link href={`/projects/${params.id}/configurator`}>Open Configurator</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
