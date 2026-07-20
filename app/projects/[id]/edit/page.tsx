import { notFound } from "next/navigation";
import Link from "next/link";
import { findProject } from "@/lib/project-store";
import { MOCK_USERS } from "@/lib/mock-data";
import { ProjectForm } from "@/components/projects/project-form";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/projects/status-badge";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { id: string } }) {
  const project = await findProject(params.id);
  return { title: project ? `Edit ${project.projectCode} – Walnut Studios ERP` : "Project not found" };
}

export default async function EditProjectPage({ params }: { params: { id: string } }) {
  const project = await findProject(params.id);
  if (!project) notFound();

  const designers          = MOCK_USERS.filter((u) => ["designer", "admin", "director"].includes(u.role));
  const productionManagers = MOCK_USERS.filter((u) => ["production_manager", "admin"].includes(u.role));

  return (
    <div className="flex flex-col gap-5 p-6 max-w-3xl">

      {/* Back */}
      <Button variant="ghost" size="sm" asChild className="-ml-1 w-fit">
        <Link href={`/projects/${project.id}`}>
          <ArrowLeft className="h-4 w-4" />
          Back to project
        </Link>
      </Button>

      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <h1 className="font-mono-data text-lg font-semibold tracking-tight text-walnut-500">
            {project.projectCode}
          </h1>
          <StatusBadge status={project.status} />
        </div>
        <p className="mt-1 text-xl font-semibold text-stone-900">Edit Project</p>
        <p className="mt-0.5 text-sm text-stone-500">
          Changes are saved immediately — no approval workflow required for project master edits.
        </p>
      </div>

      <ProjectForm
        project={project}
        designers={designers}
        productionManagers={productionManagers}
      />
    </div>
  );
}
