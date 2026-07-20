import { NextRequest, NextResponse } from "next/server";
import { getProductionStages } from "@/lib/production-store";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const stages = await getProductionStages(params.id);
  return NextResponse.json({ data: stages });
}
