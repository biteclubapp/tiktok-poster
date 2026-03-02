import type { Metadata } from "next";
import "./globals.css";

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
        {children}
      </body>
    </html>
  );
}
