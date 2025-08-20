/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/predict',
        destination: process.env.BACKEND_URL || 'http://localhost:5000/predict',
      },
      {
        source: '/api/health',
        destination: process.env.BACKEND_URL || 'http://localhost:5000/health',
      },
      {
        source: '/api/classes',
        destination: process.env.BACKEND_URL || 'http://localhost:5000/classes',
      },
    ];
  },
};

module.exports = nextConfig;