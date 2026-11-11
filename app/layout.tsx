import type { Metadata, Viewport } from "next";
import "./globals.css";
import { CartProvider } from "@/lib/cart-context";
import StorefrontShell from "@/components/StorefrontShell";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#0B2240",
};

export const metadata: Metadata = {
  title: "Z&S Textiles | Feel the Softness | Luxury Towels & Hajj/Umrah Ehrams",
  description:
    "Export-quality 100% combed cotton bath towels, luxury hand towels, face washcloths, and pure cotton Terry Hajj & Umrah Ehrams direct from Faisalabad factory. Cash on Delivery nationwide across Pakistan.",
  metadataBase: new URL("https://zandstextiles.com"),
  keywords: [
    "Z&S Textiles",
    "ZandSTextiles",
    "bath towels Pakistan",
    "Faisalabad cotton towels",
    "towel ehram",
    "Hajj Ehram Faisalabad",
    "Umrah Ehram set",
    "luxury bath linen",
    "combed cotton towels",
    "cash on delivery towels",
  ],
  authors: [{ name: "Z&S Textiles Faisalabad" }],
  openGraph: {
    title: "Z&S Textiles | Purity & Luxury in Every Thread",
    description:
      "Direct from manufacturer luxury 100% combed cotton bath towels & Shariah-compliant Hajj/Umrah Ehrams. Nationwide Cash on Delivery.",
    url: "https://zandstextiles.com",
    siteName: "Z&S Textiles",
    images: [
      {
        url: "/images/zandstextiles-luxury-home-bedding-and-linens-logo.png",
        width: 1200,
        height: 630,
        alt: "Z&S Textiles Faisalabad",
      },
    ],
    locale: "en_PK",
    type: "website",
  },
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased selection:bg-brand-gold/30 selection:text-brand-navy">
        <CartProvider>
          <StorefrontShell>{children}</StorefrontShell>
        </CartProvider>
      </body>
    </html>
  );
}
