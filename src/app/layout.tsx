import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Tars Chat — Real-time Messaging",
  description:
    "A real-time live chat messaging app built with Next.js, TypeScript, Convex, and Clerk. Connect with people and message them instantly.",
  keywords: ["chat", "messaging", "real-time", "Next.js", "Convex", "Clerk"],
  openGraph: {
    title: "Tars Chat — Real-time Messaging",
    description: "Connect and chat in real time with anyone.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className={`${inter.className} antialiased`}>
        <Providers>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: "#1a1a2e",
                color: "#e2e8f0",
                border: "1px solid #334155",
                borderRadius: "12px",
              },
              success: {
                iconTheme: {
                  primary: "#6366f1",
                  secondary: "#fff",
                },
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
