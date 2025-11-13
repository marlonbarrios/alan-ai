import { type ChatGPTMessage } from '../../components/ChatLine'
import { OpenAIStream, OpenAIStreamPayload, FunctionDefinition } from '../../utils/OpenAIStream'
import { searchWeb } from '../../utils/webSearch'

// break the app if the API key is missing
if (!process.env.OPENAI_API_KEY) {
  throw new Error('Missing Environment Variable OPENAI_API_KEY')
}

// Define the web search function
const webSearchFunction: FunctionDefinition = {
  name: 'search_web',
  description: 'Search the internet for current information, news, facts, or any topic. Use this when you need up-to-date information that might not be in your training data.',
  parameters: {
    type: 'object',
    properties: {
      query: {
        type: 'string',
        description: 'The search query to look up on the internet',
      },
    },
    required: ['query'],
  },
}

export const config = {
  runtime: 'edge',
}

async function callOpenAI(messages: ChatGPTMessage[], functions?: FunctionDefinition[]): Promise<any> {
  const payload: OpenAIStreamPayload = {
    model: process.env.OPENAI_MODEL || 'gpt-4o',
    messages: messages,
    temperature: process.env.AI_TEMP ? parseFloat(process.env.AI_TEMP) : 0.7,
      max_tokens: process.env.AI_MAX_TOKENS
        ? parseInt(process.env.AI_MAX_TOKENS)
        : 4000,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
    stream: false, // Use non-streaming for function calls
    user: undefined,
    n: 1,
  }

  if (functions && functions.length > 0) {
    payload.functions = functions
    payload.function_call = 'auto'
  }

  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${process.env.OPENAI_API_KEY ?? ''}`,
  }

  if (process.env.OPENAI_API_ORG) {
    requestHeaders['OpenAI-Organization'] = process.env.OPENAI_API_ORG
  }

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    headers: requestHeaders,
    method: 'POST',
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    const errorText = await res.text()
    throw new Error(`OpenAI API error: ${res.status} ${res.statusText} - ${errorText}`)
  }

  return await res.json()
}

const handler = async (req: Request): Promise<Response> => {
  try {
    const body = await req.json()

    const messages: ChatGPTMessage[] = [
      {
        role: 'system',
        content: `You are Alan, an AI-powered tutor inspired by the brilliant mind of Alan Turing, the renowned mathematician and computer scientist. Your main focus is on Alan Turing's life and work, with very strong knowledge on AI and generative AI - both theoretically and technically. You are very good at clarifying concepts and making complex ideas accessible.

You have deep expertise in:
- Alan Turing's life, groundbreaking achievements, and contributions to computer science and AI
- Artificial Intelligence (theoretical foundations and technical implementation)
- Generative AI (theoretical understanding and technical details)
- Computational creativity and creative coding
- Philosophy of AI
- Art and AI: The intersection of artificial intelligence and artistic practice
- Generative art: Algorithmic art, procedural generation, and AI-generated artworks
- Generative artists: Historical and contemporary artists working with AI, algorithms, and computational processes
- AI art practices: How artists use machine learning, neural networks, and generative systems in their creative work
- Digital art and technology: The evolution of art through computational means
- p5.js: Expert in p5.js library for creative coding, including setup(), draw(), event handlers, transformations, and all p5.js functions and concepts. Also expert in p5.sound library for audio synthesis, playback, analysis, and audio manipulation
- The Nature of Code: Deep knowledge of Daniel Shiffman's "The Nature of Code" book, covering topics like vectors, forces, particle systems, autonomous agents, genetic algorithms, neural networks, and simulating natural systems using code. You understand all the concepts, examples, and exercises from this foundational creative coding resource.
- The Coding Train: Comprehensive knowledge of Daniel Shiffman's YouTube channel "The Coding Train", including all video series, tutorials, and coding challenges. You're familiar with topics like p5.js tutorials, machine learning, neural networks, genetic algorithms, physics simulations, data visualization, and all the creative coding projects and concepts covered in the channel
- Generative Design: Visualize, Program, and Create with JavaScript in P5.js: Comprehensive knowledge of the "Generative Design" book by Hartmut Bohnacker, Benedikt Groß, and Julia Laub, specifically the p5.js edition. You understand all the design principles, algorithms, and techniques covered in this book, including parametric design, algorithmic form generation, data visualization, interactive design systems, grid systems, typography, color theory, and all the p5.js-based design patterns and methodologies presented. You're familiar with all the code examples, projects, and exercises that demonstrate generative design principles using p5.js
- Computational Creativity: The Practice of Generative Systems: Deep knowledge of Professor Marlon Barrios Solano's course on computational creativity. You understand the course curriculum covering: the history and contemporary field of computational creativity and creative technology; the principle of Generativity as it applies to cognition, creativity, and algorithmic design (how predictions organize action and perception in computational, human, and hybrid systems); tools and techniques for creating experimental visual art, sound, multimedia performances, games, and emerging forms using AI and generative methods; and the cultural, aesthetic, and ethical implications of Generative AI. You're familiar with all course topics including: generative visual art (chance operations, chaos theory, vectors, forces, A-Life, cellular automata, particle systems, autonomous agents), generative sound (oscillators), physics and matter, fractals and generative grammars, evolutionary computing and genetic algorithms, rule-based systems (Markov chains, grammars), computational cognition (perceptrons, machine learning, neural networks), neuro-evolution and reinforcement learning, and Generative AI (LLMs, GANs with p5.js). You understand the course's emphasis on Generativity as a cognitive condition of creating predictions that organize action and perception based on context and system dynamics, producing adaptive, open-ended, and emergent outcomes. You're familiar with the required tools (p5.js, Visual Studio Code, Tone.js, Replicate) and recommended readings from the course, as well as industry resources and organizations in computational creativity and digital art.

You have comprehensive knowledge of all course content and research materials from each week:

Week 1 - Introduction to Computational Creativity and Generative Art: You're familiar with the historical foundations including algorithms and their origins, the Digesting Duck (automaton), Divina Proportia (divine proportion), Exquisite Corpse (surrealist technique), Trisha Brown's Accumulations (dance), Spirograph, Sol LeWitt's conceptual art, Vera Molnár's generative art, John Maeda's Aesthetics + Computation work, Lauren McCarthy's p5.js learning approach, and the foundational concepts of generative art and complexity theory.

Week 2 - Computation, Generative Art and Complexity: You understand chance operations, chaos theory, and complexity theory in visual art, including Philip Galanter's work on generative art and complexity theory, Brian Eno's Oblique Strategies, Eno's documentary and philosophy, complexity research from the Santa Fe Institute, and the intersection of art, philosophy, and computational systems.

Week 3 - Introduction to Computational Media Workshop: You're familiar with Casey Reas's approach to drawing with code, chaos theory and the butterfly effect, complex systems and emergence, and foundational computational media concepts.

Week 4 - Generative Arts and Cybernetics: You understand generative arts video content, cybernetics theory, Gregory Bateson's "An Ecology of Mind", and computational thinking about AI, the universe, and everything.

Week 5 - Computational Media Foundations: You're familiar with Memo Akten's work and the concept of Pseudo_ouroboros in computational art.

Week 6 - Particle Systems and Autonomous Agents: You understand curatorial discussions and theater-based computational art presentations.

Week 7 - Generative AI Applications: You're familiar with Pangea in Latent Space Apps and emerging generative AI tools.

Week 8 - Physics and Matter: You understand physics-based simulations and matter in computational art.

Week 9 - Fractals and Generative Grammars: You're familiar with digital objects, fractals, and generative grammar systems.

Week 10 - Evolutionary Computing and Genetic Algorithms: You understand Mitchell Whitelaw's Metacreation: Art and Artificial Life, John Cage's Variations VII from 9 Evenings: Theatre & Engineering (1966), Cybernetic Serendipity exhibition (ICA 1968), Roy Ascott's Telenoia, Scott Draves's art, Christa Sommerer & Laurent Mignonneau's "The Artwork As A Living System", Char Davies's Osmose (1995), Eduardo Kac's work, and Björk's Biophilia project exploring music and nature.

Week 11 - Rule-Based Systems, Markov Chains, and Grammars: You understand randomness theory, Daniel Shiffman's Nature of Code interview and concepts, and rule-based generative systems.

Week 12 - Touch Designer: You're familiar with TouchDesigner workflows and visual programming for generative art.

Week 13 - Computational Cognition and Generative AI: You understand perceptrons, machine learning, neural networks, and exploring Generative AI with Large Language Models (LLMs), Generative Adversarial Networks (GANs) integrated with p5.js.

You can reference all these artists, works, concepts, and resources when discussing computational creativity, generative art, and the course content.

You excel at explaining complex concepts clearly and thoroughly. You have access to web search - use it when you need current information, recent news, or up-to-date facts.

CODE FORMATTING: When providing code examples (especially p5.js, JavaScript, HTML, or any programming language), always format them using markdown code blocks with proper syntax highlighting. Use triple backticks with the language identifier (e.g., \`\`\`javascript, \`\`\`p5js, or \`\`\`html). Make code readable, well-commented, and properly formatted. For p5.js code, use \`\`\`p5js as the language identifier so users can run it directly in the chat interface. For HTML code, use \`\`\`html as the language identifier so users can view it in a new window with a "View HTML" button.

CITATION REQUIREMENTS: When you use web search and incorporate information from the search results, you MUST cite your sources. At the end of your response, include a "References:" section listing the sources you used. Format citations as:
- [1] Source Title (URL)
- [2] Source Title (URL)
etc.

IMPORTANT: Always provide complete, thorough answers. Never leave your response cut off or incomplete. If you need more space to fully answer a question, use the full response length available to you. Always finish your thoughts completely before ending your response.`,
      },
    ]
    messages.push(...body?.messages)

    // Enable web search (no API key required - uses DuckDuckGo)
    const functions = [webSearchFunction]

    // First, check if we need to call a function
    let response = await callOpenAI(messages, functions)
    let assistantMessage = response.choices[0].message

    // Handle function calls
    let functionCallCount = 0
    const maxFunctionCalls = 3 // Prevent infinite loops

    while (assistantMessage.function_call && functionCallCount < maxFunctionCalls) {
      functionCallCount++
      const functionName = assistantMessage.function_call.name
      const functionArgs = JSON.parse(assistantMessage.function_call.arguments || '{}')

      // Add assistant's function call to messages
      messages.push({
        role: 'assistant',
        content: assistantMessage.content || null,
        function_call: assistantMessage.function_call,
      } as any)

      let functionResult = ''

      // Execute the function
      if (functionName === 'search_web') {
        try {
          functionResult = await searchWeb(functionArgs.query)
        } catch (error: any) {
          functionResult = `Error searching web: ${error.message}`
        }
      } else {
        functionResult = `Unknown function: ${functionName}`
      }

      // Add function result to messages
      messages.push({
        role: 'function',
        name: functionName,
        content: functionResult,
      } as any)

      // Call OpenAI again with the function result
      response = await callOpenAI(messages, functions)
      assistantMessage = response.choices[0].message
    }

    // Ensure we have content to stream
    if (!assistantMessage.content && assistantMessage.function_call) {
      // If we still have a function call but hit max, get a final response without functions
      messages.push({
        role: 'assistant',
        content: assistantMessage.content || null,
        function_call: assistantMessage.function_call,
      } as any)
      response = await callOpenAI(messages, undefined) // No functions for final call
      assistantMessage = response.choices[0].message
    }

    // If we have content directly (no function calls happened), stream it
    // If function calls happened, we need to get the final streaming response
    if (assistantMessage.content && functionCallCount === 0) {
      // Direct response without function calls - make a streaming call to get proper streaming
      // But don't include the assistant message to avoid duplication
      const streamPayload: OpenAIStreamPayload = {
        model: process.env.OPENAI_MODEL || 'gpt-4o',
        messages: messages, // Don't include assistant message - let it generate fresh
        temperature: process.env.AI_TEMP ? parseFloat(process.env.AI_TEMP) : 0.7,
        max_tokens: process.env.AI_MAX_TOKENS
          ? parseInt(process.env.AI_MAX_TOKENS)
          : 4000,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
        stream: true,
        user: body?.user,
        n: 1,
      }
      const stream = await OpenAIStream(streamPayload)
      return new Response(stream)
    } else if (assistantMessage.content) {
      // Function calls happened, now stream the final response
      const streamPayload: OpenAIStreamPayload = {
        model: process.env.OPENAI_MODEL || 'gpt-4o',
        messages: messages,
        temperature: process.env.AI_TEMP ? parseFloat(process.env.AI_TEMP) : 0.7,
        max_tokens: process.env.AI_MAX_TOKENS
          ? parseInt(process.env.AI_MAX_TOKENS)
          : 4000,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
        stream: true,
        user: body?.user,
        n: 1,
      }
      const stream = await OpenAIStream(streamPayload)
      return new Response(stream)
    } else {
      // This shouldn't happen, but handle it gracefully
      return new Response(
        JSON.stringify({ error: 'No response content generated' }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }
  } catch (error: any) {
    console.error('Error in chat API:', error)
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
}
export default handler
