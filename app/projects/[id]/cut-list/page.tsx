import { notFound } from "next/navigation";
import Link from "next/link";
import { findProject } from "@/lib/project-store";
import { getProjectCutList, summariseCutList } from "@/lib/cut-list-store";
import { CutListViewer } from "@/components/cut-list/cut-list-viewer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, ClipboardList } from "lucide-react";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { id: string } }) {
  const project = await findProject(params.id);
  return { title: project ? `Cut List – ${project.projectCode} – Walnut Studios ERP` : "Cut List" };
}

export default async function CutListPage({ params }: { params: { id: string } }) {
  const [project, version] = await Promise.all([
    findProject(params.id),
    getProjectCutList(params.id),
  ]);

  if (!project) notFound();

  const summary = version ? summariseCutList(version) : null;

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Back */}
      <div>
        <Button variant="ghost" size="sm" asChild className="-ml-1">
          <Link href={`/projects/${params.id}`}>
            <ArrowLeft className="h-4 w-4" />
            {project.projectCode}
          </Link>
        </Button>
      </div>

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-stone-400" />
            <h1 className="text-xl font-semibold text-stone-900">Cut List</h1>
          </div>
          <p className="mt-0.5 text-sm text-stone-500">
            {project.customer.companyName} — {project.siteAddress}
          </p>
        </div>
      </div>

      {version && summary ? (
        <CutListViewer version={version} summary={summary} />
      ) : (
        <Card>
          <CardContent className="py-16 text-center text-stone-400">
            <ClipboardList className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm font-medium">No cut list generated yet</p>
            <p className="mt-1 text-xs">
              Use the Configurator module to generate a cut list for this project.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
