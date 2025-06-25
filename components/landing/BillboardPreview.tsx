"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Billboard } from "@/types/product";
import { supabase } from "@/app/lib/supabase/Clientsupabase";
import { BillboardCard } from "../billboard/billboard-components";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { ChevronLeft, ChevronRight } from "lucide-react";

const BillboardPreview = () => {
  const [billboards, setBillboards] = useState<Billboard[]>([]);
  const router = useRouter();

  // Refs for custom navigation buttons

  useEffect(() => {
    const fetchBillboards = async () => {
      const { data, error } = await supabase
        .from("bill_boards")
        .select("*")
        .limit(6);
      if (error) console.error("Error fetching billboards:", error);
      else setBillboards(data);
    };

    fetchBillboards();
  }, []);

  return (
    <section className="py-12 px-6 bg-white dark:bg-gray-900">
      <div className="max-w-6xl mx-auto text-center">
        <motion.h2
          className="text-4xl font-bold text-red-500"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          Featured Billboards
        </motion.h2>
        <motion.p
          className="mt-4 text-lg text-gray-700 dark:text-gray-300 max-w-3xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
        >
          Explore a curated selection of our most impactful billboard locations.
          Each site is strategically chosen to maximize visibility and brand
          reach
        </motion.p>
      </div>

      <div className="relative w-full mt-6 ">
        {billboards.length > 0 ? (
          <Swiper
            modules={[Autoplay, Pagination]}
            autoplay={{
              delay: 2500,
              disableOnInteraction: false,
            }}
            speed={1000}
            loop={true}
            rewind={false}
            spaceBetween={20}
            centeredSlides={billboards.length < 3} // ✅ Center only when there are 1-2 slides
            breakpoints={{
              720: { slidesPerView: Math.min(billboards.length, 2) },
              1440: { slidesPerView: Math.min(billboards.length, 3) },
            }}
            className="w-full"
          >
            {billboards.map((billboard) => (
              <SwiperSlide key={billboard.id} className="flex justify-center">
                <BillboardCard board={billboard} />
              </SwiperSlide>
            ))}
          </Swiper>
        ) : (
          <p className="text-center text-gray-500 w-full">
            No billboards available.
          </p>
        )}
      </div>

      <div className="flex justify-center mt-12">
        <Button
          onClick={() => router.push("/products")}
          className="bg-red-700 hover:bg-red-800 text-white px-6 py-2 rounded-lg text-lg"
        >
          Show More
        </Button>
      </div>
    </section>
  );
};

export default BillboardPreview;
