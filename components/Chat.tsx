import { useEffect, useState } from 'react'
import { Button } from './Button'
import { type ChatGPTMessage, ChatLine, LoadingChatLine } from './ChatLine'
import { useCookies } from 'react-cookie'
import { downloadConversationAsPDF } from '../utils/generatePDF'

const COOKIE_NAME = 'nextjs-example-ai-chat-gpt3'

// default first message to display in UI (not necessary to define the prompt)
export const initialMessages: ChatGPTMessage[] = [
  {
    role: 'assistant',
    content: "Hello, I am Alan, your AI tutor. I am here to help you learn about Alan Turing's life and work  and also answer questions about AI. What would you like to know?",
  },
]

interface InputMessageProps {
  input: string
  setInput: (value: string) => void
  sendMessage: (message: string) => void
}

const InputMessage = ({ input, setInput, sendMessage }: InputMessageProps) => (
  <div className="mt-6 flex clear-both">
    <input
      type="text"
      aria-label="chat input"
      required
      className="min-w-0 flex-auto appearance-none rounded-md border border-zinc-900/10 bg-white px-3 py-[calc(theme(spacing.2)-1px)] shadow-md shadow-zinc-800/5 placeholder:text-zinc-400 focus:border-teal-500 focus:outline-none focus:ring-4 focus:ring-teal-500/10 sm:text-sm"
      value={input}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          sendMessage(input)
          setInput('')
        }
      }}
      onChange={(e) => {
        setInput(e.target.value)
      }}
    />
    <Button
      type="submit"
      className="ml-4 flex-none"
      onClick={() => {
        sendMessage(input)
        setInput('')
      }}
    >
      Say
    </Button>
  </div>
)

export function Chat() {
  const [messages, setMessages] = useState<ChatGPTMessage[]>(initialMessages)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [cookie, setCookie] = useCookies([COOKIE_NAME])

  useEffect(() => {
    if (!cookie[COOKIE_NAME]) {
      // generate a semi random short id
      const randomId = Math.random().toString(36).substring(7)
      setCookie(COOKIE_NAME, randomId)
    }
  }, [cookie, setCookie])

  // send message to API /api/chat endpoint
  const sendMessage = async (message: string) => {
    setLoading(true)
    const newMessages = [
      ...messages,
      { role: 'user', content: message } as ChatGPTMessage,
    ]
    setMessages(newMessages)
    const last10messages = newMessages.slice(-10) // remember last 10 messages

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: last10messages,
          user: cookie[COOKIE_NAME],
        }),
      })

      console.log('Edge function returned.')

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: { message: response.statusText } }))
        const errorMessage = errorData.error?.message || errorData.error || `Server error: ${response.status} ${response.statusText}`
        throw new Error(errorMessage)
      }

      // This data is a ReadableStream
      const data = response.body
      if (!data) {
        setLoading(false)
        return
      }

      const reader = data.getReader()
      const decoder = new TextDecoder()
      let done = false

      let lastMessage = ''

      try {
        while (!done) {
          const { value, done: doneReading } = await reader.read()
          done = doneReading
          if (value) {
            const chunkValue = decoder.decode(value)
            lastMessage = lastMessage + chunkValue

            setMessages([
              ...newMessages,
              { role: 'assistant', content: lastMessage } as ChatGPTMessage,
            ])
          }
        }
      } finally {
        setLoading(false)
        reader.releaseLock()
      }
    } catch (error: any) {
      console.error('Error sending message:', error)
      setLoading(false)
      setMessages([
        ...newMessages,
        {
          role: 'assistant',
          content: `Sorry, I encountered an error: ${error.message || 'Unknown error'}. Please check your OpenAI API key and try again.`,
        } as ChatGPTMessage,
      ])
    }
  }

  const handleDownloadPDF = async () => {
    try {
      await downloadConversationAsPDF(messages)
    } catch (error) {
      console.error('Error generating PDF:', error)
      alert('Failed to generate PDF. Please try again.')
    }
  }

  return (
    <div className="w-full rounded-2xl border-zinc-100 lg:border lg:p-6">
      <div className="flex justify-between items-center mb-4 pb-4 border-b border-zinc-200">
        <h2 className="text-lg font-semibold text-zinc-800">Conversation with Alan</h2>
        {messages.length > 1 && (
          <Button
            onClick={handleDownloadPDF}
            className="text-sm px-4 py-2"
            title="Download conversation as PDF"
          >
            📥 Download PDF
          </Button>
        )}
      </div>
      {messages.map(({ content, role }, index) => (
        <ChatLine key={index} role={role} content={content} />
      ))}

      {loading && <LoadingChatLine />}

      {messages.length < 2 && (
        <span className="mx-auto flex flex-grow text-gray-600 clear-both">
          Type a message to start the conversation
        </span>
      )}
      <InputMessage
        input={input}
        setInput={setInput}
        sendMessage={sendMessage}
      />
    </div>
  )
}
