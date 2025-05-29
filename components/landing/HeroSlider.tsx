"use client";

import { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, EffectFade, Autoplay } from "swiper/modules";
import { createClient } from "@supabase/supabase-js";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/effect-fade";
import LocationSearch from "../ui/LocationSearch";
import { useUi } from "@/context/UiContext";
import { useRouter } from "next/navigation";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const HeroSlider = () => {
  const [slides, setSlides] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { setSelectedLocation } = useUi();
  const router = useRouter();

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
      // Put main slide first if exists
      const mainSlide = data.find((s) => s.is_main);
      const otherSlides = data.filter((s) => !s.is_main);
      const sortedSlides = mainSlide ? [mainSlide, ...otherSlides] : data;
      setSlides(sortedSlides);
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
      modules={[Pagination, EffectFade, Autoplay]}
      effect="fade"
      pagination={{ clickable: true }}
      autoplay={
        slides.length > 1
          ? { delay: 4000, disableOnInteraction: false }
          : undefined // Important: use undefined not `false` here
      }
      loop={slides.length > 1} // Ensure continuous loop
      allowTouchMove={false}
      className="w-full h-[50vh] sm:h-[40vh] md:h-[70vh] lg:h-[85vh] xl:h-[90vh]"
    >
      {slides.map((slide) => (
        <SwiperSlide key={slide.id} className="relative w-full h-full">
          <div
            className="absolute inset-0 w-screen h-full bg-no-repeat bg-center bg-cover"
            style={{ backgroundImage: `url(${slide.image_url})` }}
          ></div>

          <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center px-4 md:px-6">
            <div className="w-full flex flex-col gap-4 justify-around items-center">
              <div className="lg:flex hidden w-[50%]">
                <LocationSearch
                  onSelectLocation={(location) => {
                    setSelectedLocation(location);
                    router.push("/products");
                  }}
                />
              </div>
            </div>
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  );
};

export default HeroSlider;
