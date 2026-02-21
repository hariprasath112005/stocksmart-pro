import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { CartItem, Sale, SaleItem } from "@/types/database";
import { toast } from "sonner";

function generateInvoiceNumber(): string {
  const now = new Date();
  const y = now.getFullYear().toString().slice(-2);
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const rand = Math.floor(Math.random() * 9000 + 1000);
  return `INV-${y}${m}${d}-${rand}`;
}

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
      const invoiceNumber = generateInvoiceNumber();

      // Insert sale
      const { data: sale, error: saleError } = await supabase
        .from("sales")
        .insert({
          invoice_number: invoiceNumber,
          customer_name: input.customerName,
          subtotal: input.subtotal,
          total_gst: input.totalGST,
          cgst: input.cgst,
          sgst: input.sgst,
          grand_total: input.grandTotal,
          payment_method: input.paymentMethod,
          amount_paid: input.amountPaid,
          balance: input.balance,
          status: "completed",
        })
        .select()
        .single();

      if (saleError) throw saleError;

      const saleData = sale as Sale;

      // Insert sale items
      const saleItems = input.cart.map((item) => {
        const lineTotal = item.price * item.qty - item.discount;
        return {
          sale_id: saleData.id,
          product_id: item.productId,
          product_name: item.name,
          product_code: item.code,
          price: item.price,
          qty: item.qty,
          discount: item.discount,
          gst_rate: item.gstRate,
          line_total: lineTotal,
        };
      });

      const { data: items, error: itemsError } = await supabase
        .from("sale_items")
        .insert(saleItems)
        .select();

      if (itemsError) throw itemsError;

      // Deduct stock for non-adhoc items
      for (const item of input.cart) {
        if (item.productId) {
          const { data: product } = await supabase
            .from("products")
            .select("stock")
            .eq("id", item.productId)
            .single();
          if (product) {
            await supabase
              .from("products")
              .update({ stock: (product as { stock: number }).stock - item.qty })
              .eq("id", item.productId);
          }
        }
      }

      return { sale: saleData, items: items as SaleItem[] };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Sale completed successfully!");
    },
    onError: (error: Error) => {
      toast.error("Failed to complete sale: " + error.message);
    },
  });
}
