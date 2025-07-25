import { type NextRequest, NextResponse } from "next/server"
import { propertyDescription } from "@/lib/storage"

// Ensure this runs in Node.js runtime, not Edge
export const runtime = "nodejs"

export async function GET() {
  try {
    return NextResponse.json({ property: propertyDescription })
  } catch (error) {
    console.error("Error getting property:", error)
    return NextResponse.json({ error: "Failed to get property" }, { status: 500 })
  }
}