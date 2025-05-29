"use client";
import React, { useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "../ui/button";
import type { BillboardType, Shopboard, SurveyBillboard } from "@/types/survey";
import Image from "next/image";

interface BoardsTableProps {
  billboards: SurveyBillboard[];
  onRemoveBoard: (index: number) => void;
  billboardNames: Shopboard[];
  billboardTypes: BillboardType[];
  onEditBoard: (index: number) => void; // ✅ New prop
}

export const BoardsTable: React.FC<BoardsTableProps> = ({
  billboards,
  onRemoveBoard,
  billboardNames,
  billboardTypes,
  onEditBoard,
}) => {
  useEffect(() => {
    console.log(billboards);
  }, [billboards]);
  return (
    <div className="w-full">
      <Card className="">
        <CardContent className="overflow-auto max-h-80 p-2">
          <Table className="min-w-full table-auto">
            <TableHeader>
              <TableRow>
                <TableHead className="whitespace-nowrap px-4 py-2 text-left">
                  Width
                </TableHead>
                <TableHead className="whitespace-nowrap px-4 py-2 text-left">
                  Height
                </TableHead>
                <TableHead className="whitespace-nowrap px-4 py-2 text-left">
                  Type
                </TableHead>
                <TableHead className="whitespace-nowrap px-4 py-2 text-left">
                  Detail
                </TableHead>
                <TableHead className="whitespace-nowrap px-4 py-2 text-left">
                  Images
                </TableHead>
                <TableHead className="whitespace-nowrap px-4 py-2 text-center">
                  Action
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {billboards.length > 0 ? (
                billboards.map((board, index) => (
                  <TableRow key={index} className="border-t">
                    <TableCell className="px-4 py-2">{board.width}</TableCell>
                    <TableCell className="px-4 py-2">{board.height}</TableCell>
                    <TableCell className="px-4 py-2">
                      {billboardTypes.find(
                        (type) => type.id === board.billboard_type_id
                      )?.type_name || "Unknown"}
                    </TableCell>
                    <TableCell className="px-4 py-2">
                      {billboardNames.find(
                        (type) => type.id === board.billboard_name_id
                      )?.name || "Unknown"}
                    </TableCell>
                    <TableCell className="px-4 py-2">
                      <div className="flex gap-1 flex-wrap">
                        {board.board_images.map((image: any, i) => (
                          <div key={i} className="relative w-[50px] h-[50px]">
                            <Image
                              src={image.preview}
                              alt={`preview-${i}`}
                              width={70}
                              height={70}
                              className="rounded-md object-cover border w-full h-full"
                            />
                            <button
                              onClick={() => {
                                const updatedImages = [...board.board_images];
                                updatedImages.splice(i, 1);
                                const updatedBillboards = [...billboards];
                                updatedBillboards[index].board_images =
                                  updatedImages;
                                onEditBoard(index); // Optional: notify parent
                              }}
                              className="absolute -top-2 -right-2 bg-white border rounded-full w-5 h-5 flex items-center justify-center shadow"
                            >
                              <span className="text-xs text-red-600 font-bold">
                                X
                              </span>
                            </button>
                          </div>
                        ))}
                      </div>
                    </TableCell>

                    <TableCell className="px-4 py-2 flex justify-center items-center gap-3">
                      <Button
                        variant="outline"
                        size="sm"
                        className="px-3 py-2 flex justify-center items-center gap-1"
                        onClick={() => onRemoveBoard(index)}
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                        Delete
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="px-3 py-2 flex justify-center items-center gap-1"
                        onClick={() => onEditBoard(index)}
                      >
                        <Pencil className="w-4 h-4 text-gray-600" />
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4">
                    No billboards added yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
