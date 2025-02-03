"use client";

import { Billboard } from "@/types/product";
import { useRouter } from "next/navigation";

export function BillboardCard({ billboard }: { billboard: Billboard }) {
const router = useRouter()
  return (
    <div className="dark:bg-red-700 bg-white space-y-1 shadow-lg text-red-700 border hover:scale-105 dark:text-white rounded-lg p-4 ">
      <img
        src={billboard.avatar || "/placeholder.jpg"}
        alt="Billboard"
        className="w-full h-48 object-cover rounded-md"
      />
      <h2 className="text-xl font-bold mt-2 dark:text-white text-red-700">
        Location: {billboard.location}
      </h2>
      <p className="text-sm">Facing: {billboard.facing_to}</p>
      <p
        className={`text-sm mt-1 ${
          billboard.status === "out_of_order" ? "text-gray-400" : "text-red-700"
        }`}
      >
        Status: {billboard.status}
      </p>
      {billboard.equipped_until && (
        <p className={`text-sm mt-1 text-gray-300`}>
          Equipped Till: {billboard.equipped_until}
        </p>
      )}
      <button onClick={()=>router.push(`/products/${billboard.id}`)} className="w-full text-center bg-red-700 hover:bg-red-800 text-white p-2 rounded-md">
        See Details
      </button>
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
    <div className="mb-4 flex gap-4">
      {["all", "equipped", "available", "out_of_order", "near_me"].map(
        (status) => (
          <button
            key={status}
            onClick={() => onSelectStatus(status === "all" ? null : status)}
            className={`px-4 py-2 rounded-md text-white dark:text-black transition-all ${
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
