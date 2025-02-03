"use client";

import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";
import { useRouter } from "next/navigation";
import { Product } from "@/types/product";

interface BillboardProps {
  product: Product;
}

export function BillboardCard({ product }: BillboardProps) {
  const router = useRouter();

  return (
    <Card className="overflow-hidden transition-all hover:shadow-lg">
      <div className="aspect-square relative overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="object-cover w-full h-full transition-transform hover:scale-105"
        />
      </div>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-lg line-clamp-1">{product.name}</h3>
          <span className="flex items-center text-sm text-muted-foreground">
            <Star className="w-4 h-4 fill-primary text-primary mr-1" />
            {product.rating}
          </span>
        </div>
        <p className="text-muted-foreground text-sm line-clamp-2 mb-2">
          {product.description}
        </p>
        <p className="font-semibold text-lg">${product.price}</p>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button
          className="w-full"
          onClick={() => router.push(`/products/${product.id}`)}
        >
          View Details
        </Button>
      </CardFooter>
    </Card>
  );
}
