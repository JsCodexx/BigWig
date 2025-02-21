"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";

const OurMission = () => {
  const { theme } = useTheme();

  return (
    <section className="relative py-16 px-6 bg-[#f3f3f3] dark:bg-gray-900 md:mt-11">
      {/* Top-left corner design */}
      <div className="absolute top-0 left-0 w-24 h-24 border-l-4 border-t-4 border-red-500"></div>
      {/* Bottom-right corner design */}
      <div className="absolute bottom-0 right-0 w-24 h-24 border-b-4 border-r-4  border-red-500"></div>

      <div className="max-w-6xl mx-auto text-center">
        <motion.h2
          className="text-4xl font-bold text-red-500"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          Our Mission
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

      {/* Image & Text Section */}
      <div className="mt-12 flex flex-col md:flex-row items-center justify-between gap-12">
        <motion.div
          className="md:w-1/2"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, delay: 0.8 }}
        >
          <Image
            src="/images/slide2.webp"
            alt="Billboard Advertising"
            width={600}
            height={400}
            className="rounded-lg shadow-lg"
          />
        </motion.div>

        <motion.div
          className="md:w-1/2 space-y-6 text-gray-800 dark:text-gray-300"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, delay: 1 }}
        >
          <p className="text-lg leading-relaxed">
            Our mission is to provide businesses with premium advertising
            platforms that captivate audiences and enhance brand recognition.
            Through strategic placement and advanced technology, we ensure
            brands shine in high-traffic locations, maximizing engagement and
            impact.
          </p>
          <p className="text-lg leading-relaxed">
            By integrating data-driven insights and sustainable practices, we
            strive to push the boundaries of outdoor advertising, making it more
            effective, efficient, and environmentally conscious.
          </p>
        </motion.div>
      </div>

      {/* CTA Button */}
      <div className="mt-12 text-center">
        <Button
          className={`text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 ${
            theme === "dark"
              ? "bg-red-700 hover:bg-red-600"
              : "bg-[#990100] hover:bg-red-700"
          }`}
        >
          Learn More
        </Button>
      </div>
    </section>
  );
};
export default OurMission;
