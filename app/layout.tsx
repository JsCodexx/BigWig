"use client";
import { UserProvider, useUser } from "@/context/UserContext";
import "./globals.css";
import { usePathname } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import Footer from "@/components/Footer";
import { UiProvider } from "@/context/UiContext";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col w-full">
        <UiProvider>
          <UserProvider>
            <AppContent>{children}</AppContent>
          </UserProvider>
        </UiProvider>
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
    <div className="flex w-full flex-col min-h-screen">
      {/* Navbar (Fixed) */}
      {!hideNavAndFooter && <Navbar />}

      {/* Main Content Wrapper */}
      <main className="flex-grow w-full bg-gray-50 dark:bg-gray-800 pt-16">
        {/* `pt-16` ensures content starts below the navbar (16 = 64px, same as navbar height) */}
        {children}
      </main>

      {/* Footer always at the bottom */}
      {!hideNavAndFooter && role !== "admin" && <Footer />}
    </div>
  );
}
