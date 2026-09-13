import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import { LanguageSwitcher } from "@/components/language-switcher";
import "./globals.css";
const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
  display: "swap",
});
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://nfccardo.ma";
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "NFCcardo.ma — Carte de visite NFC au Maroc",
    template: "%s | NFCcardo.ma",
  },
  description:
    "Créez votre carte de visite NFC premium au Maroc. Partagez contact, WhatsApp, réseaux sociaux et localisation d’un simple geste, sans application.",
  applicationName: "NFCcardo.ma",
  authors: [{ name: "NFCcardo.ma", url: siteUrl }],
  creator: "NFCcardo.ma",
  publisher: "NFCcardo.ma",
  category: "technology",
  keywords: [
    "carte NFC Maroc",
    "carte de visite NFC",
    "carte de visite digitale Maroc",
    "NFC Casablanca",
    "NFCcardo",
    "digital business card Morocco",
    "carte professionnelle intelligente",
  ],
  alternates: {
    canonical: "/",
    languages: {
      "fr-MA": "/",
      en: "/?lang=en",
      "ar-MA": "/?lang=ar",
      "x-default": "/",
    },
  },
  openGraph: {
    type: "website",
    locale: "fr_MA",
    url: siteUrl,
    siteName: "NFCcardo.ma",
    title: "NFCcardo.ma — La carte qui vous connecte",
    description:
      "Votre identité professionnelle partagée d’un simple geste. Carte NFC premium conçue au Maroc.",
    images: [
      {
        url: "/nfc-hero.png",
        width: 1536,
        height: 1024,
        alt: "Cartes NFCcardo.ma premium",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "NFCcardo.ma — Carte NFC premium",
    description:
      "Partagez toute votre identité professionnelle d’un simple geste.",
    images: ["/nfc-hero.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: { icon: "/nfccardo-3d-logo.png", apple: "/nfccardo-3d-logo.png" },
  manifest: "/manifest.webmanifest",
};
export const viewport: Viewport = {
  themeColor: "#08090c",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};
const organization = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "NFCcardo.ma",
  url: siteUrl,
  logo: `${siteUrl}/nfccardo-3d-logo.png`,
  areaServed: { "@type": "Country", name: "Morocco" },
  description: "Cartes de visite NFC premium pour les professionnels au Maroc",
};
const product = {
  "@context": "https://schema.org",
  "@type": "Product",
  name: "NFCcardo Signature",
  image: `${siteUrl}/nfc-hero.png`,
  description: "Carte de visite NFC personnalisée avec profil digital",
  brand: { "@type": "Brand", name: "NFCcardo.ma" },
  offers: {
    "@type": "Offer",
    priceCurrency: "MAD",
    price: "499",
    availability: "https://schema.org/InStock",
    url: `${siteUrl}/order`,
  },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr-MA" suppressHydrationWarning>
      <body className={`${geist.variable} font-sans antialiased`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organization) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(product) }}
        />
        {children}
        <LanguageSwitcher />
      </body>
    </html>
  );
}
