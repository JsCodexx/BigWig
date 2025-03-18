"use client";
import { motion } from "framer-motion";
import HeroSlider from "./HeroSlider";
import BillboardPreview from "./BillboardPreview";
import OurMission from "./OurMission";
import WeOffer from "./WeOffer";
import OurServices from "./OurServices";
import MasonryGrid from "./MasnoryGrid";
import ClientsSlider from "./ClientSlider";
import ContactUs from "./ContactUs";

export default function Landing() {
  return (
    <div className="bg-background text-foreground">
      {/* Hero Section (Full Width, No Container) */}
      <HeroSlider />

      {/* Billboard Preview */}
      <Section odd>
        <BillboardPreview />
      </Section>

      {/* Our Mission */}
      <Section even>
        <OurMission />
      </Section>

      {/* We Offer */}
      <Section odd>
        <WeOffer />
      </Section>

      {/* Our Services */}
      <Section even>
        <OurServices />
      </Section>

      {/* Gallery */}
      <Section odd className="text-center">
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
        <MasonryGrid />
      </Section>

      {/* Our Clients */}
      <Section even>
        <ClientsSlider />
      </Section>

      {/* Contact Us */}
      <Section odd>
        <ContactUs />
      </Section>
    </div>
  );
}

// ✅ Reusable Section Container with Alternating Colors
function Section({
  children,
  className,
  odd,
  even,
}: {
  children: React.ReactNode;
  className?: string;
  odd?: boolean;
  even?: boolean;
}) {
  return (
    <div
      className={`${
        even ? "bg-gray-100 dark:bg-gray-800" : "bg-white dark:bg-gray-900"
      } w-full`}
    >
      <div className={`max-w-7xl mx-auto py-16 px-6 ${className}`}>
        {children}
      </div>
    </div>
  );
}
