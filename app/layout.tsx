import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar";
import { Provider } from "./components/Provider";

const outfit = Outfit({
  weight: ["400", "800"],
  display: "swap",
  style: "normal",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "JunhaeStudio Dashboard",
    template: "%s | JunhaeStudio",
  },
  description:
    "JunhaeStudio admin dashboard for managing products, orders, customers, and analytics with a modern, secure interface.",
  keywords: [
    "JunhaeStudio",
    "JunhaeStudio Dashboard",
    "Admin Dashboard",
    "Ecommerce Dashboard",
    "Order Management",
    "Product Management",
    "Analytics Dashboard",
  ],
  authors: [{ name: "JunhaeStudio" }],
  creator: "JunhaeStudio",
  metadataBase: new URL("https://junhaestudio.com"), // change if different
  robots: {
    index: false, // dashboards should NOT be indexed
    follow: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${outfit.className} ${outfit.style} antialiased`}>
        <Provider>
          <Navbar />
          {children}
        </Provider>
      </body>
    </html>
  );
}
