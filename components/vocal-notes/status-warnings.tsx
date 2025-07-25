import { Card, CardContent } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"

interface StatusWarningsProps {
  apiStatus: {
    healthy: boolean
    openaiConfigured: boolean
    error?: string
  }
}

export function StatusWarnings({ apiStatus }: StatusWarningsProps) {
  if (apiStatus.healthy && apiStatus.openaiConfigured) {
    return null
  }

  return (
    <>
      {/* API Status Warning */}
      {!apiStatus.healthy && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-800">
              <AlertCircle className="w-5 h-5" />
              <div>
                <p className="font-medium">API Connection Issue</p>
                <p className="text-sm">
                  {apiStatus.error || "Unable to connect to the backend API"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* OpenAI Configuration Warning */}
      {apiStatus.healthy && !apiStatus.openaiConfigured && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-yellow-800">
              <AlertCircle className="w-5 h-5" />
              <div>
                <p className="font-medium">Transcription Disabled</p>
                <p className="text-sm">
                  OpenAI API key not configured. Recordings will be saved but
                  not transcribed.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  )
}