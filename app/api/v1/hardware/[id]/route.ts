import { NextRequest, NextResponse } from "next/server";
import { findHardware, updateHardware, type UpdateHardwareInput } from "@/lib/hardware-store";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const item = await findHardware(params.id);
  if (!item) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: `Hardware '${params.id}' not found.` } },
      { status: 404 }
    );
  }
  return NextResponse.json({ data: item });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  let body: UpdateHardwareInput;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: { code: "BAD_REQUEST", message: "Invalid JSON body." } },
      { status: 400 }
    );
  }
  const result = await updateHardware(params.id, body);
  if (!result.ok) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: `Hardware '${params.id}' not found.` } },
      { status: 404 }
    );
  }
  return NextResponse.json({ data: result.hardware });
}
