import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import Navbar from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ResumeAI — ATS Resume Analyzer",
  description: "Upload your resume and get an instant ATS compatibility score, skill gap analysis, and improvement suggestions.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-white text-gray-900`}>
        <Toaster
          position="top-center"
          toastOptions={{
            style: { fontSize: "14px", borderRadius: "8px" },
            duration: 3000,
          }}
        />
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  );
}
