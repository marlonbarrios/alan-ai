import { AppProps } from 'next/app';
import { Analytics } from '@vercel/analytics/react';
import Layout from '../components/Layout';
import '@vercel/examples-ui/globals.css';

function App({ Component, pageProps }: AppProps) {
  return (
    <Layout>
      <Component {...pageProps} />
      <Analytics />
    </Layout>
  );
}

export default App;