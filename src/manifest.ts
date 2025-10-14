import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
    return {
        "name": "Touri AI",
        "short_name": "Touri",
        "description": "Your AI Tour Guide In Your Pocket",
        "icons": [
            {
                "src": "/icon/web-app-manifest-192x192.png",
                "sizes": "192x192",
                "type": "image/png",
                "purpose": "maskable"
            },
            {
                "src": "/icon/web-app-manifest-512x512.png",
                "sizes": "512x512",
                "type": "image/png",
                "purpose": "maskable"
            }
        ],
        "theme_color": "#ffffff",
        "background_color": "#ffffff",
        "display": "standalone"
    }
}