import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import QueryProvider from "@/providers/QueryProvider";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({
  subsets: ["latin"],
});

const APP_NAME = "Touri App";
const APP_DESCRIPTION = "Your AI Tour Guide In Your Pocket";

export const metadata: Metadata = {
  title: "Touri - Your Pocket AI Tour Guide",
  description: "Your AI Tour Guide In Your Pocket",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: APP_NAME,
  },
   formatDetection: {
    telephone: false,
  },
  icons: {
    icon: "/icon/Touri.webp",
  },
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
