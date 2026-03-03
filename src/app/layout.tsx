import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "Vinted Analyzer – Optimize your Vinted listings with AI",
    template: "%s | Vinted Analyzer",
  },
  description:
    "Transform your photos into professional, SEO-friendly Vinted descriptions in seconds. Vinted Analyzer uses AI to generate titles, descriptions, and suggested prices.",
  openGraph: {
    title: "Vinted Analyzer – Optimize your Vinted listings with AI",
    description:
      "Transform your photos into professional, SEO-friendly Vinted descriptions in seconds.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`${inter.className} min-h-screen antialiased`}>
        {children}
      </body>
    </html>
  );
}
