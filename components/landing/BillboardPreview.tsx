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
  const prevRef = useRef(null);
  const nextRef = useRef(null);

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
      <motion.h2
        className="text-3xl font-bold text-center text-red-700 dark:text-red-500"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        Featured Billboards
      </motion.h2>
      <p className="text-center text-gray-600 dark:text-gray-300 mt-2">
        Explore a selection of our premium billboard locations.
      </p>

      <div className="relative w-full mt-6">
        {billboards.length > 0 ? (
          <Swiper
            modules={[Navigation, Autoplay, Pagination]}
            autoplay={{
              delay: 2500,
              disableOnInteraction: false,
            }}
            speed={1000}
            loop={true}
            rewind={false}
            navigation={{
              prevEl: prevRef.current,
              nextEl: nextRef.current,
            }}
            spaceBetween={20}
            breakpoints={{
              520: { slidesPerView: 2 },
              768: { slidesPerView: 2 },
              968: { slidesPerView: 3 },
              1440: { slidesPerView: 4 },
            }}
            className="w-full"
          >
            {billboards.map((billboard) => (
              <SwiperSlide key={billboard.id}>
                <BillboardCard board={billboard} />
              </SwiperSlide>
            ))}
          </Swiper>
        ) : (
          <p className="text-center text-gray-500 w-full">
            No billboards available.
          </p>
        )}

        {/* Navigation Buttons - Positioned at Bottom */}
        <div className="absolute top-[50px] left-0 z-10">
          <button
            ref={prevRef}
            className="text-red-700 min:w-5 p-2 rounded-lg shadow-lg"
          >
            <ChevronLeft className="text-4xl" />
          </button>
        </div>

        <div className="absolute top-[50px] right-0 z-10">
          <button
            ref={nextRef}
            className="text-red-700 min:w-5 p-2 rounded-lg shadow-lg"
          >
            <ChevronRight className="text-4xl" />
          </button>
        </div>
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
