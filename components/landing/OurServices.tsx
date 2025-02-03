"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Megaphone, Tv, Briefcase } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils"; // Utility function for conditional classes

const services = [
  {
    title: "Digital Billboards",
    description:
      "Engage your audience with high-resolution digital displays for maximum impact.",
    icon: <Tv className="h-10 w-10" />,
  },
  {
    title: "Traditional Billboards",
    description:
      "Reach a wider audience with bold and large-format static advertising.",
    icon: <Megaphone className="h-10 w-10" />,
  },
  {
    title: "Custom Campaigns",
    description:
      "Tailor your advertising strategy to fit your brand’s unique needs.",
    icon: <Briefcase className="h-10 w-10" />,
  },
];

const OurServices = () => {
  const { theme } = useTheme();

  return (
    <section className="py-16">
      <h2 className="text-4xl font-bold text-center">Our Services</h2>
      <p className="text-center text-muted-foreground mt-4 max-w-2xl mx-auto">
        Transform your brand visibility with our innovative billboard solutions.
      </p>

      <div className="grid md:grid-cols-3 gap-8 mt-12 px-6">
        {services.map((service, idx) => (
          <Card
            key={idx}
            className={cn(
              "p-8 rounded-xl shadow-xl transform transition-all duration-300 hover:scale-105",
              theme === "dark"
                ? "bg-gray-800 text-white"
                : "bg-[#990100] text-white"
            )}
          >
            <CardContent className="flex flex-col items-center text-center">
              <div
                className={cn(
                  "p-4 rounded-full mb-4",
                  theme === "dark"
                    ? "bg-white/20 text-white"
                    : "bg-white/30 text-[#990100]"
                )}
              >
                {service.icon}
              </div>
              <h3 className="text-2xl font-semibold">{service.title}</h3>
              <p className="mt-2 text-white/90">{service.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
};

export default OurServices;
