import { NextResponse } from "next/server"

// Ensure this runs in Node.js runtime, not Edge
export const runtime = "nodejs"

export async function GET() {
  try {
    const hasOpenAIKey = !!process.env.OPENAI_API_KEY

    return NextResponse.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      openai_configured: hasOpenAIKey,
      runtime: "nodejs",
    })
  } catch (error) {
    console.error("Health check error:", error)
    return NextResponse.json(
      {
        status: "error",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
