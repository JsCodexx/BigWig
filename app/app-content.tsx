"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Toaster } from "@/components/ui/toaster";
import { useUser } from "@/context/UserContext";

export default function AppContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const { loading } = useUser();
  const pathname = usePathname();
  const hiddenRoutes = ["/auth/login", "/auth/login/admin"];

  const is404 = pathname === "/404" || pathname === "/not-found"; // fallback
  const hideNavAndFooter = hiddenRoutes.includes(pathname) || is404;

  if (loading) return <div>Loading...</div>;

  return (
    <div className="flex w-full flex-col min-h-screen">
      {!hideNavAndFooter && <Navbar />}
      <main
        className={`flex-grow w-full bg-white dark:bg-gray-800 ${
          !hideNavAndFooter ? "pt-16" : ""
        }`}
      >
        {children}
      </main>
      <Toaster />
      {!hideNavAndFooter && pathname === "/" && <Footer />}
    </div>
  );
}
