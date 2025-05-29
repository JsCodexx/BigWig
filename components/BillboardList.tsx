"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Button } from "@/components/ui/button";
import { Menu, MoreVertical, Table, Trash } from "lucide-react";
import Image from "next/image";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import { Billboard } from "@/types/product";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
export default function BillboardList() {
  const supabase = createClientComponentClient();
  const [billboards, setBillboards] = useState<Billboard[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  // 📌 Fetch billboards from Supabase
  useEffect(() => {
    const fetchBillboards = async () => {
      const { data, error } = await supabase.from("bill_boards").select("*");

      if (error) console.error("Error fetching billboards:", error);
      else setBillboards(data);
      setLoading(false);
    };

    fetchBillboards();
  }, [supabase]);

  // 📌 Delete Billboard
  const deleteBillboard = async (id: number) => {
    if (!confirm("Are you sure you want to delete this billboard?")) return;

    const { error } = await supabase.from("bill_boards").delete().eq("id", id);

    if (error) {
      console.error("Error deleting billboard:", error);
    } else {
      setBillboards((prev) => prev.filter((b) => b.id !== id));
    }
  };

  if (loading) return <p className="text-center text-lg">Loading...</p>;

  return (
    <div className="w-full">
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

      <div className="space-y-4">
        {billboards.length === 0 ? (
          <p className="text-center text-gray-500">No billboards found.</p>
        ) : (
          billboards.map((board) => (
            <div
              key={board.id}
              className="flex items-center bg-white dark:bg-gray-900 shadow-md rounded-xl p-4 hover:shadow-lg transition duration-300"
            >
              {/* 📌 Image */}
              <div className="w-32 h-24 rounded-lg overflow-hidden">
                {board.avatar ? (
                  <Image
                    src={board.avatar}
                    alt="Billboard"
                    width={128}
                    height={96}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center text-gray-500">
                    No Image
                  </div>
                )}
              </div>

              {/* 📌 Billboard Details */}
              <div className="ml-4 flex-1">
                <p className="text-lg font-semibold">{board.location}</p>
                <p className="text-sm text-gray-500">
                  Facing: {board.facing_to}
                </p>
                <p className="text-sm text-gray-500">
                  Size: {board.length} x {board.width}
                </p>
                <p
                  className={`text-sm font-medium mt-1 ${
                    board.status === "equipped"
                      ? "text-green-600"
                      : board.status === "available"
                      ? "text-blue-600"
                      : "text-gray-500"
                  }`}
                >
                  Status: {board.status}
                </p>
                {board.status === "equipped" && board.equipped_until && (
                  <p className="text-xs text-red-500">
                    Equipped Until:{" "}
                    {new Date(board.equipped_until).toLocaleString()}
                  </p>
                )}
              </div>

              {/* 📌 Action Menu (3 Dots) */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="rounded-full p-2">
                    <MoreVertical className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="bg-white dark:bg-gray-800 shadow-lg rounded-md"
                >
                  <DropdownMenuItem
                    className="cursor-pointer text-gray-700 dark:text-gray-200"
                    onClick={() =>
                      router.push(`/admin/bill-boards/${board.id}`)
                    } // Redirect to details page
                  >
                    <Menu className="w-4 h-4 mr-2" />
                    View Details
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="cursor-pointer text-red-600 dark:text-red-400"
                    onClick={() => deleteBillboard(board.id)}
                  >
                    <Trash className="w-4 h-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
