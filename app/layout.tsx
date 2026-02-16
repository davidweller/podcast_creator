import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cozy Crime Creator Suite",
  description: "Transform historical research into publish-ready Cozy Crime scripts",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
