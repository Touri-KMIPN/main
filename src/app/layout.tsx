import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import QueryProvider from "@/providers/QueryProvider";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://touriai.com"),
  generator: "Next.js", // framework used
  title: "Touri - Your Pocket AI Tour Guide",
  description: "Your AI Tour Guide In Your Pocket",
  icons: {
    icon: "/icon/Touri.webp",
  },
  manifest: "manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="apple-mobile-web-app-title" content="Touri AI" />
      </head>
      <body className={`${inter.className} antialiased scroll-smooth`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>{children}</QueryProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
