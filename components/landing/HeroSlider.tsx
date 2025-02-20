"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import { createClient } from "@supabase/supabase-js";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const HeroSlider = () => {
  const [slides, setSlides] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSlides();
  }, []);

  const fetchSlides = async () => {
    const { data, error } = await supabase
      .from("slides")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching slides:", error);
    } else {
      setSlides(data);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-white">
        Loading...
      </div>
    );
  }

  return (
<Swiper
  modules={[Navigation, Pagination, Autoplay]}
  navigation
  pagination={{ clickable: true }}
  autoplay={{ delay: 3000 }}
  loop
  className="w-full h-[40vh] sm:h-[60vh] md:h-[70vh] lg:h-[85vh]" // Set a fixed height
>
  {slides.map((slide, index) => (
    <SwiperSlide key={slide.id} className="relative w-full h-full">
      {/* Background Image Container */}
      <div className="relative w-full h-full">
        <Image
          src={slide.image_url}
          alt={slide.title}
          fill
          className="object-cover"
          priority={index === 0} 
        />
      </div>

      {/* Overlay Content */}
      <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white text-center px-4 md:px-6">
        <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold">
          {slide.title}
        </h2>
        <p className="text-sm sm:text-lg md:text-xl mt-2">
          {slide.subtitle}
        </p>
      </div>
    </SwiperSlide>
  ))}
</Swiper>

  );
};

export default HeroSlider;
