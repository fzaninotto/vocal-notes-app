# Real Estate Vocal Notes App

A voice recording application that automatically transcribes audio notes and extracts real estate property information using AI. Perfect for real estate agents who want to quickly capture property details during viewings.


<img width="1225" height="934" alt="image" src="https://github.com/user-attachments/assets/5fd5b491-2465-478c-83cd-f1dbb4468ca5" />

## Features

- 🎙️ **Voice Recording**: Record audio notes directly in the browser
- 🔊 **Audio Playback**: Play back recordings with a clean interface
- 📝 **Automatic Transcription**: Uses OpenAI's Whisper API to convert speech to text
- 🏠 **Property Information Extraction**: Automatically extracts and structures property details from transcriptions
- 🔄 **Real-time Updates**: Live updates via Server-Sent Events (SSE)
- 📊 **Smart Data Merging**: Intelligently merges property information across multiple recordings
- 🎯 **Room-level Detail**: Captures specific room information with smart deduplication

## Installation

### Prerequisites

- Node.js 18+ and npm
- OpenAI API key (for transcription and property extraction)

### Setup

1. Clone the repository:

```bash
git clone <repository-url>
cd vocal-notes-app
```

2. Install dependencies:

```bash
pnpm install
```

3. Create a `.env` file in the root directory:

```env
OPENAI_API_KEY=your_openai_api_key_here
```

4. Run the development server:

```bash
pnpm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

1. **Recording Notes**: Click the microphone button to start recording. Speak naturally about the property details.

2. **Property Information**: The app automatically extracts:
   - Property type (apartment, house, etc.)
   - Price and fees
   - Location details
   - Living area and plot size
   - Room descriptions
   - Equipment and amenities
   - Energy performance ratings

3. **Multiple Recordings**: Each recording enriches the property description. For example:
   - First recording: "This is a 3-bedroom apartment of 85 square meters"
   - Second recording: "The kitchen has marble countertops and modern appliances"
   - Third recording: "There's a beautiful terrace facing south"

## Code Organization

```
vocal-notes-app/
├── app/                          # Next.js App Router
│   ├── api/                      # API endpoints
│   │   ├── notes/               # Note management endpoints
│   │   │   ├── route.ts         # Create/list notes, handle transcription
│   │   │   ├── [id]/route.ts   # Delete specific notes
│   │   │   └── events/route.ts # SSE endpoint for real-time updates
│   │   ├── property/            # Property data endpoints
│   │   └── health/route.ts      # Health check endpoint
│   ├── layout.tsx               # Root layout
│   └── page.tsx                 # Main application page
│
├── components/                   # React components
│   ├── ui/                      # Shadcn UI components
│   ├── vocal-notes/             # App-specific components
│   │   ├── recording-controls.tsx
│   │   ├── notes-list.tsx
│   │   ├── note-item.tsx
│   │   └── connection-status.tsx
│   └── property-description.tsx # Property info display
│
├── hooks/                        # Custom React hooks
│   ├── use-vocal-notes.ts       # Main app logic hook
│   └── use-sse-connection.ts    # SSE connection management
│
├── lib/                          # Utility functions and schemas
│   ├── schema.ts                # Zod schema for property data
│   ├── storage.ts               # In-memory storage and SSE
│   └── utils/                   # Helper functions
│
└── public/                       # Static assets
```

### Key Components

#### Backend (`/app/api`)

- **Note Processing Pipeline**:
  1. Audio upload → Store in memory
  2. Transcription → OpenAI Whisper API
  3. Property extraction → OpenAI GPT-4 with structured outputs
  4. Data merging → Smart deduplication for rooms

- **Real-time Updates**: SSE broadcasts state changes to all connected clients

#### Frontend (`/components` & `/hooks`)

- **Recording Controls**: Browser-based audio recording with MediaRecorder API
- **Property Display**: Tabbed interface showing property details, rooms, and features
- **Status Indicators**: Visual feedback for processing stages (pending → transcribing → extracting → success)

#### Data Model (`/lib/schema.ts`)

Comprehensive Zod schema covering:

- Basic property information
- Pricing and financial details
- Location and address
- Room specifications
- Equipment and amenities
- Energy performance

### Room Matching Logic

The app intelligently handles multiple rooms of the same type:

- **Unique rooms** (kitchen, living room): Always updated
- **Multiple rooms** (bedrooms, bathrooms): Distinguished by:
  - Ordinal identifiers ("first bedroom", "second bedroom")
  - Floor level
  - Unique features

## Development

```bash
# Run development server
pnpm run dev

# Build for production
pnpm run build

# Start production server
pnpm start

# Run linting
pnpm run lint
```

## Architecture Decisions

1. **Next.js App Router**: Modern React framework with built-in API routes
2. **Server-Sent Events**: Real-time updates without WebSocket complexity
3. **In-Memory Storage**: Simple storage solution (consider database for production)
4. **Zod Schemas**: Type-safe data validation and OpenAI structured outputs
5. **Shadcn UI**: High-quality, customizable component library

## Future Enhancements

- Persistent storage (PostgreSQL/MongoDB)
- User authentication
- Export functionality (PDF, Excel)
- Photo upload and association
- Multi-language support
- Offline recording capability

## License

[Your License Here]
