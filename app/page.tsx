"use client"

import { ConnectionStatus } from "@/components/vocal-notes/connection-status"
import { StatusWarnings } from "@/components/vocal-notes/status-warnings"
import { RecordingControls } from "@/components/vocal-notes/recording-controls"
import { NotesList } from "@/components/vocal-notes/notes-list"
import { useVocalNotes } from "@/hooks/use-vocal-notes"
import { formatTime, formatDate } from "@/lib/utils/format"

export default function VocalNotesApp() {
  const {
    notes,
    playingNoteId,
    isUploading,
    apiStatus,
    connectionStatus,
    uploadRecording,
    playNote,
    deleteNote,
  } = useVocalNotes()

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Vocal Notes</h1>
          <p className="text-gray-600">
            Record and automatically transcribe your voice notes
          </p>
          <ConnectionStatus status={connectionStatus} />
        </div>

        <StatusWarnings apiStatus={apiStatus} />

        <RecordingControls
          onRecordingComplete={uploadRecording}
          isUploading={isUploading}
          isDisabled={!apiStatus.healthy}
        />

        <NotesList
          notes={notes}
          playingNoteId={playingNoteId}
          onPlayNote={playNote}
          onDeleteNote={deleteNote}
          formatTime={formatTime}
          formatDate={formatDate}
        />
      </div>
    </div>
  )
}