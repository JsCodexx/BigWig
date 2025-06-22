"use client";

import { Billboard } from "@/types/product";
import { useRouter } from "next/navigation";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import { formatDistanceToNow } from "date-fns";
import { Calendar, ChevronRight, Heart, MapPin } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
export function BillboardCard({ board }: { board: Billboard }) {
  const router = useRouter();

  return (
    <div className="border rounded-xl overflow-hidden shadow-sm bg-white transition hover:shadow-md md:w-[350px] w-[300px]">
      {/* Slider */}
      <div className="relative">
        <Swiper
          modules={[Pagination, Navigation]}
          pagination={{ clickable: true }}
          navigation
          className="w-full h-full"
        >
          <style>
            {`
              .swiper-pagination-bullet {
                background-color: #9ca3af !important;
                opacity: 1;
              }
              .swiper-pagination-bullet-active {
                background-color: #dc2626 !important;
              }
              .swiper-button-next,
              .swiper-button-prev {
                color: white !important;
                background: rgba(0,0,0,0.7);
                width: 28px !important;
                height: 28px !important;
                border-radius: 50%;
              }
              .swiper-button-next::after,
              .swiper-button-prev::after {
                font-size: 14px !important;
              }
            `}
          </style>

          {(board?.gallery?.length ?? 0) > 0 ? (
            board.gallery &&
            board.gallery.map((imgUrl, idx) => (
              <SwiperSlide key={idx}>
                <img
                  src={imgUrl || "/placeholder.jpg"}
                  alt={`Slide ${idx}`}
                  className="w-full h-40 object-cover"
                />
              </SwiperSlide>
            ))
          ) : (
            <SwiperSlide>
              <img
                src={board?.avatar || "/placeholder.jpg"}
                alt="Default"
                className="w-full h-40 object-cover"
              />
            </SwiperSlide>
          )}
        </Swiper>

        {/* Heart */}
        <button className="absolute bottom-2 right-2 z-10 bg-white/20 p-1 rounded-full backdrop-blur">
          <Heart className="text-white w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      <div className="p-3 space-y-2">
        <p className="text-[18px] font-semibold text-gray-800">
          {board?.location}
        </p>

        <div className="flex justify-between text-xs text-gray-600">
          <span>Facing {board?.facing_to}</span>
          <span className="flex items-center gap-1">
            <MapPin size={12} />
            <span
              className={`capitalize ${
                board?.status === "equipped" ? "text-red-600" : "text-green-600"
              }`}
            >
              {board?.status}
            </span>
          </span>
        </div>

        {board?.equipped_until && (
          <div className="text-xs text-gray-700 flex items-center gap-1">
            <Calendar size={12} /> Equipped:{" "}
            {formatDistanceToNow(new Date(board.equipped_until))}
          </div>
        )}

        {board?.created_at && (
          <div className="text-xs text-gray-700 flex items-center gap-1">
            <Calendar size={12} /> Added:{" "}
            {formatDistanceToNow(new Date(board.created_at))} ago
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="mx-auto w-[85%] h-[1px] bg-gray-200" />

      {/* CTA */}
      <div className="w-full text-center py-2">
        <Link
          href={`/products/${board?.id}`}
          className="text-sm font-semibold text-gray-800 hover:text-red-600 flex items-center justify-center gap-1"
        >
          View Details <ChevronRight size={16} />
        </Link>
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
