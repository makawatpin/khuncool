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
      {
        source: "/tools/duck-race",
        destination: "/duck-race",
        permanent: true,
      },
      {
        source: "/tools/wheel",
        destination: "/random-name-picker",
        permanent: true,
      },
      {
        source: "/tools/scoreboard",
        destination: "/group-scoreboard",
        permanent: true,
      },
      {
        source: "/tools/noise-meter",
        destination: "/classroom-noise-meter",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
