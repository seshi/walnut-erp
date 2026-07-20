import { NextRequest, NextResponse } from "next/server";
import { getProjectCabinets, createCabinet } from "@/lib/configurator-store";
import type { CreateCabinetInput } from "@/lib/types";

export const dynamic = "force-dynamic";

// GET /api/v1/projects/:id/cabinets
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const items = await getProjectCabinets(params.id);
  return NextResponse.json({ data: items, meta: { total: items.length } });
}

// POST /api/v1/projects/:id/cabinets
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  let body: CreateCabinetInput;
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: { code: "BAD_REQUEST", message: "Invalid JSON." } }, { status: 400 }); }
  const cabinet = await createCabinet(params.id, body);
  return NextResponse.json({ data: cabinet }, { status: 201 });
}
