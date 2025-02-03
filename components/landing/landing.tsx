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

export default function Landing() {
  return (
    <div className="bg-background text-foreground">
      {/* Hero Section */}
      <section className="relative w-full h-screen">
        <HeroSlider />
      </section>

      {/* Our Mission */}
      <OurMission />

      {/* Our Services */}
      <OurServices />

      {/* Gallery */}
      <section className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
        <h1 className="text-3xl font-bold text-center mb-6">
          Pinterest Gallery
        </h1>
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
