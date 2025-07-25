import { NextResponse } from "next/server"
import { sseConnections } from "@/lib/storage"

export const runtime = "nodejs"

export async function GET() {
  return NextResponse.json({
    connections: sseConnections.length,
    timestamp: new Date().toISOString()
  })
}