"use client";

import BillboardList from "@/components/BillboardList";

export default function Billboards() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">All Billboards</h1>
      <BillboardList />
    </div>
  );
}
