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
  PenLine,
} from "lucide-react";
import Cookies from "js-cookie";
import { motion } from "framer-motion";

export function Navbar() {
  const { role } = useUser();
  const supabase = createClientComponentClient();
  const [darkMode, setDarkMode] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

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
      { name: "Manage Users", href: "/admin", icon: <Users size={20} /> },
      { name: "Surveys", href: "/surveyor", icon: <FileText size={20} /> },
      {
        name: "Carousel",
        href: "/admin/carousel",
        icon: <Clapperboard size={20} />,
      },
      {
        name: "Notifications",
        href: "/admin/notifications",
        icon: <Bell size={20} />,
      },
      { name: "Remarks", href: "/admin/remarks", icon: <FileText size={20} /> },
      { name: "Products", href: "/products", icon: <ShoppingCart size={20} /> },
    ],
    surveyor: [
      {
        name: "Submitted Surveys",
        href: "/surveyor",
        icon: <FileText size={20} />,
      },
      {
        name: "Create a Survey",
        href: "/surveyor/add-survey",
        icon: <PenLine size={20} />,
      },
      {
        name: "Notifications",
        href: "/surveyor/notifications",
        icon: <Bell size={20} />,
      },
      { name: "Products", href: "/products", icon: <ShoppingCart size={20} /> },
    ],
    client: [
      {
        name: "My Quotes",
        href: "/client/quotes",
        icon: <FileText size={20} />,
      },
      {
        name: "Notifications",
        href: "/client/notifications",
        icon: <Bell size={20} />,
      },
      {
        name: "Submitted Remarks",
        href: "/client/remarks",
        icon: <FileText size={20} />,
      },
      { name: "Products", href: "/products", icon: <ShoppingCart size={20} /> },
    ],
  };

  // Motion variants for smooth open & close animation
  const menuVariants = {
    open: {
      height: "auto",
      opacity: 1,
      transition: { duration: 0.4, ease: "easeInOut" },
    },
    closed: {
      height: 0,
      opacity: 0,
      transition: { duration: 0.4, ease: "easeInOut" },
    },
  };

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-md fixed top-0 left-0 w-full z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Left - Logo & Toggle Button */}
          <div className="flex items-center space-x-4">
            {/* Menu Toggle for Small Screens */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 text-gray-600 dark:text-white xl:hidden"
            >
              <Menu size={26} />
            </button>
            <Link href="/" className="text-xl font-bold text-red-600">
              BigWig
            </Link>
          </div>

          {/* Center - Navigation for XL Screens */}
          <div className="hidden xl:flex space-x-6">
            {navItems[role as keyof typeof navItems]?.map(
              ({ name, href, icon }) => (
                <Link
                  key={href}
                  href={href}
                  className="text-gray-700 dark:text-white flex items-center space-x-2 hover:text-red-600"
                >
                  <span>{name}</span>
                </Link>
              )
            )}
          </div>

          {/* Right - Dark Mode & Logout */}
          <div className="flex items-center space-x-4">
            {/* Dark Mode */}
            <button
              onClick={toggleDarkMode}
              className="p-2 text-gray-600 dark:text-white"
            >
              {darkMode ? <Sun size={22} /> : <Moon size={22} />}
            </button>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="p-2 text-gray-600 dark:text-white flex items-center space-x-2"
            >
              <LogOut size={22} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown Menu with Smooth Open & Close Animation */}
      <motion.div
        initial="closed"
        animate={menuOpen ? "open" : "closed"}
        variants={menuVariants}
        className="overflow-hidden xl:hidden bg-white dark:bg-gray-900 shadow-md"
      >
        <div className="py-2">
          {navItems[role as keyof typeof navItems]?.map(
            ({ name, href, icon }) => (
              <Link
                key={href}
                href={href}
                className="px-6 py-2 text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center space-x-2"
              >
                {icon} <span>{name}</span>
              </Link>
            )
          )}
        </div>
      </motion.div>
    </nav>
  );
}
