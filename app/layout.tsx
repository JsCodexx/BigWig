"use client";
import { UserProvider, useUser } from "@/context/UserContext";
import "./globals.css";
import { usePathname } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import Footer from "@/components/Footer";
import { UiProvider } from "@/context/UiContext";
import { Toaster } from "@/components/ui/toaster";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className="min-h-screen flex flex-col w-full">
        <UiProvider>
          <UserProvider>
            <Toaster />
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
  const hiddenRoutes = ["/auth/login", "/auth/login/admin"];
  const hideNavAndFooter = hiddenRoutes.includes(pathname);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="flex w-full flex-col min-h-screen">
      {/* Navbar */}
      {!hideNavAndFooter && <Navbar />}

      {/* Main Content */}
      <main
        className={`flex-grow w-full bg-white dark:bg-gray-800 ${
          !hideNavAndFooter ? "pt-16" : ""
        }`}
      >
        {children}
      </main>

      {/* Show Footer only on the homepage */}
      {pathname === "/" && <Footer />}
    </div>
  );
}
