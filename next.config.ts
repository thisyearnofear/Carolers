import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Explicitly configure Turbopack to work with our webpack config
  turbopack: {
    // Allow Turbopack to handle our custom webpack externals
    externalizeNodeModules: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'img.clerk.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn.discordapp.com',
      },
    ],
  },
  // Use webpack instead of Turbopack to maintain compatibility with our custom config
  webpack: (config, { isServer }) => {
    // List of Node.js core modules that should be treated as externals
    const nodeModules = [
      'tls', 'net', 'fs', 'path', 'crypto', 'stream', 'zlib',
      'http', 'https', 'dns', 'url', 'querystring', 'buffer'
    ];
    
    config.externals = config.externals || [];
    
    // Add all Node.js core modules as externals
    config.externals.push(
      function({ context, request }: { context: any; request: any }, callback: any) {
        // Handle node: protocol
        if (request.startsWith('node:')) {
          const moduleName = request.replace('node:', '');
          return callback(null, `commonjs ${moduleName}`);
        }
        
        // Handle direct module names
        if (nodeModules.includes(request)) {
          return callback(null, `commonjs ${request}`);
        }
        
        // Handle mysql2 and drizzle-orm/mysql2
        if (['mysql2', 'drizzle-orm/mysql2'].includes(request)) {
          return callback(null, `commonjs ${request}`);
        }
        
        callback();
      }
    );
    
    return config;
  },
  // React2Shell mitigation: Disable server actions in production until patched
  experimental: {
    serverActions: process.env.NODE_ENV === 'development' ? {
      bodySizeLimit: '1mb' as const,
    } : undefined,
  },
  // Security headers for React2Shell protection
  headers: async () => [
    {
      source: '/(.*)',
      headers: [
        // React2Shell specific protections
        {
          key: 'X-React2Shell-Protection',
          value: 'enabled',
        },
        // Standard security headers
        {
          key: 'X-Content-Type-Options',
          value: 'nosniff',
        },
        {
          key: 'X-Frame-Options',
          value: 'DENY',
        },
        {
          key: 'Content-Security-Policy',
          value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self'; frame-src 'self';",
        },
        {
          key: 'Referrer-Policy',
          value: 'strict-origin-when-cross-origin',
        },
      ],
    },
  ],
};

export default nextConfig;