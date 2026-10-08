import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import CartSidebar from "./components/CartSidebar";
import AuthModal from "./components/AuthModal";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata = {
  title: "Al-Nawab Restaurant | Authentic Royal Mughlai",
  description: "Experience the Royal Feast at Al-Nawab Restaurant, Noida. Authentic Mughlai cuisine, family dining, and seamless online ordering.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable}`}>
      <body>
        <AuthProvider>
          <CartProvider>
            {children}
            <CartSidebar />
            <AuthModal />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
