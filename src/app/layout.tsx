import type { Metadata, Viewport } from "next";
import "./globals.css";
import "./erp.css";

export const metadata: Metadata = {
  title: "Sri Ram Sweets ERP",
  description:
    "Sri Ram Sweets & Namkeen ERP — material import, production, sales, stock, returns, reports and billing in one place.",
  icons: {
    icon:
      "data:image/svg+xml," +
      encodeURIComponent(
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><circle cx="24" cy="24" r="23" fill="#d9780a"/><circle cx="24" cy="27" r="11" fill="#7c2d12"/><circle cx="20" cy="23" r="1.8" fill="#fbd38d"/><circle cx="27" cy="22" r="1.8" fill="#fbd38d"/><circle cx="24" cy="29" r="1.8" fill="#fbd38d"/><circle cx="18" cy="30" r="1.8" fill="#fbd38d"/><circle cx="30" cy="29" r="1.8" fill="#fbd38d"/><path d="M24 16c-3-5-8-5-9-2 3 0 6 1 9 2zM24 16c3-5 8-5 9-2-3 0-6 1-9 2z" fill="#fff"/></svg>'
      ),
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
          href="https://fonts.googleapis.com/css2?family=Mukta:wght@400;500;600;700&family=Rozha+One&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
