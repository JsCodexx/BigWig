"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";

const WeOffer = () => {
  const { theme } = useTheme();

  return (
    <section className="relative py-16 px-6 bg-white dark:bg-gray-900">
      {/* Top-left corner design */}
      <div className="absolute top-0 left-0 w-24 h-24 border-l-4 border-t-4 border-red-500"></div>
      {/* Bottom-right corner design */}
      <div className="absolute bottom-0 right-0 w-24 h-24 border-b-4 border-r-4 border-red-500"></div>

      <div className="max-w-6xl mx-auto text-center">
        <motion.h2
          className="text-4xl font-bold text-red-500"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          We Offer
        </motion.h2>
        <motion.p
          className="mt-4 text-lg text-gray-700 dark:text-gray-300 max-w-3xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
        >
          We offer a diverse range of billboard advertising solutions designed
          to amplify brand visibility and maximize audience engagement.
        </motion.p>
      </div>

      {/* Image & Text Section */}
      <div className="mt-12 flex flex-col md:flex-row items-center justify-between gap-12">
        {/* Text Section (Left) */}
        <motion.div
          className="md:w-1/2 space-y-6 text-gray-800 dark:text-gray-300"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, delay: 0.8 }}
        >
          <p className="text-lg leading-relaxed">
            {` Our comprehensive advertising services cater to a wide range of
            industries, ensuring that your brand gets the attention it deserves.
            Whether it's **Digital Billboards**, **Traditional Out-of-Home
            Ads**, or **Custom Campaigns**, we have a solution tailored for you.`}
          </p>
          <p className="text-lg leading-relaxed">
            With cutting-edge technology and strategic placements, we enhance
            brand reach and engagement, making your message **unmissable**.
          </p>
        </motion.div>

        {/* Image Section (Right) */}
        <motion.div
          className="md:w-1/2"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, delay: 1 }}
        >
          <Image
            src="/images/slide3.webp"
            alt="Billboard Advertising"
            width={600}
            height={400}
            className="rounded-lg shadow-lg"
          />
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
          Explore Services
        </Button>
      </div>
    </section>
  );
};

export default WeOffer;
