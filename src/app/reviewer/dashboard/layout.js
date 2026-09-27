"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import SideBar from "@/components/SideBarReviewer"; // Ensure this matches your file path
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
      const mobile = window.innerWidth < 992; // Bootstrap 'lg' breakpoint
      setIsMobile(mobile);
      if (mobile) {
        setSidebarOpen(false); // Default close on mobile
      } else {
        setSidebarOpen(true);  // Default open on desktop
      }
    };

    handleResize(); // Run on mount
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Prevent hydration mismatch or flash before auth check
  if (!mounted) return null;

  return (
    <>
      <NavBar />

      {/* Pass state to SideBar so it can control the toggle button.
         NOTE: Your SideBar component must accept { isOpen, setIsOpen } or similar props 
         for this to function correctly.
      */}
      <SideBar 
        isOpen={sidebarOpen} 
        setIsOpen={setSidebarOpen} 
        isMobile={isMobile}
      />

      {/* Main Layout Container */}
      <div
        className="d-flex"
        style={{
          paddingTop: "0px", // Navbar height offset
          minHeight: "100vh",
          backgroundColor: "#f8f9fa",
        }}
      >
        <main
          className="flex-grow-1 p-4"
          style={{
            // ✅ Dynamic Margin Logic:
            // Desktop & Open: 260px margin
            // Desktop & Closed: 0px margin (Full Width)
            // Mobile: 0px margin (Overlay mode)
            marginLeft: sidebarOpen && !isMobile ? "260px" : "0px",
            transition: "margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)", // Smooth sliding effect
            width: "100%", // Ensures it fills available space
          }}
        >
          {children}
        </main>
      </div>
    </>
  );
}