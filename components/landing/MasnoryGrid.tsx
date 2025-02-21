"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";

const images = [
  { src: "/images/slide1.webp", alt: "Image 1" },
  { src: "/images/slide2.webp", alt: "Image 2" },
  { src: "/images/slide3.webp", alt: "Image 3" },
  { src: "/images/slide4.webp", alt: "Image 4" },
  { src: "/images/slide5.webp", alt: "Image 5" },
  { src: "/images/slide1.webp", alt: "Image 6" },
];

const MasonryGrid = () => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });

  return (
    <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4">
      {images.map((image, index) => (
        <motion.div
          key={index}
          className="mb-4 break-inside-avoid overflow-hidden rounded-lg shadow-lg relative group"
          onMouseEnter={() => setHoveredIndex(index)}
          onMouseLeave={() => setHoveredIndex(null)}
          onMouseMove={(e) => {
            const { left, top, width, height } =
              e.currentTarget.getBoundingClientRect();
            const x = ((e.clientX - left) / width) * 100;
            const y = ((e.clientY - top) / height) * 100;
            setMousePos({ x, y });
          }}
          initial={{ opacity: 0, y: 50 }} // Start invisible and moved down
          whileInView={{ opacity: 1, y: 0 }} // Trigger animation when in viewport
          transition={{ duration: 1, delay: index * 0.15 }} // Staggered animation
          viewport={{ once: true, amount: 0.3 }} // Start when 30% of the element is visible
        >
          <Image
            src={image.src}
            alt={image.alt}
            width={500}
            height={500}
            className={`w-full transition-transform duration-300 object-cover hover:cursor-zoom-in ${
              hoveredIndex === index ? "scale-150" : "scale-100"
            }`}
            style={{
              transformOrigin: `${mousePos.x}% ${mousePos.y}%`,
            }}
            loading="lazy" // Lazy loading for performance
          />
        </motion.div>
      ))}
    </div>
  );
};

export default MasonryGrid;
