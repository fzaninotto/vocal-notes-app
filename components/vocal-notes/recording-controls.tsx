import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Mic, Square, Pause, Play } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

type RecordingState = "idle" | "recording" | "paused"

interface RecordingControlsProps {
  onRecordingComplete: (audioBlob: Blob, duration: number, title: string) => void
  isUploading: boolean
  isDisabled: boolean
}

export function RecordingControls({ 
  onRecordingComplete, 
  isUploading, 
  isDisabled 
}: RecordingControlsProps) {
  const [recordingState, setRecordingState] = useState<RecordingState>("idle")
  const [recordingTime, setRecordingTime] = useState(0)
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  
  const { toast } = useToast()

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/wav",
        })

        const title = `Note ${new Date().toLocaleString()}`
        onRecordingComplete(audioBlob, recordingTime, title)

        // Clean up
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop())
          streamRef.current = null
        }
        setRecordingTime(0)
      }

      mediaRecorder.start()
      setRecordingState("recording")

      // Start recording timer
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1)
      }, 1000)
    } catch (error) {
      console.error("Error accessing microphone:", error)
      toast({
        title: "Microphone access denied",
        description: "Please allow microphone access to record notes.",
        variant: "destructive",
      })
    }
  }

  const pauseRecording = () => {
    if (mediaRecorderRef.current && recordingState === "recording") {
      mediaRecorderRef.current.pause()
      setRecordingState("paused")
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current)
      }
    }
  }

  const resumeRecording = () => {
    if (mediaRecorderRef.current && recordingState === "paused") {
      mediaRecorderRef.current.resume()
      setRecordingState("recording")
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1)
      }, 1000)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop()
      setRecordingState("idle")
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current)
      }
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mic className="w-5 h-5" />
          Recording
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {recordingState === "idle" ? (
          <Button
            onClick={startRecording}
            className="w-full"
            size="lg"
            disabled={isUploading || isDisabled}
          >
            <Mic className="w-4 h-4 mr-2" />
            {isUploading ? "Uploading..." : "Add Note"}
          </Button>
        ) : (
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-2xl font-mono font-bold text-red-600">
                {formatTime(recordingTime)}
              </div>
              <Badge
                variant={
                  recordingState === "recording"
                    ? "destructive"
                    : "secondary"
                }
              >
                {recordingState === "recording" ? "Recording..." : "Paused"}
              </Badge>
            </div>
            <div className="flex gap-2">
              {recordingState === "recording" ? (
                <Button
                  onClick={pauseRecording}
                  variant="outline"
                  className="flex-1 bg-transparent"
                >
                  <Pause className="w-4 h-4 mr-2" />
                  Pause
                </Button>
              ) : (
                <Button
                  onClick={resumeRecording}
                  variant="outline"
                  className="flex-1 bg-transparent"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Resume
                </Button>
              )}
              <Button
                onClick={stopRecording}
                variant="destructive"
                className="flex-1"
              >
                <Square className="w-4 h-4 mr-2" />
                Stop
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}