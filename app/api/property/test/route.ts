import { type NextRequest, NextResponse } from "next/server"
import { updatePropertyDescription } from "@/lib/storage"

// Ensure this runs in Node.js runtime, not Edge
export const runtime = "nodejs"

// Test endpoint to manually update property description
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Example test data
    const testData = body || {
      listingTitle: "Beautiful 3-bedroom apartment in Paris",
      propertyType: "APARTMENT",
      status: "FOR_SALE",
      price: {
        amount: 450000,
        currency: "EUR",
        includesAgencyFees: true
      },
      address: {
        city: "Paris",
        postalCode: "75008",
        country: "France"
      },
      livingArea: 85,
      totalBedrooms: 3,
      totalBathrooms: 1,
      yearOfConstruction: 1920,
      overallCondition: "GOOD"
    }
    
    updatePropertyDescription(testData)
    
    return NextResponse.json({ success: true, property: testData })
  } catch (error) {
    console.error("Error updating property:", error)
    return NextResponse.json({ error: "Failed to update property" }, { status: 500 })
  }
}