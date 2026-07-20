import { NextRequest, NextResponse } from "next/server";
import { updateCabinet, deleteCabinet } from "@/lib/configurator-store";
import type { CreateCabinetInput } from "@/lib/types";

export const dynamic = "force-dynamic";

// PATCH /api/v1/projects/:id/cabinets/:cabinetId
export async function PATCH(req: NextRequest, { params }: { params: { id: string; cabinetId: string } }) {
  let body: Partial<CreateCabinetInput>;
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: { code: "BAD_REQUEST", message: "Invalid JSON." } }, { status: 400 }); }
  const updated = await updateCabinet(params.cabinetId, body);
  if (!updated) return NextResponse.json({ error: { code: "NOT_FOUND" } }, { status: 404 });
  return NextResponse.json({ data: updated });
}

// DELETE /api/v1/projects/:id/cabinets/:cabinetId
export async function DELETE(_req: NextRequest, { params }: { params: { id: string; cabinetId: string } }) {
  const ok = await deleteCabinet(params.cabinetId);
  if (!ok) return NextResponse.json({ error: { code: "NOT_FOUND" } }, { status: 404 });
  return new NextResponse(null, { status: 204 });
}
