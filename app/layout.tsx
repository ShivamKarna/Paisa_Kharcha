import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import Header from "@/components/header";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });
export const metadata: Metadata = {
  title: "ExpenseTracker",
  description: "The place to track expenses",
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
          <footer className="bg-blue-100 py-12">
            <div className="container  mx-auto px-4 text-center tex-gray-600">
              <p>Made By Shivam Karn</p>
            </div>
          </footer>
        </body>
      </html>
    </ClerkProvider>
  );
}
