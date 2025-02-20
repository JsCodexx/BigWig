"use client";

import Image from "next/image";

import { motion } from "framer-motion";
const clientLogos = [
  { src: "/logos/bahria.png", alt: "Bahria" },
  { src: "/logos/cda.png", alt: "CDA" },
  { src: "/logos/gfc.jpg", alt: "GFC" },
  { src: "/logos/hemani.png", alt: "Hemani" },
  { src: "/logos/imarat.jpg", alt: "Imarat" },
  { src: "/logos/j.png", alt: "J." },
  { src: "/logos/khadi.jpg", alt: "Khaadi" },
  { src: "/logos/limelight.jpg", alt: "Limelight" },
  { src: "/logos/nha.webp", alt: "NHA" },
  { src: "/logos/dimond.jpg", alt: "DimondFoam" },
  { src: "/logos/nlc.png", alt: "NLC" },
  { src: "/logos/sana.jpg", alt: "SanaSafinaz" },
];

// Duplicate logos for seamless looping
const scrollingLogos = [...clientLogos, ...clientLogos];

const ClientsSlider = () => {
  return (
    <section className="py-16 text-center overflow-hidden bg-gray-100">
      <motion.h2
        className="text-4xl font-bold text-red-500"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        Our Clients
      </motion.h2>
      <motion.p
        className="mt-4 text-lg text-gray-700 dark:text-gray-300 max-w-3xl mx-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.5 }}
      >
        Trusted by global brands, we take pride in partnering with industry
        leaders to deliver outstanding advertising solutions. Our clients
        include some of the world’s most recognized and respected companies.
      </motion.p>

      <div className="relative w-full overflow-hidden">
        <div className="flex whitespace-nowrap animate-scroll">
          {scrollingLogos.map((logo, idx) => (
            <div key={idx} className="mx-6 flex-shrink-0 hover:zoom-in-110">
              <Image
                src={logo.src}
                alt={logo.alt}
                width={100}
                height={100}
                className="h-16 w-auto hover:zoom-in-150"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ClientsSlider;
