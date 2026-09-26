import type { NextConfig } from 'next';
import path from 'path';

const nextConfig: NextConfig = {
  transpilePackages: ['@tapestry/ui', '@tapestry/hooks', '@tapestry/styles', '@tapestry/types', '@tapestry/api-client'],
  env: {
    NEXT_PUBLIC_API_ORIGIN: process.env.NEXT_PUBLIC_API_ORIGIN || (process.env.NODE_ENV === 'production' ? 'https://api.tapestry-ttrpg.com' : 'http://localhost:5000'),
    NEXT_PUBLIC_VERSION: process.env.npm_package_version,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
        port: '',
        pathname: '**',
      },
    ],
  },
  output: 'standalone',
  outputFileTracingRoot: path.join(__dirname, '../../'),
};

export default nextConfig;
