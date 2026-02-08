import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://smartavnue.com"),
  title: {
    default: "Smart Avnue – Premium Products at Affordable Prices",
    template: "%s | Smart Avnue",
  },
  description:
    "Smart Avnue is your one-stop retail destination for premium, stylish, and affordable everyday products designed to elevate your lifestyle. Shop stationery, soft toys, kitchen décor, and more.",
  keywords: [
    "Smart Avnue retail store",
    "premium stationery store",
    "stylish stationery products",
    "affordable home décor store",
    "kitchen décor products",
    "soft toys shop",
    "plastic home products",
    "home essentials store",
    "premium products affordable price",
    "retail store near me",
    "gift shop",
    "online shopping",
  ],
  authors: [{ name: "Smart Avnue" }],
  creator: "Smart Avnue",
  publisher: "Smart Avnue",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://smartavnue.com",
    title: "Smart Avnue – Premium Products at Affordable Prices",
    description:
      "Smart Avnue is your one-stop retail destination for premium, stylish, and affordable everyday products designed to elevate your lifestyle.",
    siteName: "Smart Avnue",
    images: [
      {
        url: "/og-image.jpg", // We should probably ensure this image exists or use a placeholder
        width: 1200,
        height: 630,
        alt: "Smart Avnue - Premium Retail Experience",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Smart Avnue – Premium Products at Affordable Prices",
    description:
      "Smart Avnue is your one-stop retail destination for premium, stylish, and affordable everyday products designed to elevate your lifestyle.",
    images: ["/og-image.jpg"],
    creator: "@smartavnue", // Placeholder handle
  },
  verification: {
    google: "P58XCY_8uZe5I7QC5eNh2wivKElDpu2ckaI60IgD5yc",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${playfair.variable} antialiased bg-slate-50 text-slate-900 flex flex-col min-h-screen`}
      >
        <Header />
        <main className="flex-grow pt-20">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
