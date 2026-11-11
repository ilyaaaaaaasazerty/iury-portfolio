/** @type {import('next').NextConfig} */
const nextConfig = {
  images: { unoptimized: true },
  devIndicators: false,
  typescript: { ignoreBuildErrors: true },
  // data/*.json is read at runtime during hourly revalidation, so ship it with the page.
  outputFileTracingIncludes: { "/": ["./data/**/*"] },
};

export default nextConfig;
