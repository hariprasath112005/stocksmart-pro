export interface Product {
  id: string;
  name: string;
  code: string;
  category: string;
  cost_price: number;
  sell_price: number;
  gst_rate: number;
  stock: number;
  warehouse: string;
  created_at: string;
  updated_at: string;
}

export interface Sale {
  id: string;
  invoice_number: string;
  customer_name: string;
  subtotal: number;
  total_gst: number;
  cgst: number;
  sgst: number;
  grand_total: number;
  payment_method: string;
  amount_paid: number;
  balance: number;
  status: string;
  created_at: string;
}

export interface SaleItem {
  id: string;
  sale_id: string;
  product_id: string | null;
  product_name: string;
  product_code: string;
  price: number;
  qty: number;
  discount: number;
  gst_rate: number;
  line_total: number;
  created_at: string;
}

export interface CartItem {
  id: string;
  name: string;
  code: string;
  price: number;
  qty: number;
  discount: number;
  gstRate: number;
  productId: string | null; // null for ad-hoc items
}
