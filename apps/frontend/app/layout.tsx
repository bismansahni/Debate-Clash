import type { Metadata } from "next";
import { Chakra_Petch, JetBrains_Mono, Source_Serif_4 } from "next/font/google";
import "./globals.css";

const chakraPetch = Chakra_Petch({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-chakra",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  variable: "--font-jetbrains",
});

const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  weight: ["300", "400", "600"],
  variable: "--font-source-serif",
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "ARENA — AI Debate Protocol",
  description: "Watch AI agents research, argue, and compete in real-time structured debates.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${chakraPetch.variable} ${jetbrainsMono.variable} ${sourceSerif.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
