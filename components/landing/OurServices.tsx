"use client";

import { useState } from "react";
import { useTheme } from "next-themes";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

const services = [
  {
    title: "Advertisement",
    types: [
      { name: "Billboard SMDS Steamer", image: "/images/slide1.webp" },
      { name: "Corporate Shop Branding", image: "/images/slide2.webp" },
      { name: "Advertising Taxation Vendor", image: "/images/slide3.webp" },
      { name: "Graphic Designing", image: "/images/slide4.webp" },
      { name: "Panaflex Printing", image: "/images/slide5.webp" },
      { name: "Workshop Facility", image: "/images/slide1.webp" },
    ],
  },
  {
    title: "3D Visulization",
    types: [
      { name: "3D Architectural Walkthrough", image: "/images/slide1.webp" },
      { name: "3D Floor plan Rendoring", image: "/images/slide1.webp" },
      { name: "3D Interior Exterior Rendoring", image: "/images/slide1.webp" },
      { name: "3D Animation ", image: "/images/slide1.webp" },
      { name: "Arcetectural Visualization", image: "/images/slide1.webp" },
      { name: "Ecommerce Product Visulization", image: "/images/slide1.webp" },
    ],
  },
  {
    title: "Import Export",
    types: [
      { name: "Event Branding", image: "/images/slide1.webp" },
      { name: "Vehicle Wraps", image: "/images/slide1.webp" },
      { name: "Mall Advertising", image: "/images/slide1.webp" },
      { name: "Airport Advertising", image: "/images/slide1.webp" },
      { name: "Train Station Ads", image: "/images/slide1.webp" },
      { name: "Cinema Ads", image: "/images/slide1.webp" },
    ],
  },
  {
    title: "Specialty Advertising",
    types: [
      { name: "Augmented Reality Ads", image: "/images/slide1.webp" },
      { name: "Drone Advertising", image: "/images/slide1.webp" },
      { name: "Holographic Displays", image: "/images/slide1.webp" },
      { name: "Projection Mapping", image: "/images/slide1.webp" },
      { name: "Eco-Friendly Billboards", image: "/images/slide1.webp" },
      { name: "Skywriting Ads", image: "/images/slide1.webp" },
    ],
  },
];

const OurServices = () => {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState(0);

  return (
    <section className="py-16 px-6 bg-gray-100 dark:bg-gray-900 text-center">
      <div className="max-w-6xl mx-auto">
        <motion.h2
          className="text-4xl font-bold text-red-500"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          Our Services
        </motion.h2>
        <motion.p
          className="mt-4 text-lg text-gray-700 dark:text-gray-300 max-w-3xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
        >
          Choose from a variety of high-impact advertising solutions tailored to
          your brand’s needs.
        </motion.p>

        {/* Tabs */}
        <div className="flex justify-center mt-10 border-b border-gray-300 dark:border-gray-700">
          {services.map((service, index) => (
            <button
              key={index}
              onClick={() => setActiveTab(index)}
              className={`px-6 py-3 text-lg font-semibold relative transition-all duration-300 ${
                activeTab === index
                  ? "text-red-500"
                  : "text-gray-600 dark:text-gray-400"
              }`}
            >
              {service.title}
              {activeTab === index && (
                <motion.div
                  layoutId="underline"
                  className="absolute left-0 bottom-0 w-full h-1 bg-red-500 rounded-full"
                />
              )}
            </button>
          ))}
        </div>

        {/* Selected Service Types with Animation */}
        <div className="mt-12">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.5 }}
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-8"
            >
              {services[activeTab].types.map((type, idx) => (
                <motion.div
                  key={idx}
                  className="relative h-48 rounded-lg overflow-hidden shadow-lg group"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                >
                  {/* Background Image */}
                  <Image
                    src={type.image}
                    alt={type.name}
                    layout="fill"
                    objectFit="cover"
                    className="group-hover:scale-110 transition-transform duration-500"
                  />

                  {/* Glass Effect on Hover */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
                    <span className="text-white text-xl font-semibold">
                      {type.name}
                    </span>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};

export default OurServices;
