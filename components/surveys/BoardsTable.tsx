"use client";
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Trash2 } from "lucide-react";
import { Button } from "../ui/button";
import type { SurveyBillboard } from "@/types/survey";



interface BoardsTableProps {
  billboards: SurveyBillboard[];
  onRemoveBoard: (index: number) => void; // Function to remove board from parent state
}

export const BoardsTable: React.FC<BoardsTableProps> = ({
  billboards,
  onRemoveBoard,
}) => {
  return (
    <div className="w-full">
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Billboards List</h2>
        <CardContent className="overflow-auto max-h-80">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Width</TableHead>
                <TableHead>Height</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Images</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {billboards.length > 0 ? (
                billboards.map((board, index) => (
                  <TableRow key={index}>
                    <TableCell>{board.billboard_name_id}</TableCell>
                    <TableCell>{board.width}</TableCell>
                    <TableCell>{board.height}</TableCell>
                    <TableCell>{board.billboard_type_id}</TableCell>
                    <TableCell>
                      <div className="flex gap-1 flex-wrap">
                        {/* Generate image previews */}
                        {board.board_images.map((image:unknown, i) => (
                          <img
                            key={i}
                            src={image as string} 
                            alt={`preview-${i}`}
                            width={50}
                            height={50}
                            className="rounded-md object-cover border"
                          />
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => onRemoveBoard(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
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
