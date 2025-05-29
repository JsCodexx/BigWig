"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

interface SectionContent {
  title: string;
  subtitle: string;
  paragraphs: string[];
  image_url: string;
}

const WeOffer = () => {
  const { theme } = useTheme();
  const supabase = createClientComponentClient();

  const [content, setContent] = useState<SectionContent>({
    title: "",
    subtitle: "",
    paragraphs: [],
    image_url: "",
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      const { data, error } = await supabase
        .from("page_sections")
        .select("*")
        .eq("section_slug", "we-offer")
        .single();

      if (data) {
        let paragraphs = data.paragraphs;
        if (typeof paragraphs === "string") {
          try {
            paragraphs = JSON.parse(paragraphs);
          } catch {
            paragraphs = [paragraphs];
          }
        }

        setContent({
          title: data.title || "We Offer",
          subtitle: data.subtitle || "",
          paragraphs: Array.isArray(paragraphs) ? paragraphs : [],
          image_url: data.image_url || "/images/slide3.webp",
        });
      }

      setLoading(false);
    };

    fetchContent();
  }, [supabase]);

  if (loading) return <p className="text-center py-10">Loading...</p>;

  return (
    <section className="relative py-16 px-6 bg-white dark:bg-gray-900">
      {/* Top-left & Bottom-right corner design */}
      <div className="absolute top-0 left-0 w-24 h-24 border-l-4 border-t-4 border-red-500"></div>
      <div className="absolute bottom-0 right-0 w-24 h-24 border-b-4 border-r-4 border-red-500"></div>

      <div className="max-w-6xl mx-auto text-center">
        <motion.h2
          className="text-4xl font-bold text-red-500"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          {content.title}
        </motion.h2>

        {content.subtitle && (
          <motion.p
            className="mt-4 text-lg text-gray-700 dark:text-gray-300 max-w-3xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
          >
            {content.subtitle}
          </motion.p>
        )}
      </div>

      {/* Image & Text Section */}
      <div className="mt-12 flex flex-col md:flex-row items-center justify-between gap-12">
        {/* Left: Paragraphs */}
        <motion.div
          className="md:w-1/2 space-y-6 text-gray-800 dark:text-gray-300"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, delay: 0.8 }}
        >
          {content.paragraphs.map((para, idx) => (
            <p key={idx} className="text-lg leading-relaxed">
              {para}
            </p>
          ))}
        </motion.div>

        {/* Right: Image */}
        <motion.div
          className="md:w-1/2"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, delay: 1 }}
        >
          <Image
            src={content.image_url}
            alt="We Offer Image"
            width={600}
            height={400}
            className="rounded-lg shadow-lg"
          />
        </motion.div>
      </div>

      {/* CTA Button (Not from DB) */}
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
