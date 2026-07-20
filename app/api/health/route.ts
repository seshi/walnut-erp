import { NextResponse } from "next/server";

/** GET /api/health — Railway health check */
export async function GET() {
  return NextResponse.json({ status: "ok", ts: new Date().toISOString() });
}
