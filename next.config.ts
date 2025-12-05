import type { NextConfig } from 'next';
import path from 'path';
import fs from 'fs';

// /* eslint-disable @typescript-eslint/no-var-requires */
// /** @type {import('next').NextConfig} */
// const path = require('path');
// const fs = require('fs');

const getLatestCommit = () => {
  const rev = fs.readFileSync('.git/HEAD').toString().trim();
  let buildId;

  if (rev.indexOf(':') === -1) {
    buildId = rev;
  } else {
    buildId = fs
      .readFileSync(`.git/${rev.substring(5)}`)
      .toString()
      .trim();
  }

  return buildId.substring(0, 8);
};

const nextConfig: NextConfig = {
  output: 'standalone',
  sassOptions: {
    includePaths: [path.join(__dirname, 'styles')],
  },
  productionBrowserSourceMaps: true,
  webpack(config) {
    config?.module?.rules?.push({
      test: /\.svg$/i,
      issuer: /\.[jt]sx?$/,
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

module.exports = nextConfig;
