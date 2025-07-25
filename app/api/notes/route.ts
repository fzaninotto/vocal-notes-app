import { type NextRequest, NextResponse } from "next/server"
import { notes, broadcastToSSE, sseConnections, propertyDescription, updatePropertyDescription } from "@/lib/storage"
import { RealEstatePropertySchema } from "@/lib/schema"
import { z } from "zod"
import { zodResponseFormat } from "openai/helpers/zod"

// Ensure this runs in Node.js runtime, not Edge
export const runtime = "nodejs"

// Create a partial schema for property updates
// OpenAI structured outputs require all fields to be nullable instead of optional
const PropertyUpdateSchema = z.object({
  listingTitle: z.string().nullable(),
  description: z.string().nullable(),
  propertyType: z.enum(['APARTMENT', 'HOUSE', 'PENTHOUSE', 'LOFT', 'VILLA', 'MANSION', 'TOWNHOUSE', 'STUDIO']).nullable(),
  status: z.enum(['FOR_SALE', 'UNDER_OFFER', 'SOLD', 'RENTED', 'DRAFT']).nullable(),
  price: z.object({
    amount: z.number().positive().nullable(),
    currency: z.string().nullable(),
    includesAgencyFees: z.boolean().nullable(),
    agencyFeePercentage: z.number().min(0).max(100).nullable(),
  }).nullable(),
  annualPropertyTax: z.number().positive().nullable(),
  condominiumFees: z.number().positive().nullable(),
  address: z.object({
    street: z.string().nullable(),
    postalCode: z.string().nullable(),
    city: z.string().nullable(),
    country: z.string().nullable(),
    latitude: z.number().nullable(),
    longitude: z.number().nullable(),
  }).nullable(),
  livingArea: z.number().positive().nullable(),
  totalPlotArea: z.number().positive().nullable(),
  numberOfFloorsInBuilding: z.number().int().positive().nullable(),
  propertyFloorLevel: z.number().int().nullable(),
  hasElevator: z.boolean().nullable(),
  yearOfConstruction: z.number().int().nullable(),
  lastRenovationYear: z.number().int().nullable(),
  overallCondition: z.enum(['NEW_CONSTRUCTION', 'EXCELLENT', 'GOOD', 'NEEDS_REFRESHMENT', 'TO_RENOVATE']).nullable(),
  rooms: z.array(z.object({
    type: z.enum(['LIVING_ROOM', 'DINING_ROOM', 'KITCHEN', 'BEDROOM', 'BATHROOM', 'SHOWER_ROOM', 'OFFICE', 'LAUNDRY_ROOM', 'STORAGE_ROOM', 'HALLWAY', 'WC', 'WALK_IN_CLOSET', 'UTILITY_ROOM', 'OTHER']),
    surface: z.number().positive(),
    floorLevel: z.number().int(),
    floorCovering: z.enum(['HARDWOOD', 'LAMINATE', 'TILE', 'CARPET', 'VINYL', 'CONCRETE', 'MARBLE', 'STONE', 'OTHER']).nullable(),
    exposition: z.array(z.enum(['NORTH', 'SOUTH', 'EAST', 'WEST', 'NORTH_EAST', 'NORTH_WEST', 'SOUTH_EAST', 'SOUTH_WEST'])).nullable(),
    features: z.array(z.string()).nullable(),
  })).nullable(),
  totalBedrooms: z.number().int().min(0).nullable(),
  totalBathrooms: z.number().int().min(0).nullable(),
  outdoorSpaces: z.array(z.object({
    type: z.enum(['GARDEN', 'TERRACE', 'BALCONY', 'PATIO', 'ROOFTOP']),
    surface: z.number().positive(),
    isFenced: z.boolean().nullable(),
    hasPool: z.boolean().nullable(),
    poolDimensions: z.string().nullable(),
    orientation: z.array(z.enum(['NORTH', 'SOUTH', 'EAST', 'WEST', 'NORTH_EAST', 'NORTH_WEST', 'SOUTH_EAST', 'SOUTH_WEST'])).nullable(),
  })).nullable(),
  kitchen: z.object({
    isEquipped: z.boolean().nullable(),
    type: z.enum(['SEPARATE', 'OPEN_PLAN', 'SEMI_OPEN']).nullable(),
    appliances: z.array(z.string()).nullable(),
  }).nullable(),
  heating: z.object({
    mainType: z.enum(['GAS', 'ELECTRIC', 'OIL', 'HEAT_PUMP', 'SOLAR', 'WOOD', 'DISTRICT_HEATING']).nullable(),
    distribution: z.enum(['RADIATORS', 'UNDERFLOOR', 'FORCED_AIR']).nullable(),
    hasAirConditioning: z.boolean().nullable(),
  }).nullable(),
  amenities: z.array(z.string()).nullable(),
  windows: z.object({
    glazingType: z.enum(['SINGLE', 'DOUBLE', 'TRIPLE']).nullable(),
    frameMaterial: z.enum(['WOOD', 'PVC', 'ALUMINUM']).nullable(),
  }).nullable(),
  parking: z.object({
    hasParking: z.boolean().nullable(),
    type: z.enum(['GARAGE', 'OUTDOOR_SPACE', 'UNDERGROUND_BOX', 'CARPORT']).nullable(),
    numberOfSpaces: z.number().int().positive().nullable(),
  }).nullable(),
  hasCellar: z.boolean().nullable(),
  energyPerformance: z.object({
    dpeClass: z.enum(['A', 'B', 'C', 'D', 'E', 'F', 'G']).nullable(),
    gesClass: z.enum(['A', 'B', 'C', 'D', 'E', 'F', 'G']).nullable(),
    estimatedAnnualEnergyCost: z.number().positive().nullable(),
  }).nullable(),
})

