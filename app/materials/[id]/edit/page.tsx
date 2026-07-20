import { notFound } from "next/navigation";
import Link from "next/link";
import { findMaterial } from "@/lib/material-store";
import { MaterialForm } from "@/components/materials/material-form";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { id: string } }) {
  const m = await findMaterial(params.id);
  return { title: m ? `Edit ${m.code} – Walnut Studios ERP` : "Material not found" };
}

export default async function EditMaterialPage({ params }: { params: { id: string } }) {
  const material = await findMaterial(params.id);
  if (!material) notFound();

  return (
    <div className="flex flex-col gap-5 p-6 max-w-3xl">
      <Button variant="ghost" size="sm" asChild className="-ml-1 w-fit">
        <Link href="/materials">
          <ArrowLeft className="h-4 w-4" />
          Back to Materials
        </Link>
      </Button>

      <div>
        <p className="font-mono-data text-sm font-medium text-walnut-500">{material.code}</p>
        <h1 className="mt-0.5 text-xl font-semibold text-stone-900">Edit Material</h1>
        <p className="mt-0.5 text-sm text-stone-500">
          Update pricing, supplier, lead times and grain details.
        </p>
      </div>

      <MaterialForm material={material} />
    </div>
  );
}
