import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { useAddProduct } from "@/hooks/useProducts";

const categories = ["Groceries", "Dairy", "Beverages", "Household", "Electronics", "Stationery", "General"];
const warehouses = ["Main Store", "Warehouse B"];
const gstRates = [0, 5, 12, 18, 28];

export function AddProductDialog() {
  const [open, setOpen] = useState(false);
  const addProduct = useAddProduct();
  const [form, setForm] = useState({
    name: "",
    code: "",
    category: "General",
    gst_rate: "18",
    stock: "",
    warehouse: "Main Store",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.code) return;

    addProduct.mutate(
      {
        name: form.name,
        code: form.code,
        category: form.category,
        gst_rate: Number(form.gst_rate),
        stock: Number(form.stock) || 0,
        warehouse: form.warehouse,
      },
      {
        onSuccess: () => {
          setOpen(false);
          setForm({ name: "", code: "", category: "General", gst_rate: "18", stock: "", warehouse: "Main Store" });
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Add Product
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Product</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Product Name *</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Tata Salt 1kg" required />
            </div>
            <div className="space-y-1.5">
              <Label>Product Code *</Label>
              <Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="e.g. TS001" required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Warehouse</Label>
              <Select value={form.warehouse} onValueChange={(v) => setForm({ ...form, warehouse: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {warehouses.map((w) => <SelectItem key={w} value={w}>{w}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Opening Stock</Label>
              <Input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} min={0} />
            </div>
            <div className="space-y-1.5">
              <Label>Default GST Rate</Label>
              <Select value={form.gst_rate} onValueChange={(v) => setForm({ ...form, gst_rate: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {gstRates.map((r) => <SelectItem key={r} value={String(r)}>{r}%</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={addProduct.isPending}>
            {addProduct.isPending ? "Adding..." : "Add Product"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