type PropertyUpdate = z.infer<typeof PropertyUpdateSchema>

export async function GET() {
  try {
    return NextResponse.json({ notes, property: propertyDescription })
  } catch (error) {
    console.error("Error getting notes:", error)
    return NextResponse.json({ error: "Failed to get notes" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const audioFile = formData.get("audio") as File
    const duration = Number.parseInt(formData.get("duration") as string)
    const title = formData.get("title") as string

    if (!audioFile) {
      return NextResponse.json({ error: "No audio file provided" }, { status: 400 })
    }

    // Convert audio file to base64 for storage
    const arrayBuffer = await audioFile.arrayBuffer()
    const base64Audio = Buffer.from(arrayBuffer).toString('base64')
    const audioUrl = `data:${audioFile.type};base64,${base64Audio}`

    // Create new note
    const newNote = {
      id: Date.now().toString(),
      audioUrl, // Store base64 audio data URL
      duration,
      createdAt: new Date().toISOString(),
      title,
      status: "pending" as const,
    }

    notes.unshift(newNote)

    // Notify all SSE connections about the new note
    console.log("Broadcasting note_added event for note:", newNote.id)
    broadcastToSSE({
      type: "note_added",
      note: newNote,
    })

    // Process transcription in the background
    // Important: We need to ensure the promise is started before returning
    const transcriptionPromise = processTranscription(newNote.id, audioFile).catch(error => {
      console.error("Background transcription error:", error)
    })

    // Wait a tiny bit to ensure the async operation starts
    await new Promise(resolve => setTimeout(resolve, 10))

    return NextResponse.json({ note: newNote })
  } catch (error) {
    console.error("Error creating note:", error)
    return NextResponse.json({ error: "Failed to create note" }, { status: 500 })
  }
}

async function processTranscription(noteId: string, audioFile: File) {
  try {
    // Check if OpenAI API key is available
    if (!process.env.OPENAI_API_KEY) {
      console.error("OpenAI API key not found")
      updateNoteStatus(noteId, "error")
      return
    }

    console.log("Starting transcription for note:", noteId)
    
    // Update status to transcribing
    updateNoteStatus(noteId, "transcribing")

    // Dynamically import OpenAI
    const { default: OpenAI } = await import("openai")

    // Initialize OpenAI client with proper configuration for server-side usage
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })

    // Convert File to Buffer for OpenAI
    const arrayBuffer = await audioFile.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Create a proper File object for OpenAI
    const audioFileForOpenAI = new File([buffer], "audio.wav", {
      type: "audio/wav",
    })

    console.log("Sending audio to OpenAI for transcription...")

    const transcription = await openai.audio.transcriptions.create({
      file: audioFileForOpenAI,
      model: "whisper-1",
      response_format: "text",
    })

    console.log("Transcription completed for note:", noteId)

    const transcriptionText = typeof transcription === "string" ? transcription : transcription.text

    // Update note with transcription and set status to extracting
    const noteIndex = notes.findIndex((note) => note.id === noteId)
    if (noteIndex !== -1) {
      notes[noteIndex] = {
        ...notes[noteIndex],
        status: "extracting",
        transcription: transcriptionText,
      }

      // Notify all SSE connections about the update
      console.log("Broadcasting note_updated event for transcribed note:", noteId)
      broadcastToSSE({
        type: "note_updated",
        note: notes[noteIndex],
      })

      console.log("Note updated with transcription:", noteId, "SSE connections:", sseConnections.length)
    }

    // Extract property information from the transcription
    await extractPropertyInfo(transcriptionText)
    
    // Update status to success after extraction
    updateNoteStatus(noteId, "success")
  } catch (error) {
    console.error("Error processing transcription:", error)
    updateNoteStatus(noteId, "error")
  }
}

function updateNoteStatus(noteId: string, status: "pending" | "transcribing" | "extracting" | "success" | "error") {
  const noteIndex = notes.findIndex((note) => note.id === noteId)
  if (noteIndex !== -1) {
    notes[noteIndex] = {
      ...notes[noteIndex],
      status,
    }

    broadcastToSSE({
      type: "note_updated",
      note: notes[noteIndex],
    })
  }
}

