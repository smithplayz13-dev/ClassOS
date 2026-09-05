import type { Metadata, Viewport } from "next";
import "./globals.css";
import "./workflows.css";
export const viewport: Viewport = { themeColor: "#141517" };

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
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
