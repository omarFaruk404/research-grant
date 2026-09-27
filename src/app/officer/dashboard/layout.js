"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import SideBar from "@/components/SideBarOfficer"; 
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
      return;
    }

    try {
      const user = JSON.parse(storedUser);
      if (!user.user_id || user.role !== 1) {
        router.push("/login");
      }
    } catch {
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

      <div
        className="d-flex"
        style={{
          paddingTop: "30px", 
          minHeight: "100vh",
          backgroundColor: "#f8f9fa",
          // overflowX: "hidden" // Removed to allow sticky positioning if needed, handled by main now
        }}
      >
        <main
          className="flex-grow-1"
          style={{
            // ✅ Dynamic Margin Logic
            marginLeft: sidebarOpen && !isMobile ? "260px" : "0px",
            transition: "margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)", 
            
            // ✅ CRITICAL FIXES FOR LAPTOP OVERFLOW:
            minWidth: 0,       // Allows flex child to shrink below content size (enables table scroll)
            width: "100%",     // Ensures it takes available width
            maxWidth: "100%",  // Prevents it from exceeding parent width
          }}
        >
          <div className="px-4 pb-4 h-100">
            {children}
          </div>
        </main>
      </div>
    </>
  );
}