import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Clutch - Emergency Reservations",
  description: "High Agency Dinner Finder. One click. We decide.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="font-sans">{children}</body>
    </html>
  );
}
