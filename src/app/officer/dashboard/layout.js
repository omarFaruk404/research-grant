"use client";
import SideBar from "@/components/SideBar";
import NavBar from "@/components/NavBar";

export default function DashboardLayout({ children }) {
  return (
    <div className="d-flex flex-column" style={{ minHeight: "100vh" }}>

      <NavBar />
      <div className="d-flex flex-grow-1"  style={{ paddingTop: '70px' }}>
        <SideBar />
        <main className="p-4 flex-grow-1 bg-light">
          {children}
        </main>
      </div>
    </div>
  );
}
