/** @type {import('next').NextConfig} */
const nextConfig = {
    // Firebase 9.23.0 works fine without special transpilation usually, 
    // but keeping these just in case for older compatibility
    transpilePackages: ['firebase', '@firebase/auth'],
    output: 'export'
}

module.exports = nextConfig
