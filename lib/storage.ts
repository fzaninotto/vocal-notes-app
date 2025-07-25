interface VocalNote {
  id: string
  audioUrl: string
  duration: number
  createdAt: string
  title: string
  status: "pending" | "processed" | "error"
  transcription?: string
}

// Global singleton for storage that persists across requests
const globalForStorage = global as typeof globalThis & {
  notes?: VocalNote[]
  sseConnections?: Array<(data: string) => void>
}

// In-memory storage for notes
export const notes: VocalNote[] = globalForStorage.notes ?? []
globalForStorage.notes = notes

// Store for SSE connections
export const sseConnections: Array<(data: string) => void> = globalForStorage.sseConnections ?? []
globalForStorage.sseConnections = sseConnections

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
