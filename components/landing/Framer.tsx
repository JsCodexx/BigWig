"use client";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { useState, useEffect } from "react";

const images = [
  "/images/slide1.webp",
  "/images/slide2.webp",
  "/images/slide3.webp",
];

const texts = [
  <>
    Bold Impact, <span className="text-red-600">Eco-Friendly</span> Reach
  </>,
  "Text Two",
  "Text Three",
];

export default function ScrollImageChange() {
  const [activeIndex, setActiveIndex] = useState(0);
  const { ref, inView } = useInView({ threshold: 0.5 });

  return (
    <div className="relative h-[300vh] flex">
      {/* Fixed Image Section */}
      <div className="sticky top-0 left-0 w-1/2 h-screen flex items-center justify-center bg-gray-900">
        <motion.img
          key={activeIndex}
          src={images[activeIndex]}
          className="w-96 h-96 object-cover rounded-lg"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
        />
      </div>

      {/* Scrolling Text Section */}
      <div className="w-1/2 flex flex-col">
        {texts.map((text, index) => {
          return (
            <motion.div
              key={index}
              ref={ref}
              className="h-screen flex items-center justify-center text-xl font-bold text-black"
            >
              {text}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
