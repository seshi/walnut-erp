import { NextRequest, NextResponse } from "next/server";
import { findMaterial } from "@/lib/material-store";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const material = await findMaterial(params.id);
  if (!material) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: `Material '${params.id}' not found.` } },
      { status: 404 }
    );
  }
  return NextResponse.json({ data: material });
}
