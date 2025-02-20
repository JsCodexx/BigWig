"use client";
import { useUser } from "@/context/UserContext";
import Link from "next/link";
import { useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import {
  Menu,
  Sun,
  Moon,
  LogOut,
  LayoutDashboardIcon,
  Users,
  Bell,
  FileText,
  ShoppingCart,
  Clapperboard,
} from "lucide-react";
import Cookies from "js-cookie";
import { useSidebar } from "@/context/SidebarContext";

export function Sidebar() {
  const { role } = useUser();
  const supabase = createClientComponentClient();
  const [darkMode, setDarkMode] = useState(false);
  const { expanded, setExpanded } = useSidebar(); // ✅ Use Sidebar Context

  const toggleDarkMode = () => {
    setDarkMode((prev) => !prev);
    document.documentElement.classList.toggle("dark", !darkMode);
    localStorage.setItem("theme", darkMode ? "light" : "dark");
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      Cookies.remove("token");
      Cookies.remove("sb-ebpmscwwmktnudufncts-auth-token");
      sessionStorage.removeItem("supabase.auth.token");
      window.location.href = "/auth/login";
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const navItems = {
    admin: [
      { name: "Manage Users", href: "/admin", icon: <Users size={22} /> },
      { name: "Surveys", href: "/surveyor", icon: <FileText size={22} /> },
      {
        name: "Carousel",
        href: "/admin/carousel",
        icon: <Clapperboard size={22} />,
      },
      {
        name: "Notifications",
        href: "/admin/notifications",
        icon: <Bell size={22} />,
      },
      { name: "Remarks", href: "/admin/remarks", icon: <FileText size={22} /> },
      { name: "Products", href: "/products", icon: <ShoppingCart size={22} /> },
    ],
    surveyor: [
      {
        name: "Submitted Surveys",
        href: "/surveyor/submitted",
        icon: <FileText size={22} />,
      },
      {
        name: "Create a Survey",
        href: "/surveyor/add-survey",
        icon: <FileText size={22} />,
      },
      {
        name: "Notifications",
        href: "/surveyor/notifications",
        icon: <Bell size={22} />,
      },
      { name: "Products", href: "/products", icon: <ShoppingCart size={22} /> },
    ],
    client: [
      {
        name: "My Quotes",
        href: "/client/quotes",
        icon: <FileText size={22} />,
      },
      {
        name: "Notifications",
        href: "/client/notifications",
        icon: <Bell size={22} />,
      },
      {
        name: "Submitted Remarks",
        href: "/client/remarks",
        icon: <FileText size={22} />,
      },
      { name: "Products", href: "/products", icon: <ShoppingCart size={22} /> },
    ],
  };

  return (
    <div
      className={`fixed top-0 left-0 h-full bg-white text-gray-500 transition-all duration-300 ${
        expanded ? "w-64" : "w-16"
      } shadow-lg border-r border-red-500`}
    >
      {/* Hamburger Icon */}
      <div
        className="p-4 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <Menu size={28} />
      </div>

      {/* Navigation Items */}
      <div className="flex flex-col space-y-2 mt-4">
        {navItems[role as keyof typeof navItems]?.map(
          ({ name, href, icon }) => (
            <Link
              key={href}
              href={href}
              className="group relative flex items-center space-x-3 p-3 hover:text-red-700 rounded-lg transition-all"
            >
              {icon}
              {expanded && <span className="text-sm">{name}</span>}
              {!expanded && (
                <span className="absolute left-14 opacity-0 group-hover:opacity-100 bg-gray-800 text-white text-xs rounded-md px-2 py-1 transition-all">
                  {name}
                </span>
              )}
            </Link>
          )
        )}
      </div>

      {/* Bottom Controls */}
      <div className="absolute bottom-6 flex flex-col space-y-2 w-full">
        {/* Dark Mode Toggle */}
        <button
          onClick={toggleDarkMode}
          className="p-3 hover:text-red-700 rounded-lg"
        >
          {darkMode ? <Sun size={22} /> : <Moon size={22} />}
        </button>
        {/* Logout */}
        <button
          onClick={handleLogout}
          className="p-3 hover:text-red-700 rounded-lg flex items-center space-x-3"
        >
          <LogOut size={22} />
          {expanded && <span>Logout</span>}
        </button>
        {/* Explore Button */}
        <button
          onClick={() => (window.location.href = "/")}
          className="p-3 hover:text-red-700 rounded-lg flex items-center space-x-3"
        >
          <LayoutDashboardIcon size={22} />
          {expanded && <span>Explore</span>}
        </button>
      </div>
    </div>
  );
}
export default Sidebar;
