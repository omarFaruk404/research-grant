"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import SideBar from "@/components/SideBarResearcher"; 
import NavBar from "@/components/NavBar";

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);

  // 1. Check Login
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      router.push("/login");
    }
    setMounted(true);
  }, [router]);

  // 2. Handle Responsive Behavior
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 992; 
      setIsMobile(mobile);
      if (mobile) {
        setSidebarOpen(false); 
      } else {
        setSidebarOpen(true);  
      }
    };

    handleResize(); 
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (!mounted) return null;

  return (
    <>
      <NavBar />

      <SideBar 
        isOpen={sidebarOpen} 
        setIsOpen={setSidebarOpen} 
        isMobile={isMobile}
      />

      {/* Main Layout Container */}
      <div
        className="d-flex"
        style={{
          paddingTop: "0px", // ✅ Set to 80px to prevent Navbar overlap
          minHeight: "100vh",
          backgroundColor: "#f8f9fa",
          overflowX: "hidden" // ✅ Added to strictly prevent horizontal scroll
        }}
      >
        <main
          className="flex-grow-1"
          style={{
            // ✅ Dynamic Margin Logic:
            marginLeft: sidebarOpen && !isMobile ? "260px" : "0px",
            transition: "margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)", 
            
            // ✅ FIX: Changed from "100%" to "auto" to prevent overflow
            width: "auto", 
          }}
        >
          {/* Content Wrapper with padding */}
          <div className="pt-4 px-4 pb-4 h-100">
            {children}
          </div>
        </main>
      </div>
    </>
  );
}