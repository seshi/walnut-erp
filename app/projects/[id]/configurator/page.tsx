import { notFound } from "next/navigation";
import Link from "next/link";
import { findProject } from "@/lib/project-store";
import { getProjectCabinets } from "@/lib/configurator-store";
import { getMaterialListItems } from "@/lib/material-store";
import { getHardwareListItems } from "@/lib/hardware-store";
import { CabinetConfigurator } from "@/components/configurator/cabinet-configurator";
import { GenerateCutListButton } from "@/components/configurator/generate-cut-list-button";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Layers } from "lucide-react";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { id: string } }) {
  const project = await findProject(params.id);
  return {
    title: project
      ? `Configurator – ${project.projectCode} – Walnut Studios ERP`
      : "Configurator",
  };
}

export default async function ConfiguratorPage({ params }: { params: { id: string } }) {
  const [project, cabinets, materials, hardware] = await Promise.all([
    findProject(params.id),
    getProjectCabinets(params.id),
    getMaterialListItems(undefined, true),
    getHardwareListItems(undefined, true),
  ]);

  if (!project) notFound();

  const rooms = project.rooms.map((r) => ({ id: r.id, name: r.name }));

  return (
    <div className="flex flex-col min-h-screen">
      {/* Scrollable content area — extra bottom padding so sticky bar doesn't overlap */}
      <div className="flex flex-col gap-6 p-6 pb-24">

        {/* Back button */}
        <div className="flex items-start gap-4">
          <Button variant="ghost" size="sm" asChild className="-ml-1 shrink-0">
            <Link href={`/projects/${project.id}`}>
              <ArrowLeft className="h-4 w-4" />
              {project.projectCode}
            </Link>
          </Button>
        </div>

        {/* Page header */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <Layers className="h-5 w-5 text-walnut-400 shrink-0" />
              <h1 className="text-xl font-semibold text-stone-900">Configurator</h1>
              <span className="font-mono-data text-sm font-medium text-walnut-500">
                {project.projectCode}
              </span>
              <span className="rounded-full bg-stone-100 px-2 py-0.5 text-xs text-stone-500">
                {project.rooms.length} room{project.rooms.length !== 1 ? "s" : ""}
              </span>
            </div>
            <p className="mt-1.5 text-sm text-stone-500">
              Define cabinets and joinery for each room. Click Generate Cut List when ready.
            </p>
          </div>
        </div>

        {/* Main configurator client component */}
        <CabinetConfigurator
          projectId={project.id}
          projectCode={project.projectCode}
          rooms={rooms}
          cabinets={cabinets}
          materials={materials}
          hardware={hardware}
        />
      </div>

      {/* Sticky bottom action bar */}
      <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-stone-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 px-6 py-3">
        <div className="mx-auto flex max-w-screen-xl items-center justify-between gap-4">
          <p className="text-xs text-stone-500">
            {cabinets.length} cabinet{cabinets.length !== 1 ? "s" : ""} configured
            {cabinets.length > 0 && (
              <> &mdash; total qty: {cabinets.reduce((sum, c) => sum + c.qty, 0)}</>
            )}
          </p>
          <GenerateCutListButton
            projectId={project.id}
            disabled={cabinets.length === 0}
          />
        </div>
      </div>
    </div>
  );
}
