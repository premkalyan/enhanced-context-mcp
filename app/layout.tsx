import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Enhanced Context MCP Server",
  description: "Enhanced Context MCP Server - Serverless with Project Registry Integration",
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
