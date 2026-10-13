import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/context/AppContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "LMS-UCIC | Hybrid Learning Management System",
  description: "Platform Pembelajaran Hybrid Cerdas Universitas Catur Insan Cendekia (UCIC) - Blended Learning, Anti-Cheat Quiz & Real-Time Classroom Management.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className={inter.className}>
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
