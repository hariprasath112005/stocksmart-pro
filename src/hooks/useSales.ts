import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { CartItem, Sale, SaleItem } from "@/types/database";
import { toast } from "sonner";

const API_URL = "http://localhost:3000/api";

interface CompleteSaleInput {
  cart: CartItem[];
  subtotal: number;
  totalGST: number;
  cgst: number;
  sgst: number;
  grandTotal: number;
  paymentMethod: string;
  amountPaid: number;
  balance: number;
  customerName: string;
}

export function useCompleteSale() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CompleteSaleInput): Promise<{ sale: Sale; items: SaleItem[] }> => {
      const response = await fetch(`${API_URL}/sales`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to complete sale");
      }

      return response.json() as Promise<{ sale: Sale; items: SaleItem[] }>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["sales"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Sale completed successfully!");
    },
    onError: (error: Error) => {
      toast.error("Failed to complete sale: " + error.message);
    },
  });
}

export function useSalesQuery() {
  return useQuery({
    queryKey: ["sales"],
    queryFn: async () => {
      const response = await fetch(`${API_URL}/sales`);
      if (!response.ok) {
        throw new Error("Failed to fetch sales");
      }
      return response.json() as Promise<Sale[]>;
    },
  });
}

export function useDashboard() {
  return useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => {
      const response = await fetch(`${API_URL}/dashboard`);
      if (!response.ok) {
        throw new Error("Failed to fetch dashboard data");
      }
      return response.json();
    },
  });
}

export function useReports() {
  return useQuery({
    queryKey: ["reports"],
    queryFn: async () => {
      const response = await fetch(`${API_URL}/reports`);
      if (!response.ok) {
        throw new Error("Failed to fetch reports data");
      }
      return response.json();
    },
  });
}
