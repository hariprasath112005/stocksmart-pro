import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, Trash2, Printer, Plus, Download, UserPlus } from "lucide-react";
import { useProducts } from "@/hooks/useProducts";
import { useCompleteSale } from "@/hooks/useSales";
import { useCustomers, useAddCustomer } from "@/hooks/useCustomers";
import { useSettings } from "@/hooks/useSettings";
import { calculateGST, numberToWords, getFinancialYear } from "@/lib/gstUtils";
import { generateInvoicePdf } from "@/lib/generateInvoicePdf";
import { toast } from "sonner";
import type { CartItem, Customer } from "@/types/database";

export default function POS() {
  const { data: products = [] } = useProducts();
  const { data: customers = [] } = useCustomers();
  const { data: settings } = useSettings();
  const completeSale = useCompleteSale();

  // Invoice Header
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split("T")[0]);
  const [dueDate, setDueDate] = useState("");
  const [financialYear, setFinancialYear] = useState(getFinancialYear());
  const [paymentMode, setPaymentMode] = useState("cash");
  const [placeOfSupply, setPlaceOfSupply] = useState("Tamil Nadu (33)");
  const [reverseCharge, setReverseCharge] = useState(false);
  const [referenceNumber, setReferenceNumber] = useState("");
  const [deliveryNoteNumber, setDeliveryNoteNumber] = useState("");
  const [transportName, setTransportName] = useState("");
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [lrNumber, setLrNumber] = useState("");

  // Buyer Details
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerName, setCustomerName] = useState("Walk-in");
  const [billingAddress, setBillingAddress] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");
  const [customerGstin, setCustomerGstin] = useState("");
  const [customerState, setCustomerState] = useState("Tamil Nadu");
  const [customerStateCode, setCustomerStateCode] = useState("33");

  // Item Grid
  const [cart, setCart] = useState<CartItem[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (settings && !selectedCustomer && !placeOfSupply.includes("(")) {
      const defaultState = settings.state || "Tamil Nadu";
      const defaultCode = settings.state_code || "33";
      setPlaceOfSupply(`${defaultState} (${defaultCode})`);
      setCustomerState(defaultState);
      setCustomerStateCode(defaultCode);
    }
  }, [settings, selectedCustomer]);

  useEffect(() => {
    if (selectedCustomer) {
      setCustomerName(selectedCustomer.name);
      setBillingAddress(selectedCustomer.billing_address);
      setShippingAddress(selectedCustomer.shipping_address);
      setCustomerGstin(selectedCustomer.gstin);
      setCustomerState(selectedCustomer.state);
      setCustomerStateCode(selectedCustomer.state_code);
      if (selectedCustomer.state && selectedCustomer.state_code) {
        setPlaceOfSupply(`${selectedCustomer.state} (${selectedCustomer.state_code})`);
      }
    }
  }, [selectedCustomer]);

  const addToCart = (product: any) => {
    const defaultGst = product.gst_rate || 18;
    const { taxableValue, cgst, sgst, igst, lineTotal } = calculateGST(
      0, 1, 0, defaultGst, 
      settings?.state_code || "33", 
      customerStateCode || "33"
    );

    const newItem: CartItem = {
      id: Math.random().toString(36).substr(2, 9),
      productId: product.id,
      name: product.name,
      code: product.code,
      hsnCode: product.hsn_code || "",
      price: 0,
      qty: 1,
      unit: "PCS",
      discount: 0,
      taxableValue,
      gstRate: defaultGst,
      cgst,
      sgst,
      igst,
      lineTotal
    };
    setCart([...cart, newItem]);
  };

  const updateItem = (id: string, field: keyof CartItem, value: any) => {
    setCart(prevCart => prevCart.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        const { taxableValue, cgst, sgst, igst, lineTotal } = calculateGST(
          updatedItem.price, 
          updatedItem.qty, 
          updatedItem.discount, 
          updatedItem.gstRate, 
          settings?.state_code || "", 
          customerStateCode || settings?.state_code || ""
        );
        return { ...updatedItem, taxableValue, cgst, sgst, igst, lineTotal };
      }
      return item;
    }));
  };

  const removeItem = (id: string) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const totals = useMemo(() => {
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
    const taxableTotal = cart.reduce((sum, item) => sum + item.taxableValue, 0);
    const totalGst = cart.reduce((sum, item) => sum + item.cgst + item.sgst + item.igst, 0);
    const cgstTotal = cart.reduce((sum, item) => sum + item.cgst, 0);
    const sgstTotal = cart.reduce((sum, item) => sum + item.sgst, 0);
    const igstTotal = cart.reduce((sum, item) => sum + item.igst, 0);
    const totalDiscount = cart.reduce((sum, item) => sum + item.discount, 0);
    const rawGrandTotal = taxableTotal + totalGst;
    const grandTotal = Math.round(rawGrandTotal);
    const roundOff = grandTotal - rawGrandTotal;

    return {
      subtotal,
      taxableTotal,
      totalGst,
      cgstTotal,
      sgstTotal,
      igstTotal,
      totalDiscount,
      roundOff,
      grandTotal,
      grandTotalWords: numberToWords(grandTotal)
    };
  }, [cart]);

  const validate = () => {
    if (cart.length === 0) return "At least one item is required";
    for (const item of cart) {
      if (item.qty <= 0) return `Quantity for ${item.name} must be > 0`;
      if (item.price <= 0) return `Price for ${item.name} must be > 0`;
      if (customerGstin && !item.hsnCode) return `HSN Code is mandatory for B2B for item ${item.name}`;
    }
    if (customerGstin && customerGstin.trim() !== "" && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(customerGstin)) {
      return "Invalid GSTIN format";
    }
    return null;
  };

  const handleSave = async () => {
    const error = validate();
    if (error) {
      toast.error(error);
      return;
    }

    try {
      const result = await completeSale.mutateAsync({
        invoiceDate,
        dueDate,
        financialYear,
        paymentMode,
        placeOfSupply,
        reverseCharge,
        referenceNumber,
        deliveryNoteNumber,
        transportName,
        vehicleNumber,
        lrNumber,
        customerId: selectedCustomer?.id,
        customerName,
        billingAddress,
        shippingAddress,
        customerGstin,
        customerState,
        customerStateCode,
        subtotal: totals.subtotal,
        taxableTotal: totals.taxableTotal,
        totalGst: totals.totalGst,
        cgst: totals.cgstTotal,
        sgst: totals.sgstTotal,
        igst: totals.igstTotal,
        roundOff: totals.roundOff,
        grandTotal: totals.grandTotal,
        grandTotalWords: totals.grandTotalWords,
        cart
      });

      toast.success("Invoice saved successfully!");
      
      // Generate PDF
      if (settings) {
        generateInvoicePdf({
          invoiceNumber: result.sale.invoice_number,
          invoiceDate,
          dueDate,
          financialYear,
          paymentMode,
          placeOfSupply,
          reverseCharge,
          referenceNumber,
          deliveryNoteNumber,
          transportName,
          vehicleNumber,
          lrNumber,
          seller: settings,
          customerName,
          billingAddress,
          shippingAddress,
          customerGstin,
          customerState,
          customerStateCode,
          cart,
          subtotal: totals.subtotal,
          taxableTotal: totals.taxableTotal,
          totalGst: totals.totalGst,
          cgst: totals.cgstTotal,
          sgst: totals.sgstTotal,
          igst: totals.igstTotal,
          roundOff: totals.roundOff,
          grandTotal: totals.grandTotal,
          grandTotalWords: totals.grandTotalWords,
        });
      }
    } catch (err) {
      // Error handled by mutation
    }
  };

  return (
    <div className="p-4 space-y-4 max-w-[1400px] mx-auto pb-20">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">GST Tax Invoice</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => {}}>Drafts</Button>
          <Button onClick={handleSave} disabled={completeSale.isPending}>
            {completeSale.isPending ? "Saving..." : "Save Invoice"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* A. INVOICE HEADER */}
        <Card>
          <CardHeader className="py-3"><CardTitle className="text-sm">A. Invoice Header</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-2 gap-2 text-xs">
            <div className="space-y-1">
              <Label>Invoice No</Label>
              <Input placeholder="Auto-generated" readOnly className="h-7 text-xs" />
            </div>
            <div className="space-y-1">
              <Label>Date</Label>
              <Input type="date" value={invoiceDate} onChange={e => setInvoiceDate(e.target.value)} className="h-7 text-xs" />
            </div>
            <div className="space-y-1">
              <Label>Financial Year</Label>
              <Input value={financialYear} readOnly className="h-7 text-xs bg-muted" />
            </div>
            <div className="space-y-1">
              <Label>Payment Mode</Label>
              <Select value={paymentMode} onValueChange={setPaymentMode}>
                <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="upi">UPI</SelectItem>
                  <SelectItem value="card">Card</SelectItem>
                  <SelectItem value="credit">Credit</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2 space-y-1">
              <Label>Place of Supply</Label>
              <Input value={placeOfSupply} onChange={e => setPlaceOfSupply(e.target.value)} className="h-7 text-xs" />
            </div>
            <div className="flex items-center space-x-2 pt-2">
              <Checkbox id="reverse" checked={reverseCharge} onCheckedChange={(v) => setReverseCharge(!!v)} />
              <Label htmlFor="reverse">Reverse Charge</Label>
            </div>
          </CardContent>
        </Card>

        {/* B. SELLER DETAILS */}
        <Card>
          <CardHeader className="py-3"><CardTitle className="text-sm">B. Seller Details</CardTitle></CardHeader>
          <CardContent className="space-y-1 text-xs">
            <p className="font-bold">{settings?.company_name}</p>
            <p className="text-muted-foreground">{settings?.address}</p>
            <p><span className="font-semibold">GSTIN:</span> {settings?.gstin}</p>
            <p><span className="font-semibold">State:</span> {settings?.state} ({settings?.state_code})</p>
            <p><span className="font-semibold">Phone:</span> {settings?.phone}</p>
          </CardContent>
        </Card>

        {/* C. BUYER DETAILS */}
        <Card>
          <CardHeader className="py-3 flex flex-row items-center justify-between">
            <CardTitle className="text-sm">C. Buyer Details</CardTitle>
            <Button variant="ghost" size="icon" className="h-6 w-6"><UserPlus className="h-3 w-3" /></Button>
          </CardHeader>
          <CardContent className="space-y-2 text-xs">
            <div className="space-y-1">
              <Label>Select Customer</Label>
              <Select 
                value={selectedCustomer?.id || ""} 
                onValueChange={(v) => {
                  const cust = customers.find(c => c.id === v);
                  setSelectedCustomer(cust || null);
                }}
              >
                <SelectTrigger className="h-7 text-xs">
                  <SelectValue placeholder="Select Customer" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Customer Name</Label>
              <Input 
                value={customerName} 
                onChange={e => setCustomerName(e.target.value)} 
                className="h-7 text-xs" 
                placeholder="Walk-in"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label>GSTIN</Label>
                <Input value={customerGstin} onChange={e => setCustomerGstin(e.target.value)} className="h-7 text-xs" />
              </div>
              <div className="space-y-1">
                <Label>State Name</Label>
                <Input value={customerState} onChange={e => setCustomerState(e.target.value)} className="h-7 text-xs" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label>State Code</Label>
                <Input value={customerStateCode} onChange={e => setCustomerStateCode(e.target.value)} className="h-7 text-xs" />
              </div>
              <div className="space-y-1">
                <Label>Billing Address</Label>
                <Input value={billingAddress} onChange={e => setBillingAddress(e.target.value)} className="h-7 text-xs" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 2. ITEM ENTRY GRID */}
      <Card className="min-h-[400px]">
        <CardHeader className="py-4 flex flex-row items-center justify-between border-b">
          <CardTitle className="text-lg font-semibold">2. Item Entry Grid</CardTitle>
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input 
              placeholder="Search product by name or code..." 
              className="pl-10 h-12 text-base shadow-sm focus-visible:ring-primary"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <div className="absolute top-full left-0 w-full bg-white border rounded-md shadow-xl z-50 mt-1 max-h-72 overflow-auto border-primary/20">
                {products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.code.toLowerCase().includes(search.toLowerCase())).map(p => (
                  <div 
                    key={p.id} 
                    className="p-3 hover:bg-primary/5 cursor-pointer text-sm border-b last:border-0 flex justify-between items-center"
                    onClick={() => { addToCart(p); setSearch(""); }}
                  >
                    <div>
                      <span className="font-bold text-primary">{p.name}</span>
                      <span className="ml-2 text-xs text-muted-foreground">({p.code})</span>
                    </div>
                    <Badge variant="outline" className="text-[10px]">GST {p.gst_rate}%</Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0 overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50 border-b">
                <th className="p-3 text-left w-12">Sl</th>
                <th className="p-3 text-left">Item Description</th>
                <th className="p-3 text-left w-32">HSN/SAC</th>
                <th className="p-3 text-right w-24">Qty</th>
                <th className="p-3 text-left w-20">Unit</th>
                <th className="p-3 text-right w-32">Rate (₹)</th>
                <th className="p-3 text-right w-24">Disc (₹)</th>
                <th className="p-3 text-right w-32">Taxable</th>
                <th className="p-3 text-center w-24">GST %</th>
                <th className="p-3 text-right w-32">GST Amt</th>
                <th className="p-3 text-right w-36">Total</th>
                <th className="p-3 w-12"></th>
              </tr>
            </thead>
            <tbody>
              {cart.map((item, idx) => (
                <tr key={item.id} className="border-b hover:bg-muted/30 transition-colors">
                  <td className="p-3 text-center text-muted-foreground">{idx + 1}</td>
                  <td className="p-3 font-semibold text-primary">{item.name}</td>
                  <td className="p-3">
                    <Input value={item.hsnCode} onChange={e => updateItem(item.id, "hsnCode", e.target.value)} className="h-8 text-xs font-mono" />
                  </td>
                  <td className="p-3">
                    <Input type="number" value={item.qty} onChange={e => updateItem(item.id, "qty", Number(e.target.value))} className="h-8 text-right font-medium" />
                  </td>
                  <td className="p-3">
                    <Input value={item.unit} onChange={e => updateItem(item.id, "unit", e.target.value)} className="h-8 text-xs" />
                  </td>
                  <td className="p-3">
                    <Input type="number" value={item.price} onChange={e => updateItem(item.id, "price", Number(e.target.value))} className="h-8 text-right font-semibold" />
                  </td>
                  <td className="p-3">
                    <Input type="number" value={item.discount} onChange={e => updateItem(item.id, "discount", Number(e.target.value))} className="h-8 text-right" />
                  </td>
                  <td className="p-3 text-right font-medium">₹{item.taxableValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  <td className="p-3">
                    <Select value={String(item.gstRate)} onValueChange={v => updateItem(item.id, "gstRate", Number(v))}>
                      <SelectTrigger className="h-8 text-xs font-bold"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {[0, 5, 12, 18, 28].map(r => <SelectItem key={r} value={String(r)}>{r}%</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="p-3 text-right text-muted-foreground">₹{(item.cgst + item.sgst + item.igst).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  <td className="p-3 text-right font-bold text-primary text-base">₹{item.lineTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  <td className="p-3">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => removeItem(item.id)}><Trash2 className="h-4 w-4" /></Button>
                  </td>
                </tr>
              ))}
              {cart.length === 0 && (
                <tr>
                  <td colSpan={12} className="p-8 text-center text-muted-foreground">No items added yet. Search and click to add items.</td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* BOTTOM PANEL */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* TRANSPORT DETAILS */}
        <Card>
          <CardHeader className="py-3"><CardTitle className="text-sm">Transport Details</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-2 gap-2 text-xs">
            <div className="space-y-1">
              <Label>Transport Name</Label>
              <Input value={transportName} onChange={e => setTransportName(e.target.value)} className="h-7 text-xs" />
            </div>
            <div className="space-y-1">
              <Label>Vehicle Number</Label>
              <Input value={vehicleNumber} onChange={e => setVehicleNumber(e.target.value)} className="h-7 text-xs" />
            </div>
            <div className="space-y-1">
              <Label>LR Number</Label>
              <Input value={lrNumber} onChange={e => setLrNumber(e.target.value)} className="h-7 text-xs" />
            </div>
            <div className="space-y-1">
              <Label>Reference No</Label>
              <Input value={referenceNumber} onChange={e => setReferenceNumber(e.target.value)} className="h-7 text-xs" />
            </div>
          </CardContent>
        </Card>

        {/* 4. TOTAL CALCULATION PANEL */}
        <Card>
          <CardHeader className="py-3"><CardTitle className="text-sm">4. Total Calculation Panel</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-xs">
            <div className="flex justify-between border-b pb-1">
              <span className="text-muted-foreground">Taxable Amount:</span>
              <span className="font-semibold">₹{totals.taxableTotal.toFixed(2)}</span>
            </div>
            {totals.cgstTotal > 0 && (
              <div className="flex justify-between border-b pb-1">
                <span className="text-muted-foreground">CGST Total:</span>
                <span>₹{totals.cgstTotal.toFixed(2)}</span>
              </div>
            )}
            {totals.sgstTotal > 0 && (
              <div className="flex justify-between border-b pb-1">
                <span className="text-muted-foreground">SGST Total:</span>
                <span>₹{totals.sgstTotal.toFixed(2)}</span>
              </div>
            )}
            {totals.igstTotal > 0 && (
              <div className="flex justify-between border-b pb-1">
                <span className="text-muted-foreground">IGST Total:</span>
                <span>₹{totals.igstTotal.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between border-b pb-1">
              <span className="text-muted-foreground">Round Off:</span>
              <span>₹{totals.roundOff.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold">
              <span>Grand Total:</span>
              <span className="text-primary">₹{totals.grandTotal.toFixed(2)}</span>
            </div>
            <div className="text-[10px] italic text-muted-foreground pt-2">
              Amount in words: {totals.grandTotalWords}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
