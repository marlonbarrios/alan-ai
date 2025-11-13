import {  Text, Page } from '@vercel/examples-ui'
import { Chat } from '../components/Chat'



function Layout() {
  return (
    <Page className="flex flex-col gap-12">
       
      <section className="flex flex-col gap-6">
      <Text variant="h1">Alan-AI</Text>
        <div className="w-full aspect-video rounded-lg overflow-hidden">
          <iframe 
            className="w-full h-full"
            src="https://www.youtube.com/embed/vWl6XLqvAEU" 
            title="YouTube video player" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          ></iframe>
        </div>
        
        <Text className="text-zinc-600">
        Introducing Alan, an AI chatbot created as an homage to the brilliant mind of Alan Turing, the renowned mathematician and computer scientist. Alan is designed to guide you on an enlightening journey through the realm of artificial intelligence, generative AI, and computational creativity. Speaking in the first person, Alan will share insights into Turing's life and groundbreaking achievements, while also demonstrating a deep understanding of AI theories, techniques, and applications.
        
        Alan can help you explore particle systems, neural networks, genetic algorithms, parametric design, data visualization, and much more. With expert knowledge of p5.js and p5.sound, Alan can guide you through interactive art projects, algorithmic compositions, and creative coding challenges. You can run code examples directly in the chat interface and view the results in real-time.
        
        Embark on an interactive learning experience with Alan and discover the captivating intersection of artificial intelligence, creative coding, and generative art. You can download your entire conversation as a PDF for future reference and sharing.</Text>
      </section>

      <section className="flex flex-col gap-3 w-full">
        {/* <Text variant="h2">AI Chat Bot:</Text> */}
        <div className="w-full max-w-full">
          <Chat />
        </div>
        <Text className="text-zinc-600">
        Concept and development by <a href="https://marlonbarrios.github.io/" target="_blank" rel="noopener noreferrer" className="text-teal-600 hover:text-teal-700 underline">Marlon Barrios Solano</a>
        </Text>
      </section>

      <section className="flex flex-col gap-3 mt-8 pt-8 border-t border-zinc-200">
        <Text className="text-xs text-zinc-500 italic">
          <strong>Disclaimer:</strong> Advanced AI created for experimental and educational purposes. The AI can give inaccurate information. Created to be used in the context of Marlon Barrios Solano's educational activities.
        </Text>
      </section>
    </Page>
  )
}



export default Layout