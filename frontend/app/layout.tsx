import type { Metadata } from "next";
import { Outfit, Cinzel } from "next/font/google";
import "./globals.css";
import { CartProvider } from "../context/CartContext";
import { ClientLayout } from "../components/ClientLayout";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "VANTILLU Multi Cuisine Family Restaurant",
  description: "A traditional Telugu village home filled with warmth, love and homemade food. Experience authentic multi-cuisine delicacies brought into the future.",
  keywords: "Vantillu restaurant, Telugu food, Andhra food, Telangana delicacies, village kitchen, home cooked food, Biryani Hyderabad, local restaurant BN Reddy Nagar",
  openGraph: {
    title: "VANTILLU Multi Cuisine Family Restaurant",
    description: "Experience authentic multi-cuisine delicacies cooked with traditional family recipes.",
    type: "website",
    locale: "en_IN",
    siteName: "Vantillu",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} ${cinzel.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#0c0607]">
        <CartProvider>
          <ClientLayout>
            {children}
          </ClientLayout>
        </CartProvider>
      </body>
    </html>
  );
}
