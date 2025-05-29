"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useTheme } from "next-themes";

interface SectionContent {
  title: string;
  subtitle: string;
  paragraphs: string[];
  image_url: string;
  button_text: string;
  button_link: string;
}

const OurMission = () => {
  const supabase = createClientComponentClient();
  const [content, setContent] = useState<SectionContent | null>(null);
  const { theme } = useTheme();

  useEffect(() => {
    const fetchContent = async () => {
      const { data, error } = await supabase
        .from("page_sections")
        .select("*")
        .eq("section_slug", "our-mission")
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
    <section className="relative py-16 px-6 bg-[#f3f3f3] dark:bg-gray-900 ">
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
        <motion.p
          className="mt-4 text-lg text-gray-700 dark:text-gray-300 max-w-3xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
        >
          {content.subtitle}
        </motion.p>
      </div>

      <div className="mt-12 flex flex-col md:flex-row items-center justify-between gap-12">
        <motion.div
          className="md:w-1/2"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, delay: 0.8 }}
        >
          <Image
            src={content.image_url}
            alt="Our Mission"
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
          {content.paragraphs.map((p, i) => (
            <p className="text-lg leading-relaxed" key={i}>
              {p}
            </p>
          ))}
        </motion.div>
      </div>

      <div className="mt-12 text-center">
        <a href={"/"}>
          <Button
            className={`text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 ${
              theme === "dark"
                ? "bg-red-700 hover:bg-red-600"
                : "bg-[#990100] hover:bg-red-700"
            }`}
          >
            {"Learn More"}
          </Button>
        </a>
      </div>
    </section>
  );
};

export default OurMission;
