# Alan AI

An AI-powered chatbot created as an homage to the brilliant mind of Alan Turing, the renowned mathematician and computer scientist. Alan is designed to guide users on an enlightening journey through the realm of artificial intelligence, philosophy of AI, computational creativity, and generative art.

## Features

- **GPT-4o Powered**: Uses OpenAI's latest and most capable model for intelligent conversations
- **Web Search Integration**: Built-in internet access using DuckDuckGo (no third-party API required)
- **PDF Export**: Download entire conversations as formatted PDFs for future reference
- **Alan Turing Focus**: Deep knowledge of Alan Turing's life, work, and contributions
- **AI & Art Expertise**: Comprehensive understanding of:
  - Artificial Intelligence (theoretical and technical)
  - Generative AI and creative coding
  - Art and AI intersections
  - Generative artists and AI art practices
  - Computational creativity
- **Responsive Design**: Fully responsive, liquid layout that adapts to all screen sizes
- **Streaming Responses**: Real-time streaming of AI responses for better user experience

## Tech Stack

- **Next.js** - React framework with API routes
- **OpenAI API** - GPT-4o model with function calling
- **Edge Runtime** - Fast, serverless API routes
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **jsPDF** - PDF generation for conversation export
- **React Cookie** - Cookie management for user sessions

## Getting Started

### Prerequisites

- Node.js 18+ and npm/pnpm
- OpenAI API key ([Get one here](https://platform.openai.com/api-keys))

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd alan-ai-mondrian
```

2. Install dependencies:
```bash
npm install
# or
pnpm install
```

3. Set up environment variables:

Create a `.env` file in the root directory:
```bash
OPENAI_API_KEY=your-openai-api-key-here
OPENAI_MODEL=gpt-4o  # Optional: defaults to gpt-4o
AI_TEMP=0.7          # Optional: temperature (default: 0.7)
AI_MAX_TOKENS=4000   # Optional: max tokens (default: 4000)
```

4. Run the development server:
```bash
npm run dev
# or
pnpm dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

### Chatting with Alan

- Start a conversation by typing a message and clicking "Say" or pressing Enter
- Alan can answer questions about:
  - Alan Turing's life and work
  - AI theory and implementation
  - Generative AI and creative coding
  - Art and AI intersections
  - Philosophy of AI
  - Current events (via web search)

### Downloading Conversations

- Click the "📥 Download PDF" button in the chat header
- The PDF will include:
  - Full conversation history
  - Formatted with speaker labels (Alan/You)
  - Timestamp and page numbers
  - Professional formatting

### Web Search

Alan automatically uses web search when needed for:
- Current events and news
- Recent developments
- Up-to-date information
- Facts that may not be in training data

No additional API keys required - uses DuckDuckGo HTML interface.

## Configuration

### Environment Variables

- `OPENAI_API_KEY` (required) - Your OpenAI API key
- `OPENAI_MODEL` (optional) - Model to use (default: `gpt-4o`)
  - Options: `gpt-4o`, `gpt-4-turbo`, `gpt-4`, `gpt-3.5-turbo`
- `AI_TEMP` (optional) - Temperature for responses (default: `0.7`)
- `AI_MAX_TOKENS` (optional) - Maximum tokens per response (default: `4000`)

## Project Structure

```
alan-ai-mondrian/
├── components/
│   ├── Chat.tsx          # Main chat component
│   ├── ChatLine.tsx      # Individual message component
│   ├── Button.tsx        # Reusable button component
│   └── Layout.tsx        # App layout wrapper
├── pages/
│   ├── index.tsx         # Main page
│   ├── _app.tsx          # App wrapper with CookiesProvider
│   └── api/
│       └── chat.ts       # Chat API endpoint with function calling
├── utils/
│   ├── OpenAIStream.ts   # OpenAI streaming utility
│   ├── webSearch.ts      # Web search functionality
│   └── generatePDF.ts    # PDF generation utility
└── .env                  # Environment variables (not in git)
```

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import your repository on [Vercel](https://vercel.com)
3. Add your `OPENAI_API_KEY` environment variable
4. Deploy!

The app is optimized for Vercel's Edge Runtime.

## Educational Use

This project is created for experimental and educational purposes by **Marlon Barrios Solano** as part of educational activities. The AI can provide inaccurate information - always verify important facts.

## Credits

- **Concept and Development**: [Marlon Barrios Solano](https://marlonbarrios.github.io/)
- **Inspired by**: Alan Turing's life and contributions to computer science and AI
- **Built with**: Next.js, OpenAI API, and modern web technologies

## License

MIT

## Disclaimer

Advanced AI created for experimental and educational purposes. The AI can give inaccurate information. Created to be used in the context of Marlon Barrios Solano's educational activities.
