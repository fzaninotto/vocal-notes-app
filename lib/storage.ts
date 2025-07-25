interface VocalNote {
  id: string
  audioUrl: string
  duration: number
  createdAt: string
  title: string
  status: "pending" | "transcribing" | "extracting" | "success" | "error"
  transcription?: string
}

// Global singleton for storage that persists across requests
const globalForStorage = global as typeof globalThis & {
  notes?: VocalNote[]
  sseConnections?: Array<(data: string) => void>
  propertyDescription?: any
}

// In-memory storage for notes
export const notes: VocalNote[] = globalForStorage.notes ?? []
globalForStorage.notes = notes

// Store for SSE connections
export const sseConnections: Array<(data: string) => void> = globalForStorage.sseConnections ?? []
globalForStorage.sseConnections = sseConnections

// Store for property description
export let propertyDescription: any = globalForStorage.propertyDescription ?? null

// Helper function to merge room arrays intelligently
function mergeRooms(existingRooms: any[], newRooms: any[]): any[] {
  const mergedRooms = [...(existingRooms || [])]
  
  newRooms.forEach(newRoom => {
    // Define which room types are typically unique (only one per property)
    const uniqueRoomTypes = ['KITCHEN', 'LIVING_ROOM', 'DINING_ROOM', 'LAUNDRY_ROOM']
    const isUniqueType = uniqueRoomTypes.includes(newRoom.type)
    
    // Find existing room to potentially update
    const existingIndex = mergedRooms.findIndex(existing => {
      // Match by type is required
      if (existing.type !== newRoom.type) return false
      
      // For unique room types, match by type alone
      if (isUniqueType) {
        return true
      }
      
      // For non-unique rooms (bedrooms, bathrooms, etc.):
      // Check if they have the same identifying features
      const existingFeatures = existing.features || []
      const newFeatures = newRoom.features || []
      
      // Check for matching ordinal features (first bedroom, second bedroom, etc.)
      const ordinalPattern = /(first|second|third|fourth|fifth|master|guest) (bedroom|bathroom)/i
      const existingOrdinal = existingFeatures.find(f => ordinalPattern.test(f))
      const newOrdinal = newFeatures.find(f => ordinalPattern.test(f))
      
      // If both have ordinal identifiers, they must match
      if (existingOrdinal && newOrdinal) {
        return existingOrdinal.toLowerCase() === newOrdinal.toLowerCase()
      }
      
      // If one has an ordinal and the other doesn't, they're different rooms
      if (existingOrdinal || newOrdinal) {
        return false
      }
      
      // Match by floor level if both have it
      if (existing.floorLevel !== undefined && 
          newRoom.floorLevel !== undefined) {
        return existing.floorLevel === newRoom.floorLevel
      }
      
      // If no distinguishing features, don't match (treat as new room)
      return false
    })
    
    if (existingIndex !== -1) {
      // Update existing room with new information
      mergedRooms[existingIndex] = {
        ...mergedRooms[existingIndex],
        ...newRoom,
        // Merge features arrays if both exist
        features: newRoom.features && mergedRooms[existingIndex].features
          ? [...new Set([...mergedRooms[existingIndex].features, ...newRoom.features])]
          : newRoom.features || mergedRooms[existingIndex].features
      }
    } else {
      // Add as new room
      mergedRooms.push(newRoom)
    }
  })
  
  return mergedRooms
}

// Deep merge function for nested objects
function deepMerge(target: any, source: any): any {
  if (!target) {
    return source
  }
  
  const output = { ...target }
  
  for (const key in source) {
    if (source.hasOwnProperty(key)) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        // For nested objects, merge recursively
        output[key] = deepMerge(target[key], source[key])
      } else if (Array.isArray(source[key])) {
        // For arrays, we'll append new items if they're objects with unique identifiers
        // Otherwise, replace the array
        if (key === 'rooms') {
          // For rooms, use intelligent merging
          output[key] = mergeRooms(target[key], source[key])
        } else if (key === 'outdoorSpaces') {
          // For outdoor spaces, append new ones (they're usually distinct)
          output[key] = [...(target[key] || []), ...source[key]]
        } else if (key === 'amenities' || key === 'features') {
          // For string arrays like amenities, merge unique values
          const existing = new Set(target[key] || [])
          source[key].forEach((item: string) => existing.add(item))
          output[key] = Array.from(existing)
        } else {
          // For other arrays, replace
          output[key] = source[key]
        }
      } else {
        // For primitive values, only update if the new value is not null/undefined
        if (source[key] !== null && source[key] !== undefined) {
          output[key] = source[key]
        }
      }
    }
  }
  
  return output
}

export function updatePropertyDescription(updates: any) {
  if (!propertyDescription) {
    propertyDescription = {}
    globalForStorage.propertyDescription = {}
  }
  
  // Use deep merge to preserve existing data
  propertyDescription = deepMerge(propertyDescription, updates)
  globalForStorage.propertyDescription = propertyDescription
  
  // Broadcast the update to all connected clients
  broadcastToSSE({
    type: "property_updated",
    property: propertyDescription,
  })
}

export function broadcastToSSE(data: any) {
  if (sseConnections.length === 0) {
    console.log("No SSE connections to broadcast to")
    return
  }

  const message = JSON.stringify(data)
  console.log(`Broadcasting to ${sseConnections.length} connections:`, data.type)

  // Create a copy of the array to avoid mutation during iteration
  const connections = [...sseConnections]
  
  connections.forEach((send, index) => {
    try {
      send(`data: ${message}\n\n`)
    } catch (error) {
      console.error("Error sending SSE message:", error)
      // Find and remove the broken connection from the original array
      const originalIndex = sseConnections.indexOf(send)
      if (originalIndex > -1) {
        sseConnections.splice(originalIndex, 1)
      }
    }
  })
}
