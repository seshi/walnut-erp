import { KpiTiles } from "@/components/projects/kpi-tiles";
import { ProjectList } from "@/components/projects/project-list";
import { Button } from "@/components/ui/button";
import { getProjectKpis, getProjectListItems } from "@/lib/mock-data";
import { Plus } from "lucide-react";

export const metadata = { title: "Projects – Walnut Studios ERP" };

export default function ProjectsPage() {
  const kpis     = getProjectKpis();
  const projects = getProjectListItems();

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-stone-900">Projects</h1>
          <p className="mt-0.5 text-sm text-stone-500">
            All client projects across every workflow stage.
          </p>
        </div>
        <Button size="md" className="gap-2">
          <Plus className="h-4 w-4" />
          New Project
        </Button>
      </div>

      {/* KPI tiles */}
      <KpiTiles kpis={kpis} />

      {/* Project list */}
      <ProjectList projects={projects} />
    </div>
  );
}
