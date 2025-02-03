"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";

const OurMission = () => {
  const { theme } = useTheme();

  return (
    <section className="py-16 px-6 bg-gray-100 dark:bg-gray-900">
      <div className="max-w-5xl mx-auto text-center">
        <motion.h2
          className="text-4xl font-bold"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          Our Mission
        </motion.h2>
        <motion.p
          className="mt-4 text-lg text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
        >
          Empowering businesses with high-impact, cutting-edge billboard
          advertising solutions that drive engagement and brand awareness.
        </motion.p>
      </div>

      {/* Image & Text Section */}
      <div className="mt-12 flex flex-col md:flex-row items-center justify-center gap-8">
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
          className="md:w-1/2 space-y-6"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, delay: 1 }}
        >
          <div className="flex items-center space-x-4">
            <div className="p-4 bg-[#990100] text-white rounded-full shadow-lg">
              📈
            </div>
            <div>
              <h3 className="text-xl font-semibold">Data-Driven Strategies</h3>
              <p className="text-muted-foreground">
                We use analytics to optimize billboard placements for maximum
                impact.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="p-4 bg-[#990100] text-white rounded-full shadow-lg">
              🚀
            </div>
            <div>
              <h3 className="text-xl font-semibold">High Visibility</h3>
              <p className="text-muted-foreground">
                Our billboards ensure your brand reaches a massive audience
                24/7.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="p-4 bg-[#990100] text-white rounded-full shadow-lg">
              🌍
            </div>
            <div>
              <h3 className="text-xl font-semibold">Eco-Friendly Solutions</h3>
              <p className="text-muted-foreground">
                We embrace sustainable digital billboard technology.
              </p>
            </div>
          </div>
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
