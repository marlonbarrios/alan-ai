import React from 'react';
import Head from 'next/head';

type Props = {
  children: React.ReactNode;
};

const Layout = ({ children }: Props) => {
  return (
    <>
      <Head>
        <title>Alan-AI - AI Chatbot Inspired by Alan Turing | Computational Creativity & Generative Art</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="Alan-AI is an AI chatbot created as an homage to Alan Turing. Explore AI, generative AI, computational creativity, creative coding, p5.js, and generative art. Run code examples directly in the chat interface." />
        <meta name="keywords" content="Alan-AI, Alan Turing, AI chatbot, generative AI, computational creativity, creative coding, p5.js, generative art, artificial intelligence, machine learning, neural networks" />
        <meta name="author" content="Marlon Barrios Solano" />
        <meta property="og:title" content="Alan-AI - AI Chatbot Inspired by Alan Turing" />
        <meta property="og:description" content="Explore AI, generative AI, computational creativity, and creative coding with Alan-AI. Run p5.js code examples directly in the chat interface." />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Alan-AI - AI Chatbot Inspired by Alan Turing" />
        <meta name="twitter:description" content="Explore AI, generative AI, computational creativity, and creative coding with Alan-AI." />
        <link rel="canonical" href="https://alan-ai-mondrian.vercel.app" />
      </Head>
      <main className='px-4 md:px-6 lg:px-8 xl:px-12 max-w-full'>{children}</main>
    </>
  );
};

export default Layout;