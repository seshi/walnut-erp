import { NextRequest, NextResponse } from "next/server";
import { findMaterial, updateMaterial, type UpdateMaterialInput } from "@/lib/material-store";

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

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  let body: UpdateMaterialInput;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: { code: "BAD_REQUEST", message: "Invalid JSON body." } },
      { status: 400 }
    );
  }
  const result = await updateMaterial(params.id, body);
  if (!result.ok) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: `Material '${params.id}' not found.` } },
      { status: 404 }
    );
  }
  return NextResponse.json({ data: result.material });
}
