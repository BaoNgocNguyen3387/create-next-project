const sentryConfigClient = `
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  release: process.env.buildId,

  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: 1,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,

  replaysOnErrorSampleRate: 1.0,

  // This sets the sample rate to be 10%. You may want this to be 100% while
  // in development and sample at a lower rate in production
  replaysSessionSampleRate: 0.1,

  // You can remove this option if you're not planning to use the Sentry Session Replay feature:
  integrations: [
    Sentry.replayIntegration({
      // Additional Replay configuration goes in here, for example:
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
});
`;

const sentryConfigEdge = `
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  release: process.env.buildId,

  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: 1,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,
});
`;

const sentryConfigServer = ` 
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  release: process.env.buildId,

  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: 1,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,
});
`;

const createNewNextConfig = (prjName) => {
  return `
  /* eslint-disable @typescript-eslint/no-var-requires */
  /** @type {import('next').NextConfig} */
  const path = require('path');
  const fs = require('fs');
  const { withSentryConfig } = require('@sentry/nextjs');
  
  const getLatestCommit = () => {
    const rev = fs.readFileSync('.git/HEAD').toString().trim();
    let buildId;
  
    if (rev.indexOf(':') === -1) {
      buildId = rev;
    } else {
      buildId = fs
        .readFileSync(\`.git/\${rev.substring(5)}\`)
        .toString()
        .trim();
    }
  
    return buildId.substring(0, 8);
  };
  
  const nextConfig = {
    output: 'standalone',
    sassOptions: {
      includePaths: [path.join(__dirname, 'styles')],
    },
    productionBrowserSourceMaps: true,
    webpack(config) {
      config.module.rules.push({
        test: /\\.svg$/i,
        issuer: /\\.[jt]sx?$/,
        use: ['@svgr/webpack'],
      });
  
      return config;
    },
    async rewrites() {
      return {
        fallback: [
          {
            source: '/api/:path*',
            destination: '/api/not-found',
          },
          {
            source: '/:path*',
            destination: '/errors/404',
          },
        ],
      };
    },
    env: {
      buildId: getLatestCommit(),
    },
    experimental: {
      forceSwcTransforms: process.env.NODE_ENV !== 'test',
    },
  };
  
  module.exports = withSentryConfig(
    nextConfig,
    {
      org: 'sentry',
      project: '${prjName}',
      url: 'https://sentry.ghtklab.com/',
      release: getLatestCommit(),
    },
    {
      // For all available options, see:
      // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/
  
      // Upload a larger set of source maps for prettier stack traces (increases build time)
      widenClientFileUpload: true,
  
      // Transpiles SDK to be compatible with IE11 (increases bundle size)
      transpileClientSDK: true,
  
      // Hides source maps from generated client bundles
      hideSourceMaps: true,
  
      // Automatically tree-shake Sentry logger statements to reduce bundle size
      disableLogger: true,
    }
  );
    `;
};

export { sentryConfigClient, sentryConfigEdge, sentryConfigServer, createNewNextConfig };
