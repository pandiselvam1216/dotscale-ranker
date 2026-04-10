import type { Metadata } from "next";
import "./globals.css";
import { QueryProvider } from "@/components/providers/query-provider";

export const metadata: Metadata = {
  title: "DotScale Ranker — AI-Powered SEO Intelligence Platform",
  description: "Track rankings like a search engine. DotScale Ranker provides AI-powered SERP simulation and ranking validation for SEO professionals and agencies.",
  keywords: ["SEO", "ranking", "SERP", "search engine", "keyword tracking", "AI SEO tool"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <QueryProvider>
          {children}
        </QueryProvider>
      </body>
    </html>
  );
}
