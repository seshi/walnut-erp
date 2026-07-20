import { NextRequest, NextResponse } from "next/server";
import { findHardware } from "@/lib/hardware-store";

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
