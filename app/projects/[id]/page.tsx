import { notFound } from "next/navigation";
import Link from "next/link";
import { findProject } from "@/lib/project-store";
import { StatusBadge } from "@/components/projects/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  ArrowLeft,
  MapPin,
  User,
  Calendar,
  DoorOpen,
  Banknote,
  StickyNote,
  ClipboardList,
  Hammer,
  ShoppingCart,
} from "lucide-react";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { id: string } }) {
  const project = await findProject(params.id);
  return { title: project ? `${project.projectCode} – Walnut Studios ERP` : "Project not found" };
}

const STATUS_STEPS = [
  "enquiry", "design", "approved", "in_production",
  "ready", "dispatched", "installed", "closed",
] as const;

function StatusTimeline({ current }: { current: string }) {
  const currentIdx = STATUS_STEPS.indexOf(current as typeof STATUS_STEPS[number]);
  return (
    <div className="flex items-center gap-0">
      {STATUS_STEPS.map((step, idx) => {
        const done    = idx < currentIdx;
        const active  = idx === currentIdx;
        const label   = step.replace("_", " ");
        return (
          <div key={step} className="flex flex-1 flex-col items-center">
            <div className="flex w-full items-center">
              {idx > 0 && (
                <div className={`h-0.5 flex-1 ${done || active ? "bg-walnut-500" : "bg-stone-200"}`} />
              )}
              <div
                className={`h-3 w-3 rounded-full shrink-0 ${
                  active ? "ring-2 ring-walnut-500 ring-offset-1 bg-walnut-500" :
                  done   ? "bg-walnut-500" : "bg-stone-200"
                }`}
              />
              {idx < STATUS_STEPS.length - 1 && (
                <div className={`h-0.5 flex-1 ${done ? "bg-walnut-500" : "bg-stone-200"}`} />
              )}
            </div>
            <span
              className={`mt-1.5 text-center text-[9px] leading-tight capitalize ${
                active ? "font-semibold text-walnut-500" : done ? "text-stone-500" : "text-stone-300"
              }`}
            >
              {label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default async function ProjectDetailPage({ params }: { params: { id: string } }) {
  const project = await findProject(params.id);
  if (!project) notFound();

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Back + header */}
      <div className="flex items-start gap-4">
        <Button variant="ghost" size="sm" asChild className="-ml-1 shrink-0">
          <Link href="/projects">
            <ArrowLeft className="h-4 w-4" />
            Projects
          </Link>
        </Button>
      </div>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-mono-data text-lg font-semibold tracking-tight text-walnut-500">
              {project.projectCode}
            </h1>
            <StatusBadge status={project.status} />
          </div>
          <p className="mt-1 text-xl font-semibold text-stone-900">
            {project.customer.companyName}
          </p>
          <p className="flex items-center gap-1 mt-1 text-sm text-stone-500">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            {project.siteAddress}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/projects/${project.id}/edit`}>Edit Project</Link>
          </Button>
          <Button size="sm">Generate Cut List</Button>
        </div>
      </div>

      {/* Status timeline */}
      <Card>
        <CardContent className="pt-5">
          <StatusTimeline current={project.status} />
        </CardContent>
      </Card>

      {/* Two-column detail grid */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">

        {/* Left column – project info */}
        <div className="space-y-4 lg:col-span-2">

          {/* Key details */}
          <Card>
            <CardHeader><CardTitle>Project Details</CardTitle></CardHeader>
            <CardContent className="pt-0">
              <dl className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm sm:grid-cols-3">
                <div>
                  <dt className="flex items-center gap-1.5 text-xs text-stone-400 mb-1">
                    <User className="h-3 w-3" /> Lead Designer
                  </dt>
                  <dd className="font-medium text-stone-800">{project.designer.name}</dd>
                </div>
                {project.productionManager && (
                  <div>
                    <dt className="flex items-center gap-1.5 text-xs text-stone-400 mb-1">
                      <Hammer className="h-3 w-3" /> Production Manager
                    </dt>
                    <dd className="font-medium text-stone-800">{project.productionManager.name}</dd>
                  </div>
                )}
                <div>
                  <dt className="flex items-center gap-1.5 text-xs text-stone-400 mb-1">
                    <Calendar className="h-3 w-3" /> Enquiry Date
                  </dt>
                  <dd className="font-medium text-stone-800">{formatDate(project.enquiryDate)}</dd>
                </div>
                <div>
                  <dt className="flex items-center gap-1.5 text-xs text-stone-400 mb-1">
                    <Calendar className="h-3 w-3" /> Production Start
                  </dt>
                  <dd className="font-medium text-stone-800">{formatDate(project.startDate)}</dd>
                </div>
                <div>
                  <dt className="flex items-center gap-1.5 text-xs text-stone-400 mb-1">
                    <Calendar className="h-3 w-3" /> Delivery Date
                  </dt>
                  <dd className="font-medium text-stone-800">{formatDate(project.deliveryDate)}</dd>
                </div>
                <div>
                  <dt className="flex items-center gap-1.5 text-xs text-stone-400 mb-1">
                    <Banknote className="h-3 w-3" /> Estimated Value
                  </dt>
                  <dd className="font-semibold text-stone-900">{formatCurrency(project.estimatedValue)}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          {/* Rooms */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Rooms ({project.rooms.length})</CardTitle>
                <button className="text-xs text-walnut-500 hover:underline">+ Add Room</button>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex flex-wrap gap-2">
                {project.rooms.map((room) => (
                  <div
                    key={room.id}
                    className="flex items-center gap-2 rounded-md border border-stone-200 bg-stone-50 px-3 py-1.5"
                  >
                    <DoorOpen className="h-3.5 w-3.5 text-stone-400 shrink-0" />
                    <span className="text-sm font-medium text-stone-700">{room.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Module shortcuts (locked until built) */}
          <Card>
            <CardHeader><CardTitle>Linked Modules</CardTitle></CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {[
                  { label: "Configurator", icon: DoorOpen,      href: `/projects/${project.id}/configurator`,   live: true  },
                  { label: "Cut List",     icon: ClipboardList, href: `/projects/${project.id}/cut-list`,        live: true  },
                  { label: "Costing",      icon: Banknote,      href: null,                                     live: false },
                  { label: "Production",   icon: Hammer,        href: `/projects/${project.id}/production`,     live: true  },
                ].map(({ label, icon: Icon, href, live }) => {
                  const tileClass = `flex flex-col items-center gap-2 rounded-lg border p-3 text-center text-xs font-medium transition-colors ${
                    live
                      ? "border-walnut-200 bg-walnut-50 text-walnut-600 hover:bg-walnut-100"
                      : "border-stone-200 bg-stone-50 text-stone-400 cursor-not-allowed"
                  }`;
                  const content = (
                    <>
                      <Icon className={`h-5 w-5 ${live ? "text-walnut-400" : "text-stone-300"}`} />
                      {label}
                      {!live && <Badge variant="outline" className="text-[9px]">Coming soon</Badge>}
                    </>
                  );
                  return live && href ? (
                    <Link key={label} href={href} className={tileClass}>{content}</Link>
                  ) : (
                    <span key={label} className={tileClass}>{content}</span>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right column – customer + notes */}
        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Customer</CardTitle></CardHeader>
            <CardContent className="pt-0 space-y-2 text-sm">
              <p className="font-semibold text-stone-900">{project.customer.companyName}</p>
              <p className="text-stone-600">{project.customer.contactName}</p>
              <a
                href={`mailto:${project.customer.email}`}
                className="block text-walnut-500 hover:underline"
              >
                {project.customer.email}
              </a>
              {project.customer.phone && (
                <p className="text-stone-500">{project.customer.phone}</p>
              )}
            </CardContent>
          </Card>

          {project.internalNotes && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <StickyNote className="h-3.5 w-3.5 text-stone-400" />
                  <CardTitle>Internal Notes</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-stone-600 leading-relaxed">
                  {project.internalNotes}
                </p>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader><CardTitle>Record Info</CardTitle></CardHeader>
            <CardContent className="pt-0 space-y-1.5 text-xs text-stone-500">
              <div className="flex justify-between">
                <span>Created</span>
                <span>{formatDate(project.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span>Last updated</span>
                <span>{formatDate(project.updatedAt)}</span>
              </div>
              <div className="flex justify-between">
                <span>Project ID</span>
                <span className="font-mono-data">{project.id}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
