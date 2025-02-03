"use client";

import { BillboardForm } from "@/components/BillboardForm";

export default function AddBoardPage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Add a New Billboard</h1>
      <BillboardForm />
    </div>
  );
}
