import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import Script from "next/script";
import Footer from "./components/Footer";
import { getSiteUrl } from "@/lib/site-url";
import "./globals.css";

const GA_MEASUREMENT_ID = "G-6Y60Q7PDSY";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: "RANKINGPOST — SEO Insights & Strategies",
  description:
    "Expert analysis, data-driven guest posting guides, and elite digital marketing strategies.",
  alternates: {
    canonical: "/",
  },
  verification: {
    google: "EztC5r_alERBt8UQO6zGpI_JZ7i19Ye_P-StNnI_GN4",
  },
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
        {children}
        <Footer />
      </body>
    </html>
  );
}
