/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static export: the whole app runs in the browser, no server needed.
  output: "export",
  images: { unoptimized: true },
  trailingSlash: true,
};
export default nextConfig;
