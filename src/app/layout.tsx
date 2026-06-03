import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "Baggio26 – FIFA World Cup 2026 Prediction Game",
  description: "Predict every match, build your bracket and compete with friends in the ultimate World Cup 2026 prediction game.",
  keywords: ["World Cup 2026", "football predictions", "bracket challenge", "FIFA 2026"],
  openGraph: {
    title: "Baggio26 – World Cup 2026 Predictions",
    description: "Predict the World Cup 2026 and compete with friends worldwide",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-[#0a0f1a] text-white">
        <Navbar />
        <main className="flex-1 pt-16">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
