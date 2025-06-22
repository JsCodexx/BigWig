"use client";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import {
  ArrowLeft,
  MapPin,
  MoveRight,
  Calendar,
  Ruler,
  ShieldAlert,
  MessageCircle,
  Info,
  FileText,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import ContactUs from "@/components/landing/ContactUs";
import { motion } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import { Autoplay, Navigation } from "swiper/modules";
import Image from "next/image";
import { Billboard } from "@/types/product";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { formatReadableDate } from "@/lib/utils";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function BillboardDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const [billboard, setBillboards] = useState<Billboard | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBillboards = async () => {
      const { data, error } = await supabase
        .from("bill_boards")
        .select("*")
        .eq("id", params.id)
        .single();

      if (error || !data) {
        setError("Billboard Not Found");
        setBillboards(null);
      } else {
        setBillboards(data);
      }
      setLoading(false);
    };

    fetchBillboards();
  }, [params?.id]);

  if (loading) {
    return <div className="text-center py-20">Loading...</div>;
  }

  if (error || !billboard) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold text-gray-600 dark:text-gray-300">
          {error}
        </h1>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6rounded shadow space-y-8 px-6 py-12">
      <Breadcrumb className="mb-4">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/products">Billboards</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Details</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div>
        <h1 className="text-3xl font-bold text-red-700 flex items-center gap-2">
          <FileText className="text-red-600" /> Billboard Details
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          View more about your billboard
        </p>
      </div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white dark:bg-zinc-900 grid grid-cols-1 md:grid-cols-2 gap-10"
      >
        {/* Image Slider */}
        <div className="w-full">
          <Swiper
            modules={[Autoplay, Navigation]}
            navigation
            autoplay={{ delay: 4000 }}
            loop={true}
            className="rounded-xl overflow-hidden shadow-lg"
          >
            {[billboard.avatar, ...(billboard.gallery || [])]
              .filter(
                (img): img is string =>
                  typeof img === "string" && img.length > 0
              )
              .map((image, index) => (
                <SwiperSlide key={index}>
                  <Image
                    src={image}
                    alt={`Billboard image ${index + 1}`}
                    width={700}
                    height={450}
                    className="object-cover w-full h-[400px]"
                  />
                </SwiperSlide>
              ))}
          </Swiper>
        </div>

        {/* Billboard Info */}
        <div className="flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center text-lg gap-2 text-gray-700 dark:text-gray-300">
              <MapPin className="text-red-600" />
              <span>{billboard.location}</span>
            </div>

            <div className="flex items-center text-lg gap-2 text-gray-700 dark:text-gray-300">
              <MoveRight className="text-red-600" />
              <span>Facing: {billboard.facing_to}</span>
            </div>

            <div className="flex items-center text-lg gap-2 text-gray-700 dark:text-gray-300">
              <Calendar className="text-red-600" />
              <span>
                {billboard.equipped_until
                  ? `Equipped Until: ${formatReadableDate(
                      billboard.equipped_until
                    )}`
                  : "Available Now"}
              </span>
            </div>

            <div className="flex items-center text-lg gap-2 text-gray-700 dark:text-gray-300">
              <Ruler className="text-red-600" />
              <span>
                Size: {billboard.length} x {billboard.width}
              </span>
            </div>

            <div className="flex items-center text-lg gap-2 text-gray-700">
              <ShieldAlert className="text-red-600" />
              Status:
              <span
                className={`font-semibold ${
                  billboard.status === "out_of_order"
                    ? "text-gray-400"
                    : "text-green-600"
                }`}
              >
                {billboard.status.replace("_", " ").toUpperCase()}
              </span>
            </div>
          </div>

          {/* Contact Section */}
          <div className="border-t pt-4 dark:border-zinc-700">
            <ContactUs />
          </div>
        </div>
      </motion.div>
      <a
        href="https://wa.me/923329277000?text=Hello,%20I'm%20interested%20in%20your%20billboard"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg transition"
      >
        <MessageCircle className="w-6 h-6" />
      </a>
    </div>
  );
}
