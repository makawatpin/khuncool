import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/blog/khuncool-teacher-tools",
        destination: "/blog/10-free-teaching-tools",
        permanent: true,
      },
      {
        source: "/blog/free-online-teaching-media",
        destination: "/blog/10-free-teaching-tools",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
