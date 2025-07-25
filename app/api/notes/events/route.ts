import type { NextRequest } from "next/server"
import { sseConnections } from "@/lib/storage"

// Ensure this runs in Node.js runtime, not Edge
export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  console.log("SSE endpoint hit, setting up connection...")
  
  // Create a readable stream for SSE
  const readable = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder()
      
      // Send function for this connection
      const send = (data: string) => {
        try {
          controller.enqueue(encoder.encode(data))
        } catch (error) {
          console.error("Error sending SSE data:", error)
          cleanup()
        }
      }
      
      // Connection ID for debugging
      const connectionId = Date.now().toString()
      
      // Send initial connection message
      send('data: {"type":"connected"}\n\n')
      
      // Add to global connections
      sseConnections.push(send)
      console.log(`SSE connection ${connectionId} established. Total connections: ${sseConnections.length}`)
      
      // Keep-alive ping
      const pingInterval = setInterval(() => {
        try {
          send(': ping\n\n')
        } catch (error) {
          clearInterval(pingInterval)
          cleanup()
        }
      }, 30000)
      
      // Cleanup function
      const cleanup = () => {
        clearInterval(pingInterval)
        const index = sseConnections.indexOf(send)
        if (index > -1) {
          sseConnections.splice(index, 1)
          console.log(`SSE connection ${connectionId} closed. Remaining connections: ${sseConnections.length}`)
        }
        try {
          controller.close()
        } catch (error) {
          // Controller might already be closed
        }
      }
      
      // Handle client disconnect
      request.signal.addEventListener("abort", cleanup)
      
      // Timeout after 30 minutes
      setTimeout(cleanup, 30 * 60 * 1000)
    }
  })
  
  // Return the response with proper SSE headers
  return new Response(readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-store, no-transform",
      "Connection": "keep-alive",
      "X-Accel-Buffering": "no",
    },
  })
}