"use client";

import Image from "next/image";

const clientLogos = [
  { src: "/logos/nike.png", alt: "Nike" },
  { src: "/logos/adidas.png", alt: "Adidas" },
  { src: "/logos/lv.jpg", alt: "Louis Vuitton" },
  { src: "/logos/puma.png", alt: "Puma" },
  { src: "/logos/gucci.webp", alt: "Gucci" },
  { src: "/logos/apple.png", alt: "Apple" },
  { src: "/logos/samsung.jpg", alt: "Samsung" },
];

// Duplicate logos for seamless looping
const scrollingLogos = [...clientLogos, ...clientLogos];

const ClientsSlider = () => {
  return (
    <section className="py-16 text-center overflow-hidden">
      <h2 className="text-3xl font-bold mb-4">Our Clients</h2>
      <p className="text-muted-foreground max-w-2xl mx-auto mb-6">
        Trusted by global brands, we take pride in partnering with industry
        leaders to deliver outstanding advertising solutions. Our clients
        include some of the world’s most recognized and respected companies.
      </p>

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
