"use client";
import { Instagram, TicketIcon, Twitter, Youtube } from "lucide-react";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="bg-black text-white py-10 px-6 md:px-20">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center md:items-start">
        {/* Left Section - Logo & Copyright */}
        <div className="text-center md:text-left mb-6 md:mb-0">
          <div className="flex items-center gap-2">
            <Image
              src="/wLogo.webp"
              alt="Company Logo"
              width={200}
              height={150}
              priority
            />
          </div>
          <p className="text-gray-400 text-sm mt-2">
            Designed by Flipper Devices Inc. <br />© 2024. All rights reserved.
          </p>
        </div>

        {/* Middle Section - Navigation Links */}
        <div className="grid grid-cols-2 gap-6 text-center md:text-left">
          <div className="space-y-4">
            <p className="text-gray-300 cursor-pointer hover:text-white">
              Shop
            </p>
            <p className="text-gray-300 cursor-pointer hover:text-white">
              Downloads
            </p>
            <p className="text-gray-300 cursor-pointer hover:text-white">
              Blog
            </p>
          </div>
          <div className="space-y-5">
            <p className="text-gray-300 cursor-pointer hover:text-white">
              About Us
            </p>
            <p className="text-gray-300 cursor-pointer hover:text-white">
              Contacts
            </p>
            <p className="text-gray-300 cursor-pointer hover:text-white">
              Privacy Policy
            </p>
          </div>
        </div>

        {/* Right Section - Social Icons & Address */}
        <div className="text-center md:text-right mt-6 md:mt-0">
          <div className="flex justify-center md:justify-end gap-4 text-gray-300">
            <Instagram className="w-6 h-6 cursor-pointer hover:text-white" />
            <Twitter className="w-6 h-6 cursor-pointer hover:text-white" />
            <TicketIcon className="w-6 h-6 cursor-pointer hover:text-white" />
            <Youtube className="w-6 h-6 cursor-pointer hover:text-white" />
          </div>
          <p className="text-gray-400 text-sm mt-4">
            2025 Rawalpindi Sadar, Suite B #551 <br />
            SadarBazar, RWP <br />
            Dial Number: +923106030609
          </p>
        </div>
      </div>
    </footer>
  );
}
