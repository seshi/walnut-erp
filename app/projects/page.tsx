import { KpiTiles } from "@/components/projects/kpi-tiles";
import { ProjectList } from "@/components/projects/project-list";
import { Button } from "@/components/ui/button";
import { getProjectKpis, getProjectListItems } from "@/lib/project-store";
import { Plus } from "lucide-react";

export const dynamic = "force-dynamic";
export const metadata = { title: "Projects – Walnut Studios ERP" };

export default async function ProjectsPage() {
  const [kpis, projects] = await Promise.all([
    getProjectKpis(),
    getProjectListItems(),
  ]);

  return (
    <div className="flex flex-col gap-6 p-6">
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

      <KpiTiles kpis={kpis} />
      <ProjectList projects={projects} />
    </div>
  );
}
