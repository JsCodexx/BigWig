"use client";

import { useUser } from "@/context/UserContext";
import Link from "next/link";
import { useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import {
  Menu,
  LogOut,
  Users,
  FileText,
  ShoppingCart,
  Clapperboard,
  PenLine,
  UserCircle2,
  ListOrdered,
  DollarSign,
  LayoutDashboard,
  DollarSignIcon,
} from "lucide-react";
import Cookies from "js-cookie";
import { motion } from "framer-motion";
import Image from "next/image";

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

  // Navigation links for different roles
  const navItems = {
    admin: [
      { name: "Manage Users", href: "/admin/users", icon: <Users size={20} /> },
      {
        name: "Dashboard",
        href: "/admin",
        icon: <LayoutDashboard size={20} />,
      },
      { name: "Surveys", href: "/surveyor", icon: <FileText size={20} /> },
      {
        name: "Payments",
        href: "/admin/payments",
        icon: <DollarSign size={20} />,
      },
      {
        name: "Carousel",
        href: "/admin/carousel",
        icon: <Clapperboard size={20} />,
      },
      {
        name: "Assign Surveyor",
        href: "/admin/quotes",
        icon: <ListOrdered size={20} />,
      },
      {
        name: "Billboards",
        href: "/products",
        icon: <ShoppingCart size={20} />,
      },
      {
        name: "Satisfactory Forms",
        href: "/admin/client_comments",
        icon: <FileText size={20} />,
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
      {
        name: "Payments",
        href: "/surveyor/payments",
        icon: <DollarSign size={20} />,
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

      {
        name: "Payments",
        href: "/client/payments",
        icon: <DollarSignIcon size={20} />,
      },
    ],
  };

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-md fixed top-0 left-0 w-full z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Left - Logo & Menu Toggle */}
          <div className="flex items-center space-x-4">
            {user?.user_role === "admin" && (
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="p-2 text-gray-600 dark:text-white md:hidden"
              >
                <Menu size={26} />
              </button>
            )}
            <Link href="/">
              <Image
                src="/logo.webp"
                alt="BigWig Logo"
                width={150}
                height={50}
                className="h-auto w-auto"
              />
            </Link>
          </div>

          {/* Center - Navigation (Only Admin Above md) */}
          {user?.user_role === "admin" && (
            <div className="hidden lg:flex lg:space-x-6 space-x-2">
              {navItems.admin.map(({ name, href }) => (
                <Link
                  key={href}
                  href={href}
                  className="text-gray-700 dark:text-white hover:text-red-600"
                >
                  {name}
                </Link>
              ))}
            </div>
          )}

          {/* Right - Profile Dropdown */}
          <div className="flex items-center space-x-4">
            {user ? (
              // Profile Dropdown
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="p-2 text-gray-600 dark:text-white flex items-center space-x-2"
                >
                  <UserCircle2 size={28} />
                </button>

                {/* Dropdown Menu */}
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={
                    dropdownOpen ? { opacity: 1, y: 0 } : { opacity: 0, y: -10 }
                  }
                  transition={{ duration: 0.2 }}
                  className={`absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden transition-all duration-300 
    ${
      dropdownOpen
        ? "pointer-events-auto visible"
        : "pointer-events-none invisible"
    }`}
                >
                  {/* Admin Links (Only Below md) */}
                  {user?.user_role === "admin" && (
                    <div className="lg:hidden">
                      {navItems.admin.map(({ name, href, icon }) => (
                        <Link
                          key={href}
                          href={href}
                          className="flex items-center px-4 py-2 text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          {icon} <span className="ml-2">{name}</span>
                        </Link>
                      ))}
                    </div>
                  )}

                  {/* Surveyor & Client Links (Always in Dropdown) */}
                  {role &&
                    role !== "admin" &&
                    navItems[role as keyof typeof navItems].map(
                      ({ name, href, icon }) => (
                        <Link
                          key={href}
                          href={href}
                          className="flex items-center px-4 py-2 text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          {icon} <span className="ml-2">{name}</span>
                        </Link>
                      )
                    )}

                  {/* Logout Button */}
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-gray-600 dark:text-white flex items-center space-x-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <LogOut size={22} />
                    <span>Logout</span>
                  </button>
                </motion.div>
              </div>
            ) : (
              // Login Button if Not Logged In
              <Link
                href="/auth/login"
                className="px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-lg"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Dropdown Menu (Admin Links Only Below md) */}
      {user?.user_role === "admin" && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={
            menuOpen
              ? { height: "auto", opacity: 1 }
              : { height: 0, opacity: 0 }
          }
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="overflow-hidden md:hidden bg-white dark:bg-gray-900 shadow-md"
        >
          <div className="py-2">
            {navItems.admin.map(({ name, href, icon }) => (
              <Link
                key={href}
                href={href}
                className="px-6 py-2 text-gray-700 dark:text-white flex items-center space-x-2 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                {icon} <span>{name}</span>
              </Link>
            ))}
          </div>
        </motion.div>
      )}
    </nav>
  );
}
