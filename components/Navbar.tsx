"use client";
import { useUser } from "@/context/UserContext";
import Link from "next/link";
import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Sun, Moon, LogOut, LayoutDashboardIcon } from "lucide-react";
import Cookies from "js-cookie";
export function Navbar() {
  const { role } = useUser(); // ✅ Get role from context
  const supabase = createClientComponentClient();
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    // Load theme from localStorage
    const theme = localStorage.getItem("theme");
    if (theme === "dark") {
      setDarkMode(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleDarkMode = () => {
    setDarkMode((prev) => !prev);
    if (darkMode) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    }
  };

  const handleLogout = async () => {
    try {
      // 1️⃣ Sign out from Supabase
      await supabase.auth.signOut();
      Cookies.remove("token");
      Cookies.remove("sb-ebpmscwwmktnudufncts-auth-token");
      sessionStorage.removeItem("supabase.auth.token"); // Remove only Supabase session
      window.location.href = "/auth/login";
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };
  const navItems = {
    admin: [
      { name: "Manage Users", href: "/admin" },
      { name: "Orders", href: "/admin/orders" },
      { name: "Notifications", href: "/admin/notifications" },
      { name: "Remarks", href: "/admin/remarks" },
      { name: "Products", href: "/products" },
    ],
    surveyor: [
      { name: "Submitted Surveys", href: "/surveyor/submitted" },
      { name: "Create a Survey", href: "/surveyor/add-survey" },
      { name: "List of Surveys", href: "/surveyor" },
      { name: "Notifications", href: "/surveyor/notifications" },
      { name: "Products", href: "/products" },
    ],
    client: [
      { name: "My Quotes", href: "/client/quotes" },
      { name: "Notifications", href: "/client/notifications" },
      { name: "Submitted Remarks", href: "/client/remarks" },
      { name: "Products", href: "/products" },
    ],
  };

  return (
    <nav className="fixed top-0 left-0 w-full  text-white p-4 z-10 shadow-lg bg-red-700">
      <div className="container flex justify-between items-center">
        {/* Navigation Links */}
        <div className="flex space-x-4">
          {navItems[role as keyof typeof navItems]?.map(
            (item: { name: string; href: string }) => (
              <Link
                key={item.href}
                href={item.href}
                className="hover:underline"
              >
                {item.name}
              </Link>
            )
          )}
        </div>

        {/* Right-side controls */}
        <div className="flex items-center space-x-4">
          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-full hover:bg-gray-800"
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {/* Logout Button */}

          <button
            onClick={handleLogout}
            className="flex items-center space-x-1 p-2 bg-gray-700 rounded-md hover:bg-gray-600"
          >
            <LogOut size={18} />
            <span>{role ? "logout" : "login"}</span>
          </button>

          <button
            onClick={() => (window.location.href = "/")}
            className="flex items-center space-x-1 p-2 bg-gray-700 rounded-md hover:bg-gray-600"
          >
            <LayoutDashboardIcon size={18} />
            <span>Explore</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
