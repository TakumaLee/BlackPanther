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

export const metadata: Metadata = {
  title: `${config.app.name}${config.isProduction ? '' : ` (${config.env.toUpperCase()})`}`,
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