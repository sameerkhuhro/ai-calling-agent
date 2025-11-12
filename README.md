# AI-Powered Outbound Calling Agent

A complete AI-powered outbound calling system that can make phone calls, interact naturally with HR representatives, and store conversation data (transcript + summary) in a database.

## 🚀 Features

- **Real-Time Voice Interaction**: Speech-to-Text (Deepgram) and Text-to-Speech (ElevenLabs)
- **AI Conversation Logic**: Dynamic conversations powered by OpenAI GPT
- **Calling Functionality**: Outbound calls via Twilio Programmable Voice API with WebSocket audio streaming
- **Data Management**: SQLite database for storing transcripts, summaries, and extracted answers
- **Dashboard**: React frontend for viewing calls and transcripts

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Twilio account with Programmable Voice enabled
- OpenAI API key
- Deepgram API key (for STT)
- ElevenLabs API key (for TTS)

## 🛠️ Installation

1. **Install dependencies (root + client):**
   ```bash
   npm run install-all
   ```

2. **Configure environment variables:**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your API keys:
   - `TWILIO_ACCOUNT_SID` and `TWILIO_AUTH_TOKEN`
   - `TWILIO_PHONE_NUMBER` (your Twilio phone number)
   - `OPENAI_API_KEY`
   - `DEEPGRAM_API_KEY`
   - `ELEVENLABS_API_KEY`

3. **Start the development server:**
   ```bash
   npm run dev
   ```

   This will start:
   - Backend server on `http://localhost:3001`
   - React frontend on `http://localhost:3000`

## 📁 Project Structure

```
.
├── server/
│   ├── index.js              # Express server entry point
│   ├── database/
│   │   └── db.js             # SQLite database setup
│   ├── models/
│   │   └── Call.js           # Call data model
│   ├── services/
│   │   ├── aiService.js      # OpenAI conversation logic
│   │   ├── sttService.js     # Deepgram STT integration
│   │   ├── ttsService.js     # ElevenLabs TTS integration
│   │   ├── callService.js    # Twilio calling logic
│   │   └── websocketService.js # WebSocket audio streaming
│   └── routes/
│       └── calls.js          # API routes for calls
├── client/                   # React frontend
└── data/                     # SQLite database (auto-created)
```

## 🔌 API Endpoints

### Initiate a Call
```bash
POST /api/calls/initiate
Body: { "phone_number": "+1234567890" }
```

### Get All Calls
```bash
GET /api/calls?limit=50&offset=0
```

### Get Specific Call
```bash
GET /api/calls/:id
```

### Delete Call
```bash
DELETE /api/calls/:id
```

## 🎯 Usage

### Making a Call

1. **Via API (curl example):**
   ```bash
   curl -X POST http://localhost:3001/api/calls/initiate \
     -H "Content-Type: application/json" \
     -d '{"phone_number": "+1234567890"}'
   ```

2. **Via Dashboard:**
   - Open `http://localhost:3000`
   - Enter phone number and click "Initiate Call"

### Conversation Flow

The AI agent follows this conversation flow:
1. **Greeting**: Warm, professional greeting
2. **Introduction**: Brief introduction and purpose
3. **Job Inquiry**: Asks about hiring status for fresh graduates
4. **Data Collection**: Collects responses naturally
5. **Closing**: Polite closing

## 🗄️ Database Schema

```sql
CREATE TABLE calls (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  phone_number TEXT NOT NULL,
  transcript TEXT,
  summary TEXT,
  extracted_answers TEXT,
  status TEXT DEFAULT 'initiated',
  duration INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

## 🔧 Configuration

### Twilio Setup
1. Sign up at [Twilio](https://www.twilio.com/)
2. Get a phone number with Voice capabilities
3. Add credentials to `.env`
4. In the Twilio Console, configure a Voice webhook (TwiML App or number) to `https://<YOUR_DOMAIN>/api/calls/twiml/{CALL_ID}`. During local development, expose your server with ngrok and update `BASE_URL`.
5. Ensure the caller phone number is verified for trial accounts.

### OpenAI Setup
1. Get API key from [OpenAI](https://platform.openai.com/)
2. Add to `.env` as `OPENAI_API_KEY`

### Deepgram Setup
1. Sign up at [Deepgram](https://deepgram.com/)
2. Get API key and add to `.env`
3. (Optional) Adjust STT model options in `server/services/sttService.js`

### ElevenLabs Setup
1. Sign up at [ElevenLabs](https://elevenlabs.io/)
2. Get API key and add to `.env`
3. Optionally configure `ELEVENLABS_VOICE_ID` for different voices

## 🎨 Frontend Dashboard

The React dashboard provides:
- List of all calls with status
- View call transcripts
- View AI-generated summaries
- View extracted answers
- Initiate new calls

## ⚠️ Notes & Caveats

- **Streaming Flow**: Twilio streams audio to `/api/calls/stream/{CALL_ID}`. Each chunk is transcribed, routed through GPT, and returned as synthesized speech.
- **Latency Considerations**: This prototype transcribes chunked audio (`transcribeBuffer`). For lower latency and interim transcripts, upgrade to full-duplex streaming (`transcribeStream`) and Twilio's bidirectional streams.
- **Public Reachability**: Twilio must access your server. Deploy to a public host or use ngrok and update `BASE_URL`.
- **Audio Encoding**: Twilio expects μ-law 8kHz audio when streaming responses. The current implementation includes a placeholder—add audio transcoding (e.g., with FFmpeg/prism-media) before enabling live backchannel audio.
- **Usage Costs**: Monitor usage across Twilio, OpenAI, Deepgram, and ElevenLabs—each charges per use.
- **Compliance**: Confirm calling, recording, and data retention regulations in the regions you operate.

## 🚧 Future Enhancements

- [ ] WebSocket server for real-time audio streaming
- [ ] Support for multiple languages
- [ ] Call recording and playback
- [ ] Advanced analytics dashboard
- [ ] Integration with CRM systems
- [ ] Scheduled calling
- [ ] Call quality metrics

## 📝 License

MIT

