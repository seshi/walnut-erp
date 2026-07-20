import { NextRequest, NextResponse } from "next/server";
import { updateStage } from "@/lib/production-store";
import type { StageStatus, ProductionStageName } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function PATCH(req: NextRequest, { params }: { params: { id: string; stage: string } }) {
  let body: { status: StageStatus; notes?: string };
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: { code: "BAD_REQUEST" } }, { status: 400 }); }
  const updated = await updateStage(params.id, params.stage as ProductionStageName, body.status, body.notes);
  return NextResponse.json({ data: updated });
}
