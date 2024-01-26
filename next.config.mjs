
import withPWA from "next-pwa";

const config = withPWA({
    dest: "public",
    register: true,
    skipWaiting: true,
    disable: process.env.NODE_ENV === "development",
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  // ... other options you like
};

export default config(nextConfig);

