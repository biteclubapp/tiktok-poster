import type { Metadata } from "next";
import "./globals.css";
import Nav from "@/components/Nav";

export const metadata: Metadata = {
  title: "BiteClub TikTok Poster",
  description: "Generate and post branded TikTok carousels from BiteClub dishes",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Nav />
        {children}
      </body>
    </html>
  );
}
