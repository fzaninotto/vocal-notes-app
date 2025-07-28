import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Pause, Trash2 } from "lucide-react";

export interface VocalNote {
  id: string;
  audioUrl: string;
  duration: number;
  createdAt: string;
  title: string;
  status: "pending" | "transcribing" | "extracting" | "success" | "error";
  transcription?: string;
}

interface NoteItemProps {
  note: VocalNote;
  isPlaying: boolean;
  onPlay: () => void;
  onDelete: () => void;
  formatTime: (seconds: number) => string;
  formatDate: (dateString: string) => string;
}

export function NoteItem({
  note,
  isPlaying,
  onPlay,
  onDelete,
  formatTime,
  formatDate,
}: NoteItemProps) {
  return (
    <div className="border rounded-lg p-4 hover:bg-gray-50">
      <div className="flex items-start gap-3">
        <Button
          onClick={onPlay}
          variant="outline"
          size="sm"
          className="shrink-0 mt-1"
        >
          {isPlaying ? (
            <Pause className="w-4 h-4" />
          ) : (
            <Play className="w-4 h-4" />
          )}
        </Button>

        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm truncate">{note.title}</div>
          <div className="text-xs text-gray-500 mb-2">
            {formatDate(note.createdAt)} • {formatTime(note.duration)}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Badge
            variant={
              note.status === "success"
                ? "default"
                : note.status === "error"
                ? "destructive"
                : "secondary"
            }
            className={
              note.status === "success"
                ? "bg-green-100 text-green-800 hover:bg-green-100"
                : note.status === "error"
                ? ""
                : note.status === "transcribing"
                ? "bg-blue-100 text-blue-800 hover:bg-blue-100"
                : note.status === "extracting"
                ? "bg-purple-100 text-purple-800 hover:bg-purple-100"
                : "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
            }
          >
            {note.status === "success" ? "processed" : note.status}
          </Badge>

          <Button
            onClick={onDelete}
            variant="ghost"
            size="sm"
            className="shrink-0 text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {note.transcription && (
        <div className="mt-2">
          <div className="bg-gray-100 rounded p-2 text-sm">
            <strong>Transcription:</strong>
            <p className="mt-1">{note.transcription}</p>
          </div>
        </div>
      )}
    </div>
  );
}
