"use client";

import BillboardList from "@/components/BillboardList";

export default function Billboards() {
  return (
    <div className="py-16 px-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold text-red-700 mb-6">All Billboards</h1>
      <BillboardList />
    </div>
  );
}
