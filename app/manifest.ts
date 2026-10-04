import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "EFE",
    short_name: "EFE",
    description: "Premium Streetwear forEveryday Style",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#000000",
    icons: [
      {
        src: "/og-image.jpg",
        sizes: "192x192",
        type: "image/jpg",
      },
      {
        src: "/og-image.jpg",
        sizes: "512x512",
        type: "image/jpg",
      },
    ],
  };
}