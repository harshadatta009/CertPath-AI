import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AppProviders } from "@/providers/app-providers";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: {
    default: "CertPath AI — Personalized Certification Roadmaps",
    template: "%s · CertPath AI",
  },
  description:
    "Pass certifications faster with personalized AI study roadmaps, practice questions, cheat sheets, flashcards, interview prep and readiness scoring.",
  keywords: ["certification", "AWS", "SAA-C03", "study roadmap", "exam prep", "AI"],
  authors: [{ name: "CertPath AI" }],
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#030712" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans`}>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
