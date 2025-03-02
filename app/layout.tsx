"use client";
import { UserProvider, useUser } from "@/context/UserContext";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import { useSidebar } from "@/context/SidebarContext";
import { Navbar } from "@/components/Navbar";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <UserProvider>
          <AppContent>{children}</AppContent>
        </UserProvider>
      </body>
    </html>
  );
}

function AppContent({ children }: { children: React.ReactNode }) {
  const { loading, role } = useUser(); // ✅ Fetch user role from context
  const { expanded } = useSidebar();
  if (loading) return <div>bua...</div>;

  return (
    <div className="min-h-screen">
      {/* Navbar */}
      <Navbar />

      {/* Content Area */}
      <div className="mt-16 h-[calc(100vh-4rem)] overflow-auto bg-gray-50 dark:bg-gray-800">
        {children}
      </div>
    </div>
  );
}
