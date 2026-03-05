export interface Product {
  id: string;
  name: string;
  code: string;
  category: string;
  hsn_code?: string;
  gst_rate: number;
  stock: number;
  warehouse: string;
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: string;
  name: string;
  billing_address: string;
  shipping_address: string;
  gstin: string;
  state: string;
  state_code: string;
  phone: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface CompanySettings {
  id: string;
  company_name: string;
  unit_name: string;
  address: string;
  gstin: string;
  state: string;
  state_code: string;
  phone: string;
  email: string;
  bank_name?: string;
  account_no?: string;
  ifsc_code?: string;
  inventory_password?: string;
}

export interface Sale {
  id: string;
  invoice_number: string;
  invoice_date: string;
  due_date?: string;
  financial_year: string;
  payment_mode: string;
  place_of_supply: string;
  reverse_charge: boolean;
  reference_number?: string;
  delivery_note_number?: string;
  transport_name?: string;
  vehicle_number?: string;
  lr_number?: string;
  eway_bill_number?: string;
  customer_id?: string;
  customer_name: string;
  billing_address?: string;
  shipping_address?: string;
  customer_gstin?: string;
  customer_state?: string;
  customer_state_code?: string;
  subtotal: number;
  total_gst: number;
  cgst: number;
  sgst: number;
  igst: number;
  round_off: number;
  grand_total: number;
  grand_total_words?: string;
  status: string;
  created_at: string;
}

export interface SaleItem {
  id: string;
  sale_id: string;
  product_id: string | null;
  product_name: string;
  product_code: string;
  hsn_code?: string;
  price: number;
  qty: number;
  unit: string;
  discount: number;
  taxable_value: number;
  gst_rate: number;
  cgst: number;
  sgst: number;
  igst: number;
  line_total: number;
  created_at: string;
}

export interface CartItem {
  id: string;
  productId: string | null;
  name: string;
  code: string;
  hsnCode?: string;
  price: number;
  qty: number;
  unit: string;
  discount: number;
  taxableValue: number;
  gstRate: number;
  cgst: number;
  sgst: number;
  igst: number;
  lineTotal: number;
}
