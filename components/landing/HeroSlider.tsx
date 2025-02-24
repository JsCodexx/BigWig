"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, EffectFade } from "swiper/modules";
import { createClient } from "@supabase/supabase-js";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/effect-fade";
import { Button } from "../ui/button";

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
      modules={[Pagination, EffectFade]}
      pagination={{ clickable: true }}
      effect="fade"
      allowTouchMove={false}
      className="w-full h-[50vh] sm:h-[60vh] md:h-[70vh] lg:h-[85vh] xl:h-[90vh]"
    >
      {slides.map((slide, index) => (
        <SwiperSlide key={slide.id} className="relative w-full h-full">
          {/* Background Image */}
          <div className="relative w-full h-full min-h-screen overflow-hidden">
            <Image
              src={slide.image_url}
              alt={slide.title}
              fill
              className="object-cover w-full h-full"
              priority={index === 0}
            />
          </div>

          {/* Overlay Content */}
          <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white text-center px-4 md:px-6">
            {/* Show only title & subtitle on mobile, full content on larger screens */}
            <div className="w-full flex justify-around items-center">
              {/* Title & Subtitle (Always visible) */}
              <div className="block sm:block md:block lg:block xl:block">
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-red-500">
                  {slide.title}
                </h2>
                <p className="text-sm sm:text-lg md:text-xl mt-2">
                  {slide.subtitle}
                </p>
              </div>

              {/* Filter Section (Hide on mobile, show on medium screens & above) */}
              <div className=" sm:hidden md:block lg:block xl:block w-full md:max-w-[50%] flex flex-col gap-4 bg-accent/30 border border-red-700 px-4 py-4 rounded-lg justify-center items-center backdrop-blur-lg mt-4">
                <div className="flex flex-col md:flex-row gap-4 w-full">
                  {/* Destination */}
                  <div className="flex items-start gap-1 flex-col w-full mb-3">
                    <label
                      htmlFor="destination"
                      className="text-foreground/80 pl-1"
                    >
                      Destination
                    </label>
                    <select
                      id="destination"
                      className="border border-foreground/20 bg-accent px-4 py-2 text-foreground focus:outline-none rounded-md"
                    >
                      <option className="bg-accent" value="">
                        Select a destination
                      </option>
                      <option className="bg-accent" value="lahore">
                        Lahore
                      </option>
                      <option className="bg-accent" value="islamabad">
                        Islamabad
                      </option>
                      <option className="bg-accent" value="rawalpindi">
                        Rawalpindi
                      </option>
                      <option className="bg-accent" value="karachi">
                        Karachi
                      </option>
                    </select>
                  </div>

                  {/* Availability */}
                  <div className="flex items-start gap-1 flex-col w-full mb-3">
                    <label
                      htmlFor="availability"
                      className="text-foreground/80 pl-1"
                    >
                      Availability
                    </label>
                    <select
                      id="availability"
                      className="border border-foreground/20 bg-accent px-4 py-2 text-foreground focus:outline-none rounded-md"
                    >
                      <option className="bg-accent" value="">
                        Select availability
                      </option>
                      <option className="bg-accent" value="equipped">
                        Equipped
                      </option>
                      <option className="bg-accent" value="available">
                        Available
                      </option>
                      <option className="bg-accent" value="not_working">
                        Not Working
                      </option>
                    </select>
                  </div>

                  {/* Type */}
                  <div className="xl:flex items-start hidden gap-1 flex-col w-full mb-3">
                    <label htmlFor="type" className="text-foreground/80 pl-1">
                      Type
                    </label>
                    <select
                      id="type"
                      className="border border-foreground/20 bg-accent px-4 py-2 text-foreground focus:outline-none rounded-md"
                    >
                      <option className="bg-accent" value="">
                        Select type
                      </option>
                      <option className="bg-accent" value="vinyl">
                        Vinyl
                      </option>
                      <option className="bg-accent" value="facia">
                        Facia
                      </option>
                      <option className="bg-accent" value="3d">
                        3D
                      </option>
                    </select>
                  </div>
                </div>

                <Button className="w-full bg-red-600 hover:bg-red-700">
                  Explore
                </Button>
              </div>
            </div>
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  );
};

export default HeroSlider;
