import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SupportShell } from "@/components/support-shell";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PDF-MD Support",
  description:
    "Support page for PDF-MD questions, support requests, bug reports, licensing help, and App Store access.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <SupportShell>{children}</SupportShell>
      </body>
    </html>
  );
}
