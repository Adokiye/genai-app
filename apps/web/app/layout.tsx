import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "GenAI Labs | LLM Lab",
  description:
    "A friendly console for trying LLM parameter sweeps, scoring quality, and exporting results.",
  icons: {
    icon: "/logo-brain.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
