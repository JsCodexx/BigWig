"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import {
  BillboardCard,
  BillboardFilter,
} from "@/components/billboard/billboard-components";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUser } from "@/context/UserContext";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Billboard = {
  id: number;
  length: string;
  width: string;
  location: string;
  facing_to: string;
  status: "equipped" | "available" | "out_of_order";
  equipped_until?: string | null;
  avatar?: string | null;
  gallery?: string[];
};

export default function BillboardsPage() {
  const [billboards, setBillboards] = useState<Billboard[]>([]);
  const [filteredBillboards, setFilteredBillboards] = useState<Billboard[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string | null>("all");
  const { user } = useUser();
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
    <div className="py-16 px-6 max-w-5xl mx-auto">
      <div
        className="mb-8 w-full flex justify-between
       items-center"
      >
        <h1 className="text-4xl font-bold text-red-500">Billboards</h1>
        {user && user.user_role === "admin" && (
          <Button className="bg-red-600 hover:bg-red-700">
            <Plus />
            Add Board
          </Button>
        )}
      </div>

      <BillboardFilter
        selectedStatus={selectedStatus}
        onSelectStatus={setSelectedStatus}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredBillboards.map((billboard) => (
          <BillboardCard key={billboard.id} billboard={billboard} />
        ))}
      </div>
    </div>
  );
}
