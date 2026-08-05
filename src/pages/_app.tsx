import '../styles/globals.css';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import { Inter, Space_Grotesk, JetBrains_Mono } from 'next/font/google';

/**
 * Font pairing:
 *   • body    — Inter (geometric sans, high readability)
 *   • display — Space Grotesk (geometric, slight character)
 *   • mono    — JetBrains Mono (uppercase metadata, dates, tags, tags chips)
 *
 * Sharp, technical, no decorative type.
 */

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

const display = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
  weight: ['500', '600', '700'],
});

const mono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <link rel="icon" href="/favicon.ico?v=2" />
        <meta name="theme-color" content="#1A3D6D" />
      </Head>
      <div className={`${inter.variable} ${display.variable} ${mono.variable}`}>
        <Component {...pageProps} />
      </div>
    </>
  );
}
