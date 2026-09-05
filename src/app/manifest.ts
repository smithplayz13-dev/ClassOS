import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "ClassOS",
    short_name: "ClassOS",
    description: "Your school schedule adapts when real life interrupts it.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#141517",
    theme_color: "#141517",
    icons: [
      {
        src: "/pwa-icon?size=192",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/pwa-icon?size=512",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
