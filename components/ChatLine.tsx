import React, { useState } from 'react'
import clsx from 'clsx'
import Balancer from 'react-wrap-balancer'
import { CodeRunner } from './CodeRunner'

// wrap Balancer to remove type errors :( - @TODO - fix this ugly hack
const BalancerWrapper = (props: any) => <Balancer {...props} />

type ChatGPTAgent = 'user' | 'system' | 'assistant'

export interface ChatGPTMessage {
  role: ChatGPTAgent
  content: string
}

// Code block component with copy button
const CodeBlock = ({ code, language }: { code: string; language: string }) => {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy code:', err)
    }
  }

  return (
    <div className="my-3 relative group w-full">
      <div className="absolute top-2 right-2 z-10">
        <button
          onClick={copyToClipboard}
          className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 text-xs rounded-md transition-colors flex items-center gap-1.5 shadow-lg"
          title={copied ? 'Copied!' : 'Copy code'}
        >
          {copied ? (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Copied!</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="bg-zinc-900 text-zinc-100 pt-4 pb-4 pl-4 pr-20 rounded-lg overflow-x-auto text-sm font-mono w-full whitespace-pre-wrap break-words">
        <code className={`language-${language}`}>{code}</code>
      </pre>
      <CodeRunner code={code} language={language} />
    </div>
  )
}

// loading placeholder animation for the chat line
export const LoadingChatLine = () => (
  <div className="flex min-w-full animate-pulse px-4 py-5 sm:px-6">
    <div className="flex flex-grow space-x-3">
      <div className="min-w-0 flex-1">
        <p className="font-large text-xxl text-gray-900">
          <a href="#" className="hover:underline">
          Alan
          </a>
        </p>
        <div className="space-y-4 pt-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2 h-2 rounded bg-zinc-500"></div>
            <div className="col-span-1 h-2 rounded bg-zinc-500"></div>
          </div>
          <div className="h-2 rounded bg-zinc-500"></div>
        </div>
      </div>
    </div>
  </div>
)
// Helper to format code blocks and text
const formatMessage = (text: string) => {
  const parts: JSX.Element[] = []
  let key = 0
  
  // Split by code blocks (```language\ncode\n```)
  const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g
  let lastIndex = 0
  let match
  
  while ((match = codeBlockRegex.exec(text)) !== null) {
    // Add text before code block
    if (match.index > lastIndex) {
      const beforeText = text.substring(lastIndex, match.index)
      parts.push(
        <span key={key++}>
          {beforeText.split('\n').map((line, i, arr) => (
            <span key={i}>
              {line}
              {i < arr.length - 1 && <br />}
            </span>
          ))}
        </span>
      )
    }
    
    // Add code block
    const language = match[1] || 'text'
    const code = match[2]
    parts.push(
      <CodeBlock key={key++} code={code} language={language} />
    )
    
    lastIndex = match.index + match[0].length
  }
  
  // Add remaining text
  if (lastIndex < text.length) {
    const remainingText = text.substring(lastIndex)
    parts.push(
      <span key={key++}>
        {remainingText.split('\n').map((line, i, arr) => (
          <span key={i}>
            {line}
            {i < arr.length - 1 && <br />}
          </span>
        ))}
      </span>
    )
  }
  
  return parts.length > 0 ? parts : <span>{text}</span>
}

export function ChatLine({ role = 'assistant', content }: ChatGPTMessage) {
  if (!content) {
    return null
  }
  const formattedMessage = formatMessage(content)

  return (
    <div
      className={
        role != 'assistant' ? 'float-right clear-both' : 'float-left clear-both'
      }
    >
      <BalancerWrapper>
        <div className={`mb-5 rounded-lg bg-white px-4 py-5 shadow-lg ring-1 ring-zinc-100 sm:px-6 ${role != 'assistant' ? 'float-right' : 'float-left'} max-w-[85%]`}>
          <div className="flex space-x-3">
            <div className="flex-1 gap-4">
              <p className="font-large text-xxl text-gray-900">
                <a href="#" className="hover:underline">
                  {role == 'assistant' ? 'Alan' : 'You'}
                </a>
              </p>
              <div
                className={clsx(
                  'text ',
                  role == 'assistant' ? 'font-semibold font- ' : 'text-gray-400'
                )}
              >
                {formattedMessage}
              </div>
            </div>
          </div>
        </div>
      </BalancerWrapper>
    </div>
  )
}
