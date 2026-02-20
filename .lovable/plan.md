
# Retail Wholesale Billing, Inventory & POS System — Phase 1 (Core MVP)

## 1. Authentication & Role Management
- Secure login page with email/password authentication via Supabase
- Three roles: **Admin**, **Cashier**, **Inventory Manager**
- Role-based access control — cashiers see POS only, inventory managers see stock, admins see everything
- User profiles table with role assignments stored securely in a separate roles table

## 2. Dashboard
- Overview cards: today's sales, monthly sales, total inventory value, cash drawer balance
- **Pie charts** for stock value by cost price and selling price
- **Bar/line charts** for daily and monthly sales trends
- Top-selling items list with quantity insights
- Quick action buttons to navigate to POS, Inventory, and Reports

## 3. Quick Sale / POS System
- Fast product search by name or product code
- Add products to cart with quantity, unit price, and discount fields
- **Indian GST tax calculations** — auto-compute CGST, SGST, and IGST based on product tax rates and transaction type (intra-state vs inter-state)
- Support for **temporary/ad-hoc product** entry for unlisted items
- Multiple payment methods: Cash, Card, UPI, Check, Gift Card
- Auto-calculate balance to return to customer
- Generate printable invoice/bill with GST breakdown
- Unique invoice numbering

## 4. Sales Suspension
- Suspend an ongoing sale with customer name, table/reference number, and notes
- View list of suspended sales
- Resume any suspended sale to complete the transaction

## 5. Inventory Management
- Product catalog: add, edit, delete products with details (name, code, category, cost price, selling price, tax rate, stock quantity)
- Support for **multiple warehouses/locations** — track stock per location
- **Stock transfers** between warehouses
- Stock adjustment and returns
- Low stock alerts
- Inventory reports: stock value by cost and by selling price

## 6. Reports
- **Daily and monthly sales reports** with filtering
- **Profit & Loss report** including expenses
- **Tax report** — CGST, SGST, IGST breakdown
- **Item-wise sales report** — quantities sold per product
- Export reports (display in tables with print-friendly views)

## 7. Additional Features (Phase 1)
- Expense tracking — record business expenses with categories
- Basic customer management — store customer details for wholesale billing

## Database Structure (PostgreSQL via Lovable Cloud)
- Tables: profiles, user_roles, products, categories, warehouses, stock, sales, sale_items, payments, suspended_sales, expenses, customers, tax_config
- Row-level security policies based on user roles

## Design & UX
- Clean, professional UI optimized for **desktop and tablet**
- Sidebar navigation: Dashboard, POS, Inventory, Sales, Reports, Settings
- Dark/light mode support
- Responsive data tables with search and filtering
- Charts powered by Recharts (already installed)

## Future Phases (Not in this build)
- Barcode/QR code generation for invoices
- Email invoice sending
- Gift card management
- Quotations and deliveries
- Multi-payment gateway integration
- E-commerce add-ons
