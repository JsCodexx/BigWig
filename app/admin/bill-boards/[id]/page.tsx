"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { motion } from "framer-motion";
import { ChevronLeft, Info } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import { Autoplay, Navigation } from "swiper/modules";
import { Billboard } from "@/types/product";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
export default function BillboardDetail() {
  const { id } = useParams();
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [billboard, setBillboard] = useState<Billboard>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBillboard = async () => {
      const { data, error } = await supabase
        .from("bill_boards")
        .select("*")
        .eq("id", id)
        .single();

      if (error) console.error("Error fetching billboard:", error);
      else setBillboard(data);
      setLoading(false);
    };
    fetchBillboard();
  }, [id, supabase]);

  if (loading) return <p className="text-center text-lg">Loading...</p>;
  if (!billboard)
    return <p className="text-center text-lg">Billboard not found.</p>;

  const {
    location,
    length,
    width,
    facing_to,
    status,
    equipped_until,
    gallery,
  } = billboard;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30 }}
      transition={{ duration: 0.3 }}
    >
      <Breadcrumb className="mb-4">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/admin">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/admin/bill-boards">
              Billboards
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Details</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div>
        <h1 className="text-3xl font-bold text-red-700 flex items-center gap-2">
          <Info className="text-red-600" /> Board Details
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          Full details of the boards
        </p>
      </div>

      {/* Image Slider */}
      <div className="relative w-full max-h-[400px] bg-gray-200 dark:bg-gray-800 rounded-lg overflow-hidden">
        {gallery && gallery.length > 0 ? (
          <Swiper
            spaceBetween={10}
            slidesPerView={1}
            loop
            modules={[Navigation, Autoplay]}
          >
            {gallery.map((image, index) => (
              <SwiperSlide key={index}>
                <Image
                  src={image}
                  alt={`Gallery Image ${index + 1}`}
                  width={800}
                  height={400}
                  className="rounded-lg w-full h-auto object-cover"
                />
              </SwiperSlide>
            ))}
          </Swiper>
        ) : (
          <p className="flex items-center justify-center h-full text-gray-500">
            No Images Available
          </p>
        )}
      </div>

      {/* Billboard Details */}
      <Card className="mt-6 p-6 space-y-2 shadow-lg rounded-xl">
        <p className="text-lg font-semibold">{location}</p>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Facing: {facing_to}
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Size: {length} x {width}
        </p>
        <p
          className={`text-sm font-medium ${
            status === "equipped"
              ? "text-green-600"
              : status === "available"
              ? "text-blue-600"
              : "text-gray-500"
          }`}
        >
          Status: {status}
        </p>
        {status === "equipped" && equipped_until && (
          <p className="text-xs text-red-500">
            Equipped Until: {new Date(equipped_until).toLocaleString()}
          </p>
        )}
      </Card>

      {/* Back Button */}
      <Button
        className="mt-4 w-full bg-red-700 dark:bg-red-500 text-white flex items-center justify-center"
        onClick={() => router.push("/admin/bill-boards")}
      >
        <ChevronLeft className="w-5 h-5 mr-2" />
        Back to Billboards
      </Button>
    </motion.div>
  );
}
