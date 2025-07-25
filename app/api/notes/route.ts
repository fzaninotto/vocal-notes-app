import { type NextRequest, NextResponse } from "next/server"
import { notes, broadcastToSSE, sseConnections } from "@/lib/storage"

// Ensure this runs in Node.js runtime, not Edge
export const runtime = "nodejs"

export async function GET() {
  try {
    return NextResponse.json({ notes })
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

    // Update note with transcription
    const noteIndex = notes.findIndex((note) => note.id === noteId)
    if (noteIndex !== -1) {
      notes[noteIndex] = {
        ...notes[noteIndex],
        status: "processed",
        transcription: typeof transcription === "string" ? transcription : transcription.text,
      }

      // Notify all SSE connections about the update
      console.log("Broadcasting note_updated event for transcribed note:", noteId)
      broadcastToSSE({
        type: "note_updated",
        note: notes[noteIndex],
      })

      console.log("Note updated with transcription:", noteId, "SSE connections:", sseConnections.length)
    }
  } catch (error) {
    console.error("Error processing transcription:", error)
    updateNoteStatus(noteId, "error")
  }
}

function updateNoteStatus(noteId: string, status: "pending" | "processed" | "error") {
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
