const nextConfig = {
  reactStrictMode: true,
  images: {
    loader: "custom",
    loaderFile: "./src/lib/imageLoader.js",
  },
};

export default nextConfig;