async function extractPropertyInfo(transcription: string) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      console.error("OpenAI API key not found for property extraction")
      return
    }

    console.log("Extracting property information from transcription...")

    // Dynamically import OpenAI
    const { default: OpenAI } = await import("openai")

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })

    // Get the current property state or initialize an empty one
    const currentProperty = propertyDescription || {}

    // Create a prompt for OpenAI to extract property information
    const systemPrompt = `You are a real estate property information extractor. 
Your task is to analyze audio transcriptions and extract relevant property information to ENRICH an existing real estate listing.

IMPORTANT RULES:
1. You will receive the CURRENT property state and a NEW transcription
2. Your job is to ADD new information, not replace existing information
3. Only populate fields with actual values from the transcription
4. Use null for any field that is not mentioned in the transcription
5. DO NOT return fields that already exist in the current state unless the transcription explicitly updates them
6. For rooms: Always include room descriptions in the rooms array. The system will intelligently merge them:
   - Unique rooms (KITCHEN, LIVING_ROOM, DINING_ROOM, LAUNDRY_ROOM) will be updated if they already exist
   - For multiple rooms of the same type (BEDROOM, BATHROOM): 
     * ALWAYS include distinguishing information when mentioned:
     * "The first bedroom" → Include features: ["first bedroom"] or floorLevel if mentioned
     * "The second bedroom" → Include features: ["second bedroom"] or different floorLevel
     * "The master bedroom" → Include features: ["master bedroom"]
     * "The bedroom on the second floor" → Include floorLevel: 2
     * Different bedrooms MUST have different floorLevel OR distinguishing features to be treated as separate rooms
   - Include all room details mentioned in the transcription
7. All fields in the response must be present but set to null if not mentioned in the transcription

Valid property fields include:
- listingTitle, description, propertyType (APARTMENT/HOUSE/PENTHOUSE/LOFT/VILLA/MANSION/TOWNHOUSE/STUDIO)
- status (FOR_SALE/UNDER_OFFER/SOLD/RENTED/DRAFT)
- price: {amount, currency, includesAgencyFees, agencyFeePercentage}
- address: {street, postalCode, city, country, latitude, longitude}
- livingArea, totalPlotArea, numberOfFloorsInBuilding, propertyFloorLevel, hasElevator
- yearOfConstruction, lastRenovationYear
- overallCondition (NEW_CONSTRUCTION/EXCELLENT/GOOD/NEEDS_REFRESHMENT/TO_RENOVATE)
- rooms: array of {type, surface, floorLevel, floorCovering, exposition, features}
- totalBedrooms, totalBathrooms
- outdoorSpaces: array of {type, surface, isFenced, hasPool, poolDimensions, orientation}
- kitchen: {isEquipped, type, appliances}
- heating: {mainType, distribution, hasAirConditioning}
- amenities: array of strings
- parking: {hasParking, type, numberOfSpaces}
- hasCellar: boolean
- energyPerformance: {dpeClass, gesClass, estimatedAnnualEnergyCost}

Examples:
- Current state has livingArea: 85. Transcription says "actually it's 90 square meters" → Return {"livingArea": 90}
- Current state has a kitchen. Transcription says "the kitchen has marble countertops and is 20 square meters" → Return {"rooms": [{"type": "KITCHEN", "surface": 20, "features": ["marble countertops"]}]}
- Current state has 1 bedroom. Transcription says "the second bedroom is 15 square meters" → Return {"rooms": [{"type": "BEDROOM", "surface": 15, "features": ["second bedroom"]}]} (creates new bedroom with distinguishing feature)
- Current state has 1 bedroom. Transcription says "the first bedroom has a balcony" → Return {"rooms": [{"type": "BEDROOM", "features": ["first bedroom", "balcony"]}]} (adds distinguishing feature to help identify)
- Transcription says "the master bedroom is 20 square meters on the third floor" → Return {"rooms": [{"type": "BEDROOM", "surface": 20, "floorLevel": 3, "features": ["master bedroom"]}]}
- Transcription mentions "the living room has a fireplace" → Return {"rooms": [{"type": "LIVING_ROOM", "features": ["fireplace"]}]}`

    // Use structured outputs with Zod schema
    const completion = await openai.chat.completions.parse({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: `Current property state:\n${JSON.stringify(currentProperty, null, 2)}\n\nNew transcription:\n"${transcription}"`
        }
      ],
      response_format: zodResponseFormat(PropertyUpdateSchema, "property_update"),
      temperature: 0.3,
    })

    const extractedInfo = completion.choices[0].message.parsed || {}
    
    // Filter out null values to only update fields with actual data
    const filteredInfo: any = {}
    Object.entries(extractedInfo).forEach(([key, value]) => {
      if (value !== null) {
        filteredInfo[key] = value
      }
    })
    
    console.log("Current property state:", JSON.stringify(currentProperty, null, 2))
    console.log("Extracted property info:", JSON.stringify(extractedInfo, null, 2))
    console.log("Filtered property info (non-null):", JSON.stringify(filteredInfo, null, 2))

    // Only update if we extracted some non-null information
    if (Object.keys(filteredInfo).length > 0) {
      updatePropertyDescription(filteredInfo)
      console.log("Property description updated with extracted info")
    } else {
      console.log("No relevant property information found in transcription")
    }

  } catch (error) {
    console.error("Error extracting property information:", error)
  }
}
