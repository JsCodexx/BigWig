"use client";

import { Billboard } from "@/types/product";
import { useRouter } from "next/navigation";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import { formatDistanceToNow } from "date-fns";
import { Calendar, ChevronRight, Heart, MapPin } from "lucide-react";
import { motion } from "framer-motion";
export function BillboardCard({ board }: { board: Billboard }) {
  const router = useRouter();
  return (
    <div
      key={board?.id}
      className="border rounded-sm overflow-hidden w-[300px]"
    >
      <div className="relative">
        {/* Swiper Slider replacing single <img> */}
        <Swiper
          modules={[Autoplay, Pagination]}
          autoplay={{ delay: 3000, disableOnInteraction: false }}
          pagination={{ clickable: true }}
          className="w-full"
        >
          <style>
            {`
        .swiper-pagination-bullet {
        background-color: rgb(111, 114, 111) !important; /* Gray-500 */
        opacity: 1;
}
      .swiper-pagination-bullet-active {
          background-color: rgb(220, 38, 38) !important; /* Darker Red */
      }
    `}
          </style>
          {/* If board?.gallery has images, map them; otherwise fallback to board?.image */}
          {board?.gallery && board?.gallery.length > 0 ? (
            board?.gallery.map((imgUrl, index) => (
              <SwiperSlide key={index}>
                <img
                  src={imgUrl || "/placeholder.jpg"}
                  alt="Property"
                  className="w-full h-36 object-fit"
                />
              </SwiperSlide>
            ))
          ) : (
            <SwiperSlide>
              <img
                src={board?.avatar || "/placeholder.jpg"}
                alt="Property"
                className="w-full h-36 object-cover"
              />
            </SwiperSlide>
          )}
        </Swiper>

        {/* Favorite / Heart Button */}
        <button className="absolute bottom-2 z-10 right-2 bg-white/20 p-1 rounded-full shadow">
          <Heart className="text-white w-4 h-4" />
        </button>
      </div>

      <div className="p-2 min-h-[120px]">
        <p className=" mt-1 text-[18px] font-semibold text-[#37474F]">
          {board?.location}
        </p>
        <div className="flex justify-between items-center">
          <span className="flex">
            <h2 className="text-[#37474F] text-[12px]">
              Facing {board?.facing_to}
            </h2>
          </span>
          <span className="flex items-center justify-center">
            <MapPin className="text-gray-500" size={12} />
            <p
              className={`text-sm capitalize ${
                board?.status === "equipped" ? "text-red-600" : "text-green-500"
              }`}
            >
              {board?.status}
            </p>
          </span>
        </div>
        <div className="flex justify-between items-center mb-1">
          <a
            href="https://www.flaticon.com/free-icons/out-of-stock"
            title="out of stock icons"
          >
            Out of stock icons created by Hilmy Abiyyu A. - Flaticon
          </a>
          {board?.equipped_until && (
            <p className="text-[12px] flex items-center gap-2 mt-1 text-[#37474F] ">
              <a
                href="https://www.flaticon.com/free-icons/out-of-stock"
                title="out of stock icons"
              >
                <Calendar size={10} className="text-pink-500" /> Equipped:
                {formatDistanceToNow(new Date(board?.equipped_until))}
              </a>
            </p>
          )}
        </div>
        {/* Created At & Updated At */}
        {board?.created_at && (
          <p className="text-[12px] flex items-center gap-2 mt-1 text-[#37474F]  mb-2">
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
      </div>
      {/* Example 'View Details' */}
      <div className="w-full flex justify-center items-center">
        <div className="w-[85%] h-[1px] bg-gray-200"></div>
      </div>
      <div className="w-full h-6 md:h-10 flex justify-center items-center p-1 sm:py-2">
        <button
          onClick={() => router.push(`/products/${board?.id}`)}
          className="mt-1 text-[14px] font-semibold text-[#37474F] flex justify-center items-center"
        >
          {`View Details`}
          <span>
            <ChevronRight />
          </span>
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
