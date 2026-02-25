import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusCircle, MinusCircle } from "lucide-react";
import { useUpdateProductStock } from "@/hooks/useProducts";
import { Product } from "@/types/database";

interface UpdateStockDialogProps {
  product: Product;
}

export function UpdateStockDialog({ product }: UpdateStockDialogProps) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("0");
  const updateStock = useUpdateProductStock();

  const handleUpdate = (type: "add" | "set") => {
    const value = Number(amount);
    if (isNaN(value)) return;

    let stockChange = 0;
    if (type === "add") {
      stockChange = value;
    } else {
      stockChange = value - product.stock;
    }

    updateStock.mutate(
      { id: product.id, stockChange },
      {
        onSuccess: () => {
          setOpen(false);
          setAmount("0");
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 px-2 text-primary">
          <PlusCircle className="mr-1 h-4 w-4" /> Restock
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xs">
        <DialogHeader>
          <DialogTitle>Update Stock</DialogTitle>
          <p className="text-xs text-muted-foreground">{product.name}</p>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label>Amount</Label>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="h-9"
            />
          </div>
          <div className="flex gap-2">
            <Button
              className="flex-1"
              variant="default"
              onClick={() => handleUpdate("add")}
              disabled={updateStock.isPending}
            >
              Add to Stock
            </Button>
            <Button
              className="flex-1"
              variant="outline"
              onClick={() => handleUpdate("set")}
              disabled={updateStock.isPending}
            >
              Set Total
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
