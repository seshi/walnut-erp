import { notFound } from "next/navigation";
import Link from "next/link";
import { findProject } from "@/lib/project-store";
import { getProductionStages } from "@/lib/production-store";
import { StatusBadge } from "@/components/projects/status-badge";
import { StagePipeline } from "@/components/production/stage-pipeline";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Hammer, MapPin } from "lucide-react";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { id: string } }) {
  const project = await findProject(params.id);
  return {
    title: project
      ? `Production – ${project.projectCode} – Walnut Studios ERP`
      : "Production",
  };
}

export default async function ProductionPage({
  params,
}: {
  params: { id: string };
}) {
  const [project, stages] = await Promise.all([
    findProject(params.id),
    getProductionStages(params.id),
  ]);

  if (!project) notFound();

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Back button */}
      <div>
        <Button variant="ghost" size="sm" asChild className="-ml-1">
          <Link href={`/projects/${params.id}`}>
            <ArrowLeft className="h-4 w-4" />
            {project.projectCode}
          </Link>
        </Button>
      </div>

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <Hammer className="h-5 w-5 text-stone-400 shrink-0" />
            <h1 className="text-xl font-semibold text-stone-900">Production</h1>
            <Badge variant="walnut" className="font-mono-data text-xs tracking-tight">
              {project.projectCode}
            </Badge>
            <StatusBadge status={project.status} />
          </div>
          <p className="mt-1.5 flex flex-wrap items-center gap-1.5 text-sm text-stone-500">
            <span className="font-medium text-stone-700">
              {project.customer.companyName}
            </span>
            <span aria-hidden>·</span>
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <span>{project.siteAddress}</span>
          </p>
        </div>
      </div>

      {/* Stage pipeline (client component) */}
      <StagePipeline stages={stages} projectId={params.id} />
    </div>
  );
}
