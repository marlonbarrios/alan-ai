import { AppProps } from 'next/app';
import { Analytics } from '@vercel/analytics/react';
import { CookiesProvider } from 'react-cookie';
import Layout from '../components/Layout';
import '@vercel/examples-ui/globals.css';

function App({ Component, pageProps }: AppProps) {
  return (
    <CookiesProvider>
      <Layout>
        <Component {...pageProps} />
        <Analytics />
      </Layout>
    </CookiesProvider>
  );
}

export default App;