/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    appDir: true,
  },
  env: {
    MONGODB_URI: "mongodb+srv://erarjunsingh32085:123@cluster0.zvimsjg.mongodb.net/bharattapp?retryWrites=true&w=majority&appName=Cluster0", // expose if needed (optional)
  },
};

module.exports = nextConfig;
