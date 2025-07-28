import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mic, MessageSquareQuote } from "lucide-react";
import { NoteItem, type VocalNote } from "./note-item";

interface NotesListProps {
  notes: VocalNote[];
  playingNoteId: string | null;
  onPlayNote: (note: VocalNote) => void;
  onDeleteNote: (noteId: string) => void;
  formatTime: (seconds: number) => string;
  formatDate: (dateString: string) => string;
}

export function NotesList({
  notes,
  playingNoteId,
  onPlayNote,
  onDeleteNote,
  formatTime,
  formatDate,
}: NotesListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquareQuote className="h-5 w-5" />
          Your Notes ({notes.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {notes.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Mic className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No vocal notes yet. Start recording your first note!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {notes.map((note) => (
              <NoteItem
                key={note.id}
                note={note}
                isPlaying={playingNoteId === note.id}
                onPlay={() => onPlayNote(note)}
                onDelete={() => onDeleteNote(note.id)}
                formatTime={formatTime}
                formatDate={formatDate}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
