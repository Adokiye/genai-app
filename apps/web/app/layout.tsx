import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "GenAI Labs | LLM Lab",
  description:
    "An interactive console for comparing LLM parameter sweeps, quality metrics, and exports.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-white text-slate-900">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
