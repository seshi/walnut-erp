import { NextResponse } from "next/server";
import { getProjectKpis } from "@/lib/project-store";

/** GET /api/v1/projects/kpis */
export async function GET() {
  const kpis = await getProjectKpis();
  return NextResponse.json({ data: kpis });
}
