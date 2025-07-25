import { Wifi, WifiOff } from "lucide-react"

interface ConnectionStatusProps {
  status: "connected" | "disconnected" | "reconnecting"
}

export function ConnectionStatus({ status }: ConnectionStatusProps) {
  return (
    <div className="flex items-center justify-center gap-2 mt-2">
      {status === "connected" ? (
        <>
          <Wifi className="w-4 h-4 text-green-600" />
          <span className="text-sm text-green-600">Real-time updates active</span>
        </>
      ) : status === "reconnecting" ? (
        <>
          <WifiOff className="w-4 h-4 text-yellow-600" />
          <span className="text-sm text-yellow-600">Reconnecting...</span>
        </>
      ) : (
        <>
          <WifiOff className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-500">Using polling updates</span>
        </>
      )}
    </div>
  )
}