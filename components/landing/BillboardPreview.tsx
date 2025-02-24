"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Billboard } from "@/types/product";
import { supabase } from "@/app/lib/supabase/Clientsupabase";
import { BillboardCard } from "../billboard/billboard-components";

const BillboardPreview = () => {
  const [billboards, setBillboards] = useState<Billboard[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchBillboards = async () => {
      const { data, error } = await supabase
        .from("bill_boards")
        .select("*")
        .limit(4);
      if (error) console.error("Error fetching billboards:", error);
      else setBillboards(data);
    };

    fetchBillboards();
  }, []);

  return (
    <section className="py-12 px-6 bg-white dark:bg-gray-900">
      <motion.h2
        className="text-3xl font-bold text-center text-red-700 dark:text-red-500"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        Featured Billboards
      </motion.h2>
      <p className="text-center text-gray-600 dark:text-gray-300 mt-2">
        Explore a selection of our premium billboard locations.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
        {billboards.length > 0 ? (
          billboards.map((billboard) => (
            <BillboardCard key={billboard.id} billboard={billboard} />
          ))
        ) : (
          <p className="text-center text-gray-500 col-span-full">
            No billboards available.
          </p>
        )}
      </div>

      <div className="flex justify-center mt-8">
        <Button
          onClick={() => router.push("/products")}
          className="bg-red-700 hover:bg-red-800 text-white px-6 py-2 rounded-lg text-lg"
        >
          Show More
        </Button>
      </div>
    </section>
  );
};

export default BillboardPreview;
