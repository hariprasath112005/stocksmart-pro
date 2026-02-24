import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Product } from "@/types/database";
import { toast } from "sonner";

const API_URL = "http://localhost:3000/api";

export function useProducts() {
  return useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      try {
        const response = await fetch(`${API_URL}/products`);
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `Failed to fetch products: ${response.status} ${response.statusText}`);
        }
        return response.json() as Promise<Product[]>;
      } catch (error) {
        if (error instanceof TypeError && error.message === "Failed to fetch") {
          throw new Error("Backend server is not reachable. Please make sure the server is running on port 3000.");
        }
        throw error;
      }
    },
  });
}

export function useAddProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (product: Omit<Product, "id" | "created_at" | "updated_at">) => {
      try {
        const response = await fetch(`${API_URL}/products`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(product),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `Failed to add product: ${response.status}`);
        }
        return response.json() as Promise<Product>;
      } catch (error) {
        if (error instanceof TypeError && error.message === "Failed to fetch") {
          throw new Error("Backend server is not reachable. Please make sure the server is running on port 3000.");
        }
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Product added successfully");
    },
    onError: (error: Error) => {
      toast.error("Failed to add product: " + error.message);
    },
  });
}

export function useUpdateProductStock() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, stockChange }: { id: string; stockChange: number }) => {
      // First get current stock from cache or fetch it
      // For simplicity here, we'll fetch the product first to get current stock
      // Actually, my API endpoint expects the NEW absolute stock value.
      // So I need to calculate it first.
      
      const products = queryClient.getQueryData<Product[]>(["products"]);
      const product = products?.find((p) => p.id === id);

      if (!product) {
        throw new Error("Product not found in cache");
      }

      const newStock = product.stock + stockChange;

      const response = await fetch(`${API_URL}/products/${id}/stock`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ stock: newStock }),
      });

      if (!response.ok) {
        throw new Error("Failed to update stock");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}
