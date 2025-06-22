"use client";

import { useUser } from "@/context/UserContext";
import Link from "next/link";
import { useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import {
  Menu,
  LogOut,
  UserCircle2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import Cookies from "js-cookie";
import { motion } from "framer-motion";
import Image from "next/image";
import { navItems } from "@/app/data/nav";
type Role = "admin" | "surveyor";
export function Navbar() {
  const { role, user } = useUser();
  const supabase = createClientComponentClient();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [landingDropdownOpen, setLandingDropdownOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    Cookies.remove("token");
    Cookies.remove("sb-ebpmscwwmktnudufncts-auth-token");
    sessionStorage.removeItem("supabase.auth.token");
    window.location.href = "/auth/login";
  };

  // Determine current nav items based on user role, fallback to empty array
  const currentNavItems = (() => {
    if (role && ["admin", "surveyor"].includes(role)) {
      return navItems[role as Role];
    }
    return [];
  })();

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-md fixed top-0 left-0 w-full z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo & Mobile Menu Toggle */}
          <div className="flex items-center space-x-4">
            {/* Show menu button for all users (below lg) */}
            {/* {user && (
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="p-2 text-gray-600 dark:text-white md:hidden"
                aria-label="Toggle Menu"
              >
                <Menu size={26} />
              </button>
            )} */}
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

          {/* Desktop Nav - show for all users */}
          {user && (
            <div className="hidden lg:flex lg:space-x-6 space-x-2">
              {currentNavItems.map((item: any) =>
                item.children ? (
                  <div key={item.name} className="relative">
                    <button
                      onClick={() =>
                        setLandingDropdownOpen(!landingDropdownOpen)
                      }
                      className="text-gray-700 dark:text-white hover:text-red-600 flex items-center space-x-1"
                      aria-haspopup="true"
                      aria-expanded={landingDropdownOpen}
                    >
                      {item.name}
                      {landingDropdownOpen ? (
                        <ChevronUp size={18} />
                      ) : (
                        <ChevronDown size={18} />
                      )}
                    </button>
                    {landingDropdownOpen && (
                      <div className="absolute top-full mt-2 bg-white dark:bg-gray-800 shadow-lg rounded-md z-50">
                        {item.children.map((child: any) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            className="block px-4 py-2 text-sm text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            <div className="flex items-center space-x-2 min-w-[100px]">
                              <span>{child.name}</span>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="text-gray-700 dark:text-white hover:text-red-600"
                  >
                    {item.name}
                  </Link>
                )
              )}
            </div>
          )}

          {/* Right Side - Profile or Login */}
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="p-2 text-gray-600 dark:text-white flex items-center space-x-2"
                  aria-label="User menu"
                >
                  <UserCircle2 size={28} />
                </button>
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={
                    dropdownOpen ? { opacity: 1, y: 0 } : { opacity: 0, y: -10 }
                  }
                  transition={{ duration: 0.2 }}
                  className={`absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden transition-all duration-300 ${
                    dropdownOpen
                      ? "pointer-events-auto visible"
                      : "pointer-events-none invisible"
                  }`}
                >
                  {/* Dropdown Nav Items for all roles */}
                  <div className="lg:hidden">
                    {currentNavItems.map(({ name, href, children }) =>
                      children ? (
                        <div
                          key={name}
                          className="border-b border-gray-200 dark:border-gray-700"
                        >
                          <span className="block px-4 py-2 font-semibold text-gray-900 dark:text-white">
                            {name}
                          </span>
                          {children.map((child: any) => (
                            <Link
                              key={child.href}
                              href={child.href || "#"}
                              className="flex items-center px-6 py-2 text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                              <span className="ml-2">{child.name}</span>
                            </Link>
                          ))}
                        </div>
                      ) : href ? (
                        <Link
                          key={href}
                          href={href}
                          className="flex items-center px-4 py-2 text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          <span className="ml-2">{name}</span>
                        </Link>
                      ) : null
                    )}
                  </div>

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

      {/* Mobile Menu for all users */}
      {/* {user && (
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
            {currentNavItems.map((item: any) =>
              item.children ? (
                <div key={item.name} className="px-6">
                  <button
                    onClick={() => setLandingDropdownOpen(!landingDropdownOpen)}
                    className="w-full flex justify-between items-center text-gray-700 dark:text-white py-2 hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <div className="flex items-center space-x-2">
                      <span>{item.name}</span>
                    </div>
                    {landingDropdownOpen ? (
                      <ChevronUp size={16} />
                    ) : (
                      <ChevronDown size={16} />
                    )}
                  </button>
                  {landingDropdownOpen &&
                    item.children.map((child: any) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className="block pl-10 py-2 text-sm text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
                      >
                        <div className="flex items-center space-x-2">
                          <span>{child.name}</span>
                        </div>
                      </Link>
                    ))}
                </div>
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  className="px-6 py-2 text-gray-700 dark:text-white flex items-center space-x-2 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <span>{item.name}</span>
                </Link>
              )
            )}
          </div>
        </motion.div>
      )} */}
    </nav>
  );
}
