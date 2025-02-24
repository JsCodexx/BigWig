"use client";

import { BillboardForm } from "@/components/BillboardForm";

export default function AddBoardPage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-4xl font-bold text-red-500">Add a New Billboard</h1>
      <BillboardForm />
    </div>
  );
}
