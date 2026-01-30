import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth/auth-context";
import { EnvironmentIndicator, EnvironmentBanner, DevelopmentTools } from "@/components/ui/environment-indicator";
import { config } from "@/config/environment";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Build page title: append environment label only if not already present in app name
const envLabel = config.env.toUpperCase();
const baseTitle = config.app.name;
const pageTitle = config.isProduction
  ? baseTitle
  : baseTitle.includes(`(${envLabel})`)
    ? baseTitle
    : `${baseTitle} (${envLabel})`;

export const metadata: Metadata = {
  title: pageTitle,
  description: "管理儀表板用於審核邀請系統",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <EnvironmentBanner />
          {children}
          <EnvironmentIndicator />
          <DevelopmentTools />
        </AuthProvider>
      </body>
    </html>
  );
}