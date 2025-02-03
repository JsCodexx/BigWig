"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { ArrowLeft, MapPin, MoveRight, Calendar } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import ContactUs from "@/components/landing/ContactUs";
import { motion } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import { Billboard } from "@/types/product";
import { Autoplay, Navigation } from "swiper/modules";
import Image from "next/image";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function BillboardDetailsPage() {
  const params = useParams();
  const [billboard, setBillboard] = useState<Billboard | null>(null);

  useEffect(() => {
    const fetchBillboard = async () => {
      const { data, error } = await supabase
        .from("bill_boards")
        .select("*")
        .eq("id", params.id)
        .single();

      if (error) console.error("Error fetching billboard:", error);
      else setBillboard(data);
    };

    fetchBillboard();
  }, [params.id]);

  if (!billboard) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold">Billboard not found</h1>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Link href="/products">
        <Button variant="ghost" className="mb-8">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Billboards
        </Button>
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="relative"
        >
          <Swiper
            modules={[Autoplay, Navigation]}
            navigation
            autoplay={{ delay: 3000 }} // Auto slide every 3 seconds
            loop={true} // Loop the gallery
            className="rounded-lg shadow-md"
          >
            {[billboard.avatar, ...(billboard.gallery || [])].map(
              (image, index) => (
                <SwiperSlide
                  key={index}
                  className="max-w-[608px] max-h-[450px]"
                >
                  <Image
                    src={image ? image : "https://via.placeholder.com/700"} // Using an actual placeholder URL
                    alt={`Billboard image ${index + 1}`}
                    className="object-cover rounded-lg"
                    width={608}
                    height={450}
                  />
                </SwiperSlide>
              )
            )}
          </Swiper>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          <h1 className="text-3xl font-bold text-red-700 dark:text-white">
            Billboard Details
          </h1>
          <p className="flex items-center gap-2 text-lg">
            <MapPin className="text-red-700" /> Location: {billboard.location}
          </p>
          <p className="flex items-center gap-2 text-lg">
            <MoveRight className="text-red-700" /> Facing: {billboard.facing_to}
          </p>
          <p className="flex items-center gap-2 text-lg">
            <Calendar className="text-red-700" />
            {billboard.equipped_until
              ? `Equipped until: ${billboard.equipped_until}`
              : "Available now"}
          </p>
          <p className="text-lg">
            Size: {billboard.length} x {billboard.width}
          </p>
          <p
            className={`text-lg font-semibold ${
              billboard.status === "out_of_order"
                ? "text-gray-400"
                : "text-red-700"
            }`}
          >
            Status: {billboard.status.replace("_", " ").toUpperCase()}
          </p>
          <ContactUs />
        </motion.div>
      </div>
    </div>
  );
}
