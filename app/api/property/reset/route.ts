import { type NextRequest, NextResponse } from "next/server"
import { propertyDescription } from "@/lib/storage"

// Ensure this runs in Node.js runtime, not Edge
export const runtime = "nodejs"

// Reset property description for testing
export async function POST() {
  try {
    // Reset the property description
    if (propertyDescription) {
      Object.keys(propertyDescription).forEach(key => {
        delete propertyDescription[key]
      })
    }
    
    // Reset global storage
    const globalForStorage = global as any
    globalForStorage.propertyDescription = null
    
    return NextResponse.json({ success: true, message: "Property description reset" })
  } catch (error) {
    console.error("Error resetting property:", error)
    return NextResponse.json({ error: "Failed to reset property" }, { status: 500 })
  }
}