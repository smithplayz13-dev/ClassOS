import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import "./globals.css";
import "./workflows.css";
import "./revamp.css";
import "./legal.css";
import "./theme.css";
import { THEME_INLINE_SCRIPT } from "@/lib/theme";
import { ThemeProvider } from "@/components/theme";

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f7f5" },
    { media: "(prefers-color-scheme: dark)", color: "#0e1014" },
  ],
};

export const metadata: Metadata = {
  title: {
    default: "ClassOS | Your day, in balance",
    template: "%s | ClassOS",
  },
  description: "Your school schedule adapts when real life interrupts it.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    // data-theme defaults to light (the preserved porcelain design) and is
    // corrected before first paint by the inline script below. Per the
    // installed Next.js preventing-flash guide, suppressHydrationWarning
    // tells React to accept the script-corrected DOM.
    <html
      lang="en"
      data-theme="light"
      suppressHydrationWarning
      className={GeistSans.variable}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INLINE_SCRIPT }} />
      </head>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
