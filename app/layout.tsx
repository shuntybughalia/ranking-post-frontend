import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";
import Script from "next/script";
import { Suspense } from "react";
import CategoryBar from "@/app/components/layout/CategoryBar";
import Footer from "@/app/components/layout/Footer";
import Header from "@/app/components/layout/Header";
import NavigationProgress from "@/app/components/layout/NavigationProgress";
import { Toaster } from "@/app/components/ui/Toast";
import { getSiteUrl } from "@/lib/site-url";
import "./globals.css";

const GA_MEASUREMENT_ID = "G-6Y60Q7PDSY";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const SITE_DESCRIPTION =
  "Expert analysis, data-driven guest posting guides, and elite digital marketing strategies.";

// No site-wide canonical: each indexable page sets its own, otherwise every
// page would declare itself a duplicate of the homepage.
export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: "RANKINGPOST — SEO Insights & Strategies",
    template: "%s | RANKINGPOST",
  },
  description: SITE_DESCRIPTION,
  applicationName: "RANKINGPOST",
  openGraph: {
    type: "website",
    siteName: "RANKINGPOST",
    locale: "en_US",
    title: "RANKINGPOST — SEO Insights & Strategies",
    description: SITE_DESCRIPTION,
    images: [{ url: "/logo.png", alt: "RANKINGPOST" }],
  },
  twitter: {
    card: "summary",
    title: "RANKINGPOST — SEO Insights & Strategies",
    description: SITE_DESCRIPTION,
    images: ["/logo.png"],
  },
  verification: {
    google: "EztC5r_alERBt8UQO6zGpI_JZ7i19Ye_P-StNnI_GN4",
  },
};

export const viewport: Viewport = {
  themeColor: "#0b0b0b",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${poppins.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-background font-sans text-foreground">
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}');
          `}
        </Script>
        <Suspense fallback={null}>
          <NavigationProgress />
        </Suspense>
        <Header />
        {/* useSearchParams needs a Suspense boundary; the fallback reserves the bar's height. */}
        <Suspense fallback={<div className="h-[57px] border-b border-border bg-slate-50" />}>
          <CategoryBar />
        </Suspense>
        {children}
        <Footer />
        <Toaster />
      </body>
    </html>
  );
}
