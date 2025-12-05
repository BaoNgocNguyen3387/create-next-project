import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  const date = process.env.buildId;

  return (
    <Html lang="en">
      <Head>
        <meta app-version={date} />
        <link rel="icon" href="/ghtk.ico" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
