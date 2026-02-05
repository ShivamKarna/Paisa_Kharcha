import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import Header from "@/components/header";
import { Toaster } from "sonner";
import { Github, Linkedin, Twitter } from "lucide-react";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });
export const metadata: Metadata = {
  title: "Paisa Kharcha - Smart Expense Tracker",
  description: "Track, analyze, and optimize your spending with AI-powered insights",
  manifest: "/manifest.json",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${inter.className}`}>
          <Header />
          <main className="min-h-screen overflow-x-hidden">{children}</main>
          <Toaster richColors />
          {/* Footer */}
          <footer className="bg-blue-100 py-12 border-t">
            <div className="container mx-auto px-4">
              <div className="flex flex-col items-center space-y-4">
                {/* Social Links */}
                <div className="flex items-center space-x-6">
                  <Link
                    href="https://www.linkedin.com/in/shivamkarndev/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 hover:text-green-600 transition-colors"
                    aria-label="LinkedIn"
                  >
                    <Linkedin className="w-5 h-5" />
                  </Link>
                  <Link
                    href="https://github.com/ShivamKarna"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 hover:text-green-600 transition-colors"
                    aria-label="GitHub"
                  >
                    <Github className="w-5 h-5" />
                  </Link>
                  <Link
                    href="https://x.com/shivamkarnn"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 hover:text-green-600 transition-colors"
                    aria-label="X (Twitter)"
                  >
                    <Twitter className="w-5 h-5" />
                  </Link>
                </div>
                {/* Copyright */}
                <p className="text-sm text-gray-600 text-center">
                  © {new Date().getFullYear()} Made with{" "}
                  <span className="text-green-600">💚</span> by Shivam Karn. All
                  rights reserved.
                </p>
              </div>
            </div>
          </footer>
        </body>
      </html>
    </ClerkProvider>
  );
}
