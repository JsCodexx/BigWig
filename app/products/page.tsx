"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import {
  BillboardCard,
  BillboardFilter,
} from "@/components/billboard/billboard-components";

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
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
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
    console.log(selectedStatus);
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
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Available Billboards</h1>
        <p className="text-muted-foreground">
          Find the best billboards for your needs.
        </p>
      </div>

      <BillboardFilter
        selectedStatus={selectedStatus}
        onSelectStatus={setSelectedStatus}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredBillboards.map((billboard) => (
          <BillboardCard key={billboard.id} billboard={billboard} />
        ))}
      </div>
    </div>
  );
}
