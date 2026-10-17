import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";
import { AuthProvider } from "@/components/auth/AuthProvider";
import CornerDecoration from "@/components/corner-decoration";
import { AudioPlayerProvider } from "@/components/providers/audio-player-provider";
import { LocaleProvider } from "@/components/providers/locale-provider";
import { amiri, bornomala, poppins } from "@/lib/fonts";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  openGraph: {
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    siteName: SITE_NAME,
    locale: "bn_BD",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
  },
  other: {
    "theme-color": "#008E48",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = "bn" as "bn" | "en";

  return (
    <html
      lang="bn"
      className={cn(
        "h-full",
        "antialiased",
        poppins.variable,
        bornomala.variable,
        amiri.variable,
        "font-sans",
      )}
    >
      <body
        className={cn(
          "min-h-full flex flex-col has-top-bar",
          poppins.variable,
          bornomala.variable,
          amiri.variable,
        )}
      >
        {/* Site-wide: renders on every page in every route group. Pages must not add their own. */}
        <CornerDecoration />
        <LocaleProvider initialLocale={locale}>
          <AuthProvider>
            <AudioPlayerProvider>{children}</AudioPlayerProvider>
          </AuthProvider>
        </LocaleProvider>
        <Toaster
          position="bottom-center"
          toastOptions={{
            style: {
              backgroundColor: "var(--color-primary-soft, #e6f4ed)",
              color: "var(--color-primary, #008e48)",
              border: "1px solid rgba(0, 142, 72, 0.25)",
              borderRadius: "0.75rem",
              fontWeight: 600,
              fontSize: "0.9375rem",
            },
          }}
          style={{
            zIndex: 2147483647,
          }}
        />
      </body>
    </html>
  );
}
