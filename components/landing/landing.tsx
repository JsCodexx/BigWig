"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/autoplay";
import { Autoplay } from "swiper/modules";
import HeroSlider from "./HeroSlider";
import MasonryGrid from "./MasnoryGrid";
import ClientsSlider from "./ClientSlider";
import OurServices from "./OurServices";
import ContactUs from "./ContactUs";
import OurMission from "./OurMission";
import WeOffer from "./WeOffer";
import { motion } from "framer-motion";
import BillboardPreview from "./BillboardPreview";
export default function Landing() {
  return (
    <div className="bg-background text-foreground">
      {/* Hero Section */}
      <section className="relative">
        <HeroSlider />
      </section>

      {/* Boards */}
      <BillboardPreview />

      {/* Our Mission */}
      <OurMission />

      {/* We Offer */}
      <WeOffer />

      {/* Our Services */}
      <OurServices />

      {/* Gallery */}
      <div className="max-w-6xl py-16 px-6 mx-auto text-center">
        <motion.h2
          className="text-4xl font-bold text-red-500"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          Our Gallery
        </motion.h2>
        <motion.p
          className="mt-4 text-lg text-gray-700 dark:text-gray-300 max-w-3xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
        >
          We are committed to revolutionizing billboard advertising by
          delivering innovative, high-visibility, and eco-friendly solutions
          that help brands create lasting impressions.
        </motion.p>
      </div>
      <MasonryGrid />

      {/* Our Clients */}
      <ClientsSlider />

      {/* Contact Us */}
      <ContactUs />

      {/* Footer */}
      <footer className="py-6 bg-muted text-center">
        <p>&copy; 2025 Billboard Advertising Co. All rights reserved.</p>
      </footer>
    </div>
  );
}
