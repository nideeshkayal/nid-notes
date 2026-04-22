import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";
import { AppProvider } from "@/context/AppContext";

export const metadata: Metadata = {
  title: "nid notes",
  description: "A self-hosted, filesystem-driven markdown notes application",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: "#0d0d0d",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@300;400;500;600;700&family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,500;0,9..144,600;0,9..144,700;1,9..144,400&display=swap" rel="stylesheet" />
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css" />
      </head>
      <body style={{ margin: 0, padding: 0 }}>
        <Script
          id="theme-bootstrap"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const saved = JSON.parse(localStorage.getItem('nid-notes-state') || '{}');
                document.documentElement.setAttribute('data-theme', saved.theme || 'dark-plus');
              } catch (e) {
                document.documentElement.setAttribute('data-theme', 'dark-plus');
              }
            `,
          }}
        />
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
