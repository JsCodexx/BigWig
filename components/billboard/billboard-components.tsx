"use client";

import { Billboard } from "@/types/product";
import { useRouter } from "next/navigation";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import { formatDistanceToNow } from "date-fns";
import { Calendar, Clock, Eye, MapPin } from "lucide-react";
export function BillboardCard({ billboard }: { billboard: Billboard }) {
  const router = useRouter();
  return (
    <div className="dark:bg-red-700 bg-white space-y-2 shadow-lg text-red-700 border hover:scale-105 dark:text-white rounded-lg p-4 transition-transform duration-300">
      <Swiper
        modules={[Autoplay, Pagination]}
        autoplay={{ delay: 3000, disableOnInteraction: false }}
        pagination={{ clickable: true }}
        className="w-full h-48"
      >
        {billboard.gallery && billboard.gallery.length > 0 ? (
          billboard.gallery.map((image, index) => (
            <SwiperSlide key={index}>
              <img
                src={image || "/placeholder.jpg"}
                alt={`Billboard ${index + 1}`}
                className="w-full h-48 object-cover rounded-md"
              />
            </SwiperSlide>
          ))
        ) : (
          <SwiperSlide>
            <img
              src={billboard.avatar || "/placeholder.jpg"}
              alt="Billboard"
              className="w-full h-48 object-cover rounded-md"
            />
          </SwiperSlide>
        )}
      </Swiper>

      <h2 className="text-xl font-bold mt-2 flex items-center gap-2 dark:text-white text-red-700">
        <MapPin size={18} className="text-pink-500" />
        {billboard.location}
      </h2>

      <p className="text-sm flex items-center gap-2">
        <Eye size={18} className="text-pink-500" /> Facing:{" "}
        {billboard.facing_to}
      </p>

      <p
        className={`text-sm flex items-center gap-2 mt-1 ${
          billboard.status === "out_of_order" ? "text-gray-400" : "text-red-700"
        }`}
      >
        <Clock size={18} className="text-pink-500" /> Status: {billboard.status}
      </p>

      {billboard.equipped_until && (
        <p className="text-sm flex items-center gap-2 mt-1 text-gray-300">
          <Calendar size={18} className="text-pink-500" /> Equipped Till:
          {formatDistanceToNow(new Date(billboard.equipped_until))}
        </p>
      )}

      {/* Created At & Updated At */}
      {billboard.created_at && (
        <p className="text-xs text-gray-400 flex items-center gap-2 mt-1">
          <Calendar size={14} className="text-pink-500" /> Added:{" "}
          {formatDistanceToNow(new Date(billboard.created_at))} ago
        </p>
      )}

      {billboard.updated_at && (
        <p className="text-xs text-gray-400 flex items-center gap-2">
          <Clock size={14} className="text-pink-500" /> Updated:{" "}
          {formatDistanceToNow(new Date(billboard.updated_at))} ago
        </p>
      )}

      <p
        onClick={() => router.push(`/products/${billboard.id}`)}
        className="w-full text-right underline cursor-pointer text-xs  text-red-600 rounded-md mt-2"
      >
        View Details
      </p>
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
    <div className="mb-4 flex flex-wrap gap-2 sm:gap-4 overflow-x-auto">
      {["all", "equipped", "available", "out_of_order", "near_me"].map(
        (status) => (
          <button
            key={status}
            onClick={() => onSelectStatus(status)}
            className={`px-4 py-2 rounded-md text-white dark:text-black transition-all whitespace-nowrap ${
              selectedStatus === status
                ? "bg-red-700 dark:bg-red-500"
                : "bg-gray-300 dark:bg-gray-700"
            }`}
          >
            {status.replace("_", " ").toUpperCase()}
          </button>
        )
      )}
    </div>
  );
}
