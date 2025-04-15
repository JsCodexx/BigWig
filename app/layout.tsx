"use client";
import { UserProvider, useUser } from "@/context/UserContext";
import "./globals.css";
import { usePathname } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import Footer from "@/components/Footer";

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
  const { loading, role } = useUser();
  const pathname = usePathname();
  const hiddenRoutes = ["/auth/login", "/auth/login/user"];
  const hideNavAndFooter = hiddenRoutes.includes(pathname);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="flex flex-col min-h-screen">
      {/* Navbar (Fixed) */}
      {!hideNavAndFooter && <Navbar />}

      {/* Main Content Wrapper */}
      <main className="flex-grow bg-gray-50 dark:bg-gray-800 pt-16">
        {/* `pt-16` ensures content starts below the navbar (16 = 64px, same as navbar height) */}
        {children}
      </main>

      {/* Footer always at the bottom */}
      {!hideNavAndFooter && role !== "admin" && <Footer />}
    </div>
  );
}
