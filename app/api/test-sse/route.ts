export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET() {
  const encoder = new TextEncoder()
  
  const readable = new ReadableStream({
    async start(controller) {
      // Send a test message immediately
      controller.enqueue(encoder.encode('data: {"message": "SSE test working"}\n\n'))
      
      // Send another message after 1 second
      await new Promise(resolve => setTimeout(resolve, 1000))
      controller.enqueue(encoder.encode('data: {"message": "Second message"}\n\n'))
      
      // Close after 2 seconds
      await new Promise(resolve => setTimeout(resolve, 1000))
      controller.close()
    }
  })
  
  return new Response(readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  })
}