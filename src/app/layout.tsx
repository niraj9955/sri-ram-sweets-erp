import type { Metadata, Viewport } from "next";
import "./globals.css";
import "./erp.css";

export const metadata: Metadata = {
  title: "Sri Ram Sweets ERP",
  description:
    "Sri Ram Sweets & Namkeen ERP — material import, production, sales, stock, returns, reports and billing in one place.",
  icons: {
    icon: "/logo.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
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
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        {/* eslint-disable-next-line @next/next/no-page-custom-font -- global in App Router layout */}
        <link
          href="https://fonts.googleapis.com/css2?family=Mukta:wght@400;500;600;700&family=Roboto:wght@400;500;700&family=Rozha+One&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
