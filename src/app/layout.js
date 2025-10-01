
import { Geist, Geist_Mono } from "next/font/google";
import BootstrapClient from "@/components/BootstrapClient";
import 'bootstrap/dist/css/bootstrap.css'
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Research Grant Management",
  description: "Manage your research grants effectively",
};

export default function RootLayout({ children }) {



  return (
    <html lang="en">
      <head>

      </head>
      <body>
        {children}


        <BootstrapClient />
      </body>
    </html>
  );
}
