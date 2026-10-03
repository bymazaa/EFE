import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    /* config options here */
    images: {
        remotePatterns: [{ protocol: 'https', hostname: '**' }],
    },
      allowedDevOrigins: ['192.168.0.104'],
};

export default nextConfig;
