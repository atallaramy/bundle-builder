import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";

// Manrope substitutes the design's paid Gilroy / TT Norms Pro (see
// design-reference/font-substitution.md). Variable font → every weight in one
// file, exposed as the `--font-manrope` custom property that globals.css maps
// onto `--font-sans`.
const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Bundle Builder — Build your security system",
  description:
    "Assemble a home-security bundle across four steps with a live-updating review of your selections, totals, and savings.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${manrope.variable} h-full`}>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
