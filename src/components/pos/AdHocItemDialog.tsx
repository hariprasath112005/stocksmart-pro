import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import type { CartItem } from "@/types/database";

const gstRates = [0, 5, 12, 18, 28];

interface Props {
  onAdd: (item: CartItem) => void;
}

export function AdHocItemDialog({ onAdd }: Props) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    price: "",
    gst_rate: "18",
    qty: "1",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.price) return;

    const item: CartItem = {
      id: `adhoc-${Date.now()}`,
      name: form.name,
      code: "AD-HOC",
      price: Number(form.price),
      qty: Number(form.qty) || 1,
      discount: 0,
      gstRate: Number(form.gst_rate),
      productId: null,
    };

    onAdd(item);
    setOpen(false);
    setForm({ name: "", price: "", gst_rate: "18", qty: "1" });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Plus className="mr-1 h-4 w-4" /> Ad-hoc Item
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Add Ad-hoc Item</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1.5">
            <Label>Item Name *</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Custom Item" required />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label>Price (₹) *</Label>
              <Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} min={0} required />
            </div>
            <div className="space-y-1.5">
              <Label>Qty</Label>
              <Input type="number" value={form.qty} onChange={(e) => setForm({ ...form, qty: e.target.value })} min={1} />
            </div>
            <div className="space-y-1.5">
              <Label>GST</Label>
              <Select value={form.gst_rate} onValueChange={(v) => setForm({ ...form, gst_rate: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {gstRates.map((r) => <SelectItem key={r} value={String(r)}>{r}%</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button type="submit" className="w-full">Add to Cart</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
