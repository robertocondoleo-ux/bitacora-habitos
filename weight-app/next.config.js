/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    // pdfjs-dist referencia opcionalmente "canvas" (uso en Node), pero acá
    // solo lo usamos en el navegador, así que lo excluimos del bundle.
    config.resolve.alias = {
      ...config.resolve.alias,
      canvas: false,
    };
    return config;
  },
};

module.exports = nextConfig;
