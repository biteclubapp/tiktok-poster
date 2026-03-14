import type { Metadata } from "next";
import "./globals.css";
import Nav from "@/components/Nav";
import { createServerSupabaseClient } from "@/lib/supabase-auth";
import { isSupabaseAuthConfigured } from "@/lib/supabase-config";

export const metadata: Metadata = {
  title: "BiteClub Poster",
  description: "Generate and post branded carousels from BiteClub dishes to TikTok, Reddit, and Instagram",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let userEmail: string | null = null;

  if (isSupabaseAuthConfigured()) {
    try {
      const supabase = await createServerSupabaseClient();
      const { data: { user } } = await supabase.auth.getUser();
      userEmail = user?.email ?? null;
    } catch (error) {
      console.error('Failed to read Supabase auth session in layout:', error);
    }
  }

  return (
    <html lang="en">
      <body className="antialiased">
        <Nav userEmail={userEmail} />
        {children}
      </body>
    </html>
  );
}
