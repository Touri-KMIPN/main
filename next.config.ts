// import type { NextConfig } from "next";
// import withSerwistInit from "@serwist/next";

// const withSerwist = withSerwistInit({
//   // Note: This is only an example. If you use Pages Router,
//   // use something else that works, such as "service-worker/index.ts".
//   swSrc: "src/app/sw.ts",
//   swDest: "public/sw.js",
// });

// const nextConfig: NextConfig = withSerwist({
//   /* config options here */
//   output: "standalone",
// });

// const nextConfig: NextConfig = {
//   output: "standalone",
// };

// export default nextConfig;

const withPWA = require("@ducanh2912/next-pwa").default({
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  swcMinify: true,
  dest: "public",
  fallbacks: {
    //image: "/static/images/fallback.png",
    document: "/offline", // if you want to fallback to a custom page rather than /_offline
    // font: '/static/font/fallback.woff2',
    // audio: ...,
    // video: ...,
  },
  workboxOptions: {
    disableDevLogs: true,
  },
  // ... other options you like
});
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
};

module.exports = withPWA(nextConfig);
