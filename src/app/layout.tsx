import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AppShell from "@/components/AppShell";

const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

export const metadata: Metadata = {
  title: "한글 Daily — Learn Korean",
  description: "Learn Korean from news and short clips with tap-to-gloss, sentence mining and FSRS reviews.",
  manifest: `${base}/manifest.webmanifest`,
  icons: { icon: `${base}/icon.svg`, apple: `${base}/apple-touch-icon.png` },
  appleWebApp: { capable: true, title: "한글 Daily", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#efeeeb" },
    { media: "(prefers-color-scheme: dark)", color: "#101010" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans antialiased">
        {base ? (
          // GitHub Pages serves /learn-korean/ and /Learn-Korean/ alike, but the app's
          // install scope is case-sensitive — normalise the URL so Chrome offers "Install".
          <script
            dangerouslySetInnerHTML={{
              __html: `(function(b){var p=location.pathname;if(p.indexOf(b)!==0&&p.toLowerCase().indexOf(b.toLowerCase())===0)location.replace(b+p.slice(b.length)+location.search+location.hash)})(${JSON.stringify(base)})`,
            }}
          />
        ) : null}
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
