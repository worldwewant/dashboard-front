/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,

    swcMinify: true,

    images: {
        unoptimized: true,
        domains: [],
    },

    distDir: '.next',

    output: 'export', // Do not modify
}

module.exports = nextConfig
