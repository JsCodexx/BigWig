"use client";
import { useUser } from "@/context/UserContext";
import Link from "next/link";
import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Sun, Moon, LogOut } from "lucide-react";

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
    await supabase.auth.signOut();
    window.location.href = "/auth/login"; // Redirect after logout
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
      { name: "Create a Survey", href: "/surveyor/create" },
      { name: "List of Surveys", href: "/surveyor/list" },
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
            <span>Logout</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
