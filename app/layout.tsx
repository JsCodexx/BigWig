"use client";
import { UserProvider, useUser } from "@/context/UserContext";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import { useSidebar } from "@/context/SidebarContext";

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
    <div className="flex transition-all duration-300">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content - Adjust Width Dynamically */}
      <div className="w-full flex justify-end">
        <div
          className={`transition-all duration-1000 ${
            expanded ? "w-[calc(100%-16rem)]" : "w-[calc(100%-4rem)]"
          }`}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
