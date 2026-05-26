import type { Metadata } from "next";
import { Libre_Baskerville, Bodoni_Moda, Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/shared/Providers";

const libreBaskerville = Libre_Baskerville({
  variable: "--font-baskerville",
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

const bodoniModa = Bodoni_Moda({
  variable: "--font-bodoni",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "CampusBid — Student Auction Marketplace",
    template: "%s | CampusBid",
  },
  description:
    "A college-exclusive auction marketplace where verified students can list items for sale, bid in real time, and complete safe campus-to-campus exchanges.",
  keywords: [
    "student marketplace",
    "college auction",
    "campus selling",
    "student items",
    "university marketplace",
  ],
  openGraph: {
    title: "CampusBid — Student Auction Marketplace",
    description:
      "Buy and sell with your campus community. Verified students only.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${libreBaskerville.variable} ${bodoniModa.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
