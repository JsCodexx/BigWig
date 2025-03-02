"use client";

import { Billboard } from "@/types/product";
import { useRouter } from "next/navigation";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import { formatDistanceToNow } from "date-fns";
import { Calendar, Heart, MapPin } from "lucide-react";
import { motion } from "framer-motion";
export function BillboardCard({ board }: { board: Billboard }) {
  const router = useRouter();
  return (
    <div
      key={board?.id}
      className="border rounded-md overflow-hidden shadow-sm"
    >
      <div className="relative">
        {/* Swiper Slider replacing single <img> */}
        <Swiper
          modules={[Autoplay, Pagination]}
          autoplay={{ delay: 3000, disableOnInteraction: false }}
          pagination={{ clickable: true }}
          className="w-full h-48"
        >
          {/* If board?.gallery has images, map them; otherwise fallback to board?.image */}
          {board?.gallery && board?.gallery.length > 0 ? (
            board?.gallery.map((imgUrl, index) => (
              <SwiperSlide key={index}>
                <img
                  src={imgUrl || "/placeholder.jpg"}
                  alt="Property"
                  className="w-full h-48 object-cover"
                />
              </SwiperSlide>
            ))
          ) : (
            <SwiperSlide>
              <img
                src={board?.avatar || "/placeholder.jpg"}
                alt="Property"
                className="w-full h-48 object-cover"
              />
            </SwiperSlide>
          )}
        </Swiper>

        {/* Favorite / Heart Button */}
        <button className="absolute bottom-2 z-10 right-2 bg-white/20 p-1 rounded-full shadow">
          <Heart className="text-white w-4 h-4" />
        </button>
      </div>

      <div className="p-4">
        <p className=" mt-1 text-lg font-semibold">{board?.location}</p>
        <div className="flex justify-between items-center">
          <span className="flex">
            <h2 className="text-gray-500 text-sm">{board?.facing_to}</h2>
          </span>
          <span className="flex items-center justify-center">
            <MapPin className=" text-gray-500" size={10} />
            <p className="text-red-600 text-sm">{board?.status}</p>
          </span>
        </div>
        <div className="flex justify-between items-center mb-2">
          {board?.equipped_until && (
            <p className="text-sm flex items-center gap-2 mt-1 text-gray-400">
              <Calendar size={10} className="text-pink-500" /> Equipped Till:
              {formatDistanceToNow(new Date(board?.equipped_until))}
            </p>
          )}
        </div>
        {/* Created At & Updated At */}
        {board?.created_at && (
          <p className="text-sm flex items-center gap-2 mt-1 text-gray-400">
            <Calendar size={10} className="text-pink-500" /> Added:{" "}
            {formatDistanceToNow(new Date(board?.created_at))} ago
          </p>
        )}

        {/* {board?.updated_at && (
          <p className="text-xs text-gray-400 flex items-center gap-2">
            <Clock size={14} className="text-pink-500" /> Updated:{" "}
            {formatDistanceToNow(new Date(board?.updated_at))} ago
          </p>
        )} */}
        {/* Example 'View Details' */}
        <button
          onClick={() => router.push(`/properties/${board?.id}`)}
          className="mt-3 underline text-sm text-blue-600 hover:text-blue-800"
        >
          View Details
        </button>
      </div>
    </div>
  );
}

export function BillboardFilter({
  selectedStatus,
  onSelectStatus,
}: {
  selectedStatus: string | null;
  onSelectStatus: (status: string | null) => void;
}) {
  return (
    <div className="relative flex space-x-4 overflow-x-auto p-2">
      {["all", "equipped", "available", "out_of_order", "near_me"].map(
        (status) => (
          <button
            key={status}
            onClick={() => onSelectStatus(status)}
            className="relative px-4 py-2 text-sm font-medium capitalize transition-all"
          >
            {status.replace("_", " ").toUpperCase()}
            {selectedStatus === status && (
              <motion.div
                layoutId="underline"
                className="absolute bottom-0 left-0 w-full h-1 bg-red-600 rounded-full"
              />
            )}
          </button>
        )
      )}
    </div>
  );
}
