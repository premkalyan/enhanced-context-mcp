/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['@vercel/blob', '@vercel/kv']
  },
  webpack: (config, { isServer }) => {
    // Fallback for fs module
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
    };

    // Ensure proper module resolution
    config.resolve.extensionAlias = {
      '.js': ['.js', '.ts'],
      '.jsx': ['.jsx', '.tsx']
    };

    return config;
  },
};

export default nextConfig;
