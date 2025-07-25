import { useState, useRef, useEffect, useCallback } from "react"
import { useToast } from "@/hooks/use-toast"
import { useSSEConnection } from "./use-sse-connection"

interface VocalNote {
  id: string
  audioUrl: string
  duration: number
  createdAt: string
  title: string
  status: "pending" | "processed" | "error"
  transcription?: string
}

interface ApiStatus {
  healthy: boolean
  openaiConfigured: boolean
  error?: string
}

export function useVocalNotes() {
  const [notes, setNotes] = useState<VocalNote[]>([])
  const [playingNoteId, setPlayingNoteId] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [apiStatus, setApiStatus] = useState<ApiStatus>({
    healthy: false,
    openaiConfigured: false,
  })

  const audioElementsRef = useRef<{ [key: string]: HTMLAudioElement }>({})
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  
  const { toast } = useToast()

  // Load notes from API
  const loadNotes = useCallback(async () => {
    try {
      const response = await fetch("/api/notes")

      if (!response.ok) {
        const errorText = await response.text()
        console.error("API Error Response:", errorText)
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const text = await response.text()

      if (!text) {
        console.log("Empty response from server")
        setNotes([])
        return
      }

      try {
        const data = JSON.parse(text)
        setNotes(data.notes || [])
      } catch (parseError) {
        console.error("JSON parse error:", parseError)
        console.error("Response text:", text)
        throw new Error("Invalid JSON response from server")
      }
    } catch (error) {
      console.error("Error loading notes:", error)
      toast({
        title: "Error loading notes",
        description: "Failed to load your notes from the server. Please check the console for details.",
        variant: "destructive",
      })
    }
  }, [toast])

  // Check API health
  const checkApiHealth = useCallback(async () => {
    try {
      const response = await fetch("/api/health")
      if (response.ok) {
        const data = await response.json()
        setApiStatus({
          healthy: true,
          openaiConfigured: data.openai_configured,
        })
      } else {
        setApiStatus({
          healthy: false,
          openaiConfigured: false,
          error: `API health check failed: ${response.status}`,
        })
      }
    } catch (error) {
      console.error("Health check failed:", error)
      setApiStatus({
        healthy: false,
        openaiConfigured: false,
        error: "Failed to connect to API",
      })
    }
  }, [])

  // Handle real-time updates
  const handleRealTimeUpdate = useCallback((data: any) => {
    if (data.type === "note_added") {
      setNotes((prev) => [data.note, ...prev])
    } else if (data.type === "note_updated") {
      setNotes((prev) =>
        prev.map((note) => (note.id === data.note.id ? data.note : note))
      )

      if (data.note.status === "processed") {
        toast({
          title: "Transcription complete",
          description: "Your voice note has been transcribed successfully.",
        })
      } else if (data.note.status === "error") {
        toast({
          title: "Transcription failed",
          description: "There was an error processing your voice note.",
          variant: "destructive",
        })
      }
    } else if (data.type === "note_deleted") {
      setNotes((prev) => prev.filter((note) => note.id !== data.noteId))
    }
  }, [toast])

  // Handle connection status changes
  const handleConnectionChange = useCallback((status: "connected" | "disconnected" | "reconnecting") => {
    if (status === "disconnected") {
      // Start polling as fallback
      console.log("Starting polling fallback...")
      if (!pollingIntervalRef.current) {
        pollingIntervalRef.current = setInterval(() => {
          loadNotes()
        }, 3000)
      }
    } else if (status === "connected") {
      // Stop polling when SSE is connected
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
        pollingIntervalRef.current = null
      }
    }
  }, [loadNotes])

  // Use SSE connection
  const connectionStatus = useSSEConnection(
    `${typeof window !== 'undefined' ? window.location.origin : ''}/api/notes/events`,
    {
      onMessage: handleRealTimeUpdate,
      onConnectionChange: handleConnectionChange,
    }
  )

  // Upload recording
  const uploadRecording = useCallback(async (audioBlob: Blob, duration: number, title: string) => {
    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append("audio", audioBlob, "recording.wav")
      formData.append("duration", duration.toString())
      formData.append("title", title)

      const response = await fetch("/api/notes", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Upload error response:", errorText)
        throw new Error("Failed to upload recording")
      }

      toast({
        title: "Recording uploaded",
        description: apiStatus.openaiConfigured
          ? "Your voice note is being processed..."
          : "Recording saved (transcription disabled - no OpenAI key)",
      })

      // If we're using polling, refresh the notes immediately
      if (connectionStatus === "disconnected") {
        setTimeout(loadNotes, 1000)
      }
    } catch (error) {
      console.error("Error uploading recording:", error)
      toast({
        title: "Upload failed",
        description: "Failed to upload your recording. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }, [apiStatus.openaiConfigured, connectionStatus, loadNotes, toast])

  // Play note
  const playNote = useCallback((note: VocalNote) => {
    if (!note.audioUrl) {
      toast({
        title: "No audio available",
        description: "This note doesn't have audio data.",
        variant: "destructive",
      })
      return
    }

    // Stop currently playing audio if any
    if (playingNoteId && audioElementsRef.current[playingNoteId]) {
      audioElementsRef.current[playingNoteId].pause()
      audioElementsRef.current[playingNoteId].currentTime = 0
    }

    // Create or get audio element for this note
    if (!audioElementsRef.current[note.id]) {
      const audio = new Audio(note.audioUrl)
      audioElementsRef.current[note.id] = audio

      audio.onended = () => {
        setPlayingNoteId(null)
      }

      audio.onerror = (error) => {
        console.error("Audio playback error:", error)
        toast({
          title: "Playback failed",
          description: "Failed to play the audio file.",
          variant: "destructive",
        })
        setPlayingNoteId(null)
      }
    }

    const audio = audioElementsRef.current[note.id]

    if (playingNoteId === note.id) {
      // Pause if currently playing
      audio.pause()
      setPlayingNoteId(null)
    } else {
      // Play the audio
      audio.play().catch((error) => {
        console.error("Failed to play audio:", error)
        toast({
          title: "Playback failed",
          description: "Failed to play the audio file.",
          variant: "destructive",
        })
      })
      setPlayingNoteId(note.id)
    }
  }, [playingNoteId, toast])

  // Delete note
  const deleteNote = useCallback(async (noteId: string) => {
    try {
      const response = await fetch(`/api/notes/${noteId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete note")
      }

      setNotes((prev) => prev.filter((note) => note.id !== noteId))

      if (audioElementsRef.current[noteId]) {
        audioElementsRef.current[noteId].pause()
        delete audioElementsRef.current[noteId]
      }

      if (playingNoteId === noteId) {
        setPlayingNoteId(null)
      }

      toast({
        title: "Note deleted",
        description: "The vocal note has been deleted.",
      })
    } catch (error) {
      console.error("Error deleting note:", error)
      toast({
        title: "Delete failed",
        description: "Failed to delete the note. Please try again.",
        variant: "destructive",
      })
    }
  }, [playingNoteId, toast])

  // Initial load
  useEffect(() => {
    checkApiHealth()
    loadNotes()

    return () => {
      // Cleanup
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
      }
    }
  }, [checkApiHealth, loadNotes])

  return {
    notes,
    playingNoteId,
    isUploading,
    apiStatus,
    connectionStatus,
    uploadRecording,
    playNote,
    deleteNote,
  }
}