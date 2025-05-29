"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { supabase } from "@/app/lib/supabase/Clientsupabase";

const MasonryGrid = () => {
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

  return (
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
  );
};

export default MasonryGrid;
