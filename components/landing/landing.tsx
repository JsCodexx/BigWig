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
export default function Landing() {
  return (
    <div className="bg-background text-foreground">
      {/* Hero Section */}
      <section className="relative h-[40vh] sm:h-[60vh] md:h-[70vh] lg:h-[85vh]">
        <HeroSlider />
      </section>

      {/* Our Mission */}
      <OurMission />

      {/* We Offer */}
      <WeOffer />

      {/* Our Services */}
      <OurServices />

      {/* Gallery */}
      <section className="min-h-screen bg-white dark:bg-gray-900 p-4 text-center">
        <motion.h2
          className="text-4xl font-bold text-red-500"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          Gallery
        </motion.h2>
        <MasonryGrid />
      </section>

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
