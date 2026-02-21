
-- Products table
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL DEFAULT 'General',
  cost_price NUMERIC(10,2) NOT NULL DEFAULT 0,
  sell_price NUMERIC(10,2) NOT NULL DEFAULT 0,
  gst_rate NUMERIC(5,2) NOT NULL DEFAULT 0,
  stock INTEGER NOT NULL DEFAULT 0,
  warehouse TEXT NOT NULL DEFAULT 'Main Store',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Sales table
CREATE TABLE public.sales (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_number TEXT NOT NULL UNIQUE,
  customer_name TEXT NOT NULL DEFAULT 'Walk-in',
  subtotal NUMERIC(10,2) NOT NULL DEFAULT 0,
  total_gst NUMERIC(10,2) NOT NULL DEFAULT 0,
  cgst NUMERIC(10,2) NOT NULL DEFAULT 0,
  sgst NUMERIC(10,2) NOT NULL DEFAULT 0,
  grand_total NUMERIC(10,2) NOT NULL DEFAULT 0,
  payment_method TEXT NOT NULL DEFAULT 'cash',
  amount_paid NUMERIC(10,2) NOT NULL DEFAULT 0,
  balance NUMERIC(10,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'completed',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Sale items table
CREATE TABLE public.sale_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sale_id UUID NOT NULL REFERENCES public.sales(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id),
  product_name TEXT NOT NULL,
  product_code TEXT NOT NULL DEFAULT '',
  price NUMERIC(10,2) NOT NULL,
  qty INTEGER NOT NULL DEFAULT 1,
  discount NUMERIC(10,2) NOT NULL DEFAULT 0,
  gst_rate NUMERIC(5,2) NOT NULL DEFAULT 0,
  line_total NUMERIC(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Allow public access (no auth required for now)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sale_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access to products" ON public.products FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to sales" ON public.sales FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to sale_items" ON public.sale_items FOR ALL USING (true) WITH CHECK (true);

-- Seed some initial products
INSERT INTO public.products (name, code, category, cost_price, sell_price, gst_rate, stock, warehouse) VALUES
  ('Tata Salt 1kg', 'TS001', 'Groceries', 15, 20, 5, 250, 'Main Store'),
  ('Amul Butter 500g', 'AB002', 'Dairy', 38, 50, 12, 85, 'Main Store'),
  ('Maggi Noodles Pack', 'MN003', 'Groceries', 8, 12, 18, 320, 'Warehouse B'),
  ('Surf Excel 1kg', 'SE004', 'Household', 50, 70, 28, 12, 'Main Store'),
  ('Red Label Tea 500g', 'RL005', 'Beverages', 110, 150, 5, 45, 'Main Store'),
  ('Notebook 200pg', 'NB006', 'Stationery', 28, 40, 12, 5, 'Warehouse B'),
  ('LED Bulb 12W', 'LB007', 'Electronics', 85, 120, 18, 60, 'Main Store'),
  ('USB Cable 1m', 'UC008', 'Electronics', 45, 80, 18, 8, 'Warehouse B');
