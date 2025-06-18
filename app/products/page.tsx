"use client";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import {
  BillboardCard,
  BillboardFilter,
} from "@/components/billboard/billboard-components";
import {
  ChevronRight,
  Filter,
  Plus,
  Search,
  Table,
  Trash2,
} from "lucide-react";
import { useUser } from "@/context/UserContext";
import { useRouter } from "next/navigation";
import { Billboard } from "@/types/product";
import { useUi } from "@/context/UiContext";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
export default function BillboardsPage() {
  const [billboards, setBillboards] = useState<Billboard[]>([]);
  const [filteredBillboards, setFilteredBillboards] = useState<Billboard[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string | null>("all");
  const { user } = useUser();
  const { selectedLocation, setSelectedLocation } = useUi();
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
  useEffect(() => {}, [selectedLocation]);
  useEffect(() => {
    let filtered = billboards;
    if (selectedLocation == null) {
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
    } else {
      if (selectedLocation && selectedLocation !== null) {
        filtered = billboards.filter(
          (b) => b.location.toLowerCase() === selectedLocation.toLowerCase()
        );
      }
    }
    setFilteredBillboards(filtered);
  }, [selectedStatus, location, billboards, selectedLocation]);

  return (
    <div className="py-16 px-6 max-w-7xl mx-auto">
      {/* Breadcrumbs */}
      <Breadcrumb className="mb-4">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Billboards</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div>
        <h1 className="text-3xl font-bold text-red-700 flex items-center gap-2">
          <Table className="text-red-600" /> Boards
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm">All boards</p>
      </div>

      {/* Search Input */}
      {/* <div className="flex max-w-xl items-center border border-gray-300 rounded-md px-2 py-2">
        <Search size={18} className="text-gray-400" />
        <input
          type="text"
          placeholder="Search location..."
          className="ml-2 outline-none text-sm"
        />
      </div> */}
      <BillboardFilter
        selectedStatus={selectedStatus}
        onSelectStatus={setSelectedStatus}
      />
      {/* Heading + Filter Row */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Total Available</h1>
          <p className="text-sm text-gray-500">
            {filteredBillboards.length} Boards available
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Filter Button */}
          {/* {!selectedLocation && (
            <button className="flex items-center gap-2 bg-gray-200 px-4 py-2 rounded-md text-sm hover:bg-gray-300 transition-colors">
              <Filter size={18} />
              More Filters
            </button>
          )} */}
          {selectedLocation && (
            <>
              <button
                onClick={() => setSelectedLocation(null)}
                className="flex items-center gap-2 bg-gray-200 px-4 py-2 rounded-md text-sm hover:bg-gray-300 transition-colors"
              >
                <Trash2 size={18} />
                Clear Filters
              </button>
            </>
          )}

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
