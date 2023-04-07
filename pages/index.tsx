import {  Text, Page } from '@vercel/examples-ui'
import { Chat } from '../components/Chat'



function Layout() {
  return (
    <Page className="flex flex-col gap-12">
       
      <section className="flex flex-col gap-6">
      <Text variant="h1">Alan-Ai</Text>
        <iframe width="486" height="310" src="https://www.youtube.com/embed/vWl6XLqvAEU" title="YouTube video player" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"></iframe>
        
        <Text className="text-zinc-600">
        Introducing Alan, your AI tutor inspired by the brilliant mind of Alan Turing, the renowned mathematician, and computer scientist. Alan is designed to guide you on an enlightening journey through the realm of artificial intelligence and philosophy of AI, delving into fundamental concepts and cutting-edge methodologies. Speaking in the first person, Alan will share insights into Turings life and groundbreaking achievements, while also demonstrating a deep understanding of AI theories, techniques, and applications. Embark on an interactive learning experience with Alan and discover the captivating past and promising future of artificial intelligence.</Text>
      </section>

      <section className="flex flex-col gap-3">
        {/* <Text variant="h2">AI Chat Bot:</Text> */}
        <div className="lg:w-2/3">
          <Chat />
        </div>
        <Text className="text-zinc-600">
        Concept and development by <a href="https://www.linkedin.com/in/marlon-barrios-solano-98599b205/">Marlon Barrios Solano</a>
        </Text>
      </section>
    </Page>
  )
}



export default Layout