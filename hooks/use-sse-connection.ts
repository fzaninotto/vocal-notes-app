import { useEffect, useRef, useState } from "react"

interface SSEConnectionOptions {
  onMessage: (data: any) => void
  onConnectionChange?: (status: "connected" | "disconnected" | "reconnecting") => void
  reconnectDelay?: number
}

export function useSSEConnection(url: string, options: SSEConnectionOptions) {
  const [connectionStatus, setConnectionStatus] = useState<"connected" | "disconnected" | "reconnecting">("disconnected")
  const eventSourceRef = useRef<EventSource | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  
  const { onMessage, onConnectionChange, reconnectDelay = 10000 } = options

  useEffect(() => {
    let mounted = true

    const setupSSE = () => {
      if (!mounted) return

      try {
        console.log("Setting up SSE connection...")
        const eventSource = new EventSource(url)
        eventSourceRef.current = eventSource

        eventSource.onopen = () => {
          if (!mounted) return
          console.log("SSE connection opened")
          setConnectionStatus("connected")
          onConnectionChange?.("connected")
        }

        eventSource.onmessage = (event) => {
          if (!mounted) return
          
          try {
            // Skip ping messages
            if (event.data === ": ping") {
              return
            }
            
            const data = JSON.parse(event.data)
            console.log("SSE message received:", data)

            if (data.type === "connected") {
              console.log("SSE connected successfully")
              return
            }

            onMessage(data)
          } catch (error) {
            console.error("Error parsing SSE data:", error)
          }
        }

        eventSource.onerror = (error) => {
          if (!mounted) return
          
          console.error("SSE error:", error)
          setConnectionStatus("disconnected")
          onConnectionChange?.("disconnected")

          // Close the current connection
          eventSource.close()
          eventSourceRef.current = null

          // Try to reconnect after a delay
          if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current)
          }
          
          reconnectTimeoutRef.current = setTimeout(() => {
            if (!mounted) return
            console.log("Attempting to reconnect SSE...")
            setConnectionStatus("reconnecting")
            onConnectionChange?.("reconnecting")
            setupSSE()
          }, reconnectDelay)
        }
      } catch (error) {
        console.error("Failed to setup SSE:", error)
        setConnectionStatus("disconnected")
        onConnectionChange?.("disconnected")
      }
    }

    setupSSE()

    return () => {
      mounted = false
      
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
      }
      
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
    }
  }, [url, onMessage, onConnectionChange, reconnectDelay])

  return connectionStatus
}