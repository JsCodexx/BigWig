export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  rating: number;
  stock: number;
  features: string[];
}
export interface Billboard {
  id: number;
  length: string;
  width: string;
  location: string;
  facing_to: string;
  status: "equipped" | "available" | "out_of_order";
  equipped_until?: string | null;
  avatar?: string | null;
  gallery?: string[];
  created_at?: string;
  updated_at?: string;
}
