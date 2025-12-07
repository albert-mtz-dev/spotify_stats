import type { Metadata } from "next";
import { SessionProvider } from "@/components/providers/SessionProvider";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "Spotify Mirror - Your Personal Music Profile",
  description:
    "Discover your music taste with detailed listening stats, top artists, tracks, and personalized insights from your Spotify account.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-bg-main text-text-primary antialiased min-h-screen">
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
