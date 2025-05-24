import type { NextConfig } from "next";

console.log('--- next.config.js loaded ---');
console.log('process.env.FIREBASE_ADMIN_PROJECT_ID:', process.env.FIREBASE_ADMIN_PROJECT_ID ? 'SET' : 'NOT SET', process.env.FIREBASE_ADMIN_PROJECT_ID?.length);
console.log('process.env.FIREBASE_ADMIN_CLIENT_EMAIL:', process.env.FIREBASE_ADMIN_CLIENT_EMAIL ? 'SET' : 'NOT SET', process.env.FIREBASE_ADMIN_CLIENT_EMAIL?.length);
console.log('process.env.FIREBASE_ADMIN_PRIVATE_KEY:', process.env.FIREBASE_ADMIN_PRIVATE_KEY ? 'SET' : 'NOT SET', process.env.FIREBASE_ADMIN_PRIVATE_KEY?.length);
console.log('-----------------------------');

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;
