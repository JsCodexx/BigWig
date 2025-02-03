"use client";

import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

// Image data with text overlays
const slides = [
  {
    src: "/images/slide1.webp",
    title: "High-Impact Billboard Ads",
    subtitle: "Boost your brand visibility",
  },
  {
    src: "/images/slide2.webp",
    title: "Premium Ad Spaces",
    subtitle: "Strategic locations for maximum exposure",
  },
  {
    src: "/images/slide3.webp",
    title: "Digital Billboards",
    subtitle: "Dynamic advertising solutions",
  },
  {
    src: "/images/slide4.webp",
    title: "24/7 Exposure",
    subtitle: "Reach audiences around the clock",
  },
  {
    src: "/images/slide5.webp",
    title: "Innovative Ad Displays",
    subtitle: "Cutting-edge billboard technology",
  },
];

const HeroSlider = () => {
  return (
    <Swiper
      modules={[Navigation, Pagination, Autoplay]}
      navigation
      pagination={{ clickable: true }}
      autoplay={{ delay: 3000 }}
      loop
      className="w-full h-screen"
    >
      {slides.map((slide, index) => (
        <SwiperSlide key={index} className="relative w-full h-screen">
          {/* Background Image */}
          <div className="absolute inset-0">
            <Image
              src={slide.src}
              alt={slide.title}
              fill
              className="object-cover"
              priority={index === 0} // Load first image first for performance
            />
          </div>

          {/* Overlay Content */}
          <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white text-center px-6">
            <h2 className="text-4xl md:text-6xl font-bold">{slide.title}</h2>
            <p className="text-lg md:text-xl mt-2">{slide.subtitle}</p>
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  );
};

export default HeroSlider;
