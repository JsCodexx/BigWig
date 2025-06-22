"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { supabase } from "@/app/lib/supabase/Clientsupabase";
interface SectionContent {
  title: string;
  subtitle: string;
}

const MasonryGrid = () => {
  const [content, setContent] = useState<SectionContent | null>(null);
  const [images, setImages] = useState<
    { id: string; image_url: string; title: string }[]
  >([]);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });

  useEffect(() => {
    const fetchImages = async () => {
      const { data, error } = await supabase
        .from("gallery_images")
        .select("*")
        .order("created_at", { ascending: false });
      if (!error && data) setImages(data);
    };
    fetchImages();
  }, []);

  useEffect(() => {
    const fetchContent = async () => {
      const { data, error } = await supabase
        .from("gallery_section")
        .select("*")
        .single();

      if (error) {
        console.error("Failed to fetch content:", error);
        return;
      }

      setContent(data);
    };

    fetchContent();
  }, []);

  if (!content) return null;
  return (
    <div className="w-full flex flex-col justify-start items-center">
      <motion.h2
        className="text-4xl font-bold text-red-500"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        {content.title}
      </motion.h2>
      <motion.p
        className="mt-4 text-lg text-gray-700 dark:text-gray-300 max-w-3xl mx-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.5 }}
      >
        {content.subtitle}
      </motion.p>
      <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 px-6">
        {images.map((image, index) => (
          <motion.div
            key={image.id}
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
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: index * 0.15 }}
            viewport={{ once: true, amount: 0.3 }}
          >
            <Image
              src={image.image_url}
              alt={image.title}
              width={500}
              height={500}
              className={`w-full transition-transform duration-300 object-cover hover:cursor-zoom-in ${
                hoveredIndex === index ? "scale-150" : "scale-100"
              }`}
              style={{ transformOrigin: `${mousePos.x}% ${mousePos.y}%` }}
              loading="lazy"
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default MasonryGrid;
