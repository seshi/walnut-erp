import { notFound } from "next/navigation";
import Link from "next/link";
import { findHardware } from "@/lib/hardware-store";
import { HardwareForm } from "@/components/hardware/hardware-form";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { id: string } }) {
  const h = await findHardware(params.id);
  return { title: h ? `Edit ${h.code} – Walnut Studios ERP` : "Hardware not found" };
}

export default async function EditHardwarePage({ params }: { params: { id: string } }) {
  const item = await findHardware(params.id);
  if (!item) notFound();

  return (
    <div className="flex flex-col gap-5 p-6 max-w-3xl">
      <Button variant="ghost" size="sm" asChild className="-ml-1 w-fit">
        <Link href="/hardware">
          <ArrowLeft className="h-4 w-4" />
          Back to Hardware
        </Link>
      </Button>

      <div>
        <p className="font-mono-data text-sm font-medium text-walnut-500">{item.code}</p>
        <h1 className="mt-0.5 text-xl font-semibold text-stone-900">Edit Hardware</h1>
        <p className="mt-0.5 text-sm text-stone-500">
          Update pricing, supplier, stock levels and specifications.
        </p>
      </div>

      <HardwareForm item={item} />
    </div>
  );
}
