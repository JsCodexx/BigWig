"use client";

import { useUser } from "@/context/UserContext";
import Link from "next/link";
import { useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import {
  Menu,
  LogOut,
  Users,
  Bell,
  FileText,
  ShoppingCart,
  Clapperboard,
  PenLine,
  UserCircle2,
  ListOrdered,
} from "lucide-react";
import Cookies from "js-cookie";
import { motion } from "framer-motion";

export function Navbar() {
  const { role, user } = useUser();
  const supabase = createClientComponentClient();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    Cookies.remove("token");
    Cookies.remove("sb-ebpmscwwmktnudufncts-auth-token");
    sessionStorage.removeItem("supabase.auth.token");
    window.location.href = "/auth/login";
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
        name: "Quotes",
        href: "/admin/quotes",
        icon: <ListOrdered size={20} />,
      },
      // { name: "Remarks", href: "/admin/remarks", icon: <FileText size={20} /> },
      {
        name: "Billboards",
        href: "/products",
        icon: <ShoppingCart size={20} />,
      },
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
        name: "Assigned Quotes",
        href: "/surveyor/quotes",
        icon: <ListOrdered size={20} />,
      },
    ],
    client: [
      {
        name: "My Quotes",
        href: "/client/quotes",
        icon: <ListOrdered size={20} />,
      },
      {
        name: "My Surveys",
        href: "/client/surveys",
        icon: <FileText size={20} />,
      },
      // {
      //   name: "Submitted Remarks",
      //   href: "/client/remarks",
      //   icon: <FileText size={20} />,
      // },
    ],
  };

  // Motion animation settings
  const menuVariants = {
    open: {
      height: "auto",
      opacity: 1,
      transition: { duration: 0.3, ease: "easeInOut" },
    },
    closed: {
      height: 0,
      opacity: 0,
      transition: { duration: 0.3, ease: "easeInOut" },
    },
  };

  const dropdownVariants = {
    open: { opacity: 1, y: 0, transition: { duration: 0.2 } },
    closed: { opacity: 0, y: -10, transition: { duration: 0.2 } },
  };

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-md fixed top-0 left-0 w-full z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Left - Logo & Toggle Button */}
          <div className="flex items-center space-x-4">
            {user?.user_role === "admin" && (
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="p-2 text-gray-600 dark:text-white xl:hidden"
              >
                <Menu size={26} />
              </button>
            )}
            <Link href="/" className="text-xl font-bold text-red-600">
              BigWig
            </Link>
          </div>

          {/* Center - Navigation for XL Screens (Only Admin) */}
          {role === "admin" && (
            <div className="hidden xl:flex space-x-6">
              {navItems.admin.map(({ name, href, icon }) => (
                <Link
                  key={href}
                  href={href}
                  className="text-gray-700 dark:text-white flex items-center space-x-2 hover:text-red-600"
                >
                  <span>{name}</span>
                </Link>
              ))}
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-gray-600 dark:text-white flex items-center space-x-2"
              >
                <LogOut size={22} />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          )}

          {/* Right - Profile Dropdown & Logout */}
          <div className="flex items-center space-x-4">
            {/* Profile Dropdown for Surveyors & Clients */}
            {role !== "admin" && (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="p-2 text-gray-600 dark:text-white flex items-center space-x-2"
                >
                  <UserCircle2 size={28} />
                </button>

                {/* Dropdown Menu */}
                <motion.div
                  initial="closed"
                  animate={dropdownOpen ? "open" : "closed"}
                  variants={dropdownVariants}
                  className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden"
                >
                  {navItems[role as keyof typeof navItems]?.map(
                    ({ name, href, icon }) => (
                      <Link
                        key={href}
                        href={href}
                        className="flex items-center px-4 py-2 text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => setDropdownOpen(false)} // Close dropdown on click
                      >
                        {icon}
                        <span className="ml-2">{name}</span>
                      </Link>
                    )
                  )}
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 text-gray-600 dark:text-white flex items-center space-x-2"
                  >
                    <LogOut size={22} />
                    <span className="hidden sm:inline">Logout</span>
                  </button>
                </motion.div>
              </div>
            )}

            {/* Logout Button */}
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
          {role === "admin" &&
            navItems.admin.map(({ name, href, icon }) => (
              <Link
                key={href}
                href={href}
                className="px-6 py-2 text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center space-x-2"
              >
                {icon} <span>{name}</span>
              </Link>
            ))}
          <button
            onClick={handleLogout}
            className="px-6 py-2 text-gray-600 dark:text-white flex items-center space-x-2"
          >
            <LogOut size={22} />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </motion.div>
    </nav>
  );
}
