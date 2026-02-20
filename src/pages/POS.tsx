import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Plus, Trash2, PauseCircle, Printer, X } from "lucide-react";

interface CartItem {
  id: string;
  name: string;
  code: string;
  price: number;
  qty: number;
  discount: number;
  gstRate: number;
}

const mockProducts = [
  { id: "1", name: "Tata Salt 1kg", code: "TS001", price: 20, gstRate: 5 },
  { id: "2", name: "Amul Butter 500g", code: "AB002", price: 50, gstRate: 12 },
  { id: "3", name: "Maggi Noodles Pack", code: "MN003", price: 12, gstRate: 18 },
  { id: "4", name: "Surf Excel 1kg", code: "SE004", price: 70, gstRate: 28 },
  { id: "5", name: "Red Label Tea 500g", code: "RL005", price: 150, gstRate: 5 },
  { id: "6", name: "Notebook 200pg", code: "NB006", price: 40, gstRate: 12 },
  { id: "7", name: "LED Bulb 12W", code: "LB007", price: 120, gstRate: 18 },
  { id: "8", name: "USB Cable 1m", code: "UC008", price: 80, gstRate: 18 },
];

export default function POS() {
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [amountPaid, setAmountPaid] = useState("");

  const filtered = mockProducts.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.code.toLowerCase().includes(search.toLowerCase())
  );

  const addToCart = (product: (typeof mockProducts)[0]) => {
    const existing = cart.find((c) => c.id === product.id);
    if (existing) {
      setCart(cart.map((c) => (c.id === product.id ? { ...c, qty: c.qty + 1 } : c)));
    } else {
      setCart([...cart, { ...product, qty: 1, discount: 0 }]);
    }
  };

  const updateQty = (id: string, qty: number) => {
    if (qty <= 0) return removeFromCart(id);
    setCart(cart.map((c) => (c.id === id ? { ...c, qty } : c)));
  };

  const updateDiscount = (id: string, discount: number) => {
    setCart(cart.map((c) => (c.id === id ? { ...c, discount } : c)));
  };

  const removeFromCart = (id: string) => {
    setCart(cart.filter((c) => c.id !== id));
  };

  const subtotal = cart.reduce((sum, c) => sum + c.price * c.qty - c.discount, 0);
  const totalGST = cart.reduce((sum, c) => {
    const itemTotal = c.price * c.qty - c.discount;
    return sum + (itemTotal * c.gstRate) / 100;
  }, 0);
  const cgst = totalGST / 2;
  const sgst = totalGST / 2;
  const grandTotal = subtotal + totalGST;
  const balance = Number(amountPaid) - grandTotal;

  return (
    <div className="p-6 h-[calc(100vh)] flex gap-4">
      {/* Left: Product search */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex items-center gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search product by name or code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button variant="outline" size="sm">
            <Plus className="mr-1 h-4 w-4" /> Ad-hoc Item
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 overflow-auto flex-1">
          {filtered.map((p) => (
            <Card
              key={p.id}
              className="cursor-pointer hover:border-primary transition-colors"
              onClick={() => addToCart(p)}
            >
              <CardContent className="p-3">
                <p className="font-medium text-sm truncate">{p.name}</p>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-muted-foreground">{p.code}</span>
                  <Badge variant="secondary" className="text-xs">GST {p.gstRate}%</Badge>
                </div>
                <p className="text-lg font-bold mt-1">₹{p.price}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Right: Cart & Billing */}
      <Card className="w-96 flex flex-col shrink-0">
        <CardHeader className="pb-2 border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Current Sale</CardTitle>
            <Button variant="ghost" size="sm" className="text-warning">
              <PauseCircle className="mr-1 h-4 w-4" /> Suspend
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-auto p-3 space-y-2">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-sm">
              <p>Cart is empty</p>
              <p className="text-xs mt-1">Click a product to add</p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="flex items-start gap-2 p-2 rounded-md bg-muted/50">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{item.name}</p>
                  <p className="text-xs text-muted-foreground">₹{item.price} × {item.qty}</p>
                </div>
                <div className="flex items-center gap-1">
                  <Input
                    type="number"
                    value={item.qty}
                    onChange={(e) => updateQty(item.id, Number(e.target.value))}
                    className="w-14 h-7 text-xs text-center"
                    min={1}
                  />
                  <Input
                    type="number"
                    value={item.discount}
                    onChange={(e) => updateDiscount(item.id, Number(e.target.value))}
                    className="w-14 h-7 text-xs text-center"
                    placeholder="Disc"
                    min={0}
                  />
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => removeFromCart(item.id)}>
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>

        {/* Totals */}
        <div className="border-t p-3 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span>₹{subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">CGST</span>
            <span>₹{cgst.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">SGST</span>
            <span>₹{sgst.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-bold text-base border-t pt-2">
            <span>Grand Total</span>
            <span>₹{grandTotal.toFixed(2)}</span>
          </div>

          <div className="flex gap-2">
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger className="h-9 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="card">Card</SelectItem>
                <SelectItem value="upi">UPI</SelectItem>
                <SelectItem value="check">Check</SelectItem>
              </SelectContent>
            </Select>
            <Input
              type="number"
              placeholder="Amount Paid"
              value={amountPaid}
              onChange={(e) => setAmountPaid(e.target.value)}
              className="h-9 text-xs"
            />
          </div>

          {Number(amountPaid) > 0 && (
            <div className="flex justify-between text-success font-semibold">
              <span>Balance</span>
              <span>₹{balance.toFixed(2)}</span>
            </div>
          )}

          <div className="flex gap-2 pt-1">
            <Button className="flex-1" disabled={cart.length === 0}>
              <Printer className="mr-1 h-4 w-4" /> Complete Sale
            </Button>
            <Button variant="destructive" size="icon" onClick={() => setCart([])}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
