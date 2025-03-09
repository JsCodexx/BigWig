"use client";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import {
  BillboardCard,
  BillboardFilter,
} from "@/components/billboard/billboard-components";
import { ChevronRight, Filter, Plus, Search } from "lucide-react";
import { useUser } from "@/context/UserContext";
import { useRouter } from "next/navigation";
import { Billboard } from "@/types/product";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function BillboardsPage() {
  const [billboards, setBillboards] = useState<Billboard[]>([]);
  const [filteredBillboards, setFilteredBillboards] = useState<Billboard[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string | null>("all");
  const { user } = useUser();
  const router = useRouter();
  const [location, setLocation] = useState<{
    city: string;
    country: string;
  } | null>(null);
  useEffect(() => {
    const fetchBillboards = async () => {
      const { data, error } = await supabase.from("bill_boards").select("*");
      if (error) console.error("Error fetching billboards:", error);
      else setBillboards(data);
    };

    fetchBillboards();
  }, []);

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const res = await fetch("https://get.geojs.io/v1/ip/geo.json");
        const data = await res.json();
        setLocation({ city: data.city, country: data.country });
      } catch (error) {
        console.error("Error fetching location:", error);
      }
    };
    fetchLocation();
  }, []);

  useEffect(() => {
    let filtered = billboards;

    if (!selectedStatus || selectedStatus === "all") {
      setFilteredBillboards(filtered);
      return;
    }

    if (selectedStatus) {
      filtered = filtered.filter((b) => b.status === selectedStatus);
    }

    if (selectedStatus === "near_me" && location) {
      filtered = filtered.filter((b) => b.location.includes(location?.city));
    }

    setFilteredBillboards(filtered);
  }, [selectedStatus, location, billboards]);

  useEffect(() => {
    console.log(filteredBillboards);
  }, [filteredBillboards]);
  return (
    <div className="mb-4 md:px-16 px-2 max-w-full mx-auto">
      <div
        className="mb-8 w-full flex justify-between
       items-center"
      ></div>
      {/* Breadcrumbs */}
      <nav className="flex items-center text-sm text-gray-600 mb-4">
        <span onClick={() => router.push("/")}>Home</span>
        <ChevronRight size={14} className="mx-2" />
        <span className="font-medium text-red-500">Shop Boards</span>
      </nav>
      {/* Search Input */}
      <div className="flex max-w-xl items-center border border-gray-300 rounded-md px-2 py-2">
        <Search size={18} className="text-gray-400" />
        <input
          type="text"
          placeholder="Search location..."
          className="ml-2 outline-none text-sm"
        />
      </div>
      <BillboardFilter
        selectedStatus={selectedStatus}
        onSelectStatus={setSelectedStatus}
      />
      {/* Heading + Filter Row */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold">
            Residential Properties for Sale in Islamabad
          </h1>
          <p className="text-sm text-gray-500">
            {filteredBillboards.length} properties available
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Filter Button */}
          <button className="flex items-center gap-2 bg-gray-200 px-4 py-2 rounded-md text-sm hover:bg-gray-300 transition-colors">
            <Filter size={18} />
            More Filters
          </button>

          {/* New Listings Button */}
          {user && user.user_role === "admin" && (
            <button
              onClick={() => router.push("/admin/add-board")}
              className="bg-red-500 text-white px-4 py-2 rounded-md text-sm hover:bg-red-600 transition-colors"
            >
              + New Listings
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBillboards.map((billboard) => (
          <BillboardCard key={billboard.id} board={billboard} />
        ))}
      </div>
    </div>
  );
}
