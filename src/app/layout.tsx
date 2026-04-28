import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Smart 311 — City Service Requests",
  description: "Report non-emergency issues in your city",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en" className="h-full antialiased">
        <body className={`${inter.className} min-h-full flex flex-col`}>
          {children}
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  );
}
