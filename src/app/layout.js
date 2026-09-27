import { Roboto } from "next/font/google"; 
import BootstrapClient from "@/components/BootstrapClient";
import 'bootstrap/dist/css/bootstrap.css';
import "bootstrap-icons/font/bootstrap-icons.css";
import "./globals.css";
// 1. Ensure this path matches where you created the file
import AuthInterceptor from "@/lib/authInterceptor"; 

const roboto = Roboto({
  weight: ["300", "400", "500", "700", "900"],
  subsets: ["latin"],
  variable: "--font-roboto",
  display: "swap",
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
      <body className={roboto.className}>
        {/* 2. Wrap your application children with the Interceptor */}
        <AuthInterceptor>
          {children}
        </AuthInterceptor>
        
        <BootstrapClient />
      </body>
    </html>
  );
}