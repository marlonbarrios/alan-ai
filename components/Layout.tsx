import React from 'react';
import Head from 'next/head';

type Props = {
  children: React.ReactNode;
};

const Layout = ({ children }: Props) => {
  return (
    <>
      <Head>
        <title>Sati-AI</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <main className='px-4 md:px-0'>{children}</main>
    </>
  );
};

export default Layout;