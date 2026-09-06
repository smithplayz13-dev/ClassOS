import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import "./globals.css";
import "./workflows.css";
import "./revamp.css";
export const viewport: Viewport = { themeColor: "#f7f7f5" };

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
    <html lang="en" className={GeistSans.variable}>
      <body>{children}</body>
    </html>
  );
}
