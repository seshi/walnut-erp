import { NextRequest, NextResponse } from "next/server";
import { getMaterialListItems, getMaterialKpis } from "@/lib/material-store";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const category  = searchParams.get("category") ?? undefined;
  const activeOnly = searchParams.get("active") === "true";
  const kpis      = searchParams.get("kpis") === "true";

  if (kpis) {
    return NextResponse.json({ data: await getMaterialKpis() });
  }

  const items = await getMaterialListItems(category, activeOnly);
  return NextResponse.json({ data: items, meta: { total: items.length } });
}
