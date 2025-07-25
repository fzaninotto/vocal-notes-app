import { type NextRequest, NextResponse } from "next/server"
import { notes, broadcastToSSE } from "@/lib/storage"

// Ensure this runs in Node.js runtime, not Edge
export const runtime = "nodejs"

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { status } = await request.json()
    const noteId = params.id

    const noteIndex = notes.findIndex((note) => note.id === noteId)
    if (noteIndex === -1) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 })
    }

    notes[noteIndex] = {
      ...notes[noteIndex],
      status,
    }

    // Broadcast the update
    broadcastToSSE({
      type: "note_updated",
      note: notes[noteIndex],
    })

    return NextResponse.json({ note: notes[noteIndex] })
  } catch (error) {
    console.error("Error updating note:", error)
    return NextResponse.json({ error: "Failed to update note" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const noteId = params.id
    const noteIndex = notes.findIndex((note) => note.id === noteId)

    if (noteIndex === -1) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 })
    }

    notes.splice(noteIndex, 1)

    // Broadcast the deletion
    broadcastToSSE({
      type: "note_deleted",
      noteId: noteId,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting note:", error)
    return NextResponse.json({ error: "Failed to delete note" }, { status: 500 })
  }
}
