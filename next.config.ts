import type { NextConfig } from 'next';
import { PHASE_DEVELOPMENT_SERVER } from 'next/constants';

export default function nextConfig(phase: string): NextConfig {
  const isDevServer = phase === PHASE_DEVELOPMENT_SERVER;

  return {
    // Isolate dev server artifacts from production `next build` (.next)
    // so concurrent/subsequent builds never overwrite live dev manifests.
    distDir: isDevServer ? '.next-dev' : '.next',
    reactStrictMode: true,
    experimental: {
      webpackMemoryOptimizations: true,
    },
    onDemandEntries: {
      maxInactiveAge: 15 * 1000,
      pagesBufferLength: 1,
    },
    eslint: {
      ignoreDuringBuilds: true,
    },
    typescript: {
      ignoreBuildErrors: false,
    },
    // Allow access to remote image placeholder.
    images: {
      remotePatterns: [
        {
          protocol: 'https',
          hostname: 'picsum.photos',
          port: '',
          pathname: '/**', // This allows any path under the hostname
        },
      ],
    },
    output: 'standalone',
    transpilePackages: ['motion'],
    webpack: (config, { dev }) => {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      if (dev && process.env.DISABLE_HMR === 'true') {
        config.watchOptions = {
          ignored: /.*/,
        };
      }
      return config;
    },
  };
}
